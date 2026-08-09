import { Loader2, Inbox, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * ListState — Elegant loading skeletons, error recovery, and empty states.
 */
export default function ListState({
  loading,
  error,
  count = 0,
  emptyTitle,
  emptyHint,
  emptyActionText,
  emptyActionTo,
  onEmptyAction,
  onRetry,
  skeletonCount = 3,
  skeletonType = "card",
  children,
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-3xl border border-slate-200/70 bg-white/80 shadow-xs flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl skeleton-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded-md skeleton-shimmer" />
              <div className="h-3 w-2/3 rounded-md skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl bg-red-50/50 border border-red-100/80 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mb-3 shadow-xs">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-sm font-bold text-slate-800">{t("Unable to load data")}</div>
        <div className="text-xs text-slate-500 mt-1 max-w-sm">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 font-bold text-xs shadow-xs hover:bg-red-50 active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t("Try Again")}</span>
          </button>
        )}
      </div>
    );
  }

  if (!count) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl bg-slate-50/70 border border-dashed border-slate-200 shadow-2xs">
        <div className="h-12 w-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center mb-3 shadow-xs">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>
        <div className="text-sm font-bold text-slate-800">{emptyTitle || t("Nothing here yet")}</div>
        {emptyHint && <div className="text-xs text-slate-500 mt-1 max-w-sm">{emptyHint}</div>}
        {(emptyActionText && (emptyActionTo || onEmptyAction)) && (
          <button
            onClick={onEmptyAction}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{emptyActionText}</span>
          </button>
        )}
      </div>
    );
  }

  return children;
}
