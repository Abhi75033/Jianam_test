import { ArrowLeft, Building2, CalendarClock, Car, Clock3, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberList, longDate } from "@/hooks/useMemberList";
import ListState from "@/components/member/ListState";

/**
 * MemberVisitsPage — Visitor §8: a member's own check-in/out history.
 *
 * GET /visitors/my-history is real and already live — the admin VisitorsPage
 * calls it to render the same data inside its "Member Visit History" tab
 * (see VisitorsPage.jsx's memberHistoryRes / myHistory). Field names
 * (organization.name, checkInAt, checkOutAt, vehicleNumber, durationMinutes)
 * are taken directly from that table rather than guessed.
 */
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(mins) {
  if (!mins && mins !== 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function mapVisit(v, i) {
  return {
    id: v.id || i,
    orgName: v.organization?.name || "",
    checkInAt: v.checkInAt,
    checkOutAt: v.checkOutAt,
    ongoing: Boolean(v.checkInAt) && !v.checkOutAt,
    vehicle: v.vehicleNumber || "",
    duration: formatDuration(v.durationMinutes),
  };
}

export default function MemberVisitsPage() {
  const { t } = useLanguage();
  const { items: visits, loading, error, reload } = useMemberList("/visitors/my-history", { map: mapVisit });

  return (
    <div className="space-y-6">
      <Link
        to="/member/profile"
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </Link>

      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-indigo-500" /> {t("My Temple Visits")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{t("Your verified check-ins, logged by security at each location.")}</p>
      </div>

      <ListState
        loading={loading}
        error={error}
        count={visits.length}
        emptyTitle={t("No visits recorded")}
        emptyHint={t("Your verified visits logged by security guards will appear here.")}
        onRetry={reload}
      >
        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{v.orgName || t("Location")}</div>
                    <div className="text-[11px] text-slate-400">{longDate(v.checkInAt)}</div>
                  </div>
                </div>
                {v.ongoing ? (
                  <span className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    {t("Currently Inside")}
                  </span>
                ) : v.duration && (
                  <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    <Clock3 className="h-3 w-3" /> {v.duration}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <LogIn className="h-3.5 w-3.5 text-emerald-500" /> {formatTime(v.checkInAt) || "—"}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <LogOut className="h-3.5 w-3.5 text-rose-500" /> {v.checkOutAt ? formatTime(v.checkOutAt) : "—"}
                </span>
                {v.vehicle && (
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Car className="h-3.5 w-3.5 text-slate-400" /> {v.vehicle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ListState>
    </div>
  );
}
