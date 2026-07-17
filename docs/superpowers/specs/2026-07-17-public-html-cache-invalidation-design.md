# 公开页面缓存失效修复设计

## 背景与根因

账大师 CMS 与公开官网已经部署到同一生产 release，但两类页面使用不同缓存边界：CMS 返回 `private, no-store`，公开三站页面曾长期返回一年缓存。生产 Nginx 后续把公开页面调整为 `no-cache, must-revalidate`，这只能约束浏览器重新获取后的响应，不能主动删除设备中按旧规则保存的 HTML。

真实浏览器复核确认：直接访问 `http://zhangdashi.ai/cn/product/` 时，历史缓存 HTML 会加载旧版脚本并在水合后呈现旧对比表；给同一路径增加未缓存查询参数后，页面立即加载当前 release 的 HTML 和脚本，呈现新版“费用方式”表格。命令行直接请求生产服务器也返回新版。因此问题是客户端持有旧 HTML，不是 CMS 数据不同步、生产 release 未切换或当前静态资源缺失。

## 目标

- 公开三站页面在以后每次部署后都必须重新获取，不能再次形成长期 HTML 缓存。
- CMS、API 继续保留应用自身的私有缓存策略。
- `/_next/static/` 的内容哈希 CSS 与 JavaScript 继续使用一年 immutable 缓存，并跨 release 保留。
- 发布流程必须自动阻止未应用新缓存策略的 release 被判定为成功。
- 不修改页面内容、CMS 数据结构、数据库、业务接口或现有发布触发分支。

## 方案比较

### 方案一：公开页面使用 `no-store` 并收紧发布验收（采用）

对 `/cn`、`/jp`、`/hk` 及其子路径统一返回 `no-store, no-cache, max-age=0, must-revalidate`。Nginx 继续保留 CMS、API 的上游缓存头，并继续由独立静态资源 location 提供 `/_next/static/`。

同时让服务器发布脚本和 CNB 外部验收必须检查 `no-store` 与 `max-age=0`，拒绝 `s-maxage` 和任何正数 `max-age`。该方案直接修正根因，改动集中在缓存配置、验收脚本和运维依据。

### 方案二：给站内链接增加 release 查询参数（不采用）

新版链接可以绕过旧 URL 的浏览器缓存，但已经打开或已经缓存的旧页面无法获得新版链接，外部书签和直接输入地址也不会自动携带参数。该方案会把部署版本侵入页面路由，却不能独立解决根因。

### 方案三：删除旧静态脚本或缩短静态资源缓存（不采用）

旧 HTML 仍可能引用旧 chunk。删除旧资源会把“内容过期”升级为脚本或样式 404，并可能再次出现无样式页面。静态资源文件名已经版本化，应继续长期缓存和跨 release 保留。

## 缓存边界

### 公开页面

以下路径及子路径由 Nginx 覆盖为：

```text
Cache-Control: no-store, no-cache, max-age=0, must-revalidate
```

- `/cn/`
- `/jp/`
- `/hk/`

该规则同时覆盖 Next.js 页面导航所需的 RSC 响应，确保客户端路由不会长期复用旧页面数据。

### CMS 与 API

`/cms/`、`/api/` 不套用公开页面规则，继续透传应用返回的 `private, no-store` 等缓存头。缓存修复不得改变登录、会话、草稿、发布或健康检查行为。

### 静态资源

`/_next/static/` 继续指向 `/www/zhangdashi-deploy/shared/next-static/`，使用一年 immutable 缓存。发布仍合并静态资源且不删除仍可能被保留 release 引用的旧 chunk。

## 发布与服务器更新顺序

1. 备份宝塔 Nginx 站点配置与缓存 map。
2. 把公开页面缓存值从 `no-cache, must-revalidate` 改为完整的 `no-store, no-cache, max-age=0, must-revalidate`。
3. 执行 `nginx -t`，通过后 reload；失败自动恢复备份。
4. 更新仓库中的 Nginx 配置脚本、服务器发布验收和 CNB 外部验收。
5. 将更新后的受控发布脚本安装到 `/usr/local/sbin/zhangdashi-release`，保持 root 所有和原 sudo 边界。
6. 推送目标分支触发一次真实发布，确认新 release 通过收紧后的缓存验收。

## 历史缓存处理边界

已经按旧规则保存到用户设备的响应不会被服务器远程删除。站点当前只提供 HTTP，也不能依赖安全上下文要求的站点数据清理机制。受影响设备需要执行一次强制刷新，或先访问带一次性查询参数的当前页面。设备获得新响应后，`no-store` 会阻止以后再次保存公开 HTML。

这是一项一次性迁移边界，不影响首次访问者；不能通过删除服务器旧 chunk 来替代。

## 验收标准

1. `/cn/`、`/cn/product/`、`/jp/`、`/hk/` 均返回 `no-store, no-cache, max-age=0, must-revalidate`。
2. `/cms/login/` 继续返回 `private, no-store`，未被公开页面规则覆盖。
3. CNB 外部验收与服务器发布验收都要求公开 HTML 同时包含 `no-store` 和 `max-age=0`，并拒绝一年共享缓存及正数 `max-age`。
4. `/_next/static/` 的 CSS 与 JavaScript 返回成功，保持长期 immutable 缓存。
5. 真实浏览器强制刷新原始 `/cn/product/` 后，最终 DOM 包含“费用方式”，不包含旧行“年度费用”。
6. 新增查询参数与无查询参数在清除历史缓存后的页面内容一致。
7. 发布失败时仍按现有机制自动切回上一 release，不修改 CMS 数据和持久化环境文件。

## 变更边界

- 只修改部署缓存脚本、部署验收脚本和相关 SDD/Runbook。
- 不修改官网视觉、套餐文案、新闻 CMS、数据库或用户原有未提交文件。
- 不在本任务中配置 HTTPS；历史缓存的一次性清理限制需要在交付说明中明确保留。
