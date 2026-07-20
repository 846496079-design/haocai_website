import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  desktopProductUrl,
  mobileProductUrl,
  productEntryPath,
  resolveProductEntryUrl,
} from '../lib/product-entry'

const root = process.cwd()
const officialSite = readFileSync(resolve(root, 'components/marketing/official-site.tsx'), 'utf8')
const navbar = readFileSync(resolve(root, 'components/layout/Navbar.tsx'), 'utf8')
const siteContent = readFileSync(resolve(root, 'lib/site-content.ts'), 'utf8')
const cnHome = readFileSync(resolve(root, 'app/cn/page.tsx'), 'utf8')
const siteSpec = readFileSync(resolve(root, 'docs/specs/2026-07-08-zhdashi-official-site-spec.md'), 'utf8')
const productEntryRoute = readFileSync(resolve(root, 'app/go/product/route.ts'), 'utf8')

assert.equal(productEntryPath, '/go/product/')
assert.equal(desktopProductUrl, 'https://finance-ai.haocai360.cn/sign-in')
assert.equal(mobileProductUrl, 'https://finance-h5.haocai360.cn/')
assert.match(officialSite, /const productAppUrl = '\/go\/product\/'/)
assert.doesNotMatch(officialSite, /trialLeadApiUrl|submitTrialForm|trialOpen|trialForm|\/api\/public\/leads\/trial\//)
assert.match(officialSite, /href=\{productAppUrl\}/)
assert.match(navbar, /href=\{trialHref\}/)

const desktopChrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
const macSafari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15'
const iphoneSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
const ipadSafari = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
const ipadDesktopMode = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1'
const androidTablet = 'Mozilla/5.0 (Linux; Android 14; SM-X710 Build/UP1A.231005.007) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'

assert.equal(resolveProductEntryUrl({ userAgent: desktopChrome }), desktopProductUrl)
assert.equal(resolveProductEntryUrl({ userAgent: macSafari }), desktopProductUrl)
assert.equal(resolveProductEntryUrl({ userAgent: iphoneSafari }), mobileProductUrl)
assert.equal(resolveProductEntryUrl({ userAgent: ipadSafari }), mobileProductUrl)
assert.equal(resolveProductEntryUrl({ userAgent: ipadDesktopMode }), mobileProductUrl)
assert.equal(resolveProductEntryUrl({ userAgent: androidTablet }), mobileProductUrl)
assert.equal(resolveProductEntryUrl({ mobileHint: '?1', userAgent: desktopChrome }), mobileProductUrl)
assert.equal(resolveProductEntryUrl({ userAgent: '' }), desktopProductUrl)
assert.match(productEntryRoute, /NextResponse\.redirect\(targetUrl, 307\)/)
assert.match(productEntryRoute, /private, no-store, max-age=0/)
assert.match(productEntryRoute, /User-Agent, Sec-CH-UA-Mobile/)

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
