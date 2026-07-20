# CMS 公开新闻运行时数据实施计划

## 目标

修复 CMS 新闻置顶、排序、发布和下架结果未在公开站实时生效的问题，并与已经完成但尚未推送的线索管理功能一起发布。

## 实施步骤

1. 在中国站、日本站和香港站的首页、新闻列表与新闻详情路由中声明 `dynamic = 'force-dynamic'`。
2. 保留现有 `getPublishedArticles`、`getPublishedArticle`、置顶事务、排序 SQL 和 `revalidatePublicNews`，不修改已验证的数据逻辑。
3. 增加路由渲染模式回归脚本，验证九个 CMS 依赖路由都显式声明动态读取，同时确认其他公开页面未被扩大为动态路由。
4. 更新 CMS 自托管说明，记录构建期临时数据库与运行时共享数据库的边界。
5. 运行 CMS 类型检查、回归脚本、完整构建和发布包生成。
6. 检查构建输出，确认相关路由不再进入永久静态预渲染清单。
7. 只提交本次修复文件，不纳入工作区已有的官网文案、Logo 和临时文件变更。
8. 更新服务器 root 发布入口和 Nginx 无缓存策略，推送 `codex/official-home-trust-redesign` 触发 CNB 部署。
9. 在线核对 CMS 线索管理入口、三个线索页签、CMS 置顶首稿、三站公开新闻首稿与无缓存响应头。

## 验证命令

```powershell
npm run cms:verify-runtime-news
npm run typecheck:cms
npm run build
npm run package:release
git diff --check
```
