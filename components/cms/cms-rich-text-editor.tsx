"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
} from "lucide-react";
import { renderPublicationDocument, publicationFontOptions, publicationTemplates } from "@/lib/cms/publication-renderer";
import { normalizeRichTextDocument } from "@/lib/cms/rich-text";
import type {
  CmsPublicationAsset,
  CmsPublicationBody,
  CmsPublicationStyle,
  CmsRichTextDocument,
} from "@/lib/cms/types";

type Props = {
  value: CmsPublicationBody;
  disabled?: boolean;
  onChange: (value: CmsPublicationBody) => void;
  onUpload: (file: File, altText: string) => Promise<CmsPublicationAsset | undefined>;
  onNotice: (message: string) => void;
  onUploadStateChange?: (uploading: boolean) => void;
};

const fontSizes = ["14px", "15px", "16px", "17px", "18px", "20px", "22px", "24px", "28px", "32px"];

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function invalidate(body: CmsPublicationBody): CmsPublicationBody {
  return { ...body, publicationHtml: "", contentHash: "" };
}

export default function CmsRichTextEditor({
  value,
  disabled = false,
  onChange,
  onUpload,
  onNotice,
  onUploadStateChange,
}: Props) {
  const bodyRef = useRef(value);
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageAlt, setImageAlt] = useState("正文图片");
  const [linkUrl, setLinkUrl] = useState("");
  bodyRef.current = value;

  async function insertUploadedImage(file: File, position?: number) {
    const editor = editorRef.current;
    if (!editor || uploading) return;
    setUploading(true);
    onUploadStateChange?.(true);
    try {
      const asset = await onUpload(file, imageAlt.trim() || "正文图片");
      if (!asset) return;
      const insertAt = Math.min(position ?? editor.state.selection.from, editor.state.doc.content.size);
      editor
        .chain()
        .focus()
        .insertContentAt(insertAt, {
          type: "image",
          attrs: { src: asset.cmsPublicUrl, alt: asset.altText, title: asset.caption ?? "" },
        })
        .run();
      const current = bodyRef.current;
      onChange(invalidate({
        ...current,
        assets: [...current.assets.filter((item) => item.assetId !== asset.assetId), asset],
      }));
      onNotice("正文图片已上传并插入，请保存草稿。");
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "图片上传失败，请稍后重试。");
    } finally {
      setUploading(false);
      onUploadStateChange?.(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyleKit,
      Image.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: "在这里开始撰写正文，可直接粘贴文字或图片。" }),
    ],
    content: value.editorDocument as JSONContent,
    onUpdate: ({ editor: current }) => {
      const editorDocument = normalizeRichTextDocument(current.getJSON());
      if (JSON.stringify(editorDocument) === JSON.stringify(bodyRef.current.editorDocument)) return;
      const next = invalidate({
        ...bodyRef.current,
        editorDocument: editorDocument as CmsRichTextDocument,
      });
      bodyRef.current = next;
      onChange(next);
    },
    editorProps: {
      attributes: {
        class: "cms-rich-editor-content",
        role: "textbox",
        "aria-label": "新闻正文富文本编辑器",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (!item.type.startsWith("image/")) continue;
          const file = item.getAsFile();
          if (!file) return false;
          event.preventDefault();
          void insertUploadedImage(file, view.state.selection.from);
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find((item) => item.type.startsWith("image/"));
        if (!file) return false;
        event.preventDefault();
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void insertUploadedImage(file, coordinates?.pos ?? view.state.selection.from);
        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      if (editorRef.current === editor) editorRef.current = null;
    };
  }, [editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(normalizeRichTextDocument(editor.getJSON()));
    const incoming = JSON.stringify(normalizeRichTextDocument(value.editorDocument));
    if (current !== incoming) editor.commands.setContent(value.editorDocument as JSONContent, { emitUpdate: false });
  }, [editor, value.editorDocument]);

  const liveHtml = useMemo(
    () => renderPublicationDocument(value.editorDocument, value.styleConfig),
    [value.editorDocument, value.styleConfig],
  );

  function updateStyle(update: Partial<CmsPublicationStyle>) {
    onChange(invalidate({
      ...value,
      styleConfig: { ...value.styleConfig, ...update },
    }));
  }

  function setLink() {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) {
      onNotice("链接必须使用 HTTPS、HTTP、站内路径、邮箱或电话号码。");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  const inactive = disabled || !editor;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="正文排版工具栏">
          <select
            aria-label="段落样式"
            disabled={inactive}
            value={editor?.isActive("heading", { level: 2 }) ? "2" : editor?.isActive("heading", { level: 3 }) ? "3" : editor?.isActive("heading", { level: 4 }) ? "4" : "p"}
            onChange={(event) => {
              if (!editor) return;
              const level = Number(event.target.value);
              if (level === 2 || level === 3 || level === 4) editor.chain().focus().setHeading({ level }).run();
              else editor.chain().focus().setParagraph().run();
            }}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="p">正文</option>
            <option value="2">一级小标题</option>
            <option value="3">二级小标题</option>
            <option value="4">三级小标题</option>
          </select>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <ToolbarButton label="加粗" active={Boolean(editor?.isActive("bold"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="size-4" /></ToolbarButton>
          <ToolbarButton label="斜体" active={Boolean(editor?.isActive("italic"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="size-4" /></ToolbarButton>
          <ToolbarButton label="下划线" active={Boolean(editor?.isActive("underline"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleUnderline().run()}><Underline className="size-4" /></ToolbarButton>
          <ToolbarButton label="删除线" active={Boolean(editor?.isActive("strike"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough className="size-4" /></ToolbarButton>
          <ToolbarButton label="行内代码" active={Boolean(editor?.isActive("code"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleCode().run()}><Code2 className="size-4" /></ToolbarButton>
          <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
          <ToolbarButton label="左对齐" active={Boolean(editor?.isActive({ textAlign: "left" }))} disabled={inactive} onClick={() => editor?.chain().focus().setTextAlign("left").run()}><AlignLeft className="size-4" /></ToolbarButton>
          <ToolbarButton label="居中" active={Boolean(editor?.isActive({ textAlign: "center" }))} disabled={inactive} onClick={() => editor?.chain().focus().setTextAlign("center").run()}><AlignCenter className="size-4" /></ToolbarButton>
          <ToolbarButton label="右对齐" active={Boolean(editor?.isActive({ textAlign: "right" }))} disabled={inactive} onClick={() => editor?.chain().focus().setTextAlign("right").run()}><AlignRight className="size-4" /></ToolbarButton>
          <ToolbarButton label="无序列表" active={Boolean(editor?.isActive("bulletList"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="size-4" /></ToolbarButton>
          <ToolbarButton label="有序列表" active={Boolean(editor?.isActive("orderedList"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolbarButton>
          <ToolbarButton label="引用" active={Boolean(editor?.isActive("blockquote"))} disabled={inactive} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote className="size-4" /></ToolbarButton>
          <ToolbarButton label="分隔线" disabled={inactive} onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus className="size-4" /></ToolbarButton>
          <ToolbarButton label="插入表格" disabled={inactive} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="size-4" /></ToolbarButton>
          <ToolbarButton label="清除格式" disabled={inactive} onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting className="size-4" /></ToolbarButton>
          <ToolbarButton label="撤销" disabled={inactive || !editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}><Undo2 className="size-4" /></ToolbarButton>
          <ToolbarButton label="重做" disabled={inactive || !editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}><Redo2 className="size-4" /></ToolbarButton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            字号
            <select
              aria-label="文字字号"
              disabled={inactive}
              value={editor?.getAttributes("textStyle").fontSize ?? "16px"}
              onChange={(event) => editor?.chain().focus().setFontSize(event.target.value).run()}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm"
            >
              {fontSizes.map((size) => <option key={size} value={size}>{size.replace("px", "")}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            字体
            <select
              aria-label="文字字体"
              disabled={inactive}
              value={editor?.getAttributes("textStyle").fontFamily ?? publicationFontOptions[0].css}
              onChange={(event) => editor?.chain().focus().setFontFamily(event.target.value).run()}
              className="h-8 max-w-40 rounded-md border border-slate-300 bg-white px-2 text-sm"
            >
              {publicationFontOptions.map((font) => <option key={font.id} value={font.css}>{font.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            文字色
            <input aria-label="文字颜色" type="color" disabled={inactive} value={editor?.getAttributes("textStyle").color ?? "#18243d"} onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()} className="size-8 cursor-pointer rounded border border-slate-300 bg-white p-1" />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            背景色
            <input aria-label="文字背景颜色" type="color" disabled={inactive} value={editor?.getAttributes("textStyle").backgroundColor ?? "#ffffff"} onChange={(event) => editor?.chain().focus().setBackgroundColor(event.target.value).run()} className="size-8 cursor-pointer rounded border border-slate-300 bg-white p-1" />
          </label>
          <div className="flex min-w-64 flex-1 items-center gap-2">
            <input value={linkUrl} disabled={inactive} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https:// 链接地址" aria-label="链接地址" className="h-8 min-w-40 flex-1 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
            <button type="button" disabled={inactive} onClick={setLink} className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"><Link2 className="size-3.5" />应用链接</button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500">
            <EditorContent editor={editor} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void insertUploadedImage(file); event.target.value = ""; }} />
            <button type="button" disabled={inactive || uploading} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"><ImagePlus className="size-4" />{uploading ? "图片上传中" : "上传并插入图片"}</button>
            <input value={imageAlt} disabled={inactive || uploading} onChange={(event) => setImageAlt(event.target.value)} placeholder="图片替代文字" aria-label="图片替代文字" className="h-9 min-w-52 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
            <p className="w-full text-xs leading-5 text-slate-600">支持选择、拖入或直接粘贴截图。图片会先上传到 CMS，再写入正文。</p>
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">排版模板</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {publicationTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => updateStyle({ templateId: template.id, themeColor: template.accent })}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${value.styleConfig.templateId === template.id ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  {template.name}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-600">主题色<input type="color" disabled={disabled} value={value.styleConfig.themeColor} onChange={(event) => updateStyle({ themeColor: event.target.value })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white p-1 disabled:opacity-50" /></label>
              <label className="text-xs font-medium text-slate-600">正文字号<select disabled={disabled} value={value.styleConfig.fontSize} onChange={(event) => updateStyle({ fontSize: Number(event.target.value) })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm disabled:opacity-50">{[14, 15, 16, 17, 18, 19, 20].map((size) => <option key={size} value={size}>{size}px</option>)}</select></label>
              <label className="text-xs font-medium text-slate-600">行高<select disabled={disabled} value={value.styleConfig.lineHeight} onChange={(event) => updateStyle({ lineHeight: Number(event.target.value) })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm disabled:opacity-50">{[1.5, 1.6, 1.7, 1.8, 2, 2.2].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
              <label className="text-xs font-medium text-slate-600">段间距<select disabled={disabled} value={value.styleConfig.paragraphSpacing} onChange={(event) => updateStyle({ paragraphSpacing: Number(event.target.value) })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm disabled:opacity-50">{[8, 12, 16, 20, 24, 28, 32].map((size) => <option key={size} value={size}>{size}px</option>)}</select></label>
              <label className="text-xs font-medium text-slate-600">页面留白<select disabled={disabled} value={value.styleConfig.pagePadding} onChange={(event) => updateStyle({ pagePadding: Number(event.target.value) })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm disabled:opacity-50">{[0, 8, 12, 16, 20, 24, 32].map((size) => <option key={size} value={size}>{size}px</option>)}</select></label>
              <label className="text-xs font-medium text-slate-600">图片圆角<select disabled={disabled} value={value.styleConfig.imageRadius} onChange={(event) => updateStyle({ imageRadius: Number(event.target.value) })} className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm disabled:opacity-50">{[0, 4, 8, 12, 16, 20, 24].map((size) => <option key={size} value={size}>{size}px</option>)}</select></label>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <h3 className="text-sm font-semibold text-slate-800">手机宽度预览</h3>
              <span className="text-xs text-slate-500">375px</span>
            </div>
            <div className="mx-auto max-h-[680px] w-full max-w-[375px] overflow-y-auto rounded-xl border border-slate-300 bg-white">
              <div dangerouslySetInnerHTML={{ __html: liveHtml }} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
