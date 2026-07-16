"use client";

import { useMemo, useRef, useState } from "react";
import {
  createPublicationBody,
  normalizePublicationBody,
  publicationCopyIssues,
  type PublicationAsset,
  type PublicationBody,
  type PublicationStyleConfig,
} from "@/lib/cms/publication";
import { renderPublicationMarkdown } from "@/lib/cms/publication-renderer";
import {
  publicationTemplateCategories,
  publicationTemplates,
} from "@/lib/cms/publication-templates";

type Props = {
  articleId: number;
  value: PublicationBody;
  onChange: (value: PublicationBody) => void;
  onUpload: (file: File, altText: string) => Promise<PublicationAsset | undefined>;
  onNotice: (message: string) => void;
};

const toolbar = [
  { label: "标题一", before: "# ", after: "", block: true },
  { label: "标题二", before: "## ", after: "", block: true },
  { label: "加粗", before: "**", after: "**" },
  { label: "斜体", before: "*", after: "*" },
  { label: "高亮", before: "<mark>", after: "</mark>" },
  { label: "引用", before: "> ", after: "", block: true },
  { label: "列表", before: "- ", after: "", block: true },
  { label: "有序列表", before: "1. ", after: "", block: true },
  { label: "链接", before: "[", after: "](https://)" },
  { label: "行内代码", before: "`", after: "`" },
  { label: "代码块", before: "```text\n", after: "\n```", block: true },
  { label: "上标", before: "<sup>", after: "</sup>" },
  { label: "下标", before: "<sub>", after: "</sub>" },
] as const;

function absoluteImageUrls(html: string) {
  const documentValue = new DOMParser().parseFromString(html, "text/html");
  documentValue.querySelectorAll("img[src]").forEach((image) => {
    const source = image.getAttribute("src");
    if (source) image.setAttribute("src", new URL(source, window.location.origin).href);
  });
  return documentValue.body.innerHTML;
}

async function writeRichClipboard(html: string, plainText: string) {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  const holder = document.createElement("div");
  holder.contentEditable = "true";
  holder.style.position = "fixed";
  holder.style.left = "-9999px";
  holder.innerHTML = html;
  document.body.appendChild(holder);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(holder);
  selection?.removeAllRanges();
  selection?.addRange(range);
  const copied = document.execCommand("copy");
  selection?.removeAllRanges();
  holder.remove();
  if (!copied) throw new Error("浏览器未允许写入剪贴板。");
}

export default function CmsPublicationEditor({
  articleId,
  value,
  onChange,
  onUpload,
  onNotice,
}: Props) {
  const body = normalizePublicationBody(value ?? createPublicationBody());
  const bodyRef = useRef(body);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef({ start: body.sourceMarkdown.length, end: body.sourceMarkdown.length });
  const pendingUploadCountRef = useRef(0);
  const [category, setCategory] = useState(publicationTemplateCategories[0].id);
  const [imageAlt, setImageAlt] = useState("正文图片");
  const [onlineImage, setOnlineImage] = useState("");
  const [proposal, setProposal] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const rendered = useMemo(() => renderPublicationMarkdown(body), [body]);
  const characterCount = useMemo(
    () => body.sourceMarkdown.replace(/<\/?(?:mark|sup|sub)>/gi, "").replace(/[#>*_~`|\[\]()!-]/g, "").replace(/\s/g, "").length,
    [body.sourceMarkdown],
  );
  const categoryTemplates = publicationTemplates.filter(
    (template) => template.category === category,
  );
  bodyRef.current = body;

  function update(updateValue: Partial<PublicationBody>) {
    const next = normalizePublicationBody({ ...bodyRef.current, ...updateValue });
    bodyRef.current = next;
    onChange(next);
  }

  function updateStyle<K extends keyof PublicationStyleConfig>(
    key: K,
    styleValue: PublicationStyleConfig[K],
  ) {
    update({ styleConfig: { ...body.styleConfig, [key]: styleValue } });
  }

  function insertMarkdown(before: string, after = "", block = false) {
    const textarea = textareaRef.current;
    const source = body.sourceMarkdown;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? source.length;
    const selected = source.slice(start, end) || "文字";
    const prefix = block && start > 0 && source[start - 1] !== "\n" ? "\n\n" : "";
    const suffix = block && end < source.length && source[end] !== "\n" ? "\n\n" : "";
    const inserted = `${prefix}${before}${selected}${after}${suffix}`;
    update({ sourceMarkdown: `${source.slice(0, start)}${inserted}${source.slice(end)}` });
    requestAnimationFrame(() => {
      textarea?.focus();
      const cursor = start + prefix.length + before.length + selected.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  }

  function rememberSelection() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    selectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
  }

  function insertImagePlaceholder(selection = selectionRef.current) {
    const source = bodyRef.current.sourceMarkdown;
    const start = Math.max(0, Math.min(selection.start, source.length));
    const end = Math.max(start, Math.min(selection.end, source.length));
    const uploadId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const token = `<!--cms-image-upload:${uploadId}-->`;
    const prefix = start > 0 && source[start - 1] !== "\n" ? "\n" : "";
    const suffix = end < source.length && source[end] !== "\n" ? "\n" : "";
    const selected = source.slice(start, end);
    update({ sourceMarkdown: `${source.slice(0, start)}${token}${source.slice(end)}` });
    const cursor = start + token.length;
    selectionRef.current = { start: cursor, end: cursor };
    return { token, selected, prefix, suffix };
  }

  async function addUploadedImage(file: File, selection = selectionRef.current) {
    const placeholder = insertImagePlaceholder(selection);
    pendingUploadCountRef.current += 1;
    setUploadBusy(true);
    try {
      const asset = await onUpload(file, imageAlt.trim() || "正文图片");
      const current = bodyRef.current;
      if (!asset) {
        update({ sourceMarkdown: current.sourceMarkdown.replace(placeholder.token, placeholder.selected) });
        return;
      }
      const imageMarkdown = `![${asset.altText.replace(/[\[\]\r\n]/g, " ")}](${asset.cmsPublicUrl})`;
      update({
        sourceMarkdown: current.sourceMarkdown.replace(
          placeholder.token,
          `${placeholder.prefix}${imageMarkdown}${placeholder.suffix}`,
        ),
        assets: [...current.assets.filter((item) => item.assetId !== asset.assetId), asset],
      });
      onNotice("正文图片已上传并插入 Markdown，请保存草稿。");
    } catch {
      const current = bodyRef.current;
      update({ sourceMarkdown: current.sourceMarkdown.replace(placeholder.token, placeholder.selected) });
      onNotice("图片上传失败，原正文已保留，请检查网络后重试。");
    } finally {
      pendingUploadCountRef.current = Math.max(0, pendingUploadCountRef.current - 1);
      setUploadBusy(pendingUploadCountRef.current > 0);
    }
  }

  function addOnlineImage() {
    const source = onlineImage.trim();
    if (!/^https:\/\//i.test(source)) {
      onNotice("在线图片必须使用 HTTPS 地址；正式发布前建议上传到 CMS 资源库。");
      return;
    }
    update({
      sourceMarkdown: `${body.sourceMarkdown.trimEnd()}${body.sourceMarkdown.trim() ? "\n\n" : ""}![${imageAlt.trim() || "正文图片"}](${source})`,
    });
    setOnlineImage("");
    onNotice("在线图片已插入。保存时会校验地址格式。");
  }

  async function copyForWechat() {
    const issues = publicationCopyIssues(body, rendered.html);
    if (issues.length) {
      onNotice(issues.join(" "));
      return;
    }
    try {
      const html = absoluteImageUrls(rendered.html);
      const plain = new DOMParser().parseFromString(html, "text/html").body.innerText;
      await writeRichClipboard(html, plain);
      onNotice("已复制微信兼容正文，可直接粘贴到微信公众号编辑器。粘贴后请人工核对一次。");
      void fetch(`/api/cms/news/${articleId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COPY_WECHAT_HTML", detail: { templateId: body.templateId } }),
      });
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "复制失败，请检查浏览器剪贴板权限。");
    }
  }

  async function proposeAiStructure() {
    if (!body.sourceMarkdown.trim()) {
      onNotice("请先输入正文，再使用 AI 结构排版。");
      return;
    }
    setAiBusy(true);
    setProposal("");
    const response = await fetch(`/api/cms/news/${articleId}/ai-format`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceMarkdown: body.sourceMarkdown }),
    });
    const data = (await response.json()) as { proposal?: string; message?: string };
    setAiBusy(false);
    if (!response.ok || !data.proposal) {
      onNotice(data.message ?? "AI 结构排版失败。");
      return;
    }
    setProposal(data.proposal);
    onNotice("AI 仅生成了结构调整建议，确认采用前不会修改正文。");
  }

  function acceptProposal() {
    update({ sourceMarkdown: proposal });
    setProposal("");
    void fetch(`/api/cms/news/${articleId}/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "AI_STRUCTURE_ACCEPT", detail: {} }),
    });
    onNotice("已采用 AI 结构建议，请复核正文并保存草稿。");
  }

  return (
    <section className="border-t border-slate-200 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">微信兼容排版正文</h2>
          <p className="mt-1 text-sm text-slate-600">
            Markdown 是编辑源，保存时由服务端生成并净化固定 HTML；官网和复制到微信使用同一份渲染规则。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void proposeAiStructure()}
            disabled={aiBusy}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {aiBusy ? "生成中…" : "AI 结构排版"}
          </button>
          <button
            type="button"
            onClick={() => void copyForWechat()}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            一键复制到微信
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {toolbar.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => insertMarkdown(item.before, item.after, "block" in item && item.block)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => insertMarkdown("\n| 字段 | 内容 |\n| --- | --- |\n| 示例 | 数据 |\n", "", true)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            >
              表格
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("\n---\n", "", true)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            >
              分隔线
            </button>
          </div>
          <textarea
            ref={textareaRef}
            aria-label="Markdown 正文"
            value={body.sourceMarkdown}
            onChange={(event) => update({ sourceMarkdown: event.target.value })}
            onClick={rememberSelection}
            onKeyUp={rememberSelection}
            onSelect={rememberSelection}
            onPaste={(event) => {
              const items = event.clipboardData?.items;
              if (!items) return;
              for (let index = 0; index < items.length; index += 1) {
                const item = items[index];
                if (!item.type.includes("image")) continue;
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                  const selection = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd };
                  void addUploadedImage(file, selection);
                }
                break;
              }
            }}
            rows={26}
            spellCheck={false}
            placeholder="在这里输入或粘贴正文。支持标题、段落、引用、列表、链接、图片、表格与代码块。"
            className="min-h-[620px] w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-7 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {proposal && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="font-semibold text-indigo-950">AI 结构建议</h3>
              <p className="mt-1 text-xs text-indigo-800">仅允许调整标题、列表、引用、加粗和段落边界；采用前请对照原文。</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-6 text-slate-700">{body.sourceMarkdown}</pre>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-6 text-slate-700">{proposal}</pre>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={acceptProposal} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">采用建议</button>
                <button type="button" onClick={() => setProposal("")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">取消</button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold">正文图片</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.2fr_auto]">
              <input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="图片替代文字" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={onlineImage} onChange={(event) => setOnlineImage(event.target.value)} placeholder="https:// 在线图片地址" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button type="button" onClick={addOnlineImage} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">插入在线图片</button>
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
              {uploadBusy ? "上传中…" : "上传并插入图片"}
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void addUploadedImage(file);
                  event.target.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">直接粘贴截图时也会先上传到 CMS，再写入稳定图片地址。</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold">微信字段映射</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-700">作者
                <input maxLength={16} value={body.wechat.author} onChange={(event) => update({ wechat: { ...body.wechat, author: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-700">原文链接
                <input value={body.wechat.contentSourceUrl} onChange={(event) => update({ wechat: { ...body.wechat, contentSourceUrl: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={body.wechat.needOpenComment === 1} onChange={(event) => update({ wechat: { ...body.wechat, needOpenComment: event.target.checked ? 1 : 0 } })} />开启评论</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={body.wechat.onlyFansCanComment === 1} onChange={(event) => update({ wechat: { ...body.wechat, onlyFansCanComment: event.target.checked ? 1 : 0 } })} />仅粉丝可评论</label>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">实时预览</h3>
              <span className="text-xs text-slate-500">{characterCount} 字符 · 宽度 677px 基准</span>
            </div>
            <div className="mx-auto max-h-[760px] max-w-[677px] overflow-auto rounded-lg bg-white shadow-sm" dangerouslySetInnerHTML={{ __html: rendered.html }} />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">排版模板</h3>
              <span className="text-xs text-slate-500">共 {publicationTemplates.length} 套</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {publicationTemplateCategories.map((item) => (
                <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${category === item.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{item.label}</button>
              ))}
            </div>
            <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-auto pr-1">
              {categoryTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => update({ templateId: template.id, styleConfig: { ...body.styleConfig, themeColor: template.primary } })}
                  className={`rounded-lg border p-3 text-left ${body.templateId === template.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-400"}`}
                >
                  <span className="block text-sm font-semibold">{template.name}</span>
                  <span className="mt-2 flex gap-1"><i className="size-3 rounded-full" style={{ background: template.primary }} /><i className="size-3 rounded-full" style={{ background: template.accent }} /><i className="size-3 rounded-full border" style={{ background: template.background }} /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold">全局样式</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Range label="字号" value={body.styleConfig.fontSize} min={12} max={24} step={1} onChange={(number) => updateStyle("fontSize", number)} />
              <Range label="行高" value={body.styleConfig.lineHeight} min={1.2} max={2.6} step={0.1} onChange={(number) => updateStyle("lineHeight", number)} />
              <Range label="段后距" value={body.styleConfig.paragraphSpacing} min={0} max={48} step={2} onChange={(number) => updateStyle("paragraphSpacing", number)} />
              <Range label="字间距" value={body.styleConfig.letterSpacing} min={-1} max={6} step={0.5} onChange={(number) => updateStyle("letterSpacing", number)} />
              <Range label="图片圆角" value={body.styleConfig.imageRadius} min={0} max={32} step={2} onChange={(number) => updateStyle("imageRadius", number)} />
              <Range label="上内边距" value={body.styleConfig.pagePaddingTop} min={0} max={64} step={2} onChange={(number) => updateStyle("pagePaddingTop", number)} />
              <Range label="右内边距" value={body.styleConfig.pagePaddingRight} min={0} max={48} step={2} onChange={(number) => updateStyle("pagePaddingRight", number)} />
              <Range label="下内边距" value={body.styleConfig.pagePaddingBottom} min={0} max={64} step={2} onChange={(number) => updateStyle("pagePaddingBottom", number)} />
              <Range label="左内边距" value={body.styleConfig.pagePaddingLeft} min={0} max={48} step={2} onChange={(number) => updateStyle("pagePaddingLeft", number)} />
              <label className="text-xs text-slate-600">主题色<input type="color" value={body.styleConfig.themeColor} onChange={(event) => updateStyle("themeColor", event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-200" /></label>
              <label className="text-xs text-slate-600">一级标题<select value={body.styleConfig.h1Layout} onChange={(event) => updateStyle("h1Layout", event.target.value as "left" | "center")} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"><option value="center">居中</option><option value="left">左对齐</option></select></label>
              <label className="text-xs text-slate-600">二级标题<select value={body.styleConfig.h2Layout} onChange={(event) => updateStyle("h2Layout", event.target.value as "left" | "center")} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"><option value="left">左对齐</option><option value="center">居中</option></select></label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={body.styleConfig.firstLineIndent} onChange={(event) => updateStyle("firstLineIndent", event.target.checked)} />正文首行缩进 2 字符</label>
          </div>
        </div>
      </div>
    </section>
  );
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="text-xs text-slate-600">
      <span className="flex justify-between"><span>{label}</span><b>{value}</b></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 w-full accent-indigo-600" />
    </label>
  );
}
