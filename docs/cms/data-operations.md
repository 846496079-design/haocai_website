# 数据迁移、备份、恢复与回滚

## 安全原则

- 操作前确认当前连接的是 Preview 还是 Production；脚本不会打印连接串，也无法替操作者识别错误项目。
- 迁移、seed 和恢复期间只允许一个操作者，暂停 CMS 写入。
- 先备份、再迁移；先 `--dry-run`、再正式执行；正式执行后立即 verify。
- schema 迁移只前进。已执行迁移文件的 checksum 不得修改，应新增下一编号迁移。

## Schema 迁移

```bash
npm run cms:migrate -- --help
npm run cms:migrate -- --dry-run
npm run cms:migrate
```

脚本默认读取 `db/migrations/001_cms_postgres.sql`，建立 `cms_schema_migration` 记录并校验 checksum。迁移 SQL 在一个 Neon 非交互事务中执行。若同版本文件被改写，脚本会拒绝继续。

新增迁移时使用新的递增文件名，并用 `--file` 指定：

```bash
npm run cms:migrate -- --file db/migrations/002_cms_operations.sql --dry-run
npm run cms:migrate -- --file db/migrations/002_cms_operations.sql
```

## 历史新闻导入

本地运行一次 CMS 后，`.data/news-cms.sqlite` 会包含旧站当前已发布新闻。导入脚本只读取 `PUBLISHED` 当前版本，不迁移管理员、会话、草稿或审计日志。

```bash
npm run cms:seed-legacy -- --help
npm run cms:seed-legacy -- --dry-run
npm run cms:seed-legacy
```

行为边界：

- 以 `slug` 幂等；目标已有同 slug 时跳过，绝不覆盖。
- 每篇新文章使用单条 CTE 原子写入分类、文章、版本和公开版本指针。
- 导入后必须运行 verify；若已有同 slug 但内容不同，verify 会报错，需人工决定保留哪一版。
- 如 SQLite 位于其他路径，传 `--source <路径>`。

## 统一富文本内容迁移

schema 迁移完成、历史新闻已导入后，将所有草稿和已发布版本转换为 `cms-richtext.v1`。迁移器会逐语言核对文字节点和图片顺序，并重新生成 `publicationHtml` 与 `contentHash`。

本地 SQLite：

```bash
npm run cms:migrate-richtext
npm run cms:migrate-richtext -- --apply
npm run cms:verify-richtext
```

默认命令只演练。`--apply` 会先在 `.data/backups/` 自动建立 SQLite 备份，再以事务更新全部版本并写入 `MIGRATE_RICHTEXT` 审计记录。

Neon PostgreSQL：

```bash
npm run cms:migrate-richtext -- --postgres
npm run cms:migrate-richtext -- --postgres --apply --backup-confirmed
npm run cms:verify-richtext -- --postgres
```

生产写入前必须先建立 Neon 恢复点或逻辑备份；脚本要求显式传入 `--backup-confirmed`。若任一版本迁移前后的文字或图片顺序不一致，脚本会停止且不写入。

## 校验

```bash
npm run cms:verify -- --help
npm run cms:verify
```

`cms:verify` 校验必需表、已发布文章版本指针、三语 JSON，以及存在 SQLite 源文件时的逐 slug 内容哈希对账。`cms:verify-richtext` 进一步检查所有版本是否已是当前统一富文本结构和当前渲染快照。CI 或发布门禁应同时使用两个命令的退出码，而不是只读取终端文字。

只检查 Neon 时使用：

```bash
npm run cms:verify -- --no-source
```

## 备份

优先启用 Neon 提供的 point-in-time restore，并在发布前记录可恢复时间点。额外的逻辑备份使用官方 `pg_dump`，文件保存到受控加密存储，不提交仓库：

```bash
PGDATABASE="$CMS_DATABASE_URL" pg_dump --format=custom --no-owner --no-acl --file "cms-before-release.dump"
pg_restore --list "cms-before-release.dump"
```

PowerShell 使用 `$env:CMS_DATABASE_URL`。备份完成不等于可恢复；至少在隔离 Neon branch 上定期演练一次恢复和 `cms:verify`。

Blob 资源不包含在 Postgres dump 中。应按 Vercel Blob 的保留策略维护对象清单；数据库恢复到旧时间点后，不要立即删除“未引用”对象，先完成内容校验。

## 恢复

推荐恢复到新的空 Neon branch/database，再切换 Vercel 连接变量：

1. 暂停 CMS 写入并保留故障库，不原地覆盖。
2. 创建隔离的 Neon branch/database。
3. 恢复 dump：

```bash
PGDATABASE="$RESTORE_DATABASE_URL" pg_restore --clean --if-exists --no-owner --no-acl "cms-before-release.dump"
```

4. 临时将脚本数据库变量指向恢复库，运行 `npm run cms:verify`。
5. 在 Vercel Preview 验证 CMS 和公开三站。
6. 将 Production 数据库变量切到恢复库并重新部署。
7. 验证完成前不要删除原故障库或相关 Blob。

## 回滚矩阵

| 故障 | 应用处理 | 数据处理 |
| --- | --- | --- |
| 新代码构建/运行错误，数据库未写坏 | Vercel Instant Rollback | 不恢复数据库 |
| schema 迁移失败且事务已回滚 | 回滚应用 | 保留数据库，检查迁移记录 |
| schema 与旧应用不兼容 | 部署兼容修复或前向迁移 | 不执行手工删列 |
| seed 导入了错误内容 | 停止发布并审计新增 slug | 从备份恢复到新库，或经审核后按 slug 清理 |
| 发布造成版本指针/内容损坏 | 先回滚应用并冻结 CMS | 从 Neon 恢复点恢复到新 branch，verify 后切换 |
| 密钥泄露 | 重新部署并轮换相关密钥 | 检查审计日志；数据库内容无损时无需恢复 |

禁止直接执行未经评审的生产 `DROP TABLE`、`TRUNCATE` 或批量 `DELETE` 作为“回滚”。
