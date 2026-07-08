import Image from 'next/image'
import type { SiteContent } from '@/lib/site-content'
import { sites } from '@/lib/site-content'

interface FooterProps {
  site: SiteContent
}

const siteList = [sites.cn, sites.jp, sites.hk]

export default function Footer({ site }: FooterProps) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))]">
                <span className="text-lg font-bold text-white">账</span>
              </div>
              <div>
                <p className="font-semibold">{site.name}</p>
                <p className="text-xs text-muted-foreground">让天下企业拥有一个 AI 财务专家</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground">
              <p>企业主体：{site.company.name}</p>
              <p>统一社会信用代码：{site.company.creditCode}</p>
              <p>注册地址：{site.company.registeredAddress}</p>
              <p>企业总部：{site.company.headquarters}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">产品服务</h4>
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
            <h4 className="text-sm font-semibold">站点</h4>
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
            <h4 className="text-sm font-semibold">联系我们</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="block text-xs text-text-tertiary">联系人</span>
                {site.company.manager}
              </li>
              <li>
                <span className="block text-xs text-text-tertiary">电话</span>
                <a href={`tel:${site.company.contact}`} className="hover:text-foreground">
                  {site.company.contact}
                </a>
              </li>
              <li>
                <span className="block text-xs text-text-tertiary">邮箱</span>
                <a href={`mailto:${site.company.email}`} className="hover:text-foreground">
                  {site.company.email}
                </a>
              </li>
              <li>
                <span className="block text-xs text-text-tertiary">企业微信</span>
                <div className="mt-2">
                  <Image
                    src="/images/wechat-qr.png"
                    alt="企业微信二维码"
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

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 {site.company.name}。页面宣传以当前产品能力和 PRD 边界为准。</p>
          <div className="flex gap-5">
            <span>用户协议</span>
            <span>隐私政策</span>
            <span>关于我们</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
