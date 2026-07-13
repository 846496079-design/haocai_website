# CMS 环境变量清单

在 Vercel 的 Project Settings → Environment Variables 中配置。Production 和 Preview 使用不同的数据库、Blob Store、管理员凭据、导入密钥和翻译密钥；Development 使用本地 `.env.local`，不得提交。

## 必需变量

| 变量 | 作用域 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | Preview、Production | Neon Marketplace 默认连接变量。应用也支持 `CMS_DATABASE_URL`，两者同时存在时后者优先。必须使用带 TLS 的连接串。 |
| `BLOB_READ_WRITE_TOKEN` | Preview、Production | Vercel Blob 服务端写令牌。不得使用 `NEXT_PUBLIC_` 前缀。缺失时应用会退回本地文件目录，该模式不适用于 Vercel。 |
| `CMS_ADMIN_USERNAME` | 首次初始化所在环境 | 唯一管理员账号。建议使用与公开邮箱不同的专用账号名。 |
| `CMS_ADMIN_PASSWORD` | 首次初始化所在环境 | 初始密码，至少 12 位，建议由密码管理器生成 20 位以上随机值。只用于空的 `cms_admin` 表。 |
| `CMS_IMPORT_SIGNING_SECRET` | 接入外部工作台时 | 导入 API HMAC-SHA256 签名密钥。至少 32 字节随机值，Preview 与 Production 不得复用。 |
| `CMS_IMPORT_SHARED_SECRET` | 仅旧配置迁移期 | 旧环境变量名兼容值，仍按 HMAC 签名密钥使用；新部署禁止使用，迁移完成后删除。 |

## 翻译变量

| 变量 | 说明 |
| --- | --- |
| `CMS_TRANSLATION_API_URL` | 兼容 Chat Completions 的 HTTPS 地址。只允许受信任供应商。 |
| `CMS_TRANSLATION_API_KEY` | 翻译服务密钥，仅服务端使用。 |
| `CMS_TRANSLATION_MODEL` | 支持结构化 JSON 输出的模型标识。 |

三项必须同时配置；缺任一项时“一键翻译”会返回配置错误，不会生成伪译文。

## 本地变量

| 变量 | 说明 |
| --- | --- |
| `CMS_DATABASE_PATH` | 本地 SQLite 路径，默认 `.data/news-cms.sqlite`。生产配置了 Postgres 后不会初始化 SQLite。 |
| `CMS_COOKIE_SECURE` | 仅本地 HTTPS 调试可设为 `true`。生产环境无论该值如何都强制 Secure。 |

## 配置规则

- 不要把真实值写进 `.env.example`、提交记录、工单截图、构建日志或聊天消息。
- Vercel 环境变量修改后必须重新部署才会生效。
- Preview 必须指向隔离的 Neon branch/database 与 Blob Store，避免测试发布修改生产新闻。
- 完成首次管理员创建后，可从 Vercel 移除 `CMS_ADMIN_PASSWORD` 并重新部署；已有管理员登录不依赖该明文变量。
- 轮换导入或翻译密钥时，先在提供方生成新值，再更新 Vercel 并重新部署，验证后撤销旧值。
- 禁止把 Neon 连接串暴露给浏览器；任何数据库变量都不得使用 `NEXT_PUBLIC_` 前缀。

## 生成随机密钥

在可信本机执行，结果直接保存到密码管理器和 Vercel，不写入文件：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```
