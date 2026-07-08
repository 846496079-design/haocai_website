'use client'

import { useState } from 'react'
import {
  Building2Icon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  FileStackIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  ReceiptTextIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

type NavChild = { id: string; label: string; icon: LucideIcon }
type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  children?: NavChild[]
}

const NAV: NavItem[] = [
  { id: 'workbench', label: '报税工作台', icon: LayoutDashboardIcon },
  {
    id: 'three-step',
    label: '三步报税',
    icon: ListChecksIcon,
    children: [
      { id: 'salary', label: '员工工资', icon: UsersIcon },
      { id: 'invoice', label: '发票管理', icon: ReceiptTextIcon },
      { id: 'bank', label: '银行流水', icon: WalletIcon },
    ],
  },
  { id: 'reconcile', label: '数据核对', icon: ClipboardCheckIcon },
  { id: 'declare', label: '申报中心', icon: LandmarkIcon },
  { id: 'report', label: '报表与凭证', icon: FileStackIcon },
  { id: 'ai', label: 'AI 财税助手', icon: SparklesIcon },
  { id: 'company', label: '公司管理', icon: Building2Icon },
  { id: 'settings', label: '系统设置', icon: SettingsIcon },
]

export function TaxSidebar({ className }: { className?: string }) {
  const [active, setActive] = useState('workbench')
  const [expanded, setExpanded] = useState<string[]>(['three-step'])

  const toggleExpand = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  return (
    <aside
      className={cn(
        'flex w-[260px] shrink-0 flex-col border-r border-border bg-card',
        className,
      )}
    >
      {/* 品牌 */}
      <div className="flex items-center gap-3 px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-base font-bold text-secondary-foreground">
          财
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-foreground">
            好财账大师
          </span>
          <span className="text-[11px] tracking-wide text-text-tertiary">
            AI 三步做账报税工作台
          </span>
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const Icon = item.icon
          const hasChildren = !!item.children?.length
          const isExpanded = expanded.includes(item.id)
          const isActive = active === item.id
          const hasActiveChild = item.children?.some((c) => active === c.id)

          return (
            <div key={item.id} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() =>
                  hasChildren ? toggleExpand(item.id) : setActive(item.id)
                }
                aria-expanded={hasChildren ? isExpanded : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : hasActiveChild
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  <ChevronRightIcon
                    className={cn(
                      'size-4 shrink-0 text-text-tertiary transition-transform',
                      isExpanded && 'rotate-90',
                    )}
                  />
                )}
              </button>

              {/* 二级菜单 */}
              {hasChildren && isExpanded && (
                <div className="flex flex-col gap-1 pl-4">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon
                    const isChildActive = active === child.id
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setActive(child.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          isChildActive
                            ? 'bg-secondary font-medium text-secondary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        <ChildIcon className="size-4 shrink-0" />
                        <span>{child.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 底部版本卡 */}
      <div className="px-3 pb-4">
        <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/50 px-4 py-3">
          <span className="text-xs font-semibold text-foreground">
            当前版本：原型演示
          </span>
          <span className="text-[11px] leading-relaxed text-text-tertiary">
            真实 API、银行直连、税务局提交暂未接入，本版用于流程展示与需求确认。
          </span>
        </div>
      </div>
    </aside>
  )
}
