import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const standaloneRoot = path.join(projectRoot, '.next', 'standalone')
const staticRoot = path.join(projectRoot, '.next', 'static')
const publicRoot = path.join(projectRoot, 'public')
const leadWorkerSource = path.join(projectRoot, 'scripts', 'leads', 'worker.mjs')
const outputRoot = path.join(projectRoot, '.deploy', 'release')

async function requirePath(target, description) {
  try {
    await access(target)
  } catch {
    throw new Error(`缺少${description}：${target}`)
  }
}

await requirePath(path.join(standaloneRoot, 'server.js'), 'standalone server.js')
await requirePath(staticRoot, 'Next.js 静态资源目录')
await requirePath(publicRoot, 'public 目录')
await requirePath(leadWorkerSource, '线索工作进程')

await rm(outputRoot, { recursive: true, force: true })
await mkdir(outputRoot, { recursive: true })
await cp(standaloneRoot, outputRoot, {
  recursive: true,
  dereference: true,
  filter(source) {
    const relativePath = path.relative(standaloneRoot, source)
    const topLevelName = relativePath.split(path.sep)[0]
    return topLevelName !== '.data' && !topLevelName.startsWith('.env')
  },
})
await cp(staticRoot, path.join(outputRoot, '.next', 'static'), { recursive: true })
await cp(publicRoot, path.join(outputRoot, 'public'), {
  recursive: true,
  filter(source) {
    const relativePath = path.relative(publicRoot, source)
    return relativePath !== path.join('uploads', 'cms')
      && !relativePath.startsWith(`${path.join('uploads', 'cms')}${path.sep}`)
  },
})
await mkdir(path.join(outputRoot, 'scripts', 'leads'), { recursive: true })
await cp(leadWorkerSource, path.join(outputRoot, 'scripts', 'leads', 'worker.mjs'))

for (const forbiddenPath of ['.data', '.env', '.env.local', path.join('public', 'uploads', 'cms')]) {
  try {
    await access(path.join(outputRoot, forbiddenPath))
    throw new Error(`发布包含有禁止路径：${forbiddenPath}`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

const buildId = (await readFile(path.join(projectRoot, '.next', 'BUILD_ID'), 'utf8')).trim()
const metadata = {
  commit: process.env.CNB_COMMIT || process.env.GIT_COMMIT || 'local',
  buildId,
  node: process.version,
  createdAt: new Date().toISOString(),
}

await writeFile(
  path.join(outputRoot, 'RELEASE_METADATA.json'),
  `${JSON.stringify(metadata, null, 2)}\n`,
  'utf8',
)

console.log(`发布目录已生成：${outputRoot}`)
