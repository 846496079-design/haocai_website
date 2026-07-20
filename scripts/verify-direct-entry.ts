import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const officialSite = readFileSync(resolve(root, 'components/marketing/official-site.tsx'), 'utf8')
const navbar = readFileSync(resolve(root, 'components/layout/Navbar.tsx'), 'utf8')
const siteContent = readFileSync(resolve(root, 'lib/site-content.ts'), 'utf8')
const cnHome = readFileSync(resolve(root, 'app/cn/page.tsx'), 'utf8')
const siteSpec = readFileSync(resolve(root, 'docs/specs/2026-07-08-zhdashi-official-site-spec.md'), 'utf8')

assert.match(officialSite, /const productAppUrl = 'https:\/\/finance-h5\.haocai360\.cn\/'/)
assert.doesNotMatch(officialSite, /trialLeadApiUrl|submitTrialForm|trialOpen|trialForm|\/api\/public\/leads\/trial\//)
assert.match(officialSite, /href=\{productAppUrl\}/)
assert.match(navbar, /href=\{trialHref\}/)

assert.match(officialSite, /useState<'yearly' \| 'lifetime'>\('yearly'\)/)
assert.match(officialSite, /role="tablist"/)
assert.match(officialSite, /pricing\.plans\.map/)
const pricingSource = officialSite.slice(
  officialSite.indexOf('function renderPricing'),
  officialSite.indexOf('function renderComparison'),
)
assert.match(pricingSource, /mx-auto mt-8 grid max-w-\[920px\] gap-5 md:grid-cols-2/)
assert.doesNotMatch(pricingSource, /xl:grid-cols-4/)
assert.match(siteContent, /perDay: '30 元\/月'/)
assert.match(siteContent, /perDay: '88 元\/月'/)

assert.doesNotMatch(cnHome, /redirect\(|searchParams/)
assert.match(officialSite, /if \(page !== 'partners'\) return/)
assert.match(siteSpec, /\/cn\/partners\/\?c=LFFWTL/)
assert.match(siteSpec, /\/cn\/\?c=LFFWTL.*不跳转/)

assert.match(officialSite, /const partnerLeadApiUrl = '\/api\/public\/leads\/partner\/'/)
assert.match(officialSite, /submitPartnerForm/)

console.log('官网直达产品、报价切换和代理邀请码入口验证通过。')
