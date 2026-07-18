import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function main() {
  const workDirectory = mkdtempSync(join(tmpdir(), 'zds-feishu-foundation-'))
  const databasePath = join(workDirectory, 'lead-outbox.sqlite')
  process.env.LEAD_OUTBOX_DATABASE_PATH = databasePath
  process.env.LEAD_DATA_ENCRYPTION_KEY = randomBytes(32).toString('base64')

  const configModule = await import('../../lib/feishu/config')
  const queryPlanModule = await import('../../lib/feishu/query-plan')
  const deepSeekModule = await import('../../lib/feishu/deepseek')
  const store = await import('../../lib/leads/store')
  const analytics = await import('../../lib/leads/analytics')

  try {
    const aiConfig = configModule.getLeadQueryAiConfig({
      LEAD_QUERY_AI_PROVIDER: 'deepseek',
      LEAD_QUERY_AI_API_URL: 'https://api.deepseek.com',
      LEAD_QUERY_AI_API_KEY: 'test-api-key-1234567890',
      LEAD_QUERY_AI_MODEL: 'deepseek-v4-flash',
    })
    assert.equal(aiConfig.apiUrl, 'https://api.deepseek.com/chat/completions')
    assert.throws(() => configModule.getLeadQueryAiConfig({
      LEAD_QUERY_AI_PROVIDER: 'deepseek',
      LEAD_QUERY_AI_API_URL: 'http://api.deepseek.com',
      LEAD_QUERY_AI_API_KEY: 'test-api-key-1234567890',
      LEAD_QUERY_AI_MODEL: 'deepseek-v4-flash',
    }), /HTTPS/)

    const botConfig = configModule.getFeishuBotConfig({
      FEISHU_BOT_APP_ID: 'cli_test_12345678',
      FEISHU_BOT_APP_SECRET: 'test-feishu-secret-1234567890',
      FEISHU_BOT_ALLOWED_CHAT_IDS: 'oc_allowed',
      FEISHU_BOT_ALLOWED_USER_IDS: 'ou_allowed',
      FEISHU_BOT_ALERT_CHAT_ID: 'oc_allowed',
    })
    assert.equal(botConfig.allowedChatIds.has('oc_allowed'), true)
    assert.equal(botConfig.allowedUserIds.has('ou_allowed'), true)

    const now = new Date('2026-07-18T06:00:00.000Z')
    const lastWeekPlan = queryPlanModule.parseLeadQueryPlan({
      version: 1,
      intent: 'SUMMARY',
      metric: 'LEAD_COUNT',
      periods: [{ mode: 'PRESET', value: 'LAST_WEEK', label: '上周' }],
      kinds: [],
      statuses: [],
      overdueOnly: false,
      groupBy: ['KIND'],
      helpMessage: '',
    })
    const [lastWeek] = queryPlanModule.resolveLeadQueryPeriods(lastWeekPlan, now)
    assert.equal(lastWeek.startAt, '2026-07-05T16:00:00.000Z')
    assert.equal(lastWeek.endAt, '2026-07-12T16:00:00.000Z')

    assert.throws(() => queryPlanModule.parseLeadQueryPlan({
      ...lastWeekPlan,
      sql: 'SELECT * FROM lead_submission',
    }), /不支持的字段/)

    const trial = store.createLeadSubmission('TRIAL', {
      contactName: '问数验证用户A7',
      contactPhone: '13900001111',
      referrerCode: 'FEISHU-A7',
    }, '192.0.2.31')
    const partner = store.createLeadSubmission('PARTNER', {
      contactName: '问数验证代理B8',
      contactPhone: '13800002222',
      companyName: '问数验证公司B8',
      city: '上海',
    }, '192.0.2.32')
    const current = store.createLeadSubmission('TRIAL', {
      contactName: '问数验证用户C9',
      contactPhone: '13700003333',
      referrerCode: 'FEISHU-C9',
    }, '192.0.2.33')
    const db = store.getLeadDatabase()
    db.prepare('UPDATE lead_submission SET created_at = ? WHERE receipt_id = ?').run('2026-07-07T02:00:00.000Z', trial.receiptId)
    db.prepare("UPDATE lead_submission SET created_at = ?, status = 'DELIVERED', delivered_at = ? WHERE receipt_id = ?")
      .run('2026-07-08T03:00:00.000Z', '2026-07-08T03:01:00.000Z', partner.receiptId)
    db.prepare('UPDATE lead_submission SET created_at = ? WHERE receipt_id = ?').run('2026-07-15T04:00:00.000Z', current.receiptId)

    const summary = analytics.executeLeadQueryPlan(lastWeekPlan, now)
    assert.equal(summary.periods[0].total, 2)
    assert.deepEqual(summary.periods[0].rows, [
      { dimensions: { KIND: '代理商线索' }, count: 1 },
      { dimensions: { KIND: '用户线索' }, count: 1 },
    ])

    const comparison = analytics.executeLeadQueryPlan(queryPlanModule.parseLeadQueryPlan({
      version: 1,
      intent: 'COMPARE',
      metric: 'LEAD_COUNT',
      periods: [
        { mode: 'PRESET', value: 'THIS_WEEK', label: '本周' },
        { mode: 'PRESET', value: 'LAST_WEEK', label: '上周' },
      ],
      kinds: [],
      statuses: [],
      overdueOnly: false,
      groupBy: [],
      helpMessage: '',
    }), now)
    assert.deepEqual(comparison.comparison, { current: 1, baseline: 2, difference: -1, changeRate: -0.5 })

    assert.equal(store.claimFeishuBotEvent({ eventId: 'evt-secret-A1', userId: 'ou-private-A1', chatId: 'oc-private-A1' }), true)
    assert.equal(store.claimFeishuBotEvent({ eventId: 'evt-secret-A1', userId: 'ou-private-A1', chatId: 'oc-private-A1' }), false)
    assert.equal(store.completeFeishuBotEvent('evt-secret-A1', 'SUMMARY'), true)
    assert.equal(store.claimFeishuBotEvent({ eventId: 'evt-failed-B2', userId: 'ou-private-A1', chatId: 'oc-private-A1' }), true)
    assert.equal(store.failFeishuBotEvent('evt-failed-B2', 'DEEPSEEK_TIMEOUT'), true)
    assert.equal(store.claimFeishuBotEvent({ eventId: 'evt-failed-B2', userId: 'ou-private-A1', chatId: 'oc-private-A1' }), true)

    let requestBody = ''
    const mockFetch: typeof fetch = async (_input, init) => {
      requestBody = String(init?.body || '')
      return new Response(JSON.stringify({
        choices: [{
          finish_reason: 'stop',
          message: { content: JSON.stringify(lastWeekPlan) },
        }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const planned = await deepSeekModule.planLeadQuestion('上周代理商线索和用户线索分别多少？', {
      config: aiConfig,
      fetchImplementation: mockFetch,
      now,
    })
    assert.deepEqual(planned, lastWeekPlan)
    for (const plaintext of ['问数验证用户A7', '13900001111', '问数验证公司B8']) {
      assert.equal(requestBody.includes(plaintext), false, `DeepSeek 请求不应包含线索明文：${plaintext}`)
    }
    const parsedRequest = JSON.parse(requestBody) as { response_format: { type: string }; stream: boolean }
    assert.equal(parsedRequest.response_format.type, 'json_object')
    assert.equal(parsedRequest.stream, false)

    await assert.rejects(() => deepSeekModule.planLeadQuestion('查询全部明细', {
      config: aiConfig,
      fetchImplementation: async () => new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: '{invalid' } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      now,
    }), (error: unknown) => error instanceof deepSeekModule.DeepSeekPlanningError && error.code === 'INVALID_RESPONSE')

    await assert.rejects(() => deepSeekModule.planLeadQuestion('今天多少线索？', {
      config: aiConfig,
      fetchImplementation: async () => new Response('', { status: 429 }),
      now,
    }), (error: unknown) => error instanceof deepSeekModule.DeepSeekPlanningError && error.code === 'RATE_LIMITED')

    await assert.rejects(() => deepSeekModule.planLeadQuestion('今天多少线索？', {
      config: { ...aiConfig, timeoutMilliseconds: 5 },
      fetchImplementation: async (_input, init) => new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('aborted')
          error.name = 'AbortError'
          reject(error)
        })
      }),
      now,
    }), (error: unknown) => error instanceof deepSeekModule.DeepSeekPlanningError && error.code === 'TIMEOUT')

    db.pragma('wal_checkpoint(TRUNCATE)')
    const databaseBytes = readFileSync(databasePath)
    for (const plaintext of ['evt-secret-A1', 'ou-private-A1', 'oc-private-A1']) {
      assert.equal(databaseBytes.includes(Buffer.from(plaintext, 'utf8')), false, `事件记录不应包含原始标识：${plaintext}`)
    }

    console.log('飞书 DeepSeek 智能问数配置基础验证通过。')
  } finally {
    store.closeLeadDatabaseForTest()
    rmSync(workDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
