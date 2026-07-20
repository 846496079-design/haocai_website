# 自有服务器部署 Runbook

## 1. 适用范围

本 Runbook 用于把 Next.js 计算服务部署到公司 Linux 服务器。应用既支持 Neon PostgreSQL 与 Vercel Blob，也兼容单实例服务器上的 SQLite；无论采用哪种存储，应用 release 都不得包含数据库、环境文件、上传目录或运行日志。

当前生产上传代码要求 `BLOB_READ_WRITE_TOKEN`。不要把本地开发用的 `/public/uploads/cms/` 当作生产存储。若需要 S3/MinIO，先完成存储适配器开发和数据迁移方案，再使用本 Runbook。

## 2. 服务器基线

- 64 位 Linux，Node.js 24 LTS，npm 10 或与 lockfile 匹配的包管理器。
- 至少 2 vCPU、4 GB 内存；图片转换使用 `sharp`，低于此配置可能在并发上传时内存不足。
- 服务器能通过 TCP 443 访问 Neon、Vercel Blob 和自有翻译 API。
- Nginx、Caddy 或等价反向代理负责 HTTPS、域名和请求体限制。
- 生产密钥由系统环境、Secret Manager 或受控环境文件注入；环境文件权限为仅运行账户可读。

### 2.1 账大师当前生产基线

- 域名：`http://zhangdashi.ai/`，宝塔 Nginx 反向代理到 `127.0.0.1:3000`。
- CNB 源仓库：`jason.cnb/hc/ai/website_promotion_zds`。
- 唯一生产触发分支：`codex/official-home-trust-redesign` 的 `push`。
- 服务名：PM2 `zds-website` 与 `zds-lead-worker`；自动发布后分别运行 standalone 网站服务和本地线索重试调度器。
- 发布根目录：`/www/zhangdashi-deploy`，包含 `incoming`、`releases`、`current` 和 `shared`。
- 当前生产仍使用原站点目录中的 `.data` 与 `.env.local` 作为持久化源，通过 `shared/data` 和 `shared/env/.env.local` 只读接入 release；自动发布不得移动、复制或删除它们。
- CNB 使用专用 `deploy` 用户。该用户只能写上传暂存区，不能读取生产环境文件，sudo 仅放行 `/usr/local/sbin/zhangdashi-release`。

## 3. 构建

正式生产发布由根目录 `.cnb.yml` 在 Linux amd64 的 Node.js 24 镜像中执行 `npm ci`、CMS 类型检查、`next build` 和 standalone 打包。构建后生成 `SHA256SUMS`，服务器核验全部文件后才允许切换。

手工构建只用于排障或预演：

在干净目录检出已签收的 commit：

```bash
git clone <repository-url> zhdashi-official
cd zhdashi-official
git checkout <signed-off-commit>
npm ci
npm run typecheck:cms
npm run build
```

不要把 `.env.local`、`.data`、`public/uploads/cms`、数据库连接串或 Blob 令牌打进镜像和构建产物。构建与运行使用同一 Node 主版本。

## 4. 运行环境变量

最少配置：

```text
NODE_ENV=production
DATABASE_URL=<Neon pooled TLS connection string>
BLOB_READ_WRITE_TOKEN=<server-side Blob token>
CMS_ADMIN_USERNAME=<initial administrator username>
CMS_ADMIN_PASSWORD=<temporary initial password, at least 12 characters>
CMS_IMPORT_SIGNING_SECRET=<at least 32 random bytes>
LEAD_DATA_ENCRYPTION_KEY=<32 random bytes in Base64>
LEAD_WORKER_TOKEN=<at least 32 random characters>
```

当前原子发布脚本会在共享 `.env.local` 中缺失时自动生成最后两项，且不会覆盖已有值。需要飞书站外预警时另行配置：

```text
LEAD_ALERT_FEISHU_WEBHOOK_URL=<Feishu group bot webhook>
```

飞书应用机器人与 DeepSeek 智能问数的配置基础已经进入仓库，但长连接 worker 尚未加入生产 PM2。用户提供或确认飞书 SDK 后，再在共享 `.env.local` 中配置：

```text
FEISHU_BOT_APP_ID=<Feishu custom app id>
FEISHU_BOT_APP_SECRET=<Feishu custom app secret>
FEISHU_BOT_ALLOWED_CHAT_IDS=<comma-separated allowed chat ids>
FEISHU_BOT_ALLOWED_USER_IDS=<comma-separated allowed user open ids>
FEISHU_BOT_ALERT_CHAT_ID=<alert chat id included in allowed chats>
LEAD_QUERY_AI_PROVIDER=deepseek
LEAD_QUERY_AI_API_URL=https://api.deepseek.com
LEAD_QUERY_AI_API_KEY=<server-side DeepSeek key>
LEAD_QUERY_AI_MODEL=deepseek-v4-flash
```

这些变量不得提前写入仓库或 CNB 构建参数。当前发布脚本不会启动不完整的机器人进程，现有 Webhook 预警继续工作。

需要一键翻译时再配置：

```text
CMS_TRANSLATION_API_URL=<HTTPS endpoint>
CMS_TRANSLATION_API_KEY=<server-side key>
CMS_TRANSLATION_MODEL=<model identifier>
```

当前生产服务器的准确配置位置是 `/www/zhangdashi-deploy/shared/env/.env.local`。建议在宝塔文件管理器中由 root 编辑，避免密钥进入终端历史；保存后确认文件权限为 `0600`，再执行：

```bash
env HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production pm2 restart zds-website --update-env
pm2 status zds-website
```

登录 CMS 后访问 `/api/cms/health/`，确认 `translation` 为 `configured`，再用测试稿执行一次翻译。翻译期间编辑区应被遮罩锁定；翻译完成后页面应显示已保存状态并直接引导重新预览、人工审核和确认发布。新媒体同事不需要知道或填写 API Key，只需登录网页后台点击“一键翻译”；密钥始终由 Next.js 服务端读取。未配置翻译时中文稿仍可发布，JP/HK 暂不展示该稿。

变量含义和轮换规则以 [environment-variables.md](./environment-variables.md) 为准。

## 5. 数据库发布

迁移由一名操作者在发布窗口执行，不写入 systemd、容器启动命令或 CI 的每次部署步骤：

```bash
npm run cms:migrate -- --dry-run
npm run cms:migrate
npm run cms:seed-legacy -- --dry-run
npm run cms:seed-legacy
npm run cms:verify
```

历史 seed 对有效 slug 不做覆盖；只在文章版本指针缺失或无效时复用已有发布版本或补建版本。生产执行前仍应建立 Neon 恢复点或逻辑备份。

## 6. 启动与反向代理

源码目录手工运行时，先在仅本机监听的端口启动：

```bash
npm run start -- -H 127.0.0.1 -p 3000
```

用 systemd、PM2 或容器编排平台托管该命令，必须支持自动重启、标准输出采集和优雅停止。反向代理需满足：

- 将生产域名转发到 `127.0.0.1:3000`。
- 强制 HTTPS，并转发 `Host`、`X-Forwarded-Proto` 和客户端地址。
- 上传请求体上限至少 12 MB；应用自身只接受不超过 10 MB 的 JPEG、PNG、WebP。
- 不缓存 `/cms/` 和 `/api/cms/`。
- 对外只开放 80/443，应用端口不直接暴露公网。

standalone release 由发布脚本把 `HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production node server.js` 固化为 PM2 保存的启动命令，确保 PM2 自动重启后仍监听回环地址，而不是继承服务器 `HOSTNAME` 对应的 IPv6 地址；线索调度器使用同一 release 中的 `scripts/leads/worker.mjs`，只调用回环地址上的受保护内部接口。不要把数据库迁移、seed 或生产数据写入加入 PM2 启动命令。

Nginx 缓存边界：

- `/_next/static/` 指向 `/www/zhangdashi-deploy/shared/next-static/`，使用一年 immutable 缓存；旧哈希文件跨 release 保留。
- `/cn/`、`/jp/`、`/hk/` 及其子页面使用 `no-store, max-age=0`，并通过 `proxy_cache_bypass` 与 `proxy_no_cache` 绕过宝塔在 `http` 层继承的全局代理缓存；公开 HTML 与 RSC 不在浏览器或共享缓存中保存，不得透传正数 `max-age` 或 `s-maxage`。
- `/cms/` 和 `/api/` 保留应用返回的 `private, no-store` 等缓存头，不能被公开页面规则覆盖。

三站首页、新闻列表和新闻详情必须保持 `force-dynamic`，每次请求都从运行时共享数据库读取 CMS 已发布内容。不能让这些路由进入永久静态预渲染；构建阶段使用的临时初始化数据库只用于完成构建，不能作为线上新闻数据源。

静态生成页面可以保留 ETag；运行时读取 CMS 数据的动态首页不强制生成 ETag，且 `no-store` 不以缓存复用或 `304` 为发布前提。RSC 响应同样使用 `no-store, max-age=0`；HTML 实际引用的 CSS 与 JavaScript 必须同时具备一年 `max-age=31536000` 与 `immutable`。发布脚本还会把 Nginx 在 `identity`、`gzip`、`br` 三种内容编码下返回的产品页 HTML/RSC 与当前 Next.js 进程逐一比较，任一编码仍返回旧 release 都会回滚。

旧缓存规则已经写入用户设备的 HTML 无法由服务器主动删除；受影响设备需要执行一次强制刷新，或先访问带一次性查询参数的页面。设备取得新响应后，`no-store` 会阻止公开 HTML 与 RSC 再次写入缓存。服务器 `proxy_cache` 中的历史对象不能转嫁给访问者处理，路径级 bypass 必须让它们立即退出请求链路。

## 7. 首次启动与验收

1. 访问 `/cn/`，确认公开站点返回 200。
2. 访问 `/cms/login/`，使用初始管理员登录；首次登录会在空的 `cms_admin` 表中创建账号。
3. 登录后访问 `/api/cms/health/`，应返回 `ready: true`、`postgresql-active` 和 `vercel-blob-configured`。
4. 按 [deployment-runbook.md](./deployment-runbook.md) 的 Preview 验收清单完成全流程测试。
5. 将初始凭据保存到批准的密码管理器，从运行环境移除 `CMS_ADMIN_PASSWORD`，重启服务并再次验证登录。
6. 在官网后台打开“线索管理”，确认数据库可初始化、飞书配置状态正确，并检查 PM2 的 `zds-lead-worker` 为 `online`。
7. 智能问数生产接入完成后再增加 `zds-feishu-bot` 验收；当前阶段不得把仅有配置基础视为机器人已经上线。

## 8. 发布、回滚与扩容

- 发布：只需向 `codex/official-home-trust-redesign` 推送 commit。CNB 构建后 rsync 到 `incoming/<commit>`，服务器预启动检查通过才原子切换 `current`。
- 自动回滚：切换后的首页、实际 CSS 或缓存头检查失败时，发布脚本恢复上一 `current` 并重启；新版本仍以失败结束。
- 手工回滚：root 在宝塔终端把 `current` 原子改回 `/www/zhangdashi-deploy/releases/<上一提交>`，按发布脚本逻辑重建 PM2 `zds-website` 和该版本存在的 `zds-lead-worker`，再验证三站首页和实际 CSS；不执行数据库恢复。
- 当前版本恢复：只需重新启动当前 `current` 时，由 `deploy` 用户执行 `sudo /usr/local/sbin/zhangdashi-release --restart-current`；该入口不切换 release、不改生产数据，重建两个 PM2 进程并完成回环地址、Nginx、多编码内容和线索 worker 健康检查。
- release 保留：最近 5 个完整版本；`shared/next-static` 中仍被保留 release 使用的哈希文件不得删除。
- 数据恢复：仅确认数据库被错误写入时按 [data-operations.md](./data-operations.md) 执行。
- 扩容：多个实例共用 Neon 和 Blob；所有实例必须使用完全一致的服务端变量。
- 下线旧实例前先停止新流量，再等待进行中的上传和发布请求结束。

CNB 密钥位于密钥仓库 `jason.cnb/hc/ai/github-sync-secrets` 的 `official-deploy.yml`，并通过插件参数引用 `settingsFrom` 直接传给固定版本 rsync 插件。轮换时先把新公钥加入 `/home/deploy/.ssh/authorized_keys` 并验证，再替换密钥文件中的 `key`，触发一次真实发布成功后撤销旧公钥。官网仓库和运维文档不得保存私钥。

当前生产部署公钥指纹（2026-07-17）：`SHA256:khplC+qGc5MrWoPIcAAo3hcEFPVD/ewMLtvs97eugGQ`（ED25519）。

## 9. 监控

- 公开可用性：监控 `/cn/`、`/jp/`、`/hk/` 的状态码与响应时间。
- CMS 就绪：使用受控测试账号登录后检查 `/api/cms/health/`；该接口不是匿名探针。
- 应用日志：关注登录失败、数据库连接、Blob 上传、翻译和发布错误，日志不得记录密钥或完整连接串。
- 线索中转：监控 `zds-lead-worker` 在线状态、后台待发送数量、最老等待时长和飞书预警通道；日志不得记录线索明文。
- 外部资源：监控 Neon 连接数、存储、慢查询和恢复点，监控 Blob 写入失败及容量。
