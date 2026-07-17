# 新闻 CMS 技术总交接单

## 一、交接结论

官网生产计算平台已于 2026-07-17 选定为阿里云 Linux 服务器：宝塔 Nginx 反向代理到 PM2 管理的 Next.js standalone 服务。向 `codex/official-home-trust-redesign` 推送 commit 后，CNB 构建不可变发布包并通过受限 `deploy` 用户上传，服务器预启动验收通过后原子切换 `current`。

Vercel、Neon 与 Vercel Blob 仍可作为后续迁移路径，但不是当前官网生产请求的数据来源。若公司要求数据库和图片完全私有化并迁移到 PostgreSQL 与 S3/MinIO，应另立迁移项目；当前代码尚未提供 S3/MinIO 适配器。

## 二、当前可交付状态

| 项目 | 当前状态 |
| --- | --- |
| 代码分支 | `codex/official-home-trust-redesign` |
| 生产计算平台 | 阿里云 Linux、宝塔 Nginx、PM2、Next.js standalone |
| 自动发布 | CNB 分支 push 触发，发布根目录 `/www/zhangdashi-deploy`，保留最近 5 个 release |
| 当前生产数据 | 服务器持久化 `.data` 与 `.env.local`，发布包只通过受控符号链接引用，不复制或覆盖 |
| Neon 资源 | `haocai-cms-db`，新加坡区域，已连接项目，但尚未切为当前官网生产数据源 |
| 数据库迁移 | `001_cms_postgres.sql`、`002_cms_operations.sql` 已执行 |
| 历史数据 | 17 篇已发布新闻已迁移，三语正文逐篇哈希对账通过 |
| 图片存储 | Vercel Blob `haocai-cms-media` 已建立，但尚未切为当前官网生产图片源 |
| 管理员 | 当前生产账号由服务器环境变量和持久化数据管理，密钥值不进入仓库 |
| 翻译 | 接口已预留，生产地址、密钥和模型尚未配置 |
| 生产切换 | 已完成，域名 `http://zhangdashi.ai`；TLS 证书与 HTTPS 切换仍待单独安排 |

交接时使用 `git rev-parse HEAD` 记录最终交付提交，不以工作目录或截图代替版本号。

## 三、技术总需要拍板的五项内容

1. TLS 证书负责人和 HTTPS 切换窗口。
2. 是否把当前生产持久化数据迁移到 Neon 与 Vercel Blob；如不接受 Blob，需要排期开发 S3/MinIO 适配器。
3. 自有翻译 API 的生产 URL、模型名、限流与费用责任人。
4. 服务器、域名、CNB KeyStore 与数据备份的账号归属、责任人与故障联系人。
5. 发布失败、数据恢复和证书到期的告警接收人。

## 四、交接材料

| 材料 | 路径 |
| --- | --- |
| 平台无关设计依据 | `docs/superpowers/specs/2026-07-13-platform-neutral-cms-deployment-design.md` |
| Vercel 上线步骤 | `docs/cms/deployment-runbook.md` |
| 自有服务器上线步骤 | `docs/cms/self-hosting-runbook.md` |
| 环境变量与密钥 | `docs/cms/environment-variables.md` |
| 数据迁移、备份与恢复 | `docs/cms/data-operations.md` |
| 管理员初始化 | `docs/cms/admin-bootstrap.md` |
| 外部工作台接口 | `docs/cms/integration-api.md` |
| 自有翻译接口 | `docs/cms/translation-api.md` |

## 五、建议的 45 分钟交接会议

### 0—10 分钟：边界确认

- 展示代码分支和最终提交。
- 确认计算平台、生产域名、对象存储方案。
- 明确 Preview 与 Production 必须使用隔离数据库和密钥。

### 10—25 分钟：现场演示

- 执行迁移 dry-run 和 `cms:verify`。
- 登录 CMS，演示分类、草稿、正文图片、翻译、预览和发布流程。
- 展示 CN、JP、HK 公开新闻列表与详情。

### 25—35 分钟：运维演练

- 展示应用回滚，不修改数据库。
- 展示 Neon 备份/恢复流程和恢复后校验。
- 说明初始管理员密码、导入密钥和翻译密钥的轮换方式。

### 35—45 分钟：签收

- 指定部署、数据库、内容后台和安全四类负责人。
- 记录尚未配置的翻译 API 和生产域名。
- 使用本文末尾清单逐项签收。

## 六、交付与签收清单

- [ ] 最终 commit 已推送，技术总可拉取并成功构建。
- [ ] 技术总已确认生产计算平台与域名。
- [ ] 生产环境变量已存入批准的密钥管理系统，未通过聊天或仓库传递。
- [ ] Preview 和 Production 的 Neon、Blob、管理员、导入密钥互相隔离。
- [ ] `npm run cms:migrate -- --dry-run` 与 `npm run cms:verify` 通过。
- [ ] 首次管理员已创建，临时 `CMS_ADMIN_PASSWORD` 已删除并重新部署。
- [ ] 图片上传、三语预览、发布、下架、回收站、置顶和排序通过验收。
- [ ] 数据备份与应用回滚各演练一次。
- [ ] 监控告警和故障联系人已登记。
- [ ] 翻译 API 未配置时的业务流程已确认：中文草稿可继续编辑，日文和港文由人工补录或待接口配置后一次翻译。
