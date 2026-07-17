# CNB 到宝塔服务器的原子部署设计

## 背景与目标

账大师官网由 CNB 仓库 `jason.cnb/hc/ai/website_promotion_zds` 的 `codex/official-home-trust-redesign` 分支维护，生产域名为 `http://zhangdashi.ai/`，运行在阿里云 Linux 服务器并由宝塔面板管理 Nginx 与 Next.js 服务。当前 `.cnb.yml` 只把分支同步到 GitHub，没有部署到生产服务器。

移动端截图曾出现完整 HTML 和图片已返回、但页面近似无样式的状态。现网检查显示 `/cn/` 当前能在 375 px 视口下正确渲染，两份 CSS 均返回 `200`；同时 HTML 响应带有 `Cache-Control: s-maxage=31536000`，静态 chunk 使用一年不可变缓存。若发布时直接覆盖或删除旧 `.next/static`，共享缓存中的旧 HTML 仍可能引用已经不存在的 CSS chunk，形成“HTML 到了、CSS 没到”的版本错配。

本设计的目标是：仅在目标分支推送时自动部署；以独立发布目录完成构建产物上传、检查、切换和回滚；让旧 HTML 在缓存窗口内仍能获取对应的静态资源；部署凭据不进入代码仓库和日志；保留现有 GitHub 镜像同步能力。

## 方案比较

### 方案一：覆盖现有运行目录

流水线直接把新文件同步到当前目录，再重启 Next.js。配置最少，但上传、删除旧 chunk、进程重启之间存在不一致窗口；失败后目录可能同时包含两个版本，也没有可靠回滚点。该方案不能稳定解决现有 CSS 丢失问题，不采用。

### 方案二：版本化原子发布（采用）

CNB 在 Linux 构建环境中完成依赖安装、检查和 Next.js standalone 构建，将产物上传到以 commit 标识的独立目录。服务器先验证目录完整性，再原子切换 `current` 软链接并重启现有服务；健康检查失败时切回上一软链接并重新启动。静态 chunk 合并进入持久共享目录，HTML 响应改为每次重新验证，避免旧 HTML 与已删除 chunk 失配。

该方案变更范围集中在部署配置、Next.js standalone 输出、服务器发布脚本和 Nginx 缓存规则，不修改官网页面内容、CMS 数据或业务接口。

## 触发与流水线结构

- `codex/official-home-trust-redesign` 的 `push` 事件执行 GitHub 同步与生产部署。
- 其他分支的 `push` 只保留现有 GitHub 同步，不触发生产部署。
- 生产流水线按“依赖安装与构建 → 打包 → 上传 → 服务器发布 → 外部验收”串行执行，任一步骤失败即停止。
- 依赖使用锁文件冻结安装，并沿用仓库现有国内 npm 镜像；构建不得忽略命令退出码。
- 构建产物采用 Next.js standalone 结构，包含 `server.js`、standalone 运行文件、`.next/static` 和 `public`。数据库、上传文件、环境变量文件和运行日志不得打入产物。
- 构建前确认 CNB Runner 与服务器均为 Linux amd64；架构不一致时流水线在上传前失败，不发布不兼容的原生依赖。

## 服务器目录与职责

首次 SSH 检查已确认实际发布根目录为 `/www/zhangdashi-deploy`，宝塔站点旧运行目录为 `/www/wwwroot/zhangdashi.ai/website_promotion_zds`，PM2 服务名为 `zds-website`。发布根目录内部固定使用以下边界：

```text
DEPLOY_ROOT/
├─ incoming/             # CNB 上传中的临时目录
├─ releases/<commit>/    # 完整且不可变的版本目录
├─ current -> releases/<commit>
└─ shared/
   ├─ next-static/       # 跨版本保留的内容哈希静态 chunk
   ├─ data/              # 仅在现网仍使用本地持久数据时挂载
   ├─ env/               # 服务器运行环境变量，流水线不可读取
   └─ logs/              # 运行日志
```

- `incoming` 只接收尚未验收的文件；不得直接作为运行目录。
- `releases/<commit>` 上传完成后写入校验文件并改为不可变版本；同一 commit 不重复覆盖。
- `current` 是运行服务唯一使用的发布入口；软链接切换采用同文件系统原子重命名。
- `shared/data`、`shared/env` 和生产数据库不参与应用发布、清理或回滚。
- 保留最近 5 个完整 release；共享静态 chunk 至少保留 30 天，清理前确认不再被保留 release 引用。
- 首次接入复用现有健康的进程管理器和监听端口，不为实现 CI 无依据地替换宝塔 Node 项目、PM2 或 systemd。

## SSH 身份与最小权限

1. 在本机生成用途单一、无交互密码短语的 Ed25519 CI 密钥；私钥不得进入官网仓库。
2. 通过宝塔终端把公钥临时加入 root 的 `authorized_keys`，开启密钥登录并完成首次连接验证；密码登录在此时保持不变，避免锁死服务器。
3. 首次连接后创建独立 `deploy` 系统用户，把同一公钥迁移到该用户，并从 root 移除这把 CI 公钥。
4. `deploy` 只能写入 `DEPLOY_ROOT/incoming` 和 `DEPLOY_ROOT/releases`，只能执行固定的发布包装脚本；不得读取 `shared/env`、数据库凭据或其他站点目录。
5. 若重启现有服务需要提权，只通过 sudoers 放行固定发布脚本或固定服务重启命令，不授予通用 root shell。
6. 流水线确认以 `deploy` 用户成功运行后，再单独评估关闭 root 密码登录；该安全加固不与首次发布捆绑执行。

## CNB 密钥仓库

在现有密钥仓库中新建独立文件 `official-deploy.yml`，与 `github-sync.yml` 分离。文件包含部署主机、端口、用户、部署根目录和 CI 私钥，并声明以下最小使用范围：

- `allow_slugs`: 只允许 `jason.cnb/hc/ai/website_promotion_zds`。
- `allow_events`: 只允许 `push`。
- `allow_branches`: 只允许 `codex/official-home-trust-redesign`。
- `allow_images`: 只允许固定版本 `tencentcom/rsync:v1.0.0`；上传后的发布命令由该插件的受控 SSH 脚本阶段执行，不再引入第二个 SSH 插件。

流水线通过 `imports` 引用该文件。所有含秘密的任务在输出前关闭命令回显；日志不得输出私钥、环境变量全集、服务器环境文件或数据库连接串。密钥写入 CNB 并验证成功后，本机副本只保留在当前 Windows 用户可读的 `.ssh` 目录，禁止复制到工作区。

## 发布、健康检查与回滚

服务器发布脚本按以下顺序执行：

1. 校验 release 名只包含允许的 commit 字符，检查产物清单、`server.js`、`public` 和 `.next/static` 完整。
2. 将当前 `.next/static` 内容以不覆盖旧哈希文件的方式合并到 `shared/next-static`。
3. 记录 `current` 指向的上一版本，创建新的临时软链接，再原子替换 `current`。
4. 使用现有进程管理器重启或 reload Next.js；禁止在发布脚本中执行数据库迁移、seed 或生产数据写入。
5. 在服务器本机请求 `/cn/`，解析页面实际引用的 CSS URL，并逐一确认返回 `200`、`Content-Type: text/css` 且响应体非空。
6. 再从 CNB Runner 请求 `http://zhangdashi.ai/cn/` 和 CSS URL，确认外部 Nginx 链路一致。
7. 任一检查失败时恢复上一 `current` 链接、重启上一版本并再次健康检查；回滚成功后流水线仍以失败结束，明确提示新版本未上线。

外部验收通过后才清理超出保留数量的旧 release。清理不得删除 `shared`、当前 release、上一可用 release 或仍被页面引用的静态 chunk。

## Nginx 缓存修正

首次 SSH 检查必须先读取宝塔生成的实际 Nginx 配置并备份，再做最小调整：

- `/cn/`、`/jp/`、`/hk/`、CMS 页面和其他 HTML 响应不再透传一年 `s-maxage`；统一使用需要重新验证的缓存策略，确保发布后不会长期返回旧 HTML。
- `/_next/static/` 由 Nginx 指向 `shared/next-static`，保留 `public, max-age=31536000, immutable`；文件名内容哈希保证新旧版本可以共存。
- `/_next/image`、API、CMS 和上传请求继续交给 Next.js，不把动态响应误配为静态文件。
- 修改前执行 `nginx -T` 留存有效配置，修改后先 `nginx -t`，成功才 reload；失败时恢复备份，不中断现网。

## 与现有功能的边界

- 保留当前三站页面、CMS、GitHub 镜像同步、Neon、Vercel Blob 和翻译配置，不在本任务中修改业务实现。
- 不自动执行 CMS 数据库迁移；需要迁移时继续按现有 Runbook 单独审批和验收。
- 不在本任务中调整域名 DNS、HTTP 到 HTTPS、阿里云安全组、宝塔登录方式或其他网站配置，除非它们被验证为本部署链路的直接阻塞项。
- 工作区现有未提交的新闻内容、Logo、资料目录和临时文件不纳入本任务提交。

## 验收标准

1. 只有向 `codex/official-home-trust-redesign` 推送 commit 才会触发生产部署；其他分支不部署。
2. CNB 密钥文件限制仓库、事件、分支和插件镜像，官网仓库与日志中不存在私钥。
3. 流水线使用 `deploy` 而不是 root，且没有通用 sudo 权限。
4. 新版本完全上传和验证后才切换 `current`，不存在半成品运行窗口。
5. `/cn/`、`/jp/`、`/hk/` 返回 `200`，页面引用的 CSS 全部返回有效 `text/css`。
6. 375 px 移动视口下首页保持正式样式，不再出现图一的无样式长页。
7. HTML 不再携带一年共享缓存；内容哈希静态资源仍使用一年不可变缓存，旧 chunk 在保留窗口内可访问。
8. 人为制造一次无效发布时能自动恢复上一版本，生产首页和 CSS 继续可用。
9. GitHub 镜像同步继续工作，CMS 数据、环境变量和上传资源未被发布或回滚覆盖。
