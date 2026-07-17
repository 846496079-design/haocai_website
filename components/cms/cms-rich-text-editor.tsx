"use client";

import { useEffect, useRef, useState } from "react";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type Editor,
  type NodeViewProps,
} from "@tiptap/react";
import { Node as TiptapNode, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import { ImagePlus } from "lucide-react";
import { normalizeRichTextDocument } from "@/lib/cms/rich-text";
import type {
  CmsPublicationAsset,
  CmsPublicationBody,
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

const wechatHtmlTags = new Set([
  "section", "p", "span", "strong", "em", "u", "s", "del", "a", "img", "blockquote",
  "ul", "ol", "li", "hr", "br", "code", "pre", "table", "thead", "tbody", "tr", "th",
  "td", "mark", "sup", "sub", "svg", "circle",
]);

const wechatStyleNames = new Set([
  "width", "min-width", "max-width", "height", "min-height", "max-height", "box-sizing",
  "background", "background-color", "color", "font-family", "font-size", "font-style", "font-weight",
  "line-height", "letter-spacing", "text-align", "text-decoration", "text-decoration-color",
  "text-decoration-thickness", "text-indent", "text-transform", "word-wrap", "word-break", "overflow",
  "overflow-x", "overflow-y", "white-space", "display", "vertical-align", "float", "clear", "object-fit",
  "opacity", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin",
  "margin-top", "margin-right", "margin-bottom", "margin-left", "border", "border-top", "border-right",
  "border-bottom", "border-left", "border-radius", "border-collapse", "box-shadow", "table-layout",
  "list-style-type", "transform",
]);

const attributesByTag: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  table: new Set(["cellpadding", "cellspacing", "border"]),
  th: new Set(["colspan", "rowspan", "bgcolor"]),
  td: new Set(["colspan", "rowspan", "bgcolor"]),
  svg: new Set(["width", "height", "viewbox", "xmlns"]),
  circle: new Set(["cx", "cy", "r", "fill"]),
};

function looksLikeTypeZenHtml(value: string) {
  if (!value || value.length > 1_000_000) return false;
  const documentValue = new DOMParser().parseFromString(value, "text/html");
  const root = documentValue.body.firstElementChild;
  if (!root || root.tagName.toLowerCase() !== "section") return false;
  const style = root.getAttribute("style")?.toLowerCase() ?? "";
  return root.querySelectorAll("section[style]").length >= 2
    && root.querySelectorAll("[style]").length >= 3
    && style.includes("width")
    && style.includes("box-sizing");
}

function safeStyleValue(value: string) {
  return !/(?:url\s*\(|expression\s*\(|javascript:|@import|var\s*\()/i.test(value);
}

function sanitizeWechatClipboardHtml(value: string) {
  const documentValue = new DOMParser().parseFromString(value.slice(0, 1_000_000), "text/html");
  const elements = Array.from(documentValue.body.querySelectorAll<HTMLElement>("*"));
  for (const element of elements) {
    const tag = element.tagName.toLowerCase();
    if (!wechatHtmlTags.has(tag)) {
      if (["script", "style", "iframe", "object", "embed", "form"].includes(tag)) element.remove();
      else element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    const allowedAttributes = attributesByTag[tag] ?? new Set<string>();
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name !== "style" && !allowedAttributes.has(name)) element.removeAttribute(attribute.name);
    }

    const styles = Array.from(element.style).map((name) => [name, element.style.getPropertyValue(name)] as const);
    element.removeAttribute("style");
    for (const [name, styleValue] of styles) {
      if (wechatStyleNames.has(name) && safeStyleValue(styleValue)) element.style.setProperty(name, styleValue);
    }

    if (tag === "a") {
      const href = element.getAttribute("href") ?? "";
      if (!/^(?:https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(href)) element.removeAttribute("href");
    }
    if (tag === "img") {
      const source = element.getAttribute("src") ?? "";
      if (!/^(?:data:image\/(?:png|jpe?g|gif|webp);base64,|https?:\/\/|\/(?!\/))/i.test(source)) element.remove();
    }
  }
  return documentValue.body.innerHTML;
}

function dataUrlToFile(value: string, index: number) {
  const match = /^data:(image\/(?:png|jpe?g|gif|webp));base64,([a-z0-9+/=]+)$/i.exec(value);
  if (!match) throw new Error("剪贴板图片数据无效。");
  const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
  const extension = match[1].replace("image/", "").replace("jpeg", "jpg");
  return new File([bytes], `typezen-${index + 1}.${extension}`, { type: match[1] });
}

function WechatHtmlBlockView({ node, deleteNode }: NodeViewProps) {
  return (
    <NodeViewWrapper className="my-4 rounded-lg border border-indigo-200 bg-white p-3" data-drag-handle>
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-indigo-100 pb-2">
        <span className="text-xs font-semibold text-indigo-700">外部富文本导入内容</span>
        <button type="button" onClick={deleteNode} className="text-xs font-semibold text-red-700 hover:text-red-900">删除导入块</button>
      </div>
      <div contentEditable={false} dangerouslySetInnerHTML={{ __html: String(node.attrs.html ?? "") }} />
    </NodeViewWrapper>
  );
}

const WechatHtmlBlock = TiptapNode.create({
  name: "wechatHtmlBlock",
  group: "block",
  atom: true,
  isolating: true,
  addAttributes() {
    return { html: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "div[data-wechat-html-block]" }];
  },
  renderHTML() {
    return ["div", { "data-wechat-html-block": "true" }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(WechatHtmlBlockView);
  },
});

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

  async function importTypeZenHtml(sourceHtml: string, position: number) {
    const editor = editorRef.current;
    if (!editor || uploading) return;
    setUploading(true);
    onUploadStateChange?.(true);
    try {
      const safeInput = sanitizeWechatClipboardHtml(sourceHtml);
      const documentValue = new DOMParser().parseFromString(safeInput, "text/html");
      const importedAssets: CmsPublicationAsset[] = [];
      let externalImages = 0;
      const images = Array.from(documentValue.querySelectorAll<HTMLImageElement>("img[src]"));
      for (const [index, image] of images.entries()) {
        const source = image.getAttribute("src") ?? "";
        if (!source.startsWith("data:image/")) {
          externalImages += 1;
          continue;
        }
        const altText = image.getAttribute("alt")?.trim() || `正文图片 ${index + 1}`;
        const asset = await onUpload(dataUrlToFile(source, index), altText);
        if (!asset) throw new Error(`第 ${index + 1} 张图片上传失败。`);
        image.setAttribute("src", asset.cmsPublicUrl);
        importedAssets.push(asset);
      }

      const html = sanitizeWechatClipboardHtml(documentValue.body.innerHTML);
      if (!html.trim()) throw new Error("TypeZen 剪贴板中没有可导入内容。");
      const insertAt = Math.min(position, editor.state.doc.content.size);
      editor.chain().focus().insertContentAt(insertAt, { type: "wechatHtmlBlock", attrs: { html } }).run();
      const current = bodyRef.current;
      const next = invalidate({
        ...current,
        assets: [
          ...current.assets.filter((item) => !importedAssets.some((asset) => asset.assetId === item.assetId)),
          ...importedAssets,
        ],
      });
      bodyRef.current = next;
      onChange(next);
      onNotice(externalImages
        ? `TypeZen 图文已原样导入；${externalImages} 张在线图片保留原地址，发布前请确认地址长期有效。`
        : "TypeZen 图文已原样导入，剪贴板图片已归档到 CMS。");
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "TypeZen 图文导入失败。");
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
      WechatHtmlBlock,
      Placeholder.configure({ placeholder: "将外部排版工具中的整篇图文粘贴到这里，也可以直接粘贴文字或图片。" }),
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
        const html = event.clipboardData?.getData("text/html") ?? "";
        if (looksLikeTypeZenHtml(html)) {
          event.preventDefault();
          void importTypeZenHtml(html, view.state.selection.from);
          return true;
        }
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

  const inactive = disabled || !editor;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">富文本粘贴接收区</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">从外部排版工具复制整篇图文后，直接粘贴到下方区域。CMS 会保留兼容 HTML，并把剪贴板图片归档到内容库。</p>
      </div>
      <div className="min-w-0">
        <div className="min-h-[34rem] overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 md:min-h-[44rem]">
          <EditorContent editor={editor} className="min-h-[34rem] md:min-h-[44rem]" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void insertUploadedImage(file); event.target.value = ""; }} />
          <button type="button" disabled={inactive || uploading} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"><ImagePlus className="size-4" />{uploading ? "图片上传中" : "补充上传图片"}</button>
          <input value={imageAlt} disabled={inactive || uploading} onChange={(event) => setImageAlt(event.target.value)} placeholder="图片替代文字" aria-label="图片替代文字" className="h-9 min-w-52 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
          <p className="w-full text-xs leading-5 text-slate-600">也支持拖入或直接粘贴截图；图片会先上传到 CMS，再写入正文。</p>
        </div>
      </div>
    </div>
  );
}
