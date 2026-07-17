import assert from 'node:assert/strict'
import { buildAiProviderEndpoint, requestAiProviderText } from '../../lib/cms/ai-provider-server'
import { normalizeAiSettings } from '../../lib/cms/ai-providers'

async function main() {
  const defaults = normalizeAiSettings({ providerType: 'openrouter' })
  assert.equal(defaults.baseUrl, 'https://openrouter.ai/api/v1')
  assert.equal(buildAiProviderEndpoint(defaults.baseUrl, 'openrouter').toString(), 'https://openrouter.ai/api/v1/chat/completions')
  assert.equal(buildAiProviderEndpoint('https://api.openai.com/v1/chat/completions', 'openai').toString(), 'https://api.openai.com/v1/chat/completions')
  assert.equal(buildAiProviderEndpoint('https://api.anthropic.com/v1', 'anthropic').toString(), 'https://api.anthropic.com/v1/messages')
  assert.throws(() => buildAiProviderEndpoint('http://example.com/v1', 'openai'), /必须使用 HTTPS/)
  await assert.rejects(
    () => requestAiProviderText({
      providerType: 'openai',
      baseUrl: 'https://127.0.0.1/v1',
      apiKey: 'test-key',
      model: 'test-model',
      systemPrompt: 'test',
      userPrompt: 'test',
      maxTokens: 1,
    }),
    /不能解析到本机或内网/,
  )
  console.log('AI 服务默认地址、端点拼接和内网访问限制验证通过。')
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
