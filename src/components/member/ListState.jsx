import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * ListState — loading / error / empty for the member list screens.
 *
 * The member pages previously rendered hardcoded arrays, so none of them had
 * any of these states. Now that they fetch, all three are real possibilities
 * and each needs to say something useful rather than showing a blank column.
 *
 * Renders `children` when there is data and nothing is loading or failing.
 */
export default function ListState({
  loading,
  error,
  count = 0,
  emptyTitle,
  emptyHint,
  onRetry,
  children,
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-xs font-medium">{t("Loading…")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
        <div className="h-11 w-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{t("Couldn't load this")}</div>
          <div className="text-xs text-slate-500 mt-0.5 max-w-sm">{error}</div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {t("Try again")}
          </button>
        )}
      </div>
    );
  }

  if (!count) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
        <div className="h-11 w-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
          <Inbox className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-700">{emptyTitle || t("Nothing here yet")}</div>
          {emptyHint && <div className="text-xs text-slate-500 mt-0.5 max-w-sm">{emptyHint}</div>}
        </div>
      </div>
    );
  }

  return children;
}
