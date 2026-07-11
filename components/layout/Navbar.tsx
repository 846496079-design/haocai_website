'use client'

import { useState } from 'react'
import { ChevronDown, Globe, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { SiteContent } from '@/lib/site-content'
import { sites } from '@/lib/site-content'

interface NavbarProps {
  site: SiteContent
  onTrialClick?: () => void
}

const siteList = [sites.cn, sites.jp, sites.hk]
const siteLabel = { cn: '站点', jp: 'サイト', hk: '站點' } as const
const localizedSiteNames = {
  cn: { cn: '中国站', jp: '日本站', hk: '香港站' },
  jp: { cn: '中国サイト', jp: '日本サイト', hk: '香港サイト' },
  hk: { cn: '中國站', jp: '日本站', hk: '香港站' },
} as const

export default function Navbar({ site, onTrialClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [globalOpen, setGlobalOpen] = useState(false)
  const pathname = usePathname()
  const currentSiteNames = localizedSiteNames[site.code]

  function isCurrentNavItem(href: string) {
    return href === site.path ? pathname === href : pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 md:h-16 md:px-6">
        <a href={site.path} className="flex items-center gap-2">
          <Image
            src="/images/brand/haocai-zds-logo-horizontal-web.png"
            alt="好财集团 账大师"
            width={220}
            height={52}
            className="h-8 w-auto md:h-9"
            priority
          />
          <span className="hidden text-xs leading-tight text-muted-foreground lg:block">{site.localeName}</span>
        </a>

        <nav className="hidden items-center gap-4 md:flex lg:gap-5">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setGlobalOpen((open) => !open)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="size-4" />
              <span>{siteLabel[site.code]}</span>
              <ChevronDown className={`size-4 transition-transform ${globalOpen ? 'rotate-180' : ''}`} />
            </button>
            {globalOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-lg">
                {siteList.map((item) => (
                  <a
                    key={item.code}
                    href={item.path}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      item.code === site.code
                        ? 'bg-secondary text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{currentSiteNames[item.code]}</span>
                    <span className="text-xs uppercase">{item.code}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onTrialClick}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-4 text-sm font-semibold text-white"
          >
            {site.actions.trial}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onTrialClick}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-3 text-xs font-semibold text-white"
          >
            {site.actions.trial}
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 scrollbar-none md:hidden" aria-label="移动端主导航">
        {site.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isCurrentNavItem(item.href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">{siteLabel[site.code]}</p>
              <div className="grid gap-2">
                {siteList.map((item) => (
                  <a
                    key={item.code}
                    href={item.path}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                      item.code === site.code ? 'bg-secondary text-primary' : 'text-muted-foreground'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{currentSiteNames[item.code]}</span>
                    <span className="text-xs uppercase">{item.code}</span>
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
