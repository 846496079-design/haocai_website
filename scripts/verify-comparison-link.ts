import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const officialSite = readFileSync(resolve(process.cwd(), 'components/marketing/official-site.tsx'), 'utf8')

assert.match(
  officialSite,
  /<div className="relative z-10 -mt-8 px-6 pb-12 text-center">\s*<a href=\{`\$\{site\.path\}product\/#comparison`\} className="inline-flex min-h-11 items-center/,
)

console.log('完整功能对比表入口层级与 44px 点击区域验证通过。')
