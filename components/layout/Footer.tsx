import Image from 'next/image'
import type { SiteContent } from '@/lib/site-content'
import { sites } from '@/lib/site-content'

interface FooterProps {
  site: SiteContent
}

const siteList = [sites.cn, sites.jp, sites.hk]
const footerActionCopy = { cn: '关于我们', jp: '会社紹介', hk: '關於我們' } as const
const logoSrc = {
  cn: '/images/brand/official-logo-cn-20260715.png',
  jp: '/images/brand/official-logo-jp-20260715.png',
  hk: '/images/brand/official-logo-hk-20260715.png',
} as const

const mobileFooterCopy = {
  cn: {
    slogan: '让天下企业拥有一个 AI 财务专家',
    phone: '电话咨询',
    email: '邮件联系',
    company: '企业信息',
    sites: '站点与企业微信',
    expand: '展开',
    companyName: '企业主体',
    creditCode: '统一社会信用代码',
    registeredAddress: '注册地址',
    headquarters: '企业总部',
  },
  jp: {
    slogan: 'すべての企業に AI 財務の専門家を',
    phone: '電話で相談',
    email: 'メールで相談',
    company: '会社情報',
    sites: 'サイト・企業微信',
    expand: '表示',
    companyName: '法人名',
    creditCode: '統一社会信用コード',
    registeredAddress: '登録住所',
    headquarters: '本社所在地',
  },
  hk: {
    slogan: '讓天下企業擁有一個 AI 財務專家',
    phone: '電話諮詢',
    email: '電郵聯絡',
    company: '企業資料',
    sites: '站點與企業微信',
    expand: '展開',
    companyName: '企業主體',
    creditCode: '統一社會信用代碼',
    registeredAddress: '註冊地址',
    headquarters: '企業總部',
  },
} as const

const desktopFooterCopy = {
  cn: { slogan: '让天下企业拥有一个 AI 财税大脑 · 360 元 AI 记账', product: '产品服务', sites: '站点', contact: '联系我们', manager: '联系人', phone: '电话', email: '邮箱', wechat: '企业微信', qrAlt: '企业微信二维码', disclaimer: '页面信息仅用于产品介绍，具体服务以实际开通和双方确认为准。' },
  jp: { slogan: 'すべての企業に AI 財務の専門家を · 年額 360 元 AI 記帳', product: '製品・サービス', sites: 'サイト', contact: 'お問い合わせ', manager: '担当者', phone: '電話', email: 'メール', wechat: '企業微信', qrAlt: '企業微信のQRコード', disclaimer: '本ページは製品紹介を目的としています。具体的なサービス内容は、利用開始時の案内と双方の確認を優先します。' },
  hk: { slogan: '讓天下企業擁有一個 AI 財務專家 · 年費 360 元 AI 記賬', product: '產品服務', sites: '站點', contact: '聯絡我們', manager: '聯絡人', phone: '電話', email: '電郵', wechat: '企業微信', qrAlt: '企業微信二維碼', disclaimer: '本頁資料僅作產品介紹，實際服務以開通說明及雙方確認為準。' },
} as const

export default function Footer({ site }: FooterProps) {
  const mobileCopy = mobileFooterCopy[site.code]
  const desktopCopy = desktopFooterCopy[site.code]

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-5 py-8 lg:px-6 lg:py-14">
        <div className="lg:hidden">
          <Image
            src={logoSrc[site.code]}
            alt="账大师"
            width={720}
            height={238}
            className="h-9 w-auto"
          />
          <p className="mt-3 text-sm text-muted-foreground">{mobileCopy.slogan}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a href={`tel:${site.company.contact}`} className="rounded-2xl bg-background p-3">
              <span className="block text-xs text-text-tertiary">{mobileCopy.phone}</span>
              <span className="mt-1 block text-sm font-semibold text-foreground">{site.company.contact}</span>
            </a>
            <a href={`mailto:${site.company.email}`} className="rounded-2xl bg-background p-3">
              <span className="block text-xs text-text-tertiary">{mobileCopy.email}</span>
              <span className="mt-1 block break-all text-sm font-semibold text-foreground">{site.company.email}</span>
            </a>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {site.nav.map((item) => (
              <a key={item.href} href={item.href} className="rounded-xl bg-background px-2 py-2 text-center text-xs text-muted-foreground">
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-background px-4">
            <details className="group py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                {mobileCopy.company}
                <span className="float-right text-xs font-normal text-muted-foreground">{mobileCopy.expand}</span>
              </summary>
              <div className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                <p>{mobileCopy.companyName}：{site.company.name}</p>
                <p>{mobileCopy.creditCode}：{site.company.creditCode}</p>
                <p>{mobileCopy.registeredAddress}：{site.company.registeredAddress}</p>
                <p>{mobileCopy.headquarters}：{site.company.headquarters}</p>
              </div>
            </details>
            <details className="group py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                {mobileCopy.sites}
                <span className="float-right text-xs font-normal text-muted-foreground">{mobileCopy.expand}</span>
              </summary>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  {siteList.map((item) => <a key={item.code} href={item.path} className="block">{item.localeName}</a>)}
                  <p className="pt-1 text-xs text-text-tertiary">{site.company.hours}</p>
                </div>
                <Image src="/images/wechat-qr.png" alt={desktopCopy.qrAlt} width={72} height={72} className="rounded-lg border border-border" />
              </div>
            </details>
          </div>
        </div>

        <div className="hidden gap-10 lg:grid lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={logoSrc[site.code]}
                alt="账大师"
                width={720}
                height={238}
                className="h-11 w-auto"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{desktopCopy.slogan}</p>
            <div className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground">
              <p>{mobileCopy.companyName}：{site.company.name}</p>
              <p>{mobileCopy.creditCode}：{site.company.creditCode}</p>
              <p>{mobileCopy.registeredAddress}：{site.company.registeredAddress}</p>
              <p>{mobileCopy.headquarters}：{site.company.headquarters}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{desktopCopy.product}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{desktopCopy.sites}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {siteList.map((item) => (
                <li key={item.code}>
                  <a href={item.path} className="transition-colors hover:text-foreground">
                    {item.localeName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{desktopCopy.contact}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="block text-xs text-text-tertiary">{desktopCopy.manager}</span>
                {site.company.manager}
              </li>
              <li>
                <span className="block text-xs text-text-tertiary">{desktopCopy.phone}</span>
                <a href={`tel:${site.company.contact}`} className="hover:text-foreground">
                  {site.company.contact}
                </a>
              </li>
              <li>
                <span className="block text-xs text-text-tertiary">{desktopCopy.email}</span>
                <a href={`mailto:${site.company.email}`} className="hover:text-foreground">
                  {site.company.email}
                </a>
              </li>
              <li>
                <span className="block text-xs text-text-tertiary">{desktopCopy.wechat}</span>
                <div className="mt-2">
                  <Image
                    src="/images/wechat-qr.png"
                    alt={desktopCopy.qrAlt}
                    width={88}
                    height={88}
                    className="rounded-xl border border-border"
                  />
                </div>
              </li>
              <li className="text-xs text-text-tertiary">{site.company.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 text-xs text-muted-foreground lg:mt-12 lg:pt-6 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 {site.company.name}。{desktopCopy.disclaimer}</p>
          <div className="flex gap-5">
            <a href={`${site.path}company/`} className="hover:text-foreground">{footerActionCopy[site.code]}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
