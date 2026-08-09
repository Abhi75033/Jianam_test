import { useState, useEffect } from "react";
import {
  Tag, Search, MapPin, Gift, ExternalLink, MessageSquare,
  Share2, Bookmark, Globe, Building2, Phone, Sparkles, Check,
  Clock, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberList, longDate } from "@/hooks/useMemberList";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage, STATIC_URL } from "@/lib/api";
import { toast } from "sonner";

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
      toast.success(wasSaved ? t("Offer removed from saved list.") : t("Offer saved to bookmarks!"));
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
    if (navigator.share) {
      navigator.share({ title: offer.title, text: offer.description, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(link);
      toast.success(t("Offer link copied to clipboard!"));
    }
    memberClient.post(`/offers/${offer.id}/track/share`).catch(() => {});
  };

  const trackClick = (offer) => {
    memberClient.post(`/offers/${offer.id}/track/click`).catch(() => {});
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Gift className="h-4.5 w-4.5" />
            </div>
            <span>{t("Community Offers & Deals")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Exclusive verified discounts from community partners for JiNANAM members.")}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search deals, stores, products…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── Category Chips Filter ────────────────────────────────────────── */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={cn(
                "shrink-0 text-xs font-bold px-4 py-2 rounded-2xl border transition-all active:scale-95 shadow-xs",
                selectedCat === c
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-transparent text-white shadow-emerald-600/20"
                  : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Banner / Image */}
              <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {offer.bannerSrc ? (
                  <img
                    src={offer.bannerSrc}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Gift className="h-12 w-12 text-emerald-400/40" />
                  </div>
                )}
                
                {/* Category Pill on Banner */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-extrabold shadow-xs">
                  {offer.category}
                </span>

                {/* Bookmark Action */}
                <button
                  onClick={() => toggleSave(offer)}
                  disabled={savingId === offer.id}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xs hover:bg-white active:scale-95 transition-all"
                  title={t("Save Offer")}
                >
                  <Bookmark className={cn("h-4 w-4", savedIds.has(offer.id) ? "fill-emerald-600 text-emerald-600" : "text-slate-600")} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {offer.logoSrc ? (
                      <img src={offer.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Building2 className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{offer.companyName || t("Community Partner")}</div>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{offer.description}</p>
                )}
                {offer.validity && (
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>{offer.validity}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2 pt-3">
                <div className="flex items-center gap-1.5">
                  {offer.whatsapp && (
                    <a
                      href={`https://wa.me/${offer.whatsapp}`}
                      target="_blank" rel="noreferrer"
                      onClick={() => trackClick(offer)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  )}
                  {offer.phone && (
                    <a
                      href={`tel:${offer.phone}`}
                      onClick={() => trackClick(offer)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                  {offer.website && (
                    <a
                      href={offer.website}
                      target="_blank" rel="noreferrer"
                      onClick={() => trackClick(offer)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {offer.maps && (
                    <a
                      href={offer.maps}
                      target="_blank" rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Location"
                    >
                      <MapPin className="h-4 w-4" />
                    </a>
                  )}
                </div>
                
                <button
                  onClick={() => onShare(offer)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                  title={t("Share Offer")}
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </ListState>
    </div>
  );
}
