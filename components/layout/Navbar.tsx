'use client'

import { useState } from 'react'
import { ChevronDown, Globe, Menu, X } from 'lucide-react'
import Image from 'next/image'
import type { SiteContent } from '@/lib/site-content'
import { sites } from '@/lib/site-content'

interface NavbarProps {
  site: SiteContent
  onTrialClick?: () => void
}

const siteList = [sites.cn, sites.jp, sites.hk]

export default function Navbar({ site, onTrialClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [globalOpen, setGlobalOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <a href={site.path} className="flex items-center gap-2">
          <Image
            src="/images/brand/haocai-zds-logo-horizontal.png"
            alt="好财集团 账大师"
            width={220}
            height={52}
            className="h-9 w-auto"
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
              <span>站点</span>
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
                    <span>{item.localeName}</span>
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

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">站点</p>
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
                    <span>{item.localeName}</span>
                    <span className="text-xs uppercase">{item.code}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  onTrialClick?.()
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-sm font-semibold text-white"
              >
                {site.actions.trial}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
