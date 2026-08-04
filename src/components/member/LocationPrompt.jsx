import { MapPin, LocateFixed, Loader2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * LocationPrompt — the one place the member is asked for GPS.
 *
 * Geolocation is never requested on page load (see useMemberLocation's
 * comment on why); this button is the user gesture that unlocks it. Shown
 * inline wherever "nearby" content lives, so the ask sits next to the reason
 * for it rather than as an app-wide interstitial.
 */
export default function LocationPrompt({ status, error, onRequest, className = "" }) {
  const { t } = useLanguage();

  if (status === "granted") return null;

  if (status === "denied") {
    return (
      <div className={`flex items-center gap-2 text-[11px] text-slate-500 ${className}`}>
        <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span>{t("Location blocked — showing results for your registered address instead.")}</span>
      </div>
    );
  }

  if (status === "unsupported") return null;

  return (
    <button
      type="button"
      onClick={onRequest}
      disabled={status === "locating"}
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 disabled:opacity-60 ${className}`}
    >
      {status === "locating" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LocateFixed className="h-3.5 w-3.5" />
      )}
      <span>
        {status === "locating"
          ? t("Finding you…")
          : status === "error"
          ? t("Try location again")
          : t("Use my current location")}
      </span>
      {status === "error" && error && (
        <span className="text-slate-400 font-normal hidden sm:inline">— {error}</span>
      )}
    </button>
  );
}
