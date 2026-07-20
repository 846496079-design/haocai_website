import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  InvalidCmsImageError,
  inspectCmsImageSource,
  processCmsImage,
  type SharpFactory,
} from '../../lib/cms/image-upload'
import { readCmsUploadResponse } from '../../lib/cms/upload-client'

async function main() {
const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex')
const jpeg = Buffer.from('ffd8ffe000104a464946', 'hex')
const webp = Buffer.from('524946460400000057454250', 'hex')

assert.deepEqual(inspectCmsImageSource(png), { mimeType: 'image/png', extension: 'png' })
assert.deepEqual(inspectCmsImageSource(jpeg), { mimeType: 'image/jpeg', extension: 'jpg' })
assert.deepEqual(inspectCmsImageSource(webp), { mimeType: 'image/webp', extension: 'webp' })
assert.throws(() => inspectCmsImageSource(Buffer.from('not-an-image')), InvalidCmsImageError)

const loadFailure = new Error('sharp runtime unavailable')
const original = await processCmsImage(png, inspectCmsImageSource(png), async () => { throw loadFailure })
assert.equal(original.processingMode, 'original')
assert.equal(original.main, png)
assert.equal(original.thumbnail, null)
assert.equal(original.mimeType, 'image/png')
assert.equal(original.optimizationError, loadFailure)

function createPipeline(options: { metadataError?: boolean; outputError?: boolean } = {}) {
  return {
    async metadata() {
      if (options.metadataError) throw new Error('invalid image')
      return { width: 1200, height: 800, hasAlpha: false }
    },
    rotate() { return this },
    resize() { return this },
    png() { return this },
    jpeg() { return this },
    async toBuffer() {
      if (options.outputError) throw new Error('conversion failed')
      return Buffer.from('optimized')
    },
  }
}

const optimizedFactory = (() => createPipeline()) as unknown as SharpFactory
const optimized = await processCmsImage(jpeg, inspectCmsImageSource(jpeg), async () => optimizedFactory)
assert.equal(optimized.processingMode, 'optimized')
assert.equal(optimized.mimeType, 'image/jpeg')
assert.equal(optimized.extension, 'jpg')
assert.equal(optimized.width, 1200)
assert.equal(optimized.height, 800)
assert.ok(optimized.thumbnail)

const failedOutputFactory = (() => createPipeline({ outputError: true })) as unknown as SharpFactory
const failedOutput = await processCmsImage(jpeg, inspectCmsImageSource(jpeg), async () => failedOutputFactory)
assert.equal(failedOutput.processingMode, 'original')
assert.equal(failedOutput.width, 1200)
assert.equal(failedOutput.height, 800)

const invalidFactory = (() => createPipeline({ metadataError: true })) as unknown as SharpFactory
await assert.rejects(
  processCmsImage(jpeg, inspectCmsImageSource(jpeg), async () => invalidFactory),
  InvalidCmsImageError,
)

const originalResponse = await readCmsUploadResponse(new Response(JSON.stringify({
  assetId: 'asset-1',
  url: 'https://example.com/image.png',
  processingMode: 'original',
  message: '已保存原图。',
}), { status: 200, headers: { 'content-type': 'application/json' } }))
assert.equal(originalResponse.processingMode, 'original')
assert.equal(originalResponse.message, '已保存原图。')

await assert.rejects(
  readCmsUploadResponse(new Response('Internal Server Error', { status: 500, headers: { 'content-type': 'text/plain' } })),
  /图片服务暂时不可用/,
)
await assert.rejects(
  readCmsUploadResponse(new Response('{broken', { status: 200, headers: { 'content-type': 'application/json' } })),
  /图片服务返回异常/,
)

const routeSource = await readFile('app/api/cms/upload/route.ts', 'utf8')
const processorSource = await readFile('lib/cms/image-upload.ts', 'utf8')
const editorSource = await readFile('components/cms/cms-news-editor.tsx', 'utf8')
const nextConfig = await readFile('next.config.mjs', 'utf8')
assert.doesNotMatch(routeSource, /^import sharp from ['"]sharp['"]/m, '上传路由不能顶层加载 sharp。')
assert.match(processorSource, /await import\('sharp'\)/, '图片处理阶段必须动态加载 sharp。')
assert.match(nextConfig, /outputFileTracingIncludes/, 'standalone 必须显式追踪 sharp 运行文件。')
for (const label of ['尚未上传', '进行中', '上传成功', '已保存原图', '上传失败，请重试']) {
  assert.match(editorSource, new RegExp(label), `编辑器缺少上传状态：${label}`)
}
assert.doesNotMatch(editorSource, /Unexpected token/, '编辑器不能暴露 JSON 解析异常。')

console.log('CMS 图片上传容错验证通过。')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
