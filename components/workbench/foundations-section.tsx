import { Section, SectionHeader, ShowcaseBlock } from './showcase'

type Swatch = { name: string; hex: string; className: string; ring?: boolean }

const brand: Swatch[] = [
  { name: '主品牌色', hex: '#5B6CFF', className: 'bg-primary' },
  {
    name: '品牌渐变',
    hex: '#4F7BFF → #6C5CFF',
    className: 'bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))]',
  },
]

const neutral: Swatch[] = [
  { name: '页面背景', hex: '#F7F9FC', className: 'bg-background', ring: true },
  { name: '卡片背景', hex: '#FFFFFF', className: 'bg-card', ring: true },
  { name: '悬停背景', hex: '#F3F6FF', className: 'bg-secondary', ring: true },
  { name: '分割线', hex: '#E6EAF2', className: 'bg-border', ring: true },
]

const status: Swatch[] = [
  { name: '在线', hex: '#22C55E', className: 'bg-status-online' },
  { name: '执行中', hex: '#3B82F6', className: 'bg-status-running' },
  { name: '等待中', hex: '#98A2B3', className: 'bg-status-waiting' },
  { name: '警告', hex: '#F59E0B', className: 'bg-status-warning' },
  { name: '异常', hex: '#EF4444', className: 'bg-status-error' },
]

function SwatchCell({ s }: { s: Swatch }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 w-full rounded-lg ${s.className} ${
          s.ring ? 'ring-1 ring-border ring-inset' : ''
        }`}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{s.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{s.hex}</span>
      </div>
    </div>
  )
}

export function FoundationsSection() {
  return (
    <Section id="foundations">
      <SectionHeader
        index="00"
        title="色彩与字体"
        description="贯穿多代理协作工作台的品牌色、中性色、状态色与文字层级规范。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="品牌色 Brand" caption="主操作与品牌渐变">
          <div className="grid grid-cols-2 gap-4">
            {brand.map((s) => (
              <SwatchCell key={s.name} s={s} />
            ))}
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="中性色 Neutral" caption="背景、卡片、描边层级">
          <div className="grid grid-cols-4 gap-4">
            {neutral.map((s) => (
              <SwatchCell key={s.name} s={s} />
            ))}
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="状态色 Status" caption="代理运行状态语义色">
          <div className="grid grid-cols-5 gap-4">
            {status.map((s) => (
              <SwatchCell key={s.name} s={s} />
            ))}
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock
          title="字体层级 Typography"
          caption="中文 PingFang SC · 英文 Inter"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <span className="text-2xl font-semibold text-foreground">
                多代理协作工作台
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                24px / Semibold
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <span className="text-base text-muted-foreground">
                二级文字 · Secondary text for descriptions
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                16px / Regular
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-text-tertiary">
                三级文字 · Tertiary / placeholder
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                14px / Regular
              </span>
            </div>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}
