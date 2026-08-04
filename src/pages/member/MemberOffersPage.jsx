import { useState, useEffect } from "react";
import {
  Tag, Search, MapPin, Gift, ExternalLink, MessageSquare,
  Share2, Bookmark, Globe, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, longDate } from "@/hooks/useMemberList";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage, STATIC_URL } from "@/lib/api";
import { toast } from "sonner";

/**
 * Maps an API offer onto the fields this page renders.
 *
 * The previous mapper invented fields (discount, couponCode, sponsor,
 * rating, distance) that don't exist anywhere in the real /offers schema —
 * confirmed by grepping every field the admin OffersPage.jsx actually reads
 * off an offer (title, description, companyName, companyLogoUrl, bannerUrl,
 * category.name, startAt/endAt, contact.phone, links.{whatsapp,website,maps},
 * publicId). Those cards were rendering blank price/coupon boxes and a
 * "Copy Coupon" button with nothing to copy on every real offer.
 */
function mapOffer(o) {
  return {
    id: o.id,
    publicId: o.publicId || o.id,
    title: o.title,
    description: o.description || "",
    companyName: o.companyName || "",
    logoSrc: o.companyLogoUrl ? (o.companyLogoUrl.startsWith("http") ? o.companyLogoUrl : `${STATIC_URL}/${o.companyLogoUrl}`) : null,
    bannerSrc: o.bannerUrl ? (o.bannerUrl.startsWith("http") ? o.bannerUrl : `${STATIC_URL}/${o.bannerUrl}`) : null,
    category: o.category?.name || "Others",
    startAt: o.startAt,
    endAt: o.endAt,
    deletedAt: o.deletedAt || null,
    validity: o.endAt ? `Valid till ${longDate(o.endAt)}` : "",
    phone: o.contact?.phone || "",
    whatsapp: o.links?.whatsapp || "",
    website: o.links?.website || "",
    maps: o.links?.maps || "",
  };
}

/** Same active-window rule admin's OffersPage.jsx applies client-side. */
function isActive(offer, now) {
  if (offer.deletedAt) return false;
  if (offer.startAt && new Date(offer.startAt) > now) return false;
  if (offer.endAt && new Date(offer.endAt) < now) return false;
  return true;
}

export default function MemberOffersPage() {
  const { items: offers, loading, error, reload } = useMemberList("/offers", { map: mapOffer });
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    memberClient.get("/offers/browse", { params: { section: "saved" } })
      .then((res) => {
        const rows = res?.data?.data?.items || res?.data?.data || [];
        setSavedIds(new Set(rows.map((r) => r.id)));
      })
      .catch(() => {});
  }, []);

  const savedOnly = typeof window !== "undefined" && window.location.hash === "#saved";

  const now = new Date();
  const active = offers.filter((o) => isActive(o, now));
  const categories = ["all", ...Array.from(new Set(active.map((o) => o.category).filter(Boolean)))];

  const filtered0 = active.filter((o) => {
    if (selectedCat !== "all" && o.category !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.title?.toLowerCase().includes(q) && !o.companyName?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const filtered = savedOnly ? filtered0.filter((o) => savedIds.has(o.id)) : filtered0;

  const toggleSave = async (offer) => {
    const wasSaved = savedIds.has(offer.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(offer.id) : next.add(offer.id);
      return next;
    });
    setSavingId(offer.id);
    try {
      await memberClient.post(`/offers/${offer.id}/${wasSaved ? "unsave" : "save"}`);
      toast.success(wasSaved ? t("Offer removed from your Bookmarks list.") : t("Offer bookmarked! View under Saved Offers."));
    } catch (err) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(offer.id) : next.delete(offer.id);
        return next;
      });
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const onShare = (offer) => {
    const link = `https://jinanam.org/offers/${offer.publicId}`;
    navigator.clipboard.writeText(link);
    toast.success(t("Link copied to clipboard!"));
    memberClient.post(`/offers/${offer.id}/track/share`).catch(() => {});
  };

  const trackClick = (offer) => {
    memberClient.post(`/offers/${offer.id}/track/click`).catch(() => {});
  };

  return (
    <div className="space-y-8">

      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Gift className="h-6 w-6 text-orange-500" />
            <span>{t("Community Offers & Deals")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Verified deals from partner businesses for JiNANAM members.")}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search offers, businesses…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </div>
      </div>

      {/* ── Category Chips Filter ────────────────────────────────────────── */}
      <div id="categories" className="scroll-mt-24" />
      <div id="saved" className="scroll-mt-24" />
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={cn(
                "shrink-0 text-xs font-bold px-4 py-2 rounded-2xl border transition-all",
                selectedCat === c
                  ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100"
              )}
            >
              {c === "all" ? t("All Offers") : c}
            </button>
          ))}
        </div>
      )}

      {/* ── Offers Grid ───────────────────────────────────────────────────── */}
      <ListState
        loading={loading}
        error={error}
        count={filtered.length}
        emptyTitle={savedOnly ? t("No saved offers yet") : t("No offers right now")}
        emptyHint={savedOnly ? t("Tap the bookmark icon on any offer to save it here.") : t("Check back soon for new partner deals.")}
        onRetry={reload}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="h-32 bg-slate-100 relative">
                {offer.bannerSrc ? (
                  <img src={offer.bannerSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Gift className="h-10 w-10" />
                  </div>
                )}
                <button
                  onClick={() => toggleSave(offer)}
                  disabled={savingId === offer.id}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur shadow-xs disabled:opacity-60"
                >
                  <Bookmark className={cn("h-4 w-4", savedIds.has(offer.id) ? "fill-orange-500 text-orange-500" : "text-slate-500")} />
                </button>
              </div>

              <div className="p-5 space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {offer.logoSrc ? (
                      <img src={offer.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Building2 className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-orange-600 uppercase tracking-wider">{offer.category}</div>
                    <div className="text-[11px] font-bold text-slate-700 truncate">{offer.companyName}</div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{offer.title}</h3>
                {offer.description && <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{offer.description}</p>}
                {offer.validity && <div className="text-[10px] text-slate-400 font-semibold">{offer.validity}</div>}
              </div>

              <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2 pt-3">
                <div className="flex items-center gap-1.5">
                  {offer.whatsapp && (
                    <a
                      href={`https://wa.me/${offer.whatsapp}`}
                      target="_blank" rel="noreferrer"
                      onClick={() => trackClick(offer)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {offer.website && (
                    <a
                      href={offer.website}
                      target="_blank" rel="noreferrer"
                      onClick={() => trackClick(offer)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {offer.maps && (
                    <a href={offer.maps} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                      <MapPin className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onShare(offer)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ListState>
    </div>
  );
}
