# 自有翻译 API 接入清单

CMS 不绑定具体翻译供应商。自有服务只要提供 OpenAI Chat Completions 兼容接口，即可通过环境变量接入，无需修改编辑器。翻译不是中文发布的阻塞项；未翻译稿发布后只在中文站展示。

## 1. 环境变量

| 名称 | 必填 | 说明 |
| --- | --- | --- |
| `CMS_TRANSLATION_API_URL` | 是 | 自有翻译服务的 HTTPS 完整地址，例如 `https://api.example.com/v1/chat/completions`。 |
| `CMS_TRANSLATION_API_KEY` | 是 | 服务端密钥，通过 `Authorization: Bearer <key>` 发送。 |
| `CMS_TRANSLATION_MODEL` | 是 | 自有服务识别的模型名称。 |

三个变量只配置在 Vercel 服务端环境，不写入仓库，也不下发浏览器。

### DeepSeek 配置示例

DeepSeek 提供 OpenAI Chat Completions 兼容接口，可直接使用以下非敏感配置；真实密钥从服务器的 Secret Manager 或部署环境变量注入：

```env
CMS_TRANSLATION_API_URL=https://api.deepseek.com/chat/completions
CMS_TRANSLATION_API_KEY=<仅在服务器配置真实值>
CMS_TRANSLATION_MODEL=<provider-model-id>
```

当前阿里云服务器将以上变量写入 `/www/zhangdashi-deploy/shared/env/.env.local`，然后重启 PM2 的 `zds-website`；Vercel 修改后必须重新部署。密钥不能使用 `NEXT_PUBLIC_` 前缀。

## 2. CMS 发出的请求

```http
POST {CMS_TRANSLATION_API_URL}
Content-Type: application/json
Authorization: Bearer {CMS_TRANSLATION_API_KEY}
```

```json
{
  "model": "your-model",
  "temperature": 0.2,
  "response_format": { "type": "json_object" },
  "messages": [
    {
      "role": "user",
      "content": "翻译指令及完整中文源稿 JSON"
    }
  ]
}
```

点击“一键翻译”后，CMS 会分别发起日文和香港繁体中文两个请求。默认超时时间为 60 秒。

## 3. 自有 API 的响应外层

```json
{
  "choices": [
    {
      "message": {
        "content": "{\"title\":\"...\",\"summary\":\"...\"}"
      }
    }
  ]
}
```

`message.content` 必须是可直接解析的 JSON 字符串，不得包含 Markdown 代码块。

## 4. content 内层字段

| 字段 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- |
| `title` | string | 是 | 新闻标题。 |
| `summary` | string | 是 | 新闻摘要。 |
| `lead` | string | 是 | 导语。 |
| `category` | string | 是 | 分类译名。 |
| `tags` | string[] | 是 | 标签译名数组。 |
| `sections` | object[] | 是 | 正文分节，顺序必须与中文源稿一致。 |
| `sections[].title` | string | 是 | 分节标题。 |
| `sections[].paragraphs` | string[] | 是 | 分节正文段落。 |
| `sections[].image` | string | 否 | 必须原样返回源稿图片 URL，不得改写。 |
| `sections[].imageAlt` | string | 否 | 图片替代文字译文。 |
| `sections[].imageCaption` | string | 否 | 图片说明译文。 |
| `closing` | string[] | 是 | 结语段落。 |

`slug`、发布日期和封面由 CMS 强制沿用中文源稿，自有 API 无需返回，也不能覆盖。

## 5. 质量与错误约定

- 保持事实、日期、金额、数字、产品名、链接和段落结构准确，不扩写、不删减。
- HTTP 非 2xx、缺少 `choices[0].message.content`、JSON 无法解析或必填字段缺失，均视为翻译失败。
- 翻译失败不会覆盖现有日文或香港繁体草稿，也不会影响中文稿。
- 翻译失败不会阻止中文稿保存、预览和发布；未准备好的 JP/HK 版本不进入对应公开站点。
- 翻译成功后仍须管理员人工审核并重新预览，才能正式发布。
- 自有 API 应使用请求 ID 记录调用，但不得在日志中保存 API Key 或完整敏感正文。

## 6. 接入步骤

1. 自有 API 按上述协议实现并完成独立测试。
2. 在目标运行环境配置三个服务端环境变量；当前自有服务器使用共享 `.env.local`。
3. Vercel 重新部署 Preview；自有服务器重启 `zds-website`。
4. 使用测试稿执行“一键翻译”，核对日文、香港繁体、图片字段和人工覆盖模式。
5. Preview 验收通过后再部署 Production。

如果自有 API 无法兼容此协议，应在服务端增加一层适配器，不要让浏览器直接调用翻译供应商。
