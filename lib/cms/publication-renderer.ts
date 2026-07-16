import { Marked, Renderer, type Tokens } from 'marked'
import { DEFAULT_PUBLICATION_STYLE, normalizePublicationBody, type PublicationBody, type PublicationStyleConfig } from './publication'
import { getPublicationTemplate, type PublicationTemplate } from './publication-templates'

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function safeUrl(value: string, image = false) {
  const url = value.trim()
  if (/^(https?:\/\/|\/)/i.test(url)) return escapeHtml(url)
  if (!image && /^(mailto:|tel:)/i.test(url)) return escapeHtml(url)
  return image ? '' : '#'
}

function clamp(value: unknown, minimum: number, maximum: number, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback
}

function color(value: unknown, fallback: string) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

export function normalizePublicationStyle(style: Partial<PublicationStyleConfig> | undefined, template: PublicationTemplate): PublicationStyleConfig {
  return {
    fontSize: clamp(style?.fontSize, 12, 24, DEFAULT_PUBLICATION_STYLE.fontSize),
    lineHeight: clamp(style?.lineHeight, 1.2, 2.6, DEFAULT_PUBLICATION_STYLE.lineHeight),
    paragraphSpacing: clamp(style?.paragraphSpacing, 0, 48, DEFAULT_PUBLICATION_STYLE.paragraphSpacing),
    firstLineIndent: Boolean(style?.firstLineIndent),
    pagePaddingTop: clamp(style?.pagePaddingTop, 0, 64, DEFAULT_PUBLICATION_STYLE.pagePaddingTop),
    pagePaddingRight: clamp(style?.pagePaddingRight, 0, 48, DEFAULT_PUBLICATION_STYLE.pagePaddingRight),
    pagePaddingBottom: clamp(style?.pagePaddingBottom, 0, 64, DEFAULT_PUBLICATION_STYLE.pagePaddingBottom),
    pagePaddingLeft: clamp(style?.pagePaddingLeft, 0, 48, DEFAULT_PUBLICATION_STYLE.pagePaddingLeft),
    letterSpacing: clamp(style?.letterSpacing, -1, 6, DEFAULT_PUBLICATION_STYLE.letterSpacing),
    imageRadius: clamp(style?.imageRadius, 0, 32, DEFAULT_PUBLICATION_STYLE.imageRadius),
    themeColor: color(style?.themeColor, template.primary),
    h1Layout: style?.h1Layout === 'left' ? 'left' : 'center',
    h2Layout: style?.h2Layout === 'center' ? 'center' : 'left',
  }
}

function headingStyle(depth: number, template: PublicationTemplate, style: PublicationStyleConfig) {
  const align = depth === 1 ? style.h1Layout : style.h2Layout
  const size = depth === 1 ? 30 : depth === 2 ? 24 : depth === 3 ? 20 : 17
  const common = `margin:${depth === 1 ? 36 : 30}px 0 16px;color:${template.text};font-size:${size}px;line-height:1.35;font-weight:700;text-align:${align};letter-spacing:${Math.max(style.letterSpacing, 0)}px;`
  if (template.headingStyle === 'bar') return `${common}padding-left:12px;border-left:4px solid ${style.themeColor};`
  if (template.headingStyle === 'underline') return `${common}padding-bottom:9px;border-bottom:2px solid ${style.themeColor};`
  if (template.headingStyle === 'pill') return `${common}display:block;padding:8px 14px;border-radius:999px;background:${style.themeColor};color:#ffffff;`
  if (template.headingStyle === 'frame') return `${common}padding:10px 14px;border:2px solid ${style.themeColor};border-radius:8px;`
  if (template.headingStyle === 'numbered') return `${common}padding:8px 12px;background:${template.background};border-bottom:3px solid ${style.themeColor};`
  return `${common}display:block;padding:6px 4px;background:${template.accent}55;border-bottom:2px solid ${style.themeColor};`
}

class PublicationRenderer extends Renderer<string, string> {
  constructor(private readonly template: PublicationTemplate, private readonly styleConfig: PublicationStyleConfig) {
    super()
  }

  override html({ text }: Tokens.HTML | Tokens.Tag) {
    return /^<\/?(?:mark|sup|sub)>$/i.test(text.trim()) ? text.trim() : escapeHtml(text)
  }

  override heading({ tokens, depth }: Tokens.Heading) {
    return `<section style="${headingStyle(depth, this.template, this.styleConfig)}">${this.parser.parseInline(tokens)}</section>`
  }

  override paragraph({ tokens }: Tokens.Paragraph) {
    const meaningful = tokens.filter((token) => token.type !== 'space' && !(token.type === 'text' && !token.text.trim()))
    const images = meaningful.filter((token): token is Tokens.Image => token.type === 'image')
    if (images.length > 1 && images.length === meaningful.length) {
      const width = Math.max(24, Math.floor(100 / images.length) - 1)
      return `<section style="display:flex;gap:8px;margin:${this.styleConfig.paragraphSpacing}px 0;align-items:stretch;">${images.map((image) => `<span style="display:block;width:${width}%;">${this.imageMarkup(image, true)}</span>`).join('')}</section>`
    }
    return `<p style="margin:0 0 ${this.styleConfig.paragraphSpacing}px;color:${this.template.text};font-size:${this.styleConfig.fontSize}px;line-height:${this.styleConfig.lineHeight};letter-spacing:${this.styleConfig.letterSpacing}px;text-align:justify;text-indent:${this.styleConfig.firstLineIndent ? '2em' : '0'};">${this.parser.parseInline(tokens)}</p>`
  }

  override blockquote({ tokens }: Tokens.Blockquote) {
    const base = `margin:20px 0;padding:14px 16px;color:${this.template.muted};font-size:${this.styleConfig.fontSize}px;line-height:${this.styleConfig.lineHeight};`
    const decoration = this.template.quoteStyle === 'line'
      ? `border-left:4px solid ${this.styleConfig.themeColor};background:${this.template.background};`
      : this.template.quoteStyle === 'panel'
        ? `border:1px solid ${this.template.accent};border-radius:10px;background:${this.template.background};`
        : `border-radius:10px;background:${this.template.background};box-shadow:inset 0 0 0 1px ${this.template.accent};`
    return `<blockquote style="${base}${decoration}">${this.parser.parse(tokens)}</blockquote>`
  }

  override code({ text, lang }: Tokens.Code) {
    const language = lang ? escapeHtml(lang.replace(/[^a-z0-9_+-]/gi, '').slice(0, 30)) : ''
    return `<pre style="margin:20px 0;padding:16px;overflow-x:auto;border-radius:10px;background:${this.template.codeBackground};color:${this.template.background === this.template.codeBackground ? this.template.text : '#f8fafc'};font-size:13px;line-height:1.65;white-space:pre;"><code${language ? ` data-language="${language}"` : ''}>${escapeHtml(text)}</code></pre>`
  }

  override codespan({ text }: Tokens.Codespan) {
    return `<code style="padding:2px 5px;border-radius:4px;background:${this.template.background};color:${this.styleConfig.themeColor};font-size:.92em;">${escapeHtml(text)}</code>`
  }

  override strong({ tokens }: Tokens.Strong) {
    return `<strong style="font-weight:700;color:${this.template.text};">${this.parser.parseInline(tokens)}</strong>`
  }

  override em({ tokens }: Tokens.Em) {
    return `<em style="font-style:italic;color:${this.template.muted};">${this.parser.parseInline(tokens)}</em>`
  }

  override del({ tokens }: Tokens.Del) {
    return `<s style="text-decoration:line-through;opacity:.72;">${this.parser.parseInline(tokens)}</s>`
  }

  override link({ href, title, tokens }: Tokens.Link) {
    const url = safeUrl(href)
    return `<a href="${url}"${title ? ` title="${escapeHtml(title)}"` : ''} style="color:${this.styleConfig.themeColor};text-decoration:underline;text-underline-offset:3px;">${this.parser.parseInline(tokens)}</a>`
  }

  private imageMarkup({ href, title, text }: Tokens.Image, compact = false) {
    const url = safeUrl(href, true)
    if (!url) return `<span style="color:#b91c1c;">[图片地址无效：${escapeHtml(text || '未命名图片')}]</span>`
    const caption = title ? `<span style="display:block;margin-top:7px;color:${this.template.muted};font-size:13px;line-height:1.6;text-align:center;">${escapeHtml(title)}</span>` : ''
    return `<img src="${url}" alt="${escapeHtml(text || '正文图片')}" style="display:block;width:100%;height:auto;margin:0 auto;border-radius:${this.styleConfig.imageRadius}px;" />${compact ? '' : caption}`
  }

  override image(token: Tokens.Image) {
    return `<span style="display:block;margin:${this.styleConfig.paragraphSpacing}px 0;">${this.imageMarkup(token)}</span>`
  }

  override list(token: Tokens.List) {
    const tag = token.ordered ? 'ol' : 'ul'
    const start = token.ordered && token.start !== 1 && token.start !== '' ? ` start="${Number(token.start)}"` : ''
    return `<${tag}${start} style="margin:12px 0 ${this.styleConfig.paragraphSpacing}px;padding-left:1.6em;color:${this.template.text};font-size:${this.styleConfig.fontSize}px;line-height:${this.styleConfig.lineHeight};">${token.items.map((item) => this.listitem(item)).join('')}</${tag}>`
  }

  override listitem(item: Tokens.ListItem) {
    return `<li style="margin:6px 0;padding-left:3px;">${this.parser.parse(item.tokens)}</li>`
  }

  override table(token: Tokens.Table) {
    const header = `<thead><tr>${token.header.map((cell) => this.tablecell({ ...cell, header: true })).join('')}</tr></thead>`
    const body = `<tbody>${token.rows.map((row) => `<tr>${row.map((cell) => this.tablecell({ ...cell, header: false })).join('')}</tr>`).join('')}</tbody>`
    return `<section style="margin:20px 0;overflow-x:auto;"><table style="width:100%;border-collapse:collapse;color:${this.template.text};font-size:14px;line-height:1.6;">${header}${body}</table></section>`
  }

  override tablecell(token: Tokens.TableCell) {
    const tag = token.header ? 'th' : 'td'
    const background = token.header ? `background:${this.template.background};font-weight:700;` : ''
    return `<${tag} style="padding:9px 10px;border:1px solid ${this.template.accent};text-align:${token.align ?? 'left'};vertical-align:top;${background}">${this.parser.parseInline(token.tokens)}</${tag}>`
  }

  override hr() {
    return `<hr style="margin:28px auto;border:0;border-top:2px solid ${this.template.accent};width:72%;" />`
  }

  override br() {
    return '<br />'
  }
}

export type PublicationRenderResult = {
  html: string
  template: PublicationTemplate
  styleConfig: PublicationStyleConfig
  warnings: string[]
}

export function renderPublicationMarkdown(value: PublicationBody): PublicationRenderResult {
  const body = normalizePublicationBody(value)
  const template = getPublicationTemplate(body.templateId)
  const styleConfig = normalizePublicationStyle(body.styleConfig, template)
  const renderer = new PublicationRenderer(template, styleConfig)
  const parser = new Marked()
  parser.setOptions({ renderer, gfm: true, breaks: true })
  const rendered = String(parser.parse(body.sourceMarkdown, { async: false }))
  const html = `<section data-publication-root="true" data-template-id="${template.id}" style="box-sizing:border-box;width:100%;padding:${styleConfig.pagePaddingTop}px ${styleConfig.pagePaddingRight}px ${styleConfig.pagePaddingBottom}px ${styleConfig.pagePaddingLeft}px;background:${template.background};color:${template.text};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;word-break:break-word;overflow-wrap:anywhere;">${rendered}</section>`
  const warnings: string[] = []
  if (/\bblob:/i.test(body.sourceMarkdown)) warnings.push('正文包含临时 blob 图片地址。')
  if (/\bdata:image\//i.test(body.sourceMarkdown)) warnings.push('正文包含未上传的 base64 图片。')
  return { html, template, styleConfig, warnings }
}
