import { useState } from "react";
import {
  HandshakeIcon, MapPin, Calendar, Clock, Users, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberList, longDate } from "@/hooks/useMemberList";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import ListState from "@/components/member/ListState";

/**
 * MemberVolunteersPage — §4.10 Volunteers. Did not exist at all; the sidebar
 * had no entry for it and no route was registered.
 *
 * Field names (role, details, shiftTime, totalSlots, organisationName, date,
 * locationAddress) are taken from the admin VolunteersPage's create payload,
 * which is the real POST /volunteers/opportunities shape.
 *
 * §4.10.3 defines an Applied/Approved/Rejected status per application, but the
 * API has no GET for a member's own applications — only
 * POST /volunteers/opportunities/{id}/apply and the admin-only
 * GET /volunteers/applications/org/{id}. So this tracks "applied" locally,
 * per opportunity, for the current session: honest about what it can show
 * (did I just apply) versus what it can't (my full application history and
 * its approval status), rather than inventing a list the API can't back.
 */
function mapOpportunity(o, i) {
  return {
    id: o.id || o.publicId || i,
    role: o.role || o.title || "Volunteer",
    details: o.details || o.description || "",
    shiftTime: o.shiftTime || "",
    date: o.date ? longDate(o.date) : "",
    location: o.locationAddress || o.location || "",
    organisation: o.organisationName || o.organization?.name || "",
    totalSlots: o.totalSlots ?? null,
    filledSlots: o.filledSlots ?? o._count?.applications ?? 0,
    isFull: o.totalSlots != null && (o.filledSlots ?? o._count?.applications ?? 0) >= o.totalSlots,
  };
}

export default function MemberVolunteersPage() {
  const { t } = useLanguage();
  const { items: opportunities, loading, error, reload } = useMemberList(
    "/volunteers/opportunities",
    { map: mapOpportunity }
  );
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState(() => new Set());

  const apply = async (opp) => {
    setApplying(opp.id);
    try {
      await memberClient.post(`/volunteers/opportunities/${opp.id}/apply`, {});
      setApplied((prev) => new Set(prev).add(opp.id));
      toast.success(t("Application submitted. The organiser will review it."));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <HandshakeIcon className="h-5 w-5 text-emerald-600" /> {t("Volunteer Opportunities")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t("Seva opportunities from temples and Jain centres. Apply and the organiser will confirm your slot.")}
        </p>
      </div>

      <ListState
        loading={loading}
        error={error}
        count={opportunities.length}
        emptyTitle={t("No volunteer opportunities right now")}
        emptyHint={t("Check back soon — temples post seva requests here as events approach.")}
        onRetry={reload}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opportunities.map((o) => {
            const isApplied = applied.has(o.id);
            return (
              <div key={o.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{o.role}</h3>
                  {o.organisation && <div className="text-[11px] text-slate-500">{o.organisation}</div>}
                </div>

                {o.details && <p className="text-xs text-slate-600 line-clamp-3">{o.details}</p>}

                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
                  {o.date && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {o.date}</span>
                  )}
                  {o.shiftTime && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {o.shiftTime}</span>
                  )}
                  {o.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</span>
                  )}
                  {o.totalSlots != null && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {o.filledSlots}/{o.totalSlots} {t("filled")}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => apply(o)}
                  disabled={isApplied || o.isFull || applying === o.id}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                    disabled:cursor-not-allowed
                    bg-emerald-600 hover:bg-emerald-700 text-white
                    disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {applying === o.id ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("Applying…")}</>
                  ) : isApplied ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> {t("Applied")}</>
                  ) : o.isFull ? (
                    t("Slots Full")
                  ) : (
                    t("Apply to Volunteer")
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </ListState>
    </div>
  );
}
