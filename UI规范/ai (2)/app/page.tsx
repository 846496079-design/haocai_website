import { BotIcon, SearchIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AiGallery } from '@/components/workbench/ai-gallery'
import { AiWorkspaceGallery } from '@/components/workbench/ai-workspace-gallery'
import { ComponentGallery } from '@/components/workbench/component-gallery'
import { DataDisplayGallery } from '@/components/workbench/data-display-gallery'
import { FormsGallery } from '@/components/workbench/forms-gallery'
import { FoundationsSection } from '@/components/workbench/foundations-section'
import { HomepageDemo } from '@/components/workbench/homepage-demo'
import { InputsGallery } from '@/components/workbench/inputs-gallery'
import { LayoutGallery } from '@/components/workbench/layout-gallery'
import { OverlaysGallery } from '@/components/workbench/overlays-gallery'
import { SidebarNav } from '@/components/workbench/sidebar-nav'
import { TaxGallery } from '@/components/workbench/tax-gallery'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))]">
              <BotIcon className="size-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">
                AI 代理工作台
              </span>
              <span className="text-xs text-muted-foreground">
                Agent Workbench · 设计组件库
              </span>
            </div>
            <Badge variant="secondary" className="ml-2">
              v1.0
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <SearchIcon data-icon="inline-start" />
              搜索组件
            </Button>
            <Button size="sm">使用规范</Button>
          </div>
        </div>
      </header>

      {/* 主体：左侧导航 + 内容区 */}
      <div className="mx-auto flex max-w-[1280px] gap-8 px-6 py-10">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto pb-10 lg:block">
          <SidebarNav />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-14">
          {/* 页面标题 */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
              企业级多代理协作工作空间组件体系
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              一套轻量、高度可信的设计组件库，服务于企业用户、运维团队、销售团队、知识型员工与
              AI 代理管理员。基于 1440 × 1024 画布、1280 内容区与 12 列、8px
              间距系统构建。
            </p>
          </div>

          <FoundationsSection />
          <AiGallery />
          <AiWorkspaceGallery />
          <ComponentGallery />
          <InputsGallery />
          <OverlaysGallery />
          <FormsGallery />
          <DataDisplayGallery />
          <LayoutGallery />
          <HomepageDemo />
          <TaxGallery />
        </main>
      </div>
    </div>
  )
}
