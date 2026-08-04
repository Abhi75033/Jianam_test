import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass, MapPin, Calendar, Users, Star, Clock, ChevronRight, Search, ShieldCheck, Loader2, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import ListState from "@/components/member/ListState";
import { useMemberList, relativeTime, compactNumber, longDate } from "@/hooks/useMemberList";
import { toast } from "sonner";

/**
 * Registration links a member to a tour's 99-Yatra progress tracking
 * (jatra counts, milestones, certificate — see MemberJatraProgressPage).
 * The API has no GET-my-registrations route, so the participant id this
 * POST returns is the only way back to that screen; persisted locally so a
 * returning member sees "View My Jatra Progress" instead of registering
 * twice. Keyed per device, not per account — acceptable for a convenience
 * shortcut, since the real source of truth is always the server record.
 */
const REG_KEY = "jinanam_member_tour_participants";
function loadRegistrations() {
  try { return JSON.parse(localStorage.getItem(REG_KEY) || "{}"); } catch { return {}; }
}
function saveRegistration(tourId, participantId) {
  const all = loadRegistrations();
  all[tourId] = participantId;
  try { localStorage.setItem(REG_KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
  return all;
}


/** Maps an API tour row onto the fields this page renders. */
function mapTour(t_, i) {
  return {
    id: t_.id || t_.publicId || i,
    title: t_.title || t_.name,
    destination: t_.destination || t_.endLocation || "",
    dates: [t_.startDate, t_.endDate].filter(Boolean).map(longDate).join(" – "),
    duration: t_.duration || "",
    price: t_.price ?? t_.amount ?? null,
    // Rendered directly as text, so normalise a list into a readable string.
    includes: Array.isArray(t_.includes || t_.inclusions)
      ? (t_.includes || t_.inclusions).join(" · ")
      : (t_.includes || t_.inclusions || ""),
    rating: t_.rating ?? null,
    reviews: t_.reviewCount ?? 0,
    emoji: t_.emoji || "🚌",
    bg: t_.bg || "from-orange-500 to-rose-500",
  };
}

export default function MemberToursPage() {
  const { items: tours, loading, error, reload } = useMemberList("/tours/", { map: mapTour });
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState(loadRegistrations);
  const [registeringId, setRegisteringId] = useState(null);

  const register = async (tour) => {
    if (!user?.publicId) {
      toast.error(t("Your member ID isn't available. Please sign in again."));
      return;
    }
    setRegisteringId(tour.id);
    try {
      const res = await memberClient.post(`/tours/${tour.id}/participants`, {
        memberPublicId: user.publicId,
      });
      const participantId = res?.data?.data?.id || null;
      if (participantId) {
        setRegistrations(saveRegistration(tour.id, participantId));
      }
      toast.success(t("Registered for the yatra! Track your jatra progress from this card."));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setRegisteringId(null);
    }
  };

  const filtered = tours.filter((tr) => {
    if (search && !tr.title.toLowerCase().includes(search.toLowerCase()) && !tr.destination.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-orange-500" />
            <span>{t("Tours & Yatra Packages")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Verified Jain pilgrimage group tours, 99 Yatra escorts, pure Jain meal arrangements & Dharamshala bookings.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search Yatra name, destination…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </div>
      </div>

      {/* ── Yatra Cards Grid Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tr) => (
          <div
            key={tr.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className={cn("p-6 text-white bg-gradient-to-r flex items-start justify-between gap-4", tr.bg)}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full">
                    {tr.duration}
                  </span>
                  <h2 className="text-base font-bold leading-snug mt-2">{tr.title}</h2>
                  <p className="text-xs opacity-90 mt-1 flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5" /> {tr.destination}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-3xl shrink-0">
                  {tr.emoji}
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>📅 Dates:</span>
                  <span className="font-bold text-slate-900">{tr.dates}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>⭐ Rating:</span>
                  <span className="font-bold text-slate-900">{tr.rating} ({tr.reviews} reviews)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px] text-slate-600 font-medium">
                  🎒 <strong>Includes:</strong> {tr.includes}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-sm font-black text-slate-900">{tr.price}</div>
              {registrations[tr.id] ? (
                <Link
                  to={`/member/tours/${tr.id}/jatra/${registrations[tr.id]}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trophy className="h-3.5 w-3.5" /> {t("My Jatra Progress")}
                </Link>
              ) : (
                <button
                  onClick={() => register(tr)}
                  disabled={registeringId === tr.id}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {registeringId === tr.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t("Book Yatra")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
