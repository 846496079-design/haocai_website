"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ExternalLink, Eye, EyeOff, KeyRound, LoaderCircle, Search, X } from "lucide-react";
import {
  AI_PROVIDER_CONFIGS,
  DEFAULT_AI_SETTINGS,
  normalizeAiSettings,
  type AiProviderType,
  type AiSettings,
  type OpenRouterModel,
} from "@/lib/cms/ai-providers";

type ProviderDraft = Omit<AiSettings, "providerType">;

let cachedOpenRouterModels: OpenRouterModel[] | undefined;
let pendingModelsRequest: Promise<OpenRouterModel[]> | undefined;

function providerDraft(providerType: AiProviderType): ProviderDraft {
  return {
    baseUrl: AI_PROVIDER_CONFIGS[providerType].defaultBaseUrl,
    apiKey: "",
    model: "",
  };
}

function createProviderDrafts(value: AiSettings): Record<AiProviderType, ProviderDraft> {
  return {
    openrouter: providerDraft("openrouter"),
    openai: providerDraft("openai"),
    anthropic: providerDraft("anthropic"),
    [value.providerType]: {
      baseUrl: value.baseUrl,
      apiKey: value.apiKey,
      model: value.model,
    },
  };
}

async function loadOpenRouterModels() {
  if (cachedOpenRouterModels) return cachedOpenRouterModels;
  pendingModelsRequest ??= fetch("/api/cms/ai/openrouter-models", { cache: "no-store" }).then(async (response) => {
    const data = await response.json().catch(() => null) as { models?: OpenRouterModel[]; message?: string } | null;
    if (!response.ok) throw new Error(data?.message ?? "模型列表加载失败。");
    cachedOpenRouterModels = data?.models ?? [];
    return cachedOpenRouterModels;
  });
  try {
    return await pendingModelsRequest;
  } finally {
    pendingModelsRequest = undefined;
  }
}

function formatContextLength(value: number) {
  if (!value) return "未知";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

function formatPrice(model: OpenRouterModel) {
  if (model.isFree) return "免费";
  const input = Number(model.promptPrice) * 1_000_000;
  const output = Number(model.completionPrice) * 1_000_000;
  if (!Number.isFinite(input) || !Number.isFinite(output) || input < 0 || output < 0) return "价格见 OpenRouter";
  return `输入 $${input.toFixed(3)} / 输出 $${output.toFixed(3)} 每 1M tokens`;
}

export default function CmsAiSettingsModal({
  open,
  value,
  onClose,
  onSave,
  onClear,
}: {
  open: boolean;
  value: AiSettings;
  onClose: () => void;
  onSave: (value: AiSettings) => void;
  onClear: () => void;
}) {
  const [providerType, setProviderType] = useState<AiProviderType>(value.providerType);
  const [drafts, setDrafts] = useState<Record<AiProviderType, ProviderDraft>>(() => createProviderDrafts(value));
  const [showKey, setShowKey] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [models, setModels] = useState<OpenRouterModel[]>(cachedOpenRouterModels ?? []);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const modalRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const draft = drafts[providerType];
  const provider = AI_PROVIDER_CONFIGS[providerType];

  useEffect(() => {
    if (!open) return;
    const normalized = normalizeAiSettings(value);
    setProviderType(normalized.providerType);
    setDrafts(createProviderDrafts(normalized));
    setShowKey(false);
    setModelQuery("");
    setTestResult(null);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open || providerType !== "openrouter" || cachedOpenRouterModels) return;
    let cancelled = false;
    setModelsLoading(true);
    setModelsError("");
    void loadOpenRouterModels()
      .then((items) => {
        if (!cancelled) setModels(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) setModelsError(error instanceof Error ? error.message : "模型列表加载失败。");
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, providerType]);

  const filteredModels = useMemo(() => {
    const query = modelQuery.trim().toLowerCase();
    const result = query
      ? models.filter((model) => model.name.toLowerCase().includes(query) || model.id.toLowerCase().includes(query))
      : models;
    return result.slice(0, 80);
  }, [modelQuery, models]);

  function updateDraft(patch: Partial<ProviderDraft>) {
    setDrafts((current) => ({
      ...current,
      [providerType]: { ...current[providerType], ...patch },
    }));
    setTestResult(null);
  }

  function validateDraft() {
    const settings = normalizeAiSettings({ providerType, ...draft });
    if (!settings.baseUrl || !settings.apiKey || !settings.model) {
      setTestResult({ kind: "error", message: "请填写 API 地址、API Key 和模型名称。" });
      return undefined;
    }
    return settings;
  }

  async function testConnection() {
    const settings = validateDraft();
    if (!settings) return;
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/cms/ai/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? "连接测试失败。");
      setTestResult({ kind: "success", message: data?.message ?? "连接成功。" });
    } catch (error) {
      setTestResult({ kind: "error", message: error instanceof Error ? error.message : "连接测试失败。" });
    } finally {
      setTesting(false);
    }
  }

  function save() {
    const settings = validateDraft();
    if (settings) onSave(settings);
  }

  function clear() {
    setProviderType(DEFAULT_AI_SETTINGS.providerType);
    setDrafts(createProviderDrafts(DEFAULT_AI_SETTINGS));
    setModelQuery("");
    setShowKey(false);
    setTestResult({ kind: "success", message: "本机保存的 AI 配置已清空。" });
    onClear();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="cms-ai-settings-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="cms-ai-settings-title" className="text-xl font-bold text-slate-950">AI 服务配置</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">支持 OpenRouter 模型库，以及 OpenAI / Anthropic 兼容 API。配置仅保存在当前浏览器。</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭 AI 服务配置" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><X className="size-5" /></button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">API 类型</legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(Object.keys(AI_PROVIDER_CONFIGS) as AiProviderType[]).map((item) => {
                const active = providerType === item;
                return (
                  <button key={item} type="button" aria-pressed={active} onClick={() => { setProviderType(item); setTestResult(null); }} className={`rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${active ? "border-indigo-600 bg-indigo-50 text-indigo-950" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">{AI_PROVIDER_CONFIGS[item].name}{active && <Check className="size-4 text-indigo-700" />}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">{item === "openrouter" ? "模型库与价格" : item === "openai" ? "Chat Completions" : "Messages API"}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{provider.description}</p>
          </fieldset>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cms-ai-base-url" className="text-sm font-semibold text-slate-800">API 地址</label>
              <button type="button" onClick={() => updateDraft({ baseUrl: provider.defaultBaseUrl })} className="text-xs font-semibold text-indigo-700 hover:text-indigo-900">恢复默认</button>
            </div>
            <input id="cms-ai-base-url" type="url" value={draft.baseUrl} readOnly={providerType === "openrouter"} onChange={(event) => updateDraft({ baseUrl: event.target.value })} placeholder={provider.defaultBaseUrl} autoComplete="off" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 read-only:bg-slate-100" />
            <p className="mt-1.5 text-xs leading-5 text-slate-600">可以填写 API 根地址，也可以填写完整的 {providerType === "anthropic" ? "/messages" : "/chat/completions"} 地址。</p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cms-ai-api-key" className="text-sm font-semibold text-slate-800">API Key</label>
              <a href={provider.apiKeyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900">获取 API Key<ExternalLink className="size-3.5" /></a>
            </div>
            <div className="relative mt-2">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input id="cms-ai-api-key" type={showKey ? "text" : "password"} value={draft.apiKey} onChange={(event) => updateDraft({ apiKey: event.target.value })} placeholder="粘贴你的 API Key" autoComplete="off" className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
              <button type="button" onClick={() => setShowKey((current) => !current)} aria-label={showKey ? "隐藏 API Key" : "显示 API Key"} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">{showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </div>
          </div>

          <div>
            <label htmlFor="cms-ai-model" className="text-sm font-semibold text-slate-800">{providerType === "openrouter" ? "已选模型" : "模型名称"}</label>
            <input id="cms-ai-model" value={draft.model} onChange={(event) => updateDraft({ model: event.target.value })} placeholder={provider.modelPlaceholder} autoComplete="off" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
          </div>

          {providerType === "openrouter" && (
            <section aria-labelledby="openrouter-model-library-title" className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 id="openrouter-model-library-title" className="text-sm font-semibold text-slate-800">OpenRouter 模型库</h3>
                <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900">浏览完整模型库<ExternalLink className="size-3.5" /></a>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} aria-label="搜索 OpenRouter 模型" placeholder="搜索模型名称或 ID，例如 qwen、gemini、:free" className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-300 bg-white">
                {modelsLoading && <p className="flex items-center gap-2 p-4 text-sm font-medium text-slate-700"><LoaderCircle className="size-4 animate-spin" />正在加载模型列表</p>}
                {!modelsLoading && modelsError && <div className="p-4"><p className="text-sm font-semibold text-red-700">{modelsError}</p><p className="mt-1 text-xs text-slate-600">仍可在“已选模型”输入框手工填写模型 ID。</p></div>}
                {!modelsLoading && !modelsError && filteredModels.length === 0 && <p className="p-4 text-sm text-slate-600">没有匹配模型，可以手工输入模型 ID。</p>}
                {!modelsLoading && !modelsError && filteredModels.map((model) => (
                  <button key={model.id} type="button" onClick={() => updateDraft({ model: model.id })} title={model.description} className={`w-full border-b border-slate-200 p-3 text-left last:border-b-0 hover:bg-slate-50 ${draft.model === model.id ? "bg-indigo-50" : "bg-white"}`}>
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span className="truncate">{model.name}</span>{draft.model === model.id && <Check className="size-4 shrink-0 text-indigo-700" />}</span>
                        <span className="mt-0.5 block break-all text-xs text-slate-600">{model.id}</span>
                        <span className="mt-1 block text-xs text-slate-600">{formatPrice(model)}</span>
                      </span>
                      <span className="shrink-0 text-right"><span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${model.isFree ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{model.isFree ? "免费" : "付费"}</span><span className="mt-1 block text-[11px] text-slate-500">{formatContextLength(model.contextLength)} 上下文</span></span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {testResult && <p role="status" aria-live="polite" className={`rounded-lg px-3 py-2.5 text-sm font-medium ${testResult.kind === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{testResult.message}</p>}
          <p className="text-xs leading-5 text-slate-600">测试连接会发送一条最小请求，可能产生极少量 token 费用。密钥只在请求时临时发送给 CMS 服务端，不写入数据库或审计日志。</p>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <button type="button" onClick={clear} className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">清空配置</button>
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">取消</button>
          <button type="button" onClick={() => void testConnection()} disabled={testing} className="rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">{testing ? "正在测试" : "测试连接"}</button>
          <button type="button" onClick={save} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">保存配置</button>
        </footer>
      </section>
    </div>
  );
}
