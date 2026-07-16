export type PublicationTemplateCategory = 'neo' | 'minimal' | 'business' | 'literary' | 'tech' | 'festival'
export type PublicationHeadingStyle = 'bar' | 'underline' | 'pill' | 'frame' | 'numbered' | 'marker'

export type PublicationTemplate = {
  id: string
  version: string
  category: PublicationTemplateCategory
  categoryLabel: string
  name: string
  description: string
  primary: string
  accent: string
  background: string
  text: string
  muted: string
  headingStyle: PublicationHeadingStyle
  quoteStyle: 'line' | 'panel' | 'soft'
  codeBackground: string
}

const variantNames = ['原点', '清晨', '远山', '海岸', '松影', '暖砂', '墨蓝', '青瓷', '赤陶', '暮紫', '银灰', '深夜']
const headingStyles: PublicationHeadingStyle[] = ['bar', 'underline', 'pill', 'frame', 'numbered', 'marker']

const categoryDefinitions: Array<{
  id: PublicationTemplateCategory
  label: string
  description: string
  palettes: Array<[string, string, string, string, string, string]>
}> = [
  {
    id: 'neo', label: '新粗野', description: '高对比、硬边框与明确层级',
    palettes: [
      ['#111827', '#f43f5e', '#fff7ed', '#111827', '#4b5563', '#111827'], ['#172554', '#2563eb', '#eff6ff', '#172554', '#475569', '#172554'],
      ['#422006', '#f59e0b', '#fffbeb', '#422006', '#6b5b45', '#422006'], ['#3f0d12', '#ef4444', '#fff1f2', '#3f0d12', '#6b4b50', '#3f0d12'],
      ['#052e16', '#22c55e', '#f0fdf4', '#052e16', '#486152', '#052e16'], ['#2e1065', '#a855f7', '#faf5ff', '#2e1065', '#64506f', '#2e1065'],
      ['#083344', '#06b6d4', '#ecfeff', '#083344', '#47626a', '#083344'], ['#431407', '#f97316', '#fff7ed', '#431407', '#6c554d', '#431407'],
      ['#1c1917', '#84cc16', '#f7fee7', '#1c1917', '#57534e', '#1c1917'], ['#312e81', '#818cf8', '#eef2ff', '#312e81', '#57577a', '#312e81'],
      ['#27272a', '#a1a1aa', '#fafafa', '#18181b', '#52525b', '#27272a'], ['#020617', '#38bdf8', '#0f172a', '#f8fafc', '#94a3b8', '#020617'],
    ],
  },
  {
    id: 'minimal', label: '极简', description: '克制留白与清晰阅读节奏',
    palettes: [
      ['#1f2937', '#64748b', '#ffffff', '#1f2937', '#64748b', '#f1f5f9'], ['#334155', '#94a3b8', '#f8fafc', '#334155', '#64748b', '#e2e8f0'],
      ['#3f3f46', '#a1a1aa', '#fafafa', '#27272a', '#71717a', '#e4e4e7'], ['#292524', '#a8a29e', '#fafaf9', '#292524', '#78716c', '#e7e5e4'],
      ['#374151', '#9ca3af', '#f9fafb', '#374151', '#6b7280', '#e5e7eb'], ['#44403c', '#d6d3d1', '#fffbeb', '#44403c', '#78716c', '#e7e5e4'],
      ['#164e63', '#67e8f9', '#f0fdfa', '#164e63', '#64748b', '#cffafe'], ['#14532d', '#86efac', '#f7fee7', '#14532d', '#64748b', '#dcfce7'],
      ['#7c2d12', '#fdba74', '#fff7ed', '#7c2d12', '#78716c', '#ffedd5'], ['#4c1d95', '#c4b5fd', '#faf5ff', '#4c1d95', '#71717a', '#ede9fe'],
      ['#0f172a', '#cbd5e1', '#ffffff', '#0f172a', '#64748b', '#e2e8f0'], ['#f8fafc', '#475569', '#0f172a', '#f8fafc', '#cbd5e1', '#334155'],
    ],
  },
  {
    id: 'business', label: '商务', description: '稳健、可信与数据友好',
    palettes: [
      ['#1e3a8a', '#3b82f6', '#eff6ff', '#172554', '#64748b', '#dbeafe'], ['#134e4a', '#14b8a6', '#f0fdfa', '#134e4a', '#64748b', '#ccfbf1'],
      ['#1e293b', '#0ea5e9', '#f8fafc', '#1e293b', '#64748b', '#e0f2fe'], ['#3f3f46', '#71717a', '#fafafa', '#27272a', '#71717a', '#e4e4e7'],
      ['#312e81', '#6366f1', '#eef2ff', '#312e81', '#64748b', '#e0e7ff'], ['#052e16', '#16a34a', '#f0fdf4', '#052e16', '#64748b', '#dcfce7'],
      ['#422006', '#ca8a04', '#fefce8', '#422006', '#78716c', '#fef3c7'], ['#4c0519', '#e11d48', '#fff1f2', '#4c0519', '#78716c', '#ffe4e6'],
      ['#083344', '#0891b2', '#ecfeff', '#083344', '#64748b', '#cffafe'], ['#172554', '#60a5fa', '#ffffff', '#172554', '#64748b', '#dbeafe'],
      ['#111827', '#4b5563', '#f9fafb', '#111827', '#6b7280', '#e5e7eb'], ['#f8fafc', '#38bdf8', '#082f49', '#f8fafc', '#bae6fd', '#0c4a6e'],
    ],
  },
  {
    id: 'literary', label: '文艺', description: '柔和色彩与编辑感排版',
    palettes: [
      ['#4a332d', '#b7795b', '#fffaf5', '#4a332d', '#7c6a63', '#f3e8df'], ['#3f4a3c', '#7c9a6d', '#f7faf5', '#3f4a3c', '#71806c', '#e4ede0'],
      ['#2f4858', '#8ab6d6', '#f4f9fc', '#2f4858', '#71808a', '#dfedf5'], ['#5b3f5c', '#b48ead', '#fbf7fb', '#5b3f5c', '#806f80', '#efe3ee'],
      ['#5c4b32', '#c4a46b', '#fffaf0', '#5c4b32', '#84765e', '#f2e8d5'], ['#3b4a57', '#8aa1b1', '#f6f8fa', '#3b4a57', '#73808a', '#e4eaee'],
      ['#633b3f', '#c9868c', '#fff7f7', '#633b3f', '#8b7375', '#f4e1e3'], ['#315b55', '#76a99f', '#f3faf8', '#315b55', '#70827e', '#dceeea'],
      ['#51445f', '#9c89b8', '#faf8fc', '#51445f', '#7d7485', '#ebe5f1'], ['#6a4b35', '#d39b6a', '#fff8f1', '#6a4b35', '#8b7767', '#f5e4d3'],
      ['#4b5563', '#9ca3af', '#f9fafb', '#374151', '#6b7280', '#e5e7eb'], ['#e8dccb', '#d4a373', '#2f2923', '#fffaf2', '#d6c7b4', '#5a4a3d'],
    ],
  },
  {
    id: 'tech', label: '科技', description: '数字界面感与高识别重点',
    palettes: [
      ['#0f172a', '#22d3ee', '#f0f9ff', '#0f172a', '#64748b', '#cffafe'], ['#111827', '#8b5cf6', '#f5f3ff', '#111827', '#64748b', '#ede9fe'],
      ['#052e16', '#4ade80', '#f0fdf4', '#052e16', '#64748b', '#dcfce7'], ['#172554', '#60a5fa', '#eff6ff', '#172554', '#64748b', '#dbeafe'],
      ['#3b0764', '#d946ef', '#fdf4ff', '#3b0764', '#71717a', '#fae8ff'], ['#083344', '#06b6d4', '#ecfeff', '#083344', '#64748b', '#cffafe'],
      ['#1e1b4b', '#818cf8', '#eef2ff', '#1e1b4b', '#64748b', '#e0e7ff'], ['#450a0a', '#fb7185', '#fff1f2', '#450a0a', '#78716c', '#ffe4e6'],
      ['#0c4a6e', '#38bdf8', '#f0f9ff', '#0c4a6e', '#64748b', '#bae6fd'], ['#14532d', '#a3e635', '#f7fee7', '#14532d', '#64748b', '#ecfccb'],
      ['#18181b', '#d4d4d8', '#fafafa', '#18181b', '#71717a', '#e4e4e7'], ['#020617', '#22d3ee', '#020617', '#f8fafc', '#94a3b8', '#164e63'],
    ],
  },
  {
    id: 'festival', label: '节庆', description: '节日氛围与品牌传播场景',
    palettes: [
      ['#7f1d1d', '#f59e0b', '#fff7ed', '#7f1d1d', '#7c5a4d', '#fed7aa'], ['#831843', '#f472b6', '#fdf2f8', '#831843', '#7c6570', '#fce7f3'],
      ['#4c1d95', '#facc15', '#faf5ff', '#4c1d95', '#756780', '#ede9fe'], ['#14532d', '#fbbf24', '#f0fdf4', '#14532d', '#66756a', '#dcfce7'],
      ['#7c2d12', '#fb923c', '#fff7ed', '#7c2d12', '#7c655a', '#ffedd5'], ['#1e3a8a', '#fcd34d', '#eff6ff', '#1e3a8a', '#64748b', '#dbeafe'],
      ['#701a75', '#f0abfc', '#fdf4ff', '#701a75', '#806d82', '#fae8ff'], ['#164e63', '#fde047', '#ecfeff', '#164e63', '#64748b', '#cffafe'],
      ['#881337', '#fb7185', '#fff1f2', '#881337', '#7c6870', '#ffe4e6'], ['#365314', '#bef264', '#f7fee7', '#365314', '#6b755f', '#ecfccb'],
      ['#422006', '#f59e0b', '#fefce8', '#422006', '#786d55', '#fef3c7'], ['#2e1065', '#facc15', '#2e1065', '#fff7ed', '#ddd6fe', '#581c87'],
    ],
  },
]

export const publicationTemplates: PublicationTemplate[] = categoryDefinitions.flatMap((category) =>
  category.palettes.map(([primary, accent, background, text, muted, codeBackground], index) => ({
    id: `${category.id}-${String(index + 1).padStart(2, '0')}`,
    version: '1.0.0',
    category: category.id,
    categoryLabel: category.label,
    name: `${category.label}·${variantNames[index]}`,
    description: category.description,
    primary,
    accent,
    background,
    text,
    muted,
    headingStyle: headingStyles[index % headingStyles.length],
    quoteStyle: (['line', 'panel', 'soft'] as const)[index % 3],
    codeBackground,
  })),
)

export const publicationTemplateCategories = categoryDefinitions.map(({ id, label }) => ({ id, label }))

export function getPublicationTemplate(id: string) {
  return publicationTemplates.find((template) => template.id === id) ?? publicationTemplates.find((template) => template.id === 'minimal-01')!
}
