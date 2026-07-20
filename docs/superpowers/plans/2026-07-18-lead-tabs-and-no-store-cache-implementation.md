# 官网线索三页签与公开页面无缓存实施计划

## 1. 依据与范围

- 设计依据：`docs/superpowers/specs/2026-07-18-lead-tabs-and-no-store-cache-design.md`
- 只修改线索统计与管理界面、公开页面缓存配置、发布验收和相关运维文档。
- 保留现有线索数据库结构、发送 worker、新闻 CMS、公开表单与其他未提交文件。

## 2. 实施步骤

### 步骤一：补充线索类型统计

1. 在 `LeadStats` 中增加用户线索和代理商线索总数。
2. 在现有统计 SQL 中按 `kind` 一次聚合，避免额外读取和正文解密。
3. 扩充线索专项验证，覆盖总数、两类数量和类型筛选。

### 步骤二：实现三个明显页签

1. 在线索统计卡与筛选器之间增加“全部线索｜用户线索｜代理商线索”页签和数量徽标。
2. 页签切换保留状态与超时筛选；筛选表单通过隐藏字段保留当前页签。
3. 删除重复的类型下拉框，“清除筛选”保留当前页签。
4. 统一列表、移动卡片、详情和空状态中的类型文案。

### 步骤三：公开 HTML/RSC 改为 no-store

1. Nginx 公开站点 map 改为 `no-store, max-age=0`。
2. 对公开三站路径同时设置 `proxy_cache_bypass` 与 `proxy_no_cache`，避免宝塔全局代理缓存继续复用旧 HTML/RSC。
3. 发布脚本将 Nginx 的 `identity`、`gzip`、`br` 响应与当前 Next.js 进程逐一比对；外部验收器将规范地址与版本探针的静态资源签名比对。
4. 保留 HTML ETag 和 Next.js 哈希静态资源一年 immutable 校验。
5. 更新自有服务器 Runbook，区分浏览器历史缓存和必须由服务器立即绕过的代理缓存。

### 步骤四：验证与交付

1. 执行线索专项验证、CMS 类型检查、脚本语法检查和生产构建。
2. 启动本地服务，以管理员会话验证三个页签、数量、筛选保留和移动布局。
3. 同步服务器 root 发布入口与 Nginx 配置，先验证响应头再推送。
4. 推送 `codex/official-home-trust-redesign`，等待 CNB 完成真实 release 切换。
5. 线上验证新版产品对比表、no-store、静态资源 immutable 和 CMS 三页签。

## 3. 验收门槛

- `TRIAL` 和 `PARTNER` 数量及筛选结果正确。
- 三页签在桌面端和移动端均明显可见。
- 状态、超时筛选与当前页签组合不丢失。
- 公开 HTML/RSC 为 `no-store, max-age=0`。
- 公开 HTML/RSC 不命中宝塔全局 `proxy_cache`，三种内容编码均对应当前 release。
- CSS/JavaScript 仍为一年 immutable。
- CMS/API 仍为私有 no-store。
- 只提交本次文件，不包含 `lib/news-content.ts`、Logo 和 `tmp/` 等既有工作区改动。
