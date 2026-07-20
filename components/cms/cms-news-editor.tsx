"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, ImagePlus, LoaderCircle } from "lucide-react";
import type { SiteCode } from "@/lib/site-content";
import {
  CMS_LOCALES,
  areAllLocalesReadyForPublication,
  isLocaleContentComplete,
  type CmsArticleContent,
  type CmsArticleRecord,
  type CmsAuditLog as CmsAuditLogRecord,
  type CmsLocaleArticle,
  type CmsPublicationAsset,
  type CmsPublicationBody,
} from "@/lib/cms/types";
import { getCmsEditorWorkflowGuide } from "@/lib/cms/editor-workflow";
import CmsAuditLog from "@/components/cms/cms-audit-log";
import CmsRichTextEditor from "@/components/cms/cms-rich-text-editor";

const localeNames: Record<SiteCode, string> = {
  cn: "简体中文",
  jp: "日本语",
  hk: "繁體中文",
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("图片读取失败。"));
    reader.readAsDataURL(blob);
  });
}

async function prepareClipboardHtml(html: string) {
  const documentValue = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(documentValue.querySelectorAll<HTMLImageElement>("img[src]"));
  let embeddedBytes = 0;
  let fallbackImages = 0;
  for (const image of images) {
    const source = image.getAttribute("src");
    if (!source) continue;
    const absolute = new URL(source, window.location.origin).href;
    image.setAttribute("src", absolute);
    try {
      const response = await fetch(absolute);
      if (!response.ok) throw new Error("图片读取失败。");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/") || blob.size > 2 * 1024 * 1024 || embeddedBytes + blob.size > 8 * 1024 * 1024) {
        fallbackImages += 1;
        continue;
      }
      image.setAttribute("src", await blobToDataUrl(blob));
      embeddedBytes += blob.size;
    } catch {
      fallbackImages += 1;
    }
  }
  return { html: documentValue.body.innerHTML, fallbackImages };
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
  holder.style.left = "-10000px";
  holder.innerHTML = html;
  document.body.appendChild(holder);
  const range = document.createRange();
  range.selectNodeContents(holder);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  const copied = document.execCommand("copy");
  selection?.removeAllRanges();
  holder.remove();
  if (!copied) throw new Error("浏览器未允许写入富文本剪贴板。");
}

export default function CmsNewsEditor({
  initial,
  initialCategories = [],
  initialAuditItems = [],
}: {
  initial: CmsArticleRecord;
  initialCategories?: string[];
  initialAuditItems?: CmsAuditLogRecord[];
}) {
  const [content, setContent] = useState<CmsArticleContent>(() => clone(initial.content));
  const [locale, setLocale] = useState<SiteCode>("cn");
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [journeySignal, setJourneySignal] = useState<"translated" | "preview-opened" | null>(null);
  const savingRef = useRef(false);
  const allowTranslationReloadRef = useRef(false);
  const translationOverlayRef = useRef<HTMLDivElement>(null);
  const workflowGuideRef = useRef<HTMLDivElement>(null);
  const reviewCheckboxRef = useRef<HTMLInputElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const [serverVersionId, setServerVersionId] = useState(initial.versionId);
  const [serverUpdatedAt, setServerUpdatedAt] = useState(initial.updatedAt);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasCurrentPreview, setHasCurrentPreview] = useState(Boolean(initial.previewedAt));
  const [translationStatus, setTranslationStatus] = useState(initial.translationStatus);
  const [translationMode, setTranslationMode] = useState<"overwrite" | "fill-missing">("fill-missing");
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const article = content[locale];
  const chineseComplete = useMemo(() => isLocaleContentComplete(content.cn), [content]);
  const allLocalesReady = useMemo(() => areAllLocalesReadyForPublication(content, translationStatus), [content, translationStatus]);
  const operationPending = saving || uploading || translating;
  const recoveryKey = `cms-richtext-draft-${initial.id}`;
  const translationJourneyKey = `cms-translation-journey-${initial.id}`;
  const workflowGuide = useMemo(() => getCmsEditorWorkflowGuide({
    translating,
    uploading,
    saving,
    chineseComplete,
    dirty,
    hasCurrentPreview,
    reviewed,
    translationCompleted: journeySignal === "translated",
    previewOpened: journeySignal === "preview-opened",
  }), [chineseComplete, dirty, hasCurrentPreview, journeySignal, reviewed, saving, translating, uploading]);

  useEffect(() => {
    void fetch("/api/cms/categories").then(async (response) => {
      if (!response.ok) return;
      const data = (await response.json()) as { items?: { name: string; status: string }[] };
      setCategories((data.items ?? []).filter((item) => item.status === "ACTIVE").map((item) => item.name));
    });
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(translationJourneyKey) !== "translated") return;
      window.sessionStorage.removeItem(translationJourneyKey);
      setJourneySignal("translated");
      setNotice("翻译已完成并保存。请预览当前版本后再确认发布。");
    } catch {
      // 会话存储不可用时不影响服务端已保存的翻译结果。
    }
  }, [translationJourneyKey]);

  useEffect(() => {
    if (!translating) return;
    translationOverlayRef.current?.focus();
  }, [translating]);

  useEffect(() => {
    if (!journeySignal) return;
    workflowGuideRef.current?.focus();
  }, [journeySignal]);

  useEffect(() => {
    if (!notice || translating || journeySignal) return;
    noticeRef.current?.focus();
  }, [journeySignal, notice, translating]);

  useEffect(() => {
    if (!translating) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (allowTranslationReloadRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [translating]);

  useEffect(() => {
    const stored = window.localStorage.getItem(recoveryKey);
    if (!stored) return;
    try {
      const recovered = JSON.parse(stored) as { content?: CmsArticleContent; versionId?: number; savedAt?: string };
      const recoveredAt = Date.parse(recovered.savedAt ?? "");
      const serverAt = Date.parse(serverUpdatedAt);
      if (recovered.versionId !== serverVersionId || !Number.isFinite(recoveredAt) || recoveredAt <= serverAt) {
        window.localStorage.removeItem(recoveryKey);
        return;
      }
      if (recovered.content && JSON.stringify(recovered.content) !== JSON.stringify(initial.content)) {
        setContent(recovered.content);
        setDirty(true);
        setHasCurrentPreview(false);
        setNotice("已恢复上次未完成的本地草稿，请检查后保存。");
      }
    } catch {
      window.localStorage.removeItem(recoveryKey);
    }
  }, [initial.content, recoveryKey, serverUpdatedAt, serverVersionId]);

  useEffect(() => {
    if (dirty) window.localStorage.setItem(recoveryKey, JSON.stringify({ content, versionId: serverVersionId, savedAt: new Date().toISOString() }));
    else window.localStorage.removeItem(recoveryKey);
  }, [content, dirty, recoveryKey, serverVersionId]);

  useEffect(() => {
    if (!dirty || saving || uploading || translating) return;
    const timer = window.setTimeout(() => void saveDraft(true), 3500);
    return () => window.clearTimeout(timer);
  }, [content, dirty, saving, translating, uploading]);

  function updateArticle(update: Partial<CmsLocaleArticle>) {
    setContent((current) => ({ ...current, [locale]: { ...current[locale], ...update } }));
    setDirty(true);
    setHasCurrentPreview(false);
    setReviewed(false);
    setJourneySignal(null);
    if (locale === "cn" && translationStatus === "CURRENT") setTranslationStatus("STALE");
  }

  function updateBody(body: CmsPublicationBody) {
    updateArticle({ body });
  }

  async function saveDraft(silent = false): Promise<CmsArticleContent | undefined> {
    if (savingRef.current) return undefined;
    if (!dirty) return content;
    savingRef.current = true;
    setSaving(true);
    if (!silent) setNotice("");
    try {
      const response = await fetch(`/api/cms/news/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, expectedVersionId: serverVersionId, expectedUpdatedAt: serverUpdatedAt }),
      });
      const data = (await response.json()) as CmsArticleRecord & { message?: string };
      if (!response.ok || !data.content) {
        setNotice(data.message ?? "保存失败。");
        return undefined;
      }
      setContent(clone(data.content));
      setServerVersionId(data.versionId);
      setServerUpdatedAt(data.updatedAt);
      setDirty(false);
      setHasCurrentPreview(Boolean(data.previewedAt));
      if (!silent) setNotice("草稿已保存，发布快照已更新。");
      return data.content;
    } catch {
      setNotice("保存失败，内容已保留在本机，请检查网络后重试。");
      return undefined;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function uploadImage(file: File, usage: "COVER" | "CONTENT", altText = "") {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("articleId", String(initial.id));
    formData.set("usage", usage);
    formData.set("altText", altText);
    const response = await fetch("/api/cms/upload", { method: "POST", body: formData });
    const data = (await response.json()) as {
      assetId?: string;
      url?: string;
      thumbnailUrl?: string;
      width?: number;
      height?: number;
      mimeType?: string;
      message?: string;
    };
    if (!response.ok || !data.url || !data.assetId) throw new Error(data.message ?? "图片上传失败。");
    return {
      assetId: data.assetId,
      cmsPublicUrl: data.url,
      thumbnailUrl: data.thumbnailUrl,
      mimeType: data.mimeType ?? "image/jpeg",
      width: data.width ?? 1,
      height: data.height ?? 1,
      altText,
    } satisfies CmsPublicationAsset;
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const asset = await uploadImage(file, "COVER", article.title || "新闻封面");
      setContent((current) => Object.fromEntries(CMS_LOCALES.map((code) => [code, { ...current[code], cover: asset.cmsPublicUrl }])) as CmsArticleContent);
      setDirty(true);
      setHasCurrentPreview(false);
      setReviewed(false);
      setJourneySignal(null);
      setNotice("封面已优化上传，请保存草稿。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "封面上传失败。");
    } finally {
      setUploading(false);
    }
  }

  async function uploadContentImage(file: File, altText: string) {
    return uploadImage(file, "CONTENT", altText);
  }

  async function translate() {
    allowTranslationReloadRef.current = false;
    setJourneySignal(null);
    setNotice("");
    setTranslating(true);
    try {
      if (!(await saveDraft())) return;
      const response = await fetch(`/api/cms/news/${initial.id}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: translationMode }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setNotice(data.message ?? "翻译失败，请检查网络或翻译服务后重试。");
        return;
      }
      try {
        window.sessionStorage.setItem(translationJourneyKey, "translated");
      } catch {
        // 会话存储不可用时仍重新读取服务端草稿。
      }
      allowTranslationReloadRef.current = true;
      window.location.reload();
    } catch {
      setNotice("翻译失败，请检查网络或翻译服务后重试。");
    } finally {
      if (!allowTranslationReloadRef.current) setTranslating(false);
    }
  }

  async function preview() {
    if (!(await saveDraft())) return;
    const response = await fetch(`/api/cms/news/${initial.id}/preview`, { method: "POST" });
    if (!response.ok) return setNotice("无法记录预览状态，请稍后重试。");
    setHasCurrentPreview(true);
    setJourneySignal("preview-opened");
    window.open(`/cms/preview/${initial.id}/?site=${locale}`, "_blank", "noopener,noreferrer");
    setNotice("预览已打开，请检查内容和封面；确认无误后返回本页勾选人工审核。");
  }

  async function copyForWechat() {
    const saved = await saveDraft();
    if (!saved) return;
    const snapshot = saved[locale].body.publicationHtml;
    if (!snapshot) return setNotice("当前语言还没有可复制的发布快照。");
    try {
      const prepared = await prepareClipboardHtml(snapshot);
      const plain = new DOMParser().parseFromString(prepared.html, "text/html").body.innerText;
      await writeRichClipboard(prepared.html, plain);
      void fetch(`/api/cms/news/${initial.id}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COPY_WECHAT_HTML",
          locale,
          templateId: saved[locale].body.styleConfig.templateId,
          fallbackImages: prepared.fallbackImages,
        }),
      });
      setNotice(prepared.fallbackImages
        ? `已复制微信兼容富文本，其中 ${prepared.fallbackImages} 张图片使用稳定公网地址；粘贴后请检查预览。`
        : "已复制微信兼容图文，可直接粘贴到微信公众号编辑器并检查预览。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "复制失败，请检查浏览器剪贴板权限。");
    }
  }

  async function publish() {
    if (!reviewed) return setNotice("请先勾选人工审核确认。");
    if (dirty || !hasCurrentPreview) return setNotice("当前内容尚未完成预览，请先预览当前保存版本。");
    const response = await fetch(`/api/cms/news/${initial.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: true }),
    });
    const data = (await response.json()) as { message?: string };
    setNotice(response.ok ? "正式发布成功，公开新闻页已更新。" : (data.message ?? "发布失败。"));
  }

  async function offline() {
    if (!window.confirm("确认下线这篇新闻吗？下线后公众将无法访问。")) return;
    const response = await fetch(`/api/cms/news/${initial.id}/lifecycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "offline" }),
    });
    const data = (await response.json()) as { message?: string };
    setNotice(response.ok ? "新闻已下线。" : (data.message ?? "下线失败。"));
  }

  return (
    <main aria-busy={translating} className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8">
      {translating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-5 backdrop-blur-sm">
          <div
            ref={translationOverlayRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="translation-progress-title"
            aria-describedby="translation-progress-description"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl outline-none ring-4 ring-indigo-300/50"
          >
            <LoaderCircle aria-hidden="true" className="mx-auto size-10 animate-spin text-indigo-600" />
            <h2 id="translation-progress-title" className="mt-5 text-xl font-bold text-slate-950">正在翻译并保存</h2>
            <p id="translation-progress-description" className="mt-3 text-sm leading-6 text-slate-600">正在生成日文、繁体内容，请勿关闭页面或切换到其他稿件。完成后系统会自动载入已保存的译文。</p>
          </div>
        </div>
      )}
      <div inert={translating ? true : undefined} className="mx-auto max-w-[1680px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link href="/cms/news/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">返回新闻管理</Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">编辑草稿：{initial.slug}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${translating || saving ? "bg-blue-100 text-blue-800" : dirty ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                {translating ? "正在翻译" : saving ? "正在保存" : dirty ? "有未保存修改" : "已保存"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">正文采用统一富文本模型；官网与公众号复制使用同一发布快照。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void saveDraft()} disabled={operationPending || !dirty} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50">{saving ? "处理中" : dirty ? "保存草稿" : "已保存"}</button>
            <button type="button" onClick={() => void copyForWechat()} disabled={operationPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50"><Copy className="size-4" />一键复制到公众号</button>
            <button type="button" onClick={() => void preview()} disabled={operationPending} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60">预览官网效果</button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {CMS_LOCALES.map((code) => (
                <button key={code} type="button" onClick={() => setLocale(code)} disabled={translating} className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 ${locale === code ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{localeNames[code]}</button>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="发布日期"><input aria-label="发布日期" type="date" value={article.date.replaceAll(".", "-")} onChange={(event) => updateArticle({ date: event.target.value.replaceAll("-", ".") })} /></Field>
                <Field label="分类"><select aria-label="新闻分类" value={article.category} onChange={(event) => updateArticle({ category: event.target.value })}><option value="">请选择分类</option>{categories.map((name) => <option key={name} value={name}>{name}</option>)}</select></Field>
                <Field label="作者"><input value={article.author} onChange={(event) => updateArticle({ author: event.target.value })} /></Field>
              </div>
              <Field label="新闻标题"><input value={article.title} onChange={(event) => updateArticle({ title: event.target.value })} /></Field>
              <Field label="摘要"><textarea value={article.summary} onChange={(event) => updateArticle({ summary: event.target.value })} rows={3} /></Field>
              <Field label="标签（用英文逗号分隔）"><input value={article.tags.join(", ")} onChange={(event) => updateArticle({ tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></Field>
              <Field label="新闻封面">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {article.cover && <img src={article.cover} alt="封面预览" className="h-24 w-40 rounded-lg border border-slate-200 object-cover" />}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ImagePlus className="size-4" />{uploading ? "上传中" : "选择封面"}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={operationPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCover(file); event.target.value = ""; }} /></label>
                </div>
              </Field>

              <div className="border-t border-slate-200 pt-5">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">正文内容</h2>
                  <p className="mt-1 text-sm text-slate-600">这里仅接收外部富文本内容；保存时由服务端净化并生成官网和公众号共用的发布 HTML。</p>
                </div>
                <CmsRichTextEditor
                  key={locale}
                  value={article.body}
                  disabled={operationPending}
                  onChange={updateBody}
                  onUpload={uploadContentImage}
                  onNotice={setNotice}
                  onUploadStateChange={setUploading}
                />
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 2xl:sticky 2xl:top-6">
            <h2 className="font-semibold">发布检查</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>中文发布内容：<b className={chineseComplete ? "text-emerald-700" : "text-amber-700"}>{chineseComplete ? "必填内容完整" : "缺少必填内容"}</b></li>
              <li>外语公开状态：<b className={allLocalesReady ? "text-emerald-700" : "text-amber-700"}>{allLocalesReady ? "日文、港文可随本次发布上线" : translationStatus === "CURRENT" ? "日文或繁体有缺项，本次仅发布中文站" : "译文未就绪，本次仅发布中文站"}</b></li>
              <li>译稿状态：<b className={translationStatus === "CURRENT" ? "text-emerald-700" : "text-amber-700"}>{translationStatus === "CURRENT" ? "已基于当前中文生成" : translationStatus === "STALE" ? "中文已修改，请重新翻译" : "尚未生成译稿"}</b></li>
              <li>当前版本预览：<b className={hasCurrentPreview && !dirty ? "text-emerald-700" : "text-amber-700"}>{hasCurrentPreview && !dirty ? "已完成" : "需要重新预览"}</b></li>
              <li>图片上传：<b className={uploading ? "text-amber-700" : "text-emerald-700"}>{uploading ? "进行中" : "已完成"}</b></li>
            </ul>

            <fieldset disabled={operationPending} className="mt-5 space-y-2 disabled:opacity-60">
              <legend className="text-sm font-semibold text-slate-800">重新翻译方式</legend>
              <label className="flex items-start gap-2 text-sm text-slate-700"><input type="radio" name="translation-mode" value="fill-missing" checked={translationMode === "fill-missing"} onChange={() => setTranslationMode("fill-missing")} className="mt-1" />保留已有人工内容，仅补全变化文字</label>
              <label className="flex items-start gap-2 text-sm text-slate-700"><input type="radio" name="translation-mode" value="overwrite" checked={translationMode === "overwrite"} onChange={() => setTranslationMode("overwrite")} className="mt-1" />重新生成并覆盖日文、繁体全文</label>
            </fieldset>
            <button type="button" onClick={() => void translate()} disabled={operationPending} className="mt-4 w-full rounded-lg border border-indigo-300 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">保存并翻译日文、繁体</button>

            <div ref={workflowGuideRef} tabIndex={-1} className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600" aria-live="polite">
              <p className="text-sm font-bold text-indigo-950">{workflowGuide.title}</p>
              <p className="mt-2 text-sm leading-6 text-indigo-900">{workflowGuide.message}</p>
              {workflowGuide.action === "complete-cn" && <button type="button" onClick={() => { setLocale("cn"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-3 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800">填写中文内容</button>}
              {workflowGuide.action === "save" && <button type="button" onClick={() => void saveDraft()} className="mt-3 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800">保存当前草稿</button>}
              {workflowGuide.action === "preview" && <button type="button" onClick={() => void preview()} className="mt-3 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800">预览官网效果</button>}
              {workflowGuide.action === "review" && <button type="button" onClick={() => reviewCheckboxRef.current?.focus()} className="mt-3 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800">前往人工审核</button>}
            </div>

            <label className="mt-5 flex cursor-pointer gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-950"><input ref={reviewCheckboxRef} type="checkbox" checked={reviewed} disabled={operationPending || dirty || !hasCurrentPreview} onChange={(event) => setReviewed(event.target.checked)} className="mt-1" />我已人工审核中文必填内容、封面、当前发布快照和已填写的外语内容。</label>
            <button type="button" onClick={() => void publish()} disabled={operationPending || !chineseComplete || dirty || !hasCurrentPreview || !reviewed} className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">确认发布</button>
            {initial.status === "PUBLISHED" && <button type="button" onClick={() => void offline()} disabled={operationPending} className="mt-3 w-full rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">下线新闻</button>}
            {notice && <p ref={noticeRef} role="status" aria-live="polite" tabIndex={-1} className="mt-4 rounded-lg bg-slate-100 p-3 text-sm leading-6 text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">{notice}</p>}
            <CmsAuditLog articleId={initial.id} initialItems={initialAuditItems} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className="mt-2 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-slate-300 [&>input]:px-3 [&>input]:py-2.5 [&>input]:outline-none [&>input]:ring-indigo-500 [&>input:focus]:ring-2 [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-slate-300 [&>select]:px-3 [&>select]:py-2.5 [&>select]:outline-none [&>select]:ring-indigo-500 [&>select:focus]:ring-2 [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-slate-300 [&>textarea]:px-3 [&>textarea]:py-2.5 [&>textarea]:outline-none [&>textarea]:ring-indigo-500 [&>textarea:focus]:ring-2">
        {children}
      </div>
    </label>
  );
}
