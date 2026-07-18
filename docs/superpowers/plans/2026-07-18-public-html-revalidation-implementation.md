# 公开 HTML 重新验证缓存实施计划

## 实施步骤

1. 把 `configure-nginx.sh` 的公开三站缓存值调整为 `no-cache`，保留 CMS/API 上游缓存头与静态资源 alias。
2. 在 `server-release.sh` 中抽取公开页面缓存检查，同时验证 HTML ETag、RSC Content-Type 和 RSC 缓存头。
3. 在 `verify-deployment.mjs` 中验证 HTML/RSC、实际 CSS/JS、Content-Type 与一年 immutable 静态缓存。
4. 更新 `self-hosting-runbook.md`，记录事故临时策略与长期策略边界。
5. 执行脚本语法检查、CMS 类型检查、生产构建和 release 打包。
6. 上传经过哈希校验的 Nginx 与发布器脚本，通过宝塔 root 终端安装并验证。
7. 提交并推送目标分支，等待 CNB 原子发布，检查服务器 current、四类响应头和真实浏览器页面。

## 回滚

- Nginx 修改失败时使用配置脚本的时间戳备份自动恢复。
- 新 release 验收失败时沿用现有 current 软链接自动回滚。
- 不执行数据库迁移，不触碰 CMS 持久化数据与环境文件。
