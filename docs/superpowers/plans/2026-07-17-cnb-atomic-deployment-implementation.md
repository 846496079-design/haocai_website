# CNB 到宝塔服务器原子部署实施计划

## 目标

把 `codex/official-home-trust-redesign` 分支的 push 事件接入账大师生产服务器，形成可验证、可回滚、凭据隔离的自动部署，并修复旧 HTML 与已删除 Next.js CSS chunk 失配造成的移动端无样式问题。

## 实施顺序

### 1. 建立部署身份

- 在 `C:\Users\Meng\.ssh` 生成专用 Ed25519 密钥，私钥 ACL 仅允许当前 Windows 用户访问。
- 记录公钥和 SHA256 指纹，不在日志输出私钥。
- 通过宝塔登录会话将公钥临时加入 root，开启密钥登录并验证 `root@zhangdashi.ai:22`。
- 只读检查完成后创建 `deploy` 用户，把公钥迁移到 deploy，并从 root 移除该 CI 公钥。

验证：本机能以 deploy 密钥执行 `whoami`，输出只能是 `deploy`；root 不再接受该 CI 公钥。

### 2. 只读审计现网

- 读取系统版本、CPU 架构、磁盘空间、Node/npm/pnpm/rsync 版本。
- 定位宝塔 Nginx 站点配置、反向代理 upstream、Next.js 监听端口、进程管理器、工作目录和环境变量加载方式。
- 读取当前发布目录结构和 `.next/static`，不读取环境变量值、数据库连接串或业务数据。
- 保存 `nginx -T`、服务状态和现网 `/cn/`、CSS 响应头作为变更前证据。

验证：确认 CNB 构建产物与服务器架构兼容，确定 `DEPLOY_ROOT`、服务重启命令和本机健康检查地址。

### 3. 增加 standalone 构建与发布脚本

- 在 `next.config.mjs` 启用 `output: 'standalone'`，保留现有配置逻辑。
- 新增服务器原子发布脚本：校验 release、合并静态 chunk、切换 `current`、重启、检查 HTML/CSS、失败回滚、保留最近 5 个 release。
- 新增 CNB 打包脚本或 package script，输出固定 release 结构和 SHA256 清单。
- 所有脚本使用 UTF-8 中文注释，不包含密码、私钥、环境变量值或 emoji。

验证：本地/CI 构建成功，release 同时包含 `server.js`、`public`、`.next/static` 和校验清单。

### 4. 配置服务器运行边界

- 根据现网路径创建 `incoming`、`releases`、`shared/next-static`、`shared/data`、`shared/env`、`shared/logs`。
- 保留现有 CMS 数据和环境变量，仅建立必要的共享链接或服务引用。
- 安装 root 所有的固定发布包装脚本；sudoers 只允许 deploy 执行该脚本或确认后的固定服务重启命令。
- 不替换现有健康的 PM2、systemd 或宝塔 Node 项目管理方式。

验证：deploy 无法读取生产环境文件，无法获得通用 sudo shell，只能上传 release 并调用发布入口。

### 5. 修复 Nginx 缓存边界

- 备份宝塔生成的站点配置。
- HTML 和动态响应覆盖为重新验证缓存策略，不再透传 `s-maxage=31536000`。
- `/_next/static/` 指向 `shared/next-static` 并保留一年 immutable 缓存。
- `/_next/image`、API、CMS 和上传继续反向代理到 Next.js。
- 先运行 `nginx -t`，成功后才 reload；失败立即恢复备份。

验证：`/cn/` 不再返回一年共享缓存；CSS 返回 `200 text/css` 和 immutable；现网站点不中断。

### 6. 配置 CNB 密钥与流水线

- 在密钥仓库新增 `official-deploy.yml`，按 rsync 插件原生参数写入 host、port、deploy user 和私钥，并通过 `settingsFrom` 直接加载；非敏感的 deploy root 留在官网流水线配置中。
- 限制 `allow_slugs`、`allow_events`、`allow_branches`、`allow_images`。
- 调整 `.cnb.yml`：目标分支执行 GitHub 同步、构建、打包、rsync 上传、SSH 发布和外部检查；其他分支只同步 GitHub。
- 固定 rsync 与 SSH 插件版本；敏感任务关闭命令回显。

验证：CNB Flow 只在目标分支展示生产部署；配置和日志中不可见私钥。

### 7. 首次真实部署与回滚验证

- 先以不切流方式上传并验证 release。
- 执行首次原子切换，观察服务状态、Nginx 日志与外部 HTML/CSS。
- 在桌面和 375 px 移动视口检查 `/cn/`，抽查 `/jp/`、`/hk/`、`/cms/login/`。
- 使用缺少必要文件的隔离测试 release 验证发布前失败；若要验证切换后回滚，只使用不会写数据库的应用健康检查失败场景。
- 成功后推送完整提交，确认一次真实 push 自动部署。

验证：生产页面和 CSS 正常，失败 release 不上线，上一版本可恢复，GitHub 同步仍成功。

### 8. 文档与交付

- 更新 `docs/cms/self-hosting-runbook.md`、正式站点 Spec 的 CNB 分支说明及必要环境变量说明。
- 记录服务器目录、服务名、回滚命令、密钥轮换方法和 CNB 密钥文件位置，不记录秘密值。
- 检查中文乱码、`git diff --check`、构建、类型检查和最终工作区边界。

验证：运维文档与实际配置一致，所有本任务文件可追溯，用户现有未提交文件未被纳入提交。
