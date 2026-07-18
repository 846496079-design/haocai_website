# 公开 HTML 重新验证缓存设计

> 状态：已被 `2026-07-18-lead-tabs-and-no-store-cache-design.md` 中用户确认的 `no-store, max-age=0` 决策取代；本文保留为历史方案记录，不再作为当前实施依据。

## 背景

2026-07-17 的历史缓存事故处置把公开三站页面临时调整为 `no-store, no-cache, max-age=0, must-revalidate`，用于阻止设备继续保存新的旧 HTML。该策略安全但过于保守，会放弃浏览器缓存与返回导航等能力，不适合作为普通公开营销站点的长期策略。

现网复核确认：

- `/cn/` 与 `/cn/product/` HTML 具备 ETag。
- Next.js standalone 当前对 `If-None-Match` 仍返回完整 `200`，不能把 `304` 作为发布前提。
- RSC 响应为 `text/x-component`，没有 ETag。
- `/_next/static/` 的 CSS 与 JavaScript 文件名带内容哈希，并返回一年 immutable 缓存。

## 目标

- 公开 HTML 与 RSC 每次使用前都向生产服务器请求当前版本。
- 不再长期使用 `no-store` 限制普通公开页面。
- 内容哈希 CSS 与 JavaScript 继续使用一年 immutable 缓存。
- CMS 与 API 继续保持 `private, no-store`。
- 服务器与 CNB 验收同时检查 HTML、RSC、CSS 和 JavaScript，防止只验证首屏 HTML 而遗漏客户端导航。

## 采用方案

### 公开 HTML 与 RSC

`/cn`、`/jp`、`/hk` 及其子路径统一返回：

```text
Cache-Control: no-cache
```

浏览器可以保存响应，但每次复用前必须回源验证。当前 Next.js standalone 即使收到条件请求仍返回完整 `200`，因此设计只要求每次回源，不要求 `304`。

### 哈希静态资源

`/_next/static/` 继续返回：

```text
Cache-Control: public, max-age=31536000, immutable
```

发布时新内容生成新文件名，旧 chunk 跨 release 保留；不得覆盖同名但内容不同的文件，也不得为了刷新页面删除旧 chunk。

### CMS 与 API

`/cms/`、`/api/` 继续透传应用的 `private, no-store` 等响应头，不套用公开页面规则。

## 发布验收

服务器发布器与 CNB 外部验收必须确认：

1. HTML 返回 `no-cache`，不包含 `no-store`、正数 `max-age` 或正数 `s-maxage`。
2. HTML 具备 ETag；当前只把它作为内容版本标识，不要求条件请求返回 `304`。
3. 使用 `RSC: 1` 请求相同页面时返回非空 `text/x-component`，并使用同一 `no-cache` 策略。
4. HTML 实际引用的 CSS 与 JavaScript 全部返回非空内容和正确 Content-Type。
5. CSS 与 JavaScript 同时包含 `max-age=31536000` 与 `immutable`。

## 历史缓存边界

新策略不能删除设备已经按旧规则保存的响应。历史访问者仍需通过一次版本化地址或清理站点缓存取得新 HTML；取得新响应后，`no-cache` 会保证后续复用前回源。新访问者与已完成一次迁移的访问者不需要人工处理。

## 变更边界

- 只修改 Nginx 缓存 map、服务器发布验收、CNB 外部验收和运维文档。
- 不修改页面视觉、CMS 数据、产品文案、数据库或发布触发分支。
- 不引入 CDN；未来若接入 CDN，再单独设计短 `s-maxage` 与发布 purge。

## 验收标准

1. 三站公开 HTML 与 RSC 都返回 `Cache-Control: no-cache`。
2. CMS 登录页继续返回 `private, no-store`。
3. 产品页 HTML 具备 ETag，RSC 返回 `text/x-component`。
4. 页面引用的 CSS 和 JavaScript 均返回一年 immutable 缓存。
5. CNB 发布成功后服务器 `current` 指向新 commit。
6. 真实浏览器通过未缓存版本入口加载新版首页，再进入产品页时使用当前 release 脚本和内容。
