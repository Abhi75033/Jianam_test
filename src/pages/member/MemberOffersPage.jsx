import { useState } from "react";
import {
  Tag, Search, MapPin, Sparkles, Filter, ChevronRight,
  Gift, Percent, Copy, QrCode, ExternalLink, Phone, MessageSquare,
  Share2, Bookmark, Star, Clock, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/* ─── Offer categories ────────────────────────────────────────────────────── */
const CATEGORIES = [
  { key: "all",          label: "All Offers",          emoji: "🎁" },
  { key: "travel",       label: "Travel & Yatra",      emoji: "✈️" },
  { key: "hotels",       label: "Hotels & Stays",      emoji: "🏨" },
  { key: "restaurants",  label: "Jain Restaurants",    emoji: "🍱" },
  { key: "medical",      label: "Medical & Health",    emoji: "🏥" },
  { key: "education",    label: "Education",           emoji: "📚" },
  { key: "jewellery",    label: "Jewellery & Gems",    emoji: "💎" },
  { key: "finance",      label: "Finance & Insurance", emoji: "🏦" },
  { key: "realestate",   label: "Real Estate",         emoji: "🏢" },
  { key: "shopping",     label: "Shopping & Retail",   emoji: "🛍️" },
  { key: "temple",       label: "Temple Services",     emoji: "🛕" },
  { key: "spiritual",    label: "Spiritual Products",  emoji: "📿" },
  { key: "tours",        label: "Guided Tours",        emoji: "🗺️" },
];

/* ─── Demo offer items ───────────────────────────────────────────────────── */
const DEMO_OFFERS = [
  {
    id: 1,
    title: "Palitana Dharamshala AC Stay — 20% OFF",
    sponsor: "Palitana Board Dharamshala Trust",
    category: "hotels",
    discount: "20% OFF",
    code: "PALITANA20",
    distance: "1.2 km",
    validity: "Valid till 31 Oct 2025",
    rating: 4.8,
    sponsored: true,
    exclusive: true,
    emoji: "🏨",
    bg: "from-[#0F172A] via-[#1E293B] to-[#334155]"
  },
  {
    id: 2,
    title: "Shree Mahavir Pure Jain Bhojanshala — Free Special Sweet",
    sponsor: "Mahavir Seva Samiti",
    category: "restaurants",
    discount: "FREE DESSERT",
    code: "JAINTHALI",
    distance: "500 m",
    validity: "Valid on all orders above ₹200",
    rating: 4.9,
    sponsored: true,
    trending: true,
    emoji: "🍱",
    bg: "from-[#4C1D95] via-[#5B21B6] to-[#6D28D9]"
  },
  {
    id: 3,
    title: "Shatrunjay Yatra Bus Package — 15% Group Discount",
    sponsor: "JiNANAM Yatra Services",
    category: "tours",
    discount: "15% OFF",
    code: "YATRA15",
    distance: "Citywide",
    validity: "Booking open for Sep 2025",
    rating: 4.7,
    exclusive: true,
    emoji: "🚌",
    bg: "from-[#065F46] via-[#047857] to-[#059669]"
  },
  {
    id: 4,
    title: "Pooja Samagri & Brass Idol Set — Extra 10% Cashback",
    sponsor: "Arihant Jain Puja Store",
    category: "spiritual",
    discount: "10% CASHBACK",
    code: "PUJA10",
    distance: "2.4 km",
    validity: "Valid till 15 Nov 2025",
    rating: 4.6,
    trending: true,
    emoji: "📿",
    bg: "from-[#9A3412] via-[#C2410C] to-[#EA580C]"
  },
];

export default function MemberOffersPage() {
  const { t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = DEMO_OFFERS.filter((o) => {
    if (selectedCat !== "all" && o.category !== selectedCat) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.sponsor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(t(`Coupon code "${code}" copied to clipboard!`));
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
            Exclusive discounts, coupons, and verified deals for JiNANAM members across India & globally.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search offers, stores, categories…")}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
          />
        </div>
      </div>

      {/* ── Featured Banner Carousel ─────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#311042] p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[160px] opacity-10 pointer-events-none select-none">
          🎁
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block">
            ⭐ FEATURED MEMBER OFFER
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Special Chaturmas Dharamshala Discount: Up to 25% Off
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Book verified AC Dharamshala rooms in Palitana, Girnar, Ranakpur and Shankheshwar with instant member voucher.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => copyCode("JINANAM25")}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Copy className="h-4 w-4" />
              <span>Use Code: JINANAM25</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Chips Filter ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setSelectedCat(key)}
            className={cn(
              "shrink-0 text-xs font-bold px-4 py-2 rounded-2xl border transition-all flex items-center gap-2",
              selectedCat === key
                ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100"
            )}
          >
            <span>{emoji}</span>
            <span>{t(label)}</span>
          </button>
        ))}
      </div>

      {/* ── Offers Grid Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className={cn("p-6 text-white bg-gradient-to-r flex items-start justify-between gap-4", offer.bg)}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {offer.sponsored && (
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                      SPONSORED
                    </span>
                  )}
                  {offer.exclusive && (
                    <span className="bg-white/20 backdrop-blur text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                      EXCLUSIVE
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black mt-2">{offer.discount}</div>
                <h3 className="text-sm font-bold leading-snug line-clamp-1">{offer.title}</h3>
                <p className="text-[11px] opacity-80 font-medium">{offer.sponsor}</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shrink-0">
                {offer.emoji}
              </div>
            </div>

            <div className="p-5 bg-white space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {offer.distance}</span>
                <span className="flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {offer.rating}</span>
                <span>{offer.validity}</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="px-3 py-1.5 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-800 tracking-wider">
                  {offer.code}
                </div>
                <button
                  onClick={() => copyCode(offer.code)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Coupon</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
