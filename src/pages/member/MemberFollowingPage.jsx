import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Landmark, User, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { cn } from "@/lib/utils";

/**
 * MemberFollowingPage — the follow list finally has somewhere to live.
 *
 * There is no GET-my-follows endpoint, so this can only show what the
 * member followed through this device: followedIds (real, server-backed
 * where toggleFollow had a type+apiId — see VisibilityEngineContext.jsx)
 * paired with followedMeta, the display info captured at the moment of
 * following. Entries followed only through Feed's local-only follow button
 * have no meta and render as a bare id with no detail link — an honest
 * gap, not hidden.
 *
 * The Primary/Secondary/Tertiary pills below are a genuinely local,
 * on-device sort preference — see the note on TIER_CAPS in
 * VisibilityEngineContext.jsx for exactly what that does and doesn't mean.
 * Only categories with a defined cap (temple, monk) show pills at all.
 */
const CATEGORY_ICON = { monk: User, temple: Landmark, dharamshala: Landmark, jaincentre: Landmark };
const CATEGORY_LABEL = { monk: "Maharaj Saheb", temple: "Temple", dharamshala: "Dharamshala", jaincentre: "Jain Centre" };
const TIER_LABEL = { primary: "Primary", secondary: "Secondary", tertiary: "Tertiary" };

function detailPathFor(meta) {
  if (!meta?.apiId) return null;
  if (meta.category === "monk") return `/member/ms/${meta.apiId}`;
  if (["temple", "dharamshala", "jaincentre"].includes(meta.category)) return `/member/temples/${meta.apiId}`;
  return null;
}

export default function MemberFollowingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { followedIds, followedMeta, toggleFollow, setFollowTier, clearFollowTier, tierUsage, tierCaps } = useVisibilityEngine();

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </button>

      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> {t("Following")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t("Content from everything you follow is boosted to the top of your Feed, Events and Announcements.")}
        </p>
      </div>

      {followedIds.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center">
          <Star className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-bold text-slate-600">{t("You're not following anything yet")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("Follow a temple, Maharaj Saheb, or centre to see it here.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {followedIds.map((id) => {
            const meta = followedMeta[id];
            const Icon = CATEGORY_ICON[meta?.category] || HelpCircle;
            const path = detailPathFor(meta);
            const label = meta?.category ? CATEGORY_LABEL[meta.category] : t("Unknown type");
            const caps = meta?.category ? tierCaps[meta.category] : null;

            const card = (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 overflow-hidden text-lg">
                  {meta?.image && meta.image.length <= 4 ? meta.image : <Icon className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{meta?.name || id}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{label} · {id}</div>
                </div>
              </div>
            );

            return (
              <div key={id} className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  {path ? <Link to={path} className="flex-1 min-w-0">{card}</Link> : <div className="flex-1 min-w-0">{card}</div>}
                  <button
                    onClick={() => toggleFollow(id, meta || {})}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-colors"
                  >
                    {t("Following")}
                  </button>
                </div>

                {caps && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mr-0.5">{t("Priority")}</span>
                    {Object.keys(caps).map((tierKey) => {
                      const isCurrent = meta.tier === tierKey;
                      const usage = tierUsage(meta.category, tierKey);
                      const isFull = usage && usage.used >= usage.cap && !isCurrent;
                      return (
                        <button
                          key={tierKey}
                          disabled={isFull}
                          onClick={() => (isCurrent ? clearFollowTier(id) : setFollowTier(id, tierKey))}
                          title={usage ? `${usage.used}/${usage.cap}` : undefined}
                          className={cn(
                            "text-[9px] font-bold px-2 py-1 rounded-lg border transition-colors",
                            isCurrent
                              ? "bg-amber-500 border-amber-500 text-white"
                              : isFull
                              ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                              : "bg-white border-slate-200 text-slate-500 hover:border-amber-300"
                          )}
                        >
                          {TIER_LABEL[tierKey]} {usage ? `(${usage.used}/${usage.cap})` : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
