# 新媒体工作台导入接口与字段清单

## 版本与用途

```text
POST /api/integrations/news/import
Content-Type: application/json
X-CMS-Timestamp: <Unix 毫秒时间戳>
Idempotency-Key: <调用方生成的唯一键>
X-CMS-Signature: sha256=<小写十六进制 HMAC>
```

接口只创建或更新 CMS 草稿，不能发布、下架、删除、置顶或排序。当前正文版本为 `cms-richtext.v1`，导入结果进入与 CMS 编辑器、官网和公众号复制相同的统一内容模型。中文是唯一源稿；日文和港文由 CMS 管理员保存后手动触发翻译。

`sourceId` 用于识别同一外部稿件，`Idempotency-Key` 和请求体哈希用于防止重复交付。CMS 根据 `sourceId` 自动分配文章路径；调用方不得传入或管理 `slug`。过渡期仍可接收旧 `lead/sections/closing` 输入，但服务端会在入口立即转换，数据库不会保存第二套正文模型。

## 请求签名

1. 将 JSON 序列化为 UTF-8 原始请求体 `rawBody`；签名后不得重新格式化。
2. 生成 Unix 毫秒时间戳 `timestamp` 和本次业务交付唯一的 `idempotencyKey`。服务端允许前后 5 分钟时钟偏差。
3. 签名原文为 `${timestamp}.${idempotencyKey}.${rawBody}`。
4. 使用 `CMS_IMPORT_SIGNING_SECRET` 计算 HMAC-SHA256，输出小写十六进制。
5. 发送 `x-cms-timestamp`、`idempotency-key` 和 `x-cms-signature: sha256=<hex>`。

```js
import { createHmac, randomUUID } from 'node:crypto'

const rawBody = JSON.stringify(payload)
const timestamp = Date.now().toString()
const idempotencyKey = randomUUID()
const digest = createHmac('sha256', process.env.CMS_IMPORT_SIGNING_SECRET)
  .update(`${timestamp}.${idempotencyKey}.${rawBody}`)
  .digest('hex')
```

同一个业务重试必须复用相同 `Idempotency-Key` 和完全相同的 `rawBody`。同一幂等键配不同正文会被拒绝。请求体最大 2 MB。

## 请求字段

| 路径 | 类型 | 必填 | 约束/说明 |
| --- | --- | --- | --- |
| `sourceId` | string | 是 | 外部系统稳定稿件 ID，同一稿件更新时保持不变。 |
| `contentVersion` | string | 是 | 当前填写 `cms-richtext.v1`。 |
| `content.cn.date` | string | 是 | `YYYY.MM.DD`，例如 `2026.07.17`。 |
| `content.cn.category` | string | 否 | 已有分类名；新名称自动创建并标记为外部导入。 |
| `content.cn.tags` | string[] | 否 | 标签数组。 |
| `content.cn.title` | string | 是 | 中文标题，纯文本。 |
| `content.cn.author` | string | 否 | 作者，默认“账大师”。 |
| `content.cn.summary` | string | 是 | 列表和 SEO 摘要，纯文本。 |
| `content.cn.cover` | string | 是 | CMS 或双方认可对象存储中的 HTTPS URL。 |
| `content.cn.body.editorDocument` | object | 是 | Tiptap JSON 文档，根节点固定为 `doc`。 |
| `content.cn.body.styleConfig` | object | 否 | 排版模板与全局样式；缺失字段使用 CMS 默认值。 |
| `content.cn.body.assets` | object[] | 否 | 已上传正文图片的素材元数据。 |

调用方不得发送或依赖 `publicationHtml`、`contentHash` 和 `renderVersion`；服务端保存时会重新生成。不要发送 `content.jp` 或 `content.hk`，CMS 会创建空译稿并由管理员触发翻译。

允许的主要节点为 `paragraph`、`heading`、`text`、`hardBreak`、`horizontalRule`、`blockquote`、`bulletList`、`orderedList`、`listItem`、`codeBlock`、`image`、`table`、`tableRow`、`tableHeader` 和 `tableCell`。允许的文字标记为 `bold`、`italic`、`underline`、`strike`、`code`、`link` 和 `textStyle`。未知节点、属性和标记不会进入发布 HTML。

## 请求示例

```json
{
  "sourceId": "workspace-news-20260717-001",
  "contentVersion": "cms-richtext.v1",
  "content": {
    "cn": {
      "date": "2026.07.17",
      "category": "产品动态",
      "tags": ["AI 财务", "产品升级"],
      "title": "账大师 AI 财务能力更新",
      "author": "账大师",
      "summary": "本次更新进一步优化企业日常财务处理体验。",
      "cover": "https://cdn.example.com/news/cover.jpg",
      "body": {
        "editorDocument": {
          "type": "doc",
          "content": [
            {
              "type": "heading",
              "attrs": { "level": 2, "textAlign": "left" },
              "content": [{ "type": "text", "text": "更新内容" }]
            },
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "第一段正文，", "marks": [{ "type": "bold" }] },
                { "type": "text", "text": "排版会同时用于官网和公众号。" }
              ]
            },
            {
              "type": "image",
              "attrs": {
                "src": "https://cdn.example.com/news/body.jpg",
                "alt": "产品界面示意图",
                "title": "账大师产品界面"
              }
            }
          ]
        },
        "styleConfig": {
          "templateId": "brand-tech",
          "themeColor": "#5b6cff",
          "fontFamily": "system-sans",
          "fontSize": 16,
          "lineHeight": 1.8,
          "paragraphSpacing": 16,
          "pagePadding": 16,
          "letterSpacing": 0,
          "imageRadius": 8
        },
        "assets": []
      }
    }
  }
}
```

示例域名仅说明字段，真实调用必须使用受信任 HTTPS 图片地址。

## 成功响应

首次写入返回 HTTP `201`；相同幂等交付重试返回 HTTP `200`：

```json
{
  "articleId": 123,
  "slug": "workspace-6c315a5a65b3c76d2af0",
  "duplicate": false,
  "category": "产品动态",
  "categoryCreated": true,
  "categoryNotice": "已自动创建新分类，来源标记为外部导入。",
  "validation": { "valid": true, "missingFields": [] },
  "editUrl": "/cms/news/123/"
}
```

## 错误响应与安全边界

| HTTP | 场景 |
| --- | --- |
| `401` | 签名、时间戳、幂等键缺失或无效，或服务端未配置签名密钥。 |
| `413` | 请求体超过 2 MB。 |
| `422` | `sourceId`、内容版本、中文正文或数据库写入失败。 |

- 相同 `sourceId` 的新交付只更新该稿件草稿，不覆盖已发布版本。
- HMAC 密钥只能位于服务端；浏览器不得直调，日志不得记录密钥、签名头或完整正文。
- 浏览器传入的 HTML 不会直接保存或发布。所有输出都从受限 JSON 文档重新生成。
- 正式开放跨系统生产调用前，双方还需确认版本化路径、密钥轮换、JSON Schema、重试上限和联调验收样例。
