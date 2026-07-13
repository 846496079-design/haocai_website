# 新闻 CMS 技术总交接单

## 一、交接结论

本项目不依赖 Vercel 才能运行。推荐先把部署选择限定在以下两条可直接执行的路径：

1. Vercel 托管 Next.js，连接 Neon 与 Vercel Blob。
2. 公司 Linux 服务器运行 Next.js，继续连接同一套 Neon 与 Vercel Blob。

两条路径共用同一套数据结构、迁移脚本和业务代码，切换计算平台不需要重新迁移新闻。若公司要求数据库和图片都完全私有化，应另立项目接入自建 PostgreSQL 与 S3/MinIO；当前代码尚未提供 S3/MinIO 适配器。

## 二、当前可交付状态

| 项目 | 当前状态 |
| --- | --- |
| 代码分支 | `codex/official-home-trust-redesign` |
| Neon 资源 | `haocai-cms-db`，新加坡区域，已连接项目 |
| 数据库迁移 | `001_cms_postgres.sql`、`002_cms_operations.sql` 已执行 |
| 历史数据 | 17 篇已发布新闻已迁移，三语正文逐篇哈希对账通过 |
| 图片存储 | Vercel Blob `haocai-cms-media` 已建立 |
| 管理员 | Neon 当前尚未创建管理员；由生产环境首次启动时用临时初始凭据创建 |
| 翻译 | 接口已预留，生产地址、密钥和模型尚未配置 |
| 生产切换 | 尚未执行，避免在部署平台未确定时误切生产 |

交接时使用 `git rev-parse HEAD` 记录最终交付提交，不以工作目录或截图代替版本号。

## 三、技术总需要拍板的五项内容

1. 计算平台：Vercel 或公司 Linux 服务器。
2. 生产域名、TLS 证书负责人和 DNS 切换窗口。
3. 第一阶段是否接受继续使用 Vercel Blob；如不接受，需要排期开发 S3/MinIO 适配器。
4. 自有翻译 API 的生产 URL、模型名、限流与费用责任人。
5. Neon、Blob、服务器、域名和密钥的账号归属、备份责任人与故障联系人。

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
