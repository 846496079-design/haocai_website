# Vercel + Neon + Blob 部署 Runbook

本文只覆盖 Vercel 计算平台。使用公司服务器时执行 [self-hosting-runbook.md](./self-hosting-runbook.md)，两种部署方式共用同一套 Neon 数据迁移和验收标准。

## 1. 前置条件

- GitHub 上待部署分支包含 CMS 代码、`db/migrations/`、`scripts/cms/` 和本目录文档。
- Vercel Project 已连接正确的 GitHub 仓库；Framework Preset 为 Next.js，Build Command 使用仓库的 `npm run build`，不要使用旧 `dist` 静态目录。
- 操作者拥有 Vercel Project、Neon Project、Blob Store 和域名设置权限。
- 本机 Node.js 与仓库 lockfile 对应，已执行 `npm ci`。
- 已阅读 [环境变量清单](./environment-variables.md) 与 [数据操作](./data-operations.md)。

## 2. 建立隔离的 Preview 资源

1. 在 Neon 创建 Preview branch/database；不要让功能分支直连生产 branch。
2. 在 Vercel Storage 为该项目连接 Blob Store，确认 Preview 作用域获得独立写令牌。
3. 按环境变量清单配置 Preview 变量。管理员、导入和翻译密钥使用测试专用值。
4. 在可信本机临时设置 Preview 的数据库连接变量，不要把值写入命令历史或仓库。
5. 依次执行：

```bash
npm run cms:migrate -- --dry-run
npm run cms:migrate
npm run cms:seed-legacy -- --dry-run
npm run cms:seed-legacy
npm run cms:verify
```

6. 推送分支触发 Vercel Preview Deployment。构建失败时不得跳过类型或运行时错误直接上线。

## 3. Preview 验收

使用 Preview 域名完成以下测试，并保留不含秘密的结果记录：

1. `/cms/login/`：首次管理员可登录，连续错误登录会锁定，退出后会话失效。
2. `/api/cms/health/`：登录后显示 `postgresql-active`、`vercel-blob-configured`；需要验收一键翻译时，翻译为 `configured`。
3. 分类：创建、停用、恢复；稿件编辑器只能选择启用分类。
4. 素材：分别上传 JPEG、PNG、WebP；返回 Blob URL，刷新和重新部署后仍可访问。
5. 稿件：新建中文草稿、加入正文图、拖拽分节、保存；日文和港文不应自动变化。
6. 非阻塞发布：不翻译，预览中文并人工确认发布；CN 列表和详情可访问，JP/HK 不展示该稿，CMS 标识待翻译。
7. 翻译：点击一次生成 JP、HK 草稿，人工检查产品名、数字、日期和链接；重新预览发布后验证三个站点的列表和详情。
8. 状态：下架后公开详情不可访问；删除进入回收站；恢复回到草稿。
9. 已发布排序：置顶和拖拽只出现在已发布区，三个公开站点顺序一致。
10. 外部导入：使用 Preview 密钥导入一次新分类与一次空分类，确认都只生成草稿。

任何数据仍落到 SQLite、图片 URL 为 `/uploads/cms/`、旧新闻缺失或外语站错误展示未翻译稿，都属于上线阻断。翻译未配置只会停用一键翻译，不阻止中文发布。

## 4. Production 发布

1. 冻结 CMS 内容写入，记录发布窗口。
2. 按 [数据操作](./data-operations.md) 创建 Neon 恢复点或逻辑备份。
3. 在 Vercel Production 连接生产 Neon branch/database 与 Blob Store。
4. 配置 Production 环境变量；不得复制 Preview 密钥。
5. 在本机先运行迁移和 seed 的 `--dry-run`，再单人执行正式命令。历史 seed 不覆盖有效的同 slug 稿件，只修复缺失或无效的版本指针。
6. 执行 `npm run cms:verify`，结果必须为零错误。
7. 将已经验收的 commit 部署为 Production。不要在 Production 临时改分支后跳过 Preview 验收。
8. 首次打开 CMS 完成管理员初始化；确认登录后移除 Vercel 中的初始明文密码并重新部署。
9. 重复 Preview 验收中的健康检查、公开三站抽查、上传和草稿流程。生产 smoke 稿件不得发布，或测试后放入回收站并永久删除。

## 5. 发布后监控

- 检查 Vercel Function 错误率、响应时延与 Blob 写入错误。
- 检查 Neon 连接数、存储增长、慢查询与恢复点状态。
- 重点观察 `/cms/`、上传、翻译、发布接口及 `/cn|jp|hk/news/`。
- 每次正式发布、下架和排序后抽查三个站点，不以 CMS 返回成功作为唯一证据。

## 6. 回滚判定

出现以下任一情况立即停止内容操作并进入回滚：

- CMS 连接到错误数据库或生产仍初始化 SQLite。
- 旧新闻缺失、三语内容错配、公开页出现草稿。
- 发布/下架出现部分成功或数据指针异常。
- Blob 图片持续失败、管理员无法登录或凭据疑似泄露。

应用回滚和数据恢复是两件事：先在 Vercel 使用 Instant Rollback 回到上一已验证 Deployment；只有确认数据库已被错误写入时，才按数据操作文档恢复 Neon。不要为了前端错误盲目覆盖数据库。
