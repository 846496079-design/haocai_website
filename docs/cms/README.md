# 新闻 CMS 生产交付文档

本目录是新闻 CMS 在 Vercel、Neon Postgres 和 Vercel Blob 上线与运维的唯一操作入口。

| 文档 | 用途 |
| --- | --- |
| [deployment-runbook.md](./deployment-runbook.md) | 从空环境到 Preview、Production 的完整上线顺序与验收 |
| [environment-variables.md](./environment-variables.md) | 环境变量、作用域、生成与轮换要求 |
| [data-operations.md](./data-operations.md) | schema 迁移、历史新闻导入、校验、备份、恢复和回滚 |
| [admin-bootstrap.md](./admin-bootstrap.md) | 唯一管理员首次初始化、凭据保管和应急重置 |
| [integration-api.md](./integration-api.md) | 新媒体工作台导入字段和接口清单 |
| [translation-api.md](./translation-api.md) | 自有翻译 API 的请求、响应和字段约定 |

## 可执行命令

```bash
npm run cms:migrate -- --help
npm run cms:seed-legacy -- --help
npm run cms:verify -- --help
```

所有命令只从 `CMS_DATABASE_URL` 或 `DATABASE_URL` 读取数据库连接串，不把连接串或其他密钥写入仓库和日志。首次执行前先使用 `--dry-run`。

## 上线门禁

以下条件缺一不可：

1. 生产环境已连接 Neon 和 Blob，且环境变量作用域正确。
2. schema 迁移、历史新闻导入和 `cms:verify` 全部通过。
3. 已完成数据库恢复点或逻辑备份。
4. Preview 中完成管理员登录、上传、草稿、翻译、预览、发布、下架和恢复测试。
5. CN、JP、HK 的新闻列表与详情均通过逐篇抽查。

不要在 Vercel Build Command 中运行迁移或 seed；并行构建和回滚部署可能导致不可控的数据写入。迁移应由单一操作者在发布窗口显式执行。
