# CMS 环境变量清单

在 Vercel 的 Project Settings → Environment Variables 或公司服务器批准的 Secret Manager 中配置。Production 和 Preview 使用不同的数据库、Blob Store、管理员凭据、导入密钥和翻译密钥；Development 使用本地 `.env.local`，不得提交。

## 必需变量

| 变量 | 作用域 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | Preview、Production | Neon Marketplace 默认连接变量。应用也支持 `CMS_DATABASE_URL`，两者同时存在时后者优先。必须使用带 TLS 的连接串。 |
| `BLOB_READ_WRITE_TOKEN` | Preview、Production | Vercel Blob 服务端写令牌。不得使用 `NEXT_PUBLIC_` 前缀。生产环境缺失时会拒绝上传，Vercel 和自有服务器都必须配置。 |
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

当前阿里云自有服务器将真实值写入 `/www/zhangdashi-deploy/shared/env/.env.local`。该文件由发布脚本挂载到每个 release，权限保持 `0600`；修改后重启 PM2 的 `zds-website`。不要把密钥写入网页设置、CNB 构建参数或任何带 `NEXT_PUBLIC_` 前缀的变量。

翻译不是中文发布的阻塞项。未配置或调用失败时，中文稿仍可保存、预览和发布；CMS 标识待翻译，JP/HK 在译稿完成并重新发布前不展示该稿。

## 官网线索中转变量

| 变量 | 说明 |
| --- | --- |
| `LEAD_DATA_ENCRYPTION_KEY` | 32 字节随机密钥，支持 Base64 或 64 位十六进制。用于 AES-256-GCM 加密线索正文；密钥丢失后历史线索无法恢复。当前自有服务器发布脚本会在首次缺失时生成并保存在共享 `.env.local`。 |
| `LEAD_WORKER_TOKEN` | 至少 32 字符的随机令牌，仅用于本机 PM2 worker 调用内部处理接口。当前自有服务器发布脚本会在首次缺失时生成。 |
| `LEAD_ALERT_FEISHU_WEBHOOK_URL` | 飞书群机器人完整 Webhook。未配置时线索接收、自动转发和站内预警仍正常，站外预警停用。 |
| `LEAD_OUTBOX_DATABASE_PATH` | 可选；默认 `.data/lead-outbox.sqlite`。生产必须位于 release 外的共享持久化目录。 |
| `LEAD_WORKER_ENDPOINT` | 可选；默认 `http://127.0.0.1:3000/api/internal/leads/process/`。禁止设置为公网第三方地址。 |
| `LEAD_WORKER_INTERVAL_MS` | 可选；默认 15000，最小 5000。 |
| `PUBLIC_SITE_ORIGIN` | 可选；飞书预警中的官网后台链接，默认 `http://zhangdashi.ai`。 |

飞书通知只发送数量、等待时长和后台链接，不发送姓名、电话、公司或备注。Webhook 与加密密钥不得使用 `NEXT_PUBLIC_` 前缀。

## 飞书智能问数变量

| 变量 | 说明 |
| --- | --- |
| `FEISHU_BOT_APP_ID` | 飞书企业自建应用的 App ID。只在机器人进程中读取。 |
| `FEISHU_BOT_APP_SECRET` | 飞书企业自建应用的 App Secret。不得写入构建产物或日志。 |
| `FEISHU_BOT_ALLOWED_CHAT_IDS` | 允许问数的群聊 ID，多个值使用英文逗号分隔。 |
| `FEISHU_BOT_ALLOWED_USER_IDS` | 允许问数的用户 Open ID，多个值使用英文逗号分隔。 |
| `FEISHU_BOT_ALERT_CHAT_ID` | 接收线索超时预警的群聊 ID；必须同时包含在允许群聊中。 |
| `LEAD_QUERY_AI_PROVIDER` | 当前固定为 `deepseek`。 |
| `LEAD_QUERY_AI_API_URL` | DeepSeek HTTPS 基础地址或完整 Chat Completions 地址；官方地址为 `https://api.deepseek.com`。 |
| `LEAD_QUERY_AI_API_KEY` | DeepSeek 服务端 API Key。 |
| `LEAD_QUERY_AI_MODEL` | DeepSeek 模型标识；示例配置使用 `deepseek-v4-flash`。 |
| `LEAD_QUERY_AI_TIMEOUT_MS` | 可选；DeepSeek 请求超时，默认 15000，范围 3000 至 60000。 |

当前仓库已具备变量校验、DeepSeek 兼容适配器、受控查询计划和线索汇总统计基础。飞书长连接 worker 尚未接入生产启动项；在用户提供或确认 SDK 前，不得把该功能标记为生产可用。

## 本地变量

| 变量 | 说明 |
| --- | --- |
| `CMS_DATABASE_PATH` | 本地 SQLite 路径，默认 `.data/news-cms.sqlite`。生产配置了 Postgres 后不会初始化 SQLite。 |
| `CMS_COOKIE_SECURE` | 未配置时生产环境默认 `true`。仅当生产域名暂时仍为 HTTP、且应用端口只监听回环地址并由受控反向代理访问时，才可显式设为 `false`；启用 HTTPS 后必须改回 `true`。 |

## 配置规则

- 不要把真实值写进 `.env.example`、提交记录、工单截图、构建日志或聊天消息。
- `CMS_COOKIE_SECURE=false` 是 HTTP 过渡配置，不是长期安全方案；域名完成 HTTPS 后必须轮换为 `true` 并重新登录验收。
- Vercel 环境变量修改后必须重新部署；自有服务器变量修改后必须重启服务才会生效。
- Preview 必须指向隔离的 Neon branch/database 与 Blob Store，避免测试发布修改生产新闻。
- 完成首次管理员创建后，可从运行环境移除 `CMS_ADMIN_PASSWORD` 并重新部署或重启；已有管理员登录不依赖该明文变量。
- 轮换导入或翻译密钥时，先在提供方生成新值，再更新运行环境并重新部署或重启，验证后撤销旧值。
- 轮换 `LEAD_DATA_ENCRYPTION_KEY` 前必须完成数据库重加密迁移；禁止直接替换，否则历史线索将无法解密。`LEAD_WORKER_TOKEN` 可在停止 worker 后直接轮换并重启两个 PM2 进程。
- 轮换 `FEISHU_BOT_APP_SECRET` 或 `LEAD_QUERY_AI_API_KEY` 时，先停止未来的 `zds-feishu-bot`，更新共享环境文件并重启；网站和线索转发 worker 不需要停机。
- 禁止把 Neon 连接串暴露给浏览器；任何数据库变量都不得使用 `NEXT_PUBLIC_` 前缀。

## 生成随机密钥

在可信本机执行，结果直接保存到密码管理器和 Vercel，不写入文件：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```
