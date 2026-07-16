# 新闻 CMS 生产交付文档

本目录是新闻 CMS 在 Vercel 或自有服务器、Neon Postgres 和 Vercel Blob 上线与运维的唯一操作入口。

| 文档 | 用途 |
| --- | --- |
| [cto-handoff.md](./cto-handoff.md) | 技术总决策项、交接会议议程与签收清单 |
| [deployment-runbook.md](./deployment-runbook.md) | 从空环境到 Preview、Production 的完整上线顺序与验收 |
| [self-hosting-runbook.md](./self-hosting-runbook.md) | 公司 Linux 服务器构建、运行、反向代理、回滚和监控 |
| [environment-variables.md](./environment-variables.md) | 环境变量、作用域、生成与轮换要求 |
| [data-operations.md](./data-operations.md) | schema 迁移、历史新闻导入、校验、备份、恢复和回滚 |
| [admin-bootstrap.md](./admin-bootstrap.md) | 唯一管理员首次初始化、凭据保管和应急重置 |
| [integration-api.md](./integration-api.md) | 新媒体工作台导入字段和接口清单 |
| [translation-api.md](./translation-api.md) | 自有翻译 API 的请求、响应和字段约定 |
| [CMS 微信兼容排版与统一发布字段设计](../superpowers/specs/2026-07-16-wechat-compatible-cms-formatting-design.md) | 过渡排版板块、微信公众号兼容字段、复制规则、端到端验收和未来接口交付清单；当前为设计依据，尚未替代生产接口 |

## 可执行命令

```bash
npm run cms:migrate -- --help
npm run cms:seed-legacy -- --help
npm run cms:verify -- --help
```

所有命令只从 `CMS_DATABASE_URL` 或 `DATABASE_URL` 读取数据库连接串，不把连接串或其他密钥写入仓库和日志。首次执行前先使用 `--dry-run`。

## 本地开发访问

本机使用 `http://127.0.0.1:3000` 调试 CMS 时，Next.js 开发服务已显式允许该来源加载热更新资源，CMS 的开发环境同源校验也允许此本机地址。修改 `next.config.mjs` 或 `proxy.ts` 后必须重启本地开发服务；否则页面可能能显示但表单按钮不会响应，或登录返回“拒绝跨站请求”。生产环境仍只允许严格同源请求。

## 上线门禁

以下条件缺一不可：

1. 生产计算服务已连接 Neon 和 Blob，且环境变量作用域正确。
2. schema 迁移、历史新闻导入和 `cms:verify` 全部通过。
3. 已完成数据库恢复点或逻辑备份。
4. Preview 中完成管理员登录、上传、草稿、翻译、预览、发布、下架和恢复测试。
5. CN、JP、HK 的新闻列表与详情均通过逐篇抽查。

不要在 Vercel Build Command 中运行迁移或 seed；并行构建和回滚部署可能导致不可控的数据写入。迁移应由单一操作者在发布窗口显式执行。
