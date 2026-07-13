"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, RefreshCw } from "lucide-react";

type AuditItem = {
  id: number;
  action: string;
  createdAt: string;
  adminUsername: string | null;
  detail: unknown;
};

const actionNames: Record<string, string> = {
  CREATE_DRAFT: "创建草稿",
  IMPORT_CREATE_DRAFT: "从工作台导入草稿",
  IMPORT_UPDATE_DRAFT: "从工作台更新草稿",
  SAVE_DRAFT: "保存草稿",
  PREVIEW_DRAFT: "预览稿件",
  TRANSLATE_DRAFT: "生成日文与繁体译稿",
  PUBLISH: "发布新闻",
  OFFLINE: "下架新闻",
  MOVE_TO_TRASH: "移入回收站",
  RESTORE_FROM_TRASH: "从回收站恢复",
  DELETE_PERMANENTLY: "永久删除",
  PIN_ARTICLE: "置顶新闻",
  UNPIN_ARTICLE: "取消置顶",
  REORDER_PUBLISHED: "调整展示顺序",
  UPLOAD_ASSET: "上传图片",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

function actionLabel(action: string) {
  return actionNames[action] ?? `其他操作（${action}）`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "时间未知";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function detailEntries(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).filter(
    ([, item]) => item !== null && item !== undefined && item !== "",
  );
}

function detailValue(value: unknown) {
  if (Array.isArray(value)) return value.join("、");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export default function CmsAuditLog({
  articleId,
  initialItems = [],
}: {
  articleId: number;
  initialItems?: AuditItem[];
}) {
  const [items, setItems] = useState<AuditItem[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [error, setError] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/cms/news/${articleId}/audit`, {
          cache: "no-store",
          signal,
        });
        let data: { items?: AuditItem[]; message?: string } = {};
        try {
          data = (await response.json()) as typeof data;
        } catch {
          /* 由统一错误文案兜底 */
        }
        if (!response.ok)
          throw new Error(data.message || "操作记录加载失败，请稍后重试。");
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError(
          reason instanceof Error
            ? reason.message
            : "网络连接异常，暂时无法加载操作记录。",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [articleId],
  );

  useEffect(() => {
    if (initialItems.length > 0) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [initialItems.length, load]);

  return (
    <section
      aria-labelledby="audit-log-title"
      aria-busy={loading}
      className="mt-6 border-t border-slate-200 pt-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="audit-log-title" className="font-semibold text-slate-900">
            操作记录
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            记录稿件的重要编辑与发布动作
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          aria-label="刷新操作记录"
          className={`rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50 ${focusRing}`}
        >
          <RefreshCw
            className={`size-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {loading && !items.length && (
        <div
          role="status"
          className="mt-4 space-y-3"
          aria-label="正在加载操作记录"
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-lg border border-slate-100 p-3"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p role="alert" className="text-sm leading-5 text-red-700">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className={`mt-2 text-sm font-semibold text-red-700 underline underline-offset-2 ${focusRing}`}
          >
            重新加载
          </button>
        </div>
      )}

      {!loading && !error && !items.length && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center">
          <Clock3
            className="mx-auto size-5 text-slate-400"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium text-slate-700">
            暂无操作记录
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            保存、预览或发布后，相关动作会显示在这里。
          </p>
        </div>
      )}

      {!!items.length && (
        <ol
          className="mt-4 max-h-96 space-y-1 overflow-y-auto pr-1"
          aria-label="稿件操作时间线"
        >
          {items.map((item, index) => {
            const details = detailEntries(item.detail);
            return (
              <li key={item.id} className="relative pl-5 pb-4 last:pb-0">
                <span
                  className="absolute left-0 top-1.5 size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50"
                  aria-hidden="true"
                />
                {index < items.length - 1 && (
                  <span
                    className="absolute bottom-0 left-[3px] top-4 w-px bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <p className="text-sm font-semibold leading-5 text-slate-800">
                  {actionLabel(item.action)}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  <time dateTime={item.createdAt}>
                    {formatDate(item.createdAt)}
                  </time>
                  <span aria-hidden="true"> · </span>
                  {item.adminUsername || "系统"}
                </p>
                {details.length > 0 && (
                  <details className="mt-1.5 text-xs text-slate-500">
                    <summary
                      className={`w-fit cursor-pointer rounded-sm font-medium text-slate-600 hover:text-slate-900 ${focusRing}`}
                    >
                      查看详情
                    </summary>
                    <dl className="mt-2 space-y-1 rounded-md bg-slate-50 p-2">
                      {details.map(([key, value]) => (
                        <div
                          key={key}
                          className="grid grid-cols-[72px_minmax(0,1fr)] gap-2"
                        >
                          <dt className="truncate text-slate-500">{key}</dt>
                          <dd className="break-all text-slate-700">
                            {detailValue(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
