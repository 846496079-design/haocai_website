import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
try {
  process.loadEnvFile(join(projectRoot, '.env.local'))
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

const token = process.env.LEAD_WORKER_TOKEN?.trim()
const endpoint = process.env.LEAD_WORKER_ENDPOINT?.trim() || 'http://127.0.0.1:3000/api/internal/leads/process/'
const intervalMilliseconds = Math.max(5_000, Number(process.env.LEAD_WORKER_INTERVAL_MS || 15_000))
const heartbeatPath = process.env.LEAD_WORKER_HEARTBEAT_PATH?.trim() || join(projectRoot, '.data', 'lead-worker-heartbeat.json')

if (!token || token.length < 32) {
  console.error('[lead-worker] 缺少有效的 LEAD_WORKER_TOKEN。')
  process.exit(1)
}

let stopped = false
let consecutiveFailures = 0

async function tick() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45_000)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`内部处理接口返回 HTTP ${response.status}`)
    const result = await response.json()
    await mkdir(dirname(heartbeatPath), { recursive: true })
    await writeFile(heartbeatPath, `${JSON.stringify({ checkedAt: new Date().toISOString(), delivered: Number(result.delivered || 0), retried: Number(result.retried || 0), paused: Number(result.paused || 0) })}\n`, { encoding: 'utf8', mode: 0o600 })
    if (consecutiveFailures > 0) console.log('[lead-worker] 内部处理接口已恢复。')
    consecutiveFailures = 0
    if (result.delivered || result.retried || result.paused || result.backupCreated) {
      console.log('[lead-worker] 批处理完成。', {
        delivered: Number(result.delivered || 0),
        retried: Number(result.retried || 0),
        paused: Number(result.paused || 0),
        backupCreated: Boolean(result.backupCreated),
      })
    }
  } catch (error) {
    consecutiveFailures += 1
    if (consecutiveFailures === 1 || consecutiveFailures % 20 === 0) {
      console.error('[lead-worker] 调度失败。', error instanceof Error ? error.message : '未知错误')
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function run() {
  console.log('[lead-worker] 已启动。')
  while (!stopped) {
    await tick()
    await new Promise((resolve) => setTimeout(resolve, intervalMilliseconds))
  }
  console.log('[lead-worker] 已停止。')
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { stopped = true })
}

await run()
