import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
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

async function requireFileNamePart(target, namePart, description) {
  await requirePath(target, description)
  const entries = await readdir(target, { recursive: true, withFileTypes: true })
  if (!entries.some((entry) => entry.isFile() && entry.name.includes(namePart))) {
    throw new Error(`缺少${description}文件：${target}（文件名需要包含 ${namePart}）`)
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

await requirePath(path.join(outputRoot, 'node_modules', 'detect-libc', 'lib', 'detect-libc.js'), 'sharp 的 detect-libc 运行文件')
await requirePath(path.join(outputRoot, 'node_modules', 'semver', 'semver.js'), 'sharp 的 semver 运行文件')
await requirePath(path.join(outputRoot, 'node_modules', '@img', 'colour', 'index.cjs'), 'sharp 的 colour 运行文件')
if (process.platform === 'linux' && process.arch === 'x64') {
  await requireFileNamePart(path.join(outputRoot, 'node_modules', '@img', 'sharp-linux-x64'), '.node', 'Linux x64 sharp 原生模块')
  await requireFileNamePart(path.join(outputRoot, 'node_modules', '@img', 'sharp-libvips-linux-x64'), '.so', 'Linux x64 libvips 运行库')
}
if (process.platform === 'win32' && process.arch === 'x64') {
  await requireFileNamePart(path.join(outputRoot, 'node_modules', '@img', 'sharp-win32-x64'), '.node', 'Windows x64 sharp 原生模块')
  await requireFileNamePart(path.join(outputRoot, 'node_modules', '@img', 'sharp-win32-x64'), '.dll', 'Windows x64 libvips 运行库')
}
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
