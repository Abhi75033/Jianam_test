import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Small connection-status pill for realtime pages.
 */
export function LiveBadge({ connected, testId = "live-badge", label }) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        connected
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-200 text-slate-600"
      )}
      data-testid={testId}
      data-connected={connected ? "true" : "false"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
        )}
      />
      {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {label || (connected ? t("Live") : t("Offline"))}
    </div>
  );
}
