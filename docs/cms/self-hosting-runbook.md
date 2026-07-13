# 自有服务器部署 Runbook

## 1. 适用范围

本 Runbook 用于把 Next.js 计算服务部署到公司 Linux 服务器，同时继续使用 Neon PostgreSQL 和 Vercel Blob。服务器无需保存业务数据或上传文件，因此可替换、回滚和水平扩容。

当前生产上传代码要求 `BLOB_READ_WRITE_TOKEN`。不要把本地开发用的 `/public/uploads/cms/` 当作生产存储。若需要 S3/MinIO，先完成存储适配器开发和数据迁移方案，再使用本 Runbook。

## 2. 服务器基线

- 64 位 Linux，Node.js 24 LTS，npm 10 或与 lockfile 匹配的包管理器。
- 至少 2 vCPU、4 GB 内存；图片转换使用 `sharp`，低于此配置可能在并发上传时内存不足。
- 服务器能通过 TCP 443 访问 Neon、Vercel Blob 和自有翻译 API。
- Nginx、Caddy 或等价反向代理负责 HTTPS、域名和请求体限制。
- 生产密钥由系统环境、Secret Manager 或受控环境文件注入；环境文件权限为仅运行账户可读。

## 3. 构建

在干净目录检出已签收的 commit：

```bash
git clone <repository-url> zhdashi-official
cd zhdashi-official
git checkout <signed-off-commit>
npm ci
npm run typecheck:cms
npm run build
```

不要把 `.env.local`、数据库连接串或 Blob 令牌打进镜像和构建产物。构建与运行使用同一 Node 主版本。

## 4. 运行环境变量

最少配置：

```text
NODE_ENV=production
DATABASE_URL=<Neon pooled TLS connection string>
BLOB_READ_WRITE_TOKEN=<server-side Blob token>
CMS_ADMIN_USERNAME=<initial administrator username>
CMS_ADMIN_PASSWORD=<temporary initial password, at least 12 characters>
CMS_IMPORT_SIGNING_SECRET=<at least 32 random bytes>
```

需要一键翻译时再配置：

```text
CMS_TRANSLATION_API_URL=<HTTPS endpoint>
CMS_TRANSLATION_API_KEY=<server-side key>
CMS_TRANSLATION_MODEL=<model identifier>
```

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

先在仅本机监听的端口启动：

```bash
npm run start -- -H 127.0.0.1 -p 3000
```

用 systemd、PM2 或容器编排平台托管该命令，必须支持自动重启、标准输出采集和优雅停止。反向代理需满足：

- 将生产域名转发到 `127.0.0.1:3000`。
- 强制 HTTPS，并转发 `Host`、`X-Forwarded-Proto` 和客户端地址。
- 上传请求体上限至少 12 MB；应用自身只接受不超过 10 MB 的 JPEG、PNG、WebP。
- 不缓存 `/cms/` 和 `/api/cms/`。
- 对外只开放 80/443，应用端口不直接暴露公网。

## 7. 首次启动与验收

1. 访问 `/cn/`，确认公开站点返回 200。
2. 访问 `/cms/login/`，使用初始管理员登录；首次登录会在空的 `cms_admin` 表中创建账号。
3. 登录后访问 `/api/cms/health/`，应返回 `ready: true`、`postgresql-active` 和 `vercel-blob-configured`。
4. 按 [deployment-runbook.md](./deployment-runbook.md) 的 Preview 验收清单完成全流程测试。
5. 将初始凭据保存到批准的密码管理器，从运行环境移除 `CMS_ADMIN_PASSWORD`，重启服务并再次验证登录。

## 8. 发布、回滚与扩容

- 发布：构建新目录或新镜像，验收后原子切换反向代理或服务版本。
- 应用回滚：切回上一已签收 commit 或镜像，不执行数据库恢复。
- 数据恢复：仅确认数据库被错误写入时按 [data-operations.md](./data-operations.md) 执行。
- 扩容：多个实例共用 Neon 和 Blob；所有实例必须使用完全一致的服务端变量。
- 下线旧实例前先停止新流量，再等待进行中的上传和发布请求结束。

## 9. 监控

- 公开可用性：监控 `/cn/`、`/jp/`、`/hk/` 的状态码与响应时间。
- CMS 就绪：使用受控测试账号登录后检查 `/api/cms/health/`；该接口不是匿名探针。
- 应用日志：关注登录失败、数据库连接、Blob 上传、翻译和发布错误，日志不得记录密钥或完整连接串。
- 外部资源：监控 Neon 连接数、存储、慢查询和恢复点，监控 Blob 写入失败及容量。
