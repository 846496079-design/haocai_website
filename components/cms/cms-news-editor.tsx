"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  ImagePlus,
  Trash2,
} from "lucide-react";
import type { NewsArticle } from "@/lib/news-content";
import type { SiteCode } from "@/lib/site-content";
import {
  CMS_LOCALES,
  type CmsArticleContent,
  type CmsArticleRecord,
  type CmsAuditLog as CmsAuditLogRecord,
} from "@/lib/cms/types";
import CmsAuditLog from "@/components/cms/cms-audit-log";
import CmsPublicationEditor from "@/components/cms/cms-publication-editor";
import {
  articleUsesPublication,
  createPublicationBody,
  legacyArticleToMarkdown,
  type CmsLocalizedArticle,
  type PublicationAsset,
} from "@/lib/cms/publication";

const localeNames: Record<SiteCode, string> = {
  cn: "简体中文",
  jp: "日本语",
  hk: "繁體中文",
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function initializeContent(value: CmsArticleContent) {
  const next = clone(value);
  CMS_LOCALES.forEach((code) => {
    const article = next[code];
    if (!articleUsesPublication(article) && !article.sections.length && !article.closing.length) {
      article.publication = createPublicationBody();
    }
  });
  return next;
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
  const [content, setContent] = useState<CmsArticleContent>(() =>
    initializeContent(initial.content),
  );
  const [locale, setLocale] = useState<SiteCode>("cn");
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [hasCurrentPreview, setHasCurrentPreview] = useState(
    Boolean(initial.previewedAt),
  );
  const [translationStatus, setTranslationStatus] = useState(
    initial.translationStatus,
  );
  const [translationMode, setTranslationMode] = useState<
    "overwrite" | "fill-missing"
  >("fill-missing");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const article = content[locale];
  const complete = useMemo(
    () =>
      CMS_LOCALES.every((code) => {
        const item = content[code];
        return (
          item.title &&
          item.summary &&
          item.lead &&
          item.category &&
          item.cover &&
          (articleUsesPublication(item)
            ? item.publication.sourceMarkdown.trim()
            : item.sections.length && item.closing.length)
        );
      }),
    [content],
  );

  useEffect(() => {
    void fetch("/api/cms/categories").then(async (response) => {
      if (!response.ok) return;
      const data = (await response.json()) as {
        items?: { name: string; status: string }[];
      };
      setCategories(
        (data.items ?? [])
          .filter((item) => item.status === "ACTIVE")
          .map((item) => item.name),
      );
    });
  }, []);

  function updateArticle(update: Partial<CmsLocalizedArticle>) {
    setContent((current) => ({
      ...current,
      [locale]: { ...current[locale], ...update },
    }));
    setDirty(true);
    setHasCurrentPreview(false);
    if (locale === "cn" && translationStatus === "CURRENT")
      setTranslationStatus("STALE");
  }

  function updateSection(
    index: number,
    update: Partial<NewsArticle["sections"][number]>,
  ) {
    const sections = article.sections.map((section, sectionIndex) =>
      sectionIndex === index ? { ...section, ...update } : section,
    );
    updateArticle({ sections });
  }

  function moveSection(from: number, to: number) {
    if (from === to) return;
    const sections = [...article.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    updateArticle({ sections });
  }

  function duplicateSection(index: number) {
    const sections = [...article.sections];
    sections.splice(index + 1, 0, clone(article.sections[index]));
    updateArticle({ sections });
  }

  async function saveDraft() {
    setSaving(true);
    setNotice("");
    const response = await fetch(`/api/cms/news/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = (await response.json()) as CmsArticleRecord & { message?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice(data.message ?? "保存失败。");
      return false;
    }
    setContent(clone(data.content));
    setHasCurrentPreview(Boolean(data.previewedAt));
    setDirty(false);
    setNotice("草稿已保存。");
    return true;
  }

  async function uploadImage(
    file: File,
    usage: "COVER" | "CONTENT",
    altText = "",
  ): Promise<PublicationAsset | undefined> {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("articleId", String(initial.id));
    formData.set("usage", usage);
    formData.set("altText", altText);
    setSaving(true);
    const response = await fetch("/api/cms/upload", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as {
      assetId?: string;
      url?: string;
      width?: number;
      height?: number;
      message?: string;
    };
    setSaving(false);
    if (!response.ok || !data.url) {
      setNotice(data.message ?? "图片上传失败。");
      return undefined;
    }
    return {
      assetId: data.assetId ?? data.url,
      type: "image",
      originalUrl: null,
      cmsPublicUrl: data.url,
      wechatUrl: null,
      wechatMediaId: null,
      altText: altText || "正文图片",
      caption: null,
      width: data.width ?? 0,
      height: data.height ?? 0,
      mimeType: "image/webp",
      contentHash: null,
    };
  }

  async function uploadCover(file: File) {
    const asset = await uploadImage(file, "COVER", "新闻封面");
    if (!asset) return;
    setContent(
      (current) =>
        Object.fromEntries(
          CMS_LOCALES.map((code) => [code, { ...current[code], cover: asset.cmsPublicUrl }]),
        ) as CmsArticleContent,
    );
    setNotice("封面已优化上传，请保存草稿。");
  }

  async function uploadSectionImage(index: number, file: File) {
    const asset = await uploadImage(file, "CONTENT", "正文图片");
    if (!asset) return;
    updateSection(index, { image: asset.cmsPublicUrl });
    setNotice("正文图片已上传，请保存草稿。");
  }

  async function translate() {
    if (!(await saveDraft())) return;
    setSaving(true);
    const response = await fetch(`/api/cms/news/${initial.id}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: translationMode }),
    });
    const data = (await response.json()) as { message?: string };
    setSaving(false);
    if (!response.ok) return setNotice(data.message ?? "翻译失败。");
    window.location.reload();
  }

  async function preview() {
    if (!(await saveDraft())) return;
    const response = await fetch(`/api/cms/news/${initial.id}/preview`, {
      method: "POST",
    });
    if (!response.ok) return setNotice("无法记录预览状态，请稍后重试。");
    setHasCurrentPreview(true);
    window.open(
      `/cms/preview/${initial.id}/?site=${locale}`,
      "_blank",
      "noopener,noreferrer",
    );
    setNotice("已打开官网样式预览。");
  }

  async function publish() {
    if (!reviewed) return setNotice("请先勾选人工审核确认。");
    if (dirty || !hasCurrentPreview)
      return setNotice(
        "当前内容尚未完成预览。请先点击“预览官网效果”，确认后再发布。",
      );
    const response = await fetch(`/api/cms/news/${initial.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: true }),
    });
    const data = (await response.json()) as { message?: string };
    setNotice(
      response.ok
        ? "正式发布成功，公开新闻页已更新。"
        : (data.message ?? "发布失败。"),
    );
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
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link
              href="/cms/"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              返回新闻管理
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">编辑草稿：{initial.slug}</h1>
              {dirty && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  有未保存修改
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              状态：
              {initial.status === "PUBLISHED"
                ? "已发布，当前编辑将作为新草稿保存"
                : initial.status === "OFFLINE"
                  ? "已下架，可修改后重新发布"
                  : "草稿"}
              。发布前必须完成三语预览与人工确认。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving || !dirty}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {saving ? "处理中…" : dirty ? "保存草稿" : "已保存"}
            </button>
            <button
              type="button"
              onClick={() => void preview()}
              disabled={saving}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
            >
              预览官网效果
            </button>
          </div>
        </header>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {CMS_LOCALES.map((code) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${locale === code ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {localeNames[code]}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="发布日期">
                  <input
                    aria-label="发布日期"
                    type="date"
                    value={article.date.replaceAll(".", "-")}
                    onChange={(event) =>
                      updateArticle({
                        date: event.target.value.replaceAll("-", "."),
                      })
                    }
                  />
                </Field>
                <Field label="分类">
                  <select
                    aria-label="新闻分类"
                    value={article.category}
                    onChange={(event) =>
                      updateArticle({ category: event.target.value })
                    }
                  >
                    <option value="">请选择分类</option>
                    {categories.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {!article.category ? (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      待填写分类：未选择分类时不能发布。
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-normal text-slate-600">
                      没有合适分类时，请先在分类管理中创建；外部导入的新分类会标记来源。
                    </p>
                  )}
                </Field>
              </div>
              <Field label="新闻标题">
                <input
                  value={article.title}
                  onChange={(event) =>
                    updateArticle({ title: event.target.value })
                  }
                />
              </Field>
              <Field label="摘要">
                <textarea
                  value={article.summary}
                  onChange={(event) =>
                    updateArticle({ summary: event.target.value })
                  }
                  rows={3}
                />
              </Field>
              <Field label="导语">
                <textarea
                  value={article.lead}
                  onChange={(event) =>
                    updateArticle({ lead: event.target.value })
                  }
                  rows={4}
                />
              </Field>
              <Field label="标签（用英文逗号分隔）">
                <input
                  value={(article.tags ?? []).join(", ")}
                  onChange={(event) =>
                    updateArticle({
                      tags: event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <Field label="新闻封面">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {article.cover && (
                    <img
                      src={article.cover}
                      alt="封面预览"
                      className="h-24 w-40 rounded-lg border border-slate-200 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadCover(file);
                    }}
                  />
                </div>
              </Field>
              {articleUsesPublication(article) ? (
                <CmsPublicationEditor
                  articleId={initial.id}
                  value={article.publication}
                  onChange={(publication) => updateArticle({ publication })}
                  onUpload={(file, altText) => uploadImage(file, "CONTENT", altText)}
                  onNotice={setNotice}
                />
              ) : (
                <>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <h2 className="font-semibold text-indigo-950">当前文章使用旧版内容块</h2>
                    <p className="mt-1 text-sm leading-6 text-indigo-900">
                      旧文章继续按原格式编辑和发布。只有点击启用后，系统才会把现有分节复制为 Markdown，并切换到微信兼容排版。
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateArticle({
                          publication: createPublicationBody(legacyArticleToMarkdown(article)),
                        })
                      }
                      className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      启用微信兼容排版
                    </button>
                  </div>
                  <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">正文内容块</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      可拖拽，也可用上移、下移按钮调整顺序；每个分节支持独立图片、替代文字和图片说明。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateArticle({
                        sections: [
                          ...article.sections,
                          { title: "", paragraphs: [""] },
                        ],
                      })
                    }
                    className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    新增分节
                  </button>
                </div>
                <div className="mt-4 space-y-5">
                  {article.sections.map((section, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => setDraggingIndex(index)}
                      onDragEnd={() => setDraggingIndex(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggingIndex !== null)
                          moveSection(draggingIndex, index);
                        setDraggingIndex(null);
                      }}
                      className={`rounded-xl border p-4 ${draggingIndex === index ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex cursor-grab items-center gap-2 text-sm font-semibold text-slate-600">
                          <GripVertical className="size-4" aria-hidden="true" />
                          分节 {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`上移分节 ${index + 1}`}
                            disabled={index === 0}
                            onClick={() => moveSection(index, index - 1)}
                            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`下移分节 ${index + 1}`}
                            disabled={index === article.sections.length - 1}
                            onClick={() => moveSection(index, index + 1)}
                            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ArrowDown className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`复制分节 ${index + 1}`}
                            onClick={() => duplicateSection(index)}
                            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Copy className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`删除分节 ${index + 1}`}
                            onClick={() =>
                              updateArticle({
                                sections: article.sections.filter(
                                  (_, sectionIndex) => sectionIndex !== index,
                                ),
                              })
                            }
                            className="rounded-md p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <Field label="分节标题">
                        <input
                          value={section.title}
                          onChange={(event) =>
                            updateSection(index, { title: event.target.value })
                          }
                        />
                      </Field>
                      <Field label="正文段落（段落之间空一行）">
                        <textarea
                          value={section.paragraphs.join("\n\n")}
                          onChange={(event) =>
                            updateSection(index, {
                              paragraphs: event.target.value
                                .split(/\n\s*\n/)
                                .map((paragraph) => paragraph.trim())
                                .filter(Boolean),
                            })
                          }
                          rows={8}
                        />
                      </Field>
                      <Field label="分节图片">
                        <div className="space-y-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <ImagePlus className="size-4" />
                            选择图片
                            <input
                              className="sr-only"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void uploadSectionImage(index, file);
                              }}
                            />
                          </label>
                          {section.image && (
                            <>
                              <img
                                src={section.image}
                                alt={section.imageAlt || "正文图片预览"}
                                className="max-h-72 w-full rounded-lg object-cover"
                              />
                              <input
                                value={section.imageAlt ?? ""}
                                onChange={(event) =>
                                  updateSection(index, {
                                    imageAlt: event.target.value,
                                  })
                                }
                                placeholder="图片替代文字（用于无障碍访问）"
                              />
                              <input
                                value={section.imageCaption ?? ""}
                                onChange={(event) =>
                                  updateSection(index, {
                                    imageCaption: event.target.value,
                                  })
                                }
                                placeholder="图片说明（可选）"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSection(index, {
                                    image: undefined,
                                    imageAlt: undefined,
                                    imageCaption: undefined,
                                  })
                                }
                                className="text-sm font-semibold text-red-600"
                              >
                                移除图片
                              </button>
                            </>
                          )}
                        </div>
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
                  <Field label="结语（每行一段）">
                    <textarea
                      value={article.closing.join("\n")}
                      onChange={(event) =>
                        updateArticle({
                          closing: event.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={4}
                    />
                  </Field>
                </>
              )}
            </div>
          </section>
          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
            <h2 className="font-semibold">发布检查</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>
                三语内容：
                {complete ? (
                  <b className="text-emerald-700">完整</b>
                ) : (
                  <b className="text-amber-700">待补全</b>
                )}
              </li>
              <li>
                译稿状态：
                {translationStatus === "CURRENT" ? (
                  <b className="text-emerald-700">已基于当前中文生成</b>
                ) : translationStatus === "STALE" ? (
                  <b className="text-amber-700">中文已修改，请重新翻译</b>
                ) : (
                  <b className="text-amber-700">尚未生成译稿</b>
                )}
              </li>
              <li>
                当前版本预览：
                {hasCurrentPreview && !dirty ? (
                  <b className="text-emerald-700">已完成</b>
                ) : (
                  <b className="text-amber-700">需要重新预览</b>
                )}
              </li>
              <li>正式发布后，草稿将替换当前线上版本。</li>
            </ul>
            <fieldset className="mt-5 space-y-2">
              <legend className="text-sm font-semibold text-slate-800">
                重新翻译方式
              </legend>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="translation-mode"
                  value="fill-missing"
                  checked={translationMode === "fill-missing"}
                  onChange={() => setTranslationMode("fill-missing")}
                  className="mt-1"
                />
                保留人工已填写内容，仅补全空白字段
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="translation-mode"
                  value="overwrite"
                  checked={translationMode === "overwrite"}
                  onChange={() => setTranslationMode("overwrite")}
                  className="mt-1"
                />
                重新生成并覆盖日文、繁体全文
              </label>
            </fieldset>
            <button
              type="button"
              onClick={() => void translate()}
              disabled={saving}
              className="mt-4 w-full rounded-lg border border-indigo-300 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              保存并一键翻译日文、繁体
            </button>
            <p className="mt-2 text-xs text-slate-600">
              翻译只在此按钮触发时执行一次，完成后仍需人工审核。
            </p>
            <label className="mt-5 flex cursor-pointer gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(event) => setReviewed(event.target.checked)}
                className="mt-1"
              />
              我已人工审核三语内容、封面和预览效果，确认正式发布。
            </label>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={saving || !complete || dirty || !hasCurrentPreview}
              className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              确认发布
            </button>
            {initial.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={() => void offline()}
                className="mt-3 w-full rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                下线新闻
              </button>
            )}
            {notice && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700"
              >
                {notice}
              </p>
            )}
            <CmsAuditLog articleId={initial.id} initialItems={initialAuditItems} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className="mt-2 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:ring-indigo-500 [&_input:focus]:ring-2 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_select]:ring-indigo-500 [&_select:focus]:ring-2 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:ring-indigo-500 [&_textarea:focus]:ring-2">
        {children}
      </div>
    </label>
  );
}
