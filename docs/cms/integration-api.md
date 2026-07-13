# 新媒体工作台导入接口与字段清单

## 版本与用途

当前预留接口：

```text
POST /api/integrations/news/import
Content-Type: application/json
X-CMS-Timestamp: <Unix 毫秒时间戳>
Idempotency-Key: <调用方生成的唯一键>
X-CMS-Signature: sha256=<小写十六进制 HMAC>
```

接口只创建或更新 CMS 草稿，不能发布、下架、删除、置顶或排序。中文是唯一源稿；日文和港文由 CMS 管理员保存后手动触发一次翻译。

当前版本使用 `content.cn.slug` 作为稿件更新键，使用 `Idempotency-Key` 和请求体哈希防止重复交付。调用方必须对同一外部稿件持续使用同一 slug，不得把 slug 复用于另一篇稿件。

## 请求签名

1. 将准备发送的 JSON 序列化为 UTF-8 原始请求体 `rawBody`。签名后不得重新格式化 JSON。
2. 生成当前 Unix 毫秒时间戳 `timestamp`，以及本次业务交付唯一的 `idempotencyKey`。服务端允许前后 5 分钟时钟偏差。
3. 拼接签名原文，点号不可省略：

```text
${timestamp}.${idempotencyKey}.${rawBody}
```

4. 使用 `CMS_IMPORT_SIGNING_SECRET` 对签名原文计算 HMAC-SHA256，输出小写十六进制。
5. 发送三个请求头：`x-cms-timestamp`、`idempotency-key`、`x-cms-signature: sha256=<hex>`。

Node.js 示例：

```js
import { createHmac } from 'node:crypto'

const rawBody = JSON.stringify(payload)
const timestamp = Date.now().toString()
const idempotencyKey = crypto.randomUUID()
const digest = createHmac('sha256', process.env.CMS_IMPORT_SIGNING_SECRET)
  .update(`${timestamp}.${idempotencyKey}.${rawBody}`)
  .digest('hex')

const headers = {
  'content-type': 'application/json',
  'x-cms-timestamp': timestamp,
  'idempotency-key': idempotencyKey,
  'x-cms-signature': `sha256=${digest}`,
}
```

同一个业务重试必须复用相同 `Idempotency-Key` 和完全相同的 `rawBody`；同一幂等键配不同正文会被拒绝。请求体最大 2 MB。

## 请求字段

| 路径 | 类型 | 必填 | 约束/说明 |
| --- | --- | --- | --- |
| `sourceId` | string | 是 | 外部系统稳定稿件 ID；非空。当前版本不以此做数据库唯一约束。 |
| `content.cn.slug` | string | 是 | 小写字母、数字和连字符；格式 `^[a-z0-9]+(?:-[a-z0-9]+)*$`。发布后应保持不变。 |
| `content.cn.date` | string | 是 | 发布日期，当前 CMS 使用 `YYYY.MM.DD`，例如 `2026.07.13`。 |
| `content.cn.category` | string | 否 | 已有分类名；新名称会自动创建并标记为外部导入。空值会保留草稿并提示后台补充，不能发布。 |
| `content.cn.tags` | string[] | 否 | 标签数组；去除空值与重复项后提交。 |
| `content.cn.title` | string | 是 | 中文标题，纯文本。 |
| `content.cn.summary` | string | 是 | 列表/SEO 摘要，纯文本。 |
| `content.cn.lead` | string | 是 | 正文导语，纯文本。 |
| `content.cn.cover` | string | 是 | 已上传到双方认可对象存储的 HTTPS URL，或由 CMS 上传后回填的 URL。 |
| `content.cn.sections` | object[] | 是 | 至少一个有序正文分节，数组顺序即展示顺序。 |
| `content.cn.sections[].title` | string | 是 | 分节标题。 |
| `content.cn.sections[].paragraphs` | string[] | 是 | 段落数组，可为空数组但发布检查可能不通过。 |
| `content.cn.sections[].image` | string | 否 | 正文图片 HTTPS URL。 |
| `content.cn.sections[].imageAlt` | string | 否 | 图片替代文本。 |
| `content.cn.sections[].imageCaption` | string | 否 | 图片说明。 |
| `content.cn.closing` | string[] | 是 | 结语段落，至少一项。 |

不要发送 `content.jp` 或 `content.hk`；CMS 会为缺失语言建立空草稿，管理员点击“一键翻译”后生成译文。

## 请求示例

```json
{
  "sourceId": "workspace-news-20260713-001",
  "content": {
    "cn": {
      "slug": "ai-finance-update-20260713",
      "date": "2026.07.13",
      "category": "产品动态",
      "tags": ["AI 财务", "产品升级"],
      "title": "账大师 AI 财务能力更新",
      "summary": "本次更新进一步优化企业日常财务处理体验。",
      "lead": "账大师完成新一轮产品能力更新。",
      "cover": "https://example-cdn.invalid/news/cover.webp",
      "sections": [
        {
          "title": "更新内容",
          "paragraphs": ["第一段正文。", "第二段正文。"],
          "image": "https://example-cdn.invalid/news/body.webp",
          "imageAlt": "产品界面示意图",
          "imageCaption": "账大师产品界面"
        }
      ],
      "closing": ["企业 AI 财务，就找账大师。"]
    }
  }
}
```

示例域名仅作字段说明，不可用于真实调用。

## 成功响应

首次写入返回 HTTP `201`；同一幂等交付重试返回 HTTP `200`：

```json
{
  "articleId": 123,
  "slug": "ai-finance-update-20260713",
  "duplicate": false,
  "category": "产品动态",
  "categoryCreated": true,
  "categoryNotice": "已自动创建新分类，来源标记为外部导入。",
  "validation": { "valid": true, "missingFields": [] },
  "editUrl": "/cms/news/123/"
}
```

空分类时 `category` 为 `null`，`categoryNotice` 会要求管理员补充。

## 错误响应

| HTTP | 场景 |
| --- | --- |
| `401` | 签名、时间戳或幂等键缺失/无效，或服务端未配置签名密钥。 |
| `413` | 请求体超过 2 MB。 |
| `422` | `sourceId`、中文内容、slug 或正文结构校验失败，或数据库写入失败。 |

错误体格式：

```json
{ "message": "可读的错误说明" }
```

调用方只有收到 2xx 才能记录成功；超时和 5xx 可有限重试，422 应由人工修正字段后重发。

## 幂等与安全边界

- 相同 slug 的新交付会更新该稿件的草稿，不覆盖已发布版本；不同 slug 会创建新稿件。
- 相同幂等键与相同正文安全返回第一次结果；相同幂等键配不同正文会拒绝。
- HMAC 密钥只能放在服务端，不得由浏览器直调。日志不得记录签名密钥、签名头或完整正文。
- 图片 URL 必须来自受信任 HTTPS 源；推荐先通过 CMS 上传能力写入 Vercel Blob。

## 下一版对接前置项

在正式开放跨系统生产调用前，双方仍需共同确认：版本化路径、密钥轮换方式、完整 JSON Schema、失败重试上限和联调验收样例。旧 `CMS_IMPORT_SHARED_SECRET` 仅作为 HMAC 密钥变量名的迁移兼容，新部署应使用 `CMS_IMPORT_SIGNING_SECRET`。
