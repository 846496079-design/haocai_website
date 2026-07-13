import { mkdir, readdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const sourceRoot = join(process.cwd(), 'public', 'images', 'news')
const outputRoot = join(sourceRoot, 'optimized')

async function collectPngFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return entry.name === 'optimized' ? [] : collectPngFiles(path)
    return entry.isFile() && entry.name.toLowerCase().endsWith('.png') ? [path] : []
  }))
  return nested.flat()
}

await mkdir(outputRoot, { recursive: true })
const files = await collectPngFiles(sourceRoot)
let inputBytes = 0
let outputBytes = 0

for (const source of files) {
  const target = join(outputRoot, `${parse(source).name}.webp`)
  const info = await sharp(source).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(target)
  inputBytes += (await stat(source)).size
  outputBytes += info.size
}

console.log(`已优化 ${files.length} 张新闻图片：${Math.round(inputBytes / 1024)} KiB -> ${Math.round(outputBytes / 1024)} KiB`)
