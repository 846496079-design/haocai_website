# 公开页面缓存失效修复实施计划

## 目标

把账大师公开三站页面从“重新验证”升级为“禁止存储”，让后续 release 不再被浏览器长期保留旧 HTML；同时保持 CMS、API 和 `/_next/static/` 的现有边界，并让服务器与 CNB 验收自动阻止缓存配置回退。

## 实施步骤

### 1. 修改配置依据

- 在 `scripts/deploy/configure-nginx.sh` 中把 `/cn`、`/jp`、`/hk` 的响应头改为 `no-store, no-cache, max-age=0, must-revalidate`。
- 保留默认分支对上游 `Cache-Control` 的透传，确保 CMS 和 API 不受影响。
- 不修改 `/_next/static/` alias 和长期缓存。

### 2. 收紧服务器发布验收

- 在 `scripts/deploy/server-release.sh` 中要求公开页面同时包含 `no-store` 和 `max-age=0`。
- 拒绝正数 `s-maxage` 和正数 `max-age`。
- 保留 HTML、CSS、预启动、原子切换和失败回滚逻辑。

### 3. 收紧 CNB 外部验收

- 在 `scripts/deploy/verify-deployment.mjs` 中应用同一缓存判断。
- 继续验证 HTML 引用的所有 CSS 都返回非空 `text/css`。
- 保持 `.cnb.yml` 的目标分支触发条件不变。

### 4. 同步运维文档

- 更新 `docs/cms/self-hosting-runbook.md` 的公开页面缓存头和验收说明。
- 保留历史缓存需要一次强制刷新的边界说明。

### 5. 本地验证

- 执行中文与 diff 检查。
- 执行 CMS 类型检查、Next.js 生产构建和 release 打包。
- 在生产 Nginx 更新前运行外部验收，确认旧 `no-cache` 策略会被新检查拒绝。

### 6. 生产服务器更新

- 通过宝塔 root 终端备份并运行更新后的 Nginx 配置脚本。
- 执行 `nginx -t` 后 reload，确认三站公开页面为 `no-store`，CMS 保持 `private, no-store`。
- 把更新后的 `server-release.sh` 安装为 `/usr/local/sbin/zhangdashi-release`，保持 root 所有和原有 sudoers 范围。

### 7. 提交、发布与浏览器验收

- 只提交本任务的脚本和文档，保留用户已有未提交文件。
- 推送 `codex/official-home-trust-redesign`，等待 CNB 构建、上传、原子切换和外部验收通过。
- 确认服务器 `current` 指向新 commit。
- 在真实浏览器清除历史页面缓存后直接打开 `/cn/product/`，最终 DOM 应包含“费用方式”且不包含“年度费用”。

## 回滚

- Nginx 修改失败时由配置脚本恢复时间戳备份。
- 新 release 的服务器或外部验收失败时，沿用现有发布脚本自动切回上一 release。
- 缓存修复不执行数据库迁移，不触碰 `.data`、`.env.local` 或 CMS 上传目录。
