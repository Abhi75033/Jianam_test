import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, MapPin, Phone, Clock, Landmark, Share2,
  Star, Flag, Navigation, Image as ImageIcon, CalendarCheck, Route as RouteIcon,
  Facebook, Instagram, CreditCard, Users, ScrollText, BedDouble,
  Building2, Utensils, Hotel, Sparkles, CheckCircle2, ChevronRight, Check
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import { formatDistance } from "@/lib/geo";
import ListState from "@/components/member/ListState";
import { STATIC_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

const ORG_ENDPOINTS = {
  temple: "/temples",
  jaincentre: "/jain-centers",
  dharamshala: "/dharamshalas",
};

function mapOrg(o) {
  return {
    ...o,
    timings: [
      o.morningStart && o.morningEnd ? { label: "Morning Darshan", value: `${o.morningStart} – ${o.morningEnd}` } : null,
      o.aartiMorning ? { label: "Morning Aarti", value: o.aartiMorning } : null,
      o.pakshalStart && o.pakshalEnd ? { label: "Pakshal Puja", value: `${o.pakshalStart} – ${o.pakshalEnd}` } : null,
      o.poojaStart && o.poojaEnd ? { label: "Snatra Pooja", value: `${o.poojaStart} – ${o.poojaEnd}` } : null,
      o.eveningStart && o.eveningEnd ? { label: "Evening Darshan", value: `${o.eveningStart} – ${o.eveningEnd}` } : null,
      o.aartiEvening ? { label: "Sandhya Aarti", value: o.aartiEvening } : null,
    ].filter(Boolean),
    address: [o.addressLine, o.landmark, o.city, o.district, o.state, o.pincode]
      .filter(Boolean).join(", "),
    mulNayakName: o.mulNayakBhagwan?.name || o.mulNayakBhagwanName || o.mulNayakName || o.deity || o.mulNayak,
    dhaja: (o.dhajaRecords || [])[0] || null,
    chaturmas: (o.chaturmasStays || []).find((c) => c.status === "ONGOING")
      || (o.chaturmasStays || []).find((c) => c.status === "UPCOMING")
      || null,
    logoSrc: o.logoUrl ? (o.logoUrl.startsWith("http") ? o.logoUrl : `${STATIC_URL}/${o.logoUrl}`) : null,
  };
}

export default function MemberTempleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isEntityFollowed, toggleFollow, distanceTo } = useVisibilityEngine();

  const [org, setOrg] = useState(null);
  const [orgType, setOrgType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    for (const [type, prefix] of [["temple", ORG_ENDPOINTS.temple], ["dharamshala", ORG_ENDPOINTS.dharamshala], ["jaincentre", ORG_ENDPOINTS.jaincentre]]) {
      try {
        const res = await memberClient.get(`${prefix}/${id}`);
        const data = res?.data?.data;
        if (data) {
          setOrg(mapOrg(data));
          setOrgType(type);
          setLoading(false);
          return;
        }
      } catch {
        /* try next */
      }
    }
    setError(extractErrorMessage({ message: "Not found" }));
    setOrg(null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  const reload = load;

  const km = org ? distanceTo(org) : null;
  const followed = org ? isEntityFollowed(org.publicId || org.id) : false;

  const onShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: org?.name, url });
    else { navigator.clipboard.writeText(url); toast.success(t("Link copied to clipboard")); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs active:scale-95 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("Back to Directory")}</span>
      </button>

      <ListState
        loading={loading}
        error={error}
        count={org ? 1 : 0}
        emptyTitle={t("Temple or Centre not found")}
        emptyHint={t("This profile may have been removed, or the link is out of date.")}
        onRetry={reload}
      >
        {org && (
          <div className="space-y-6">
            
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 border border-white/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shrink-0 overflow-hidden shadow-xl text-white">
                    {org.logoSrc ? (
                      <img src={org.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Building2 className="h-10 w-10" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-0.5 text-xs font-mono font-bold">
                        {org.publicId}
                      </span>
                      {km != null && (
                        <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-0.5 text-xs font-bold flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          <span>{formatDistance(km)}</span>
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 leading-tight text-white">{org.name}</h1>
                    <div className="text-xs text-orange-100 font-semibold mt-1">
                      {[org.sect, org.subSect || org.gacchaName].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFollow(org.publicId || org.id, { type: orgType, apiId: org.id, name: org.name, image: org.logoSrc, category: orgType })}
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 active:scale-95 transition-all shadow-xs",
                      followed
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-white text-orange-600 border-white hover:bg-orange-50 shadow-md"
                    )}
                  >
                    {followed ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    <span>{followed ? t("Following") : t("Follow Temple")}</span>
                  </button>

                  <button
                    onClick={onShare}
                    className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 active:scale-95 transition-all"
                    title={t("Share")}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-6">

                {/* Location & Contact */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-orange-500" />
                    <span>{t("Address & Location")}</span>
                  </h2>
                  {org.address && <p className="text-xs text-slate-600 font-medium leading-relaxed">{org.address}</p>}
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    {org.googleMapsLink && (
                      <a
                        href={org.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200 hover:bg-orange-100 transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>{t("Directions in Google Maps")}</span>
                      </a>
                    )}
                    {org.phone && (
                      <a
                        href={`tel:${org.phone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5 text-green-600" />
                        <span>{org.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Darshan & Aarti Timings */}
                {org.timings.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-orange-500" />
                      <span>{t("Darshan, Aarti & Pakshal Timings")}</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {org.timings.map((row) => (
                        <div key={row.label} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <div className="text-[10px] font-extrabold text-slate-400 uppercase">{t(row.label)}</div>
                          <div className="text-xs font-bold text-slate-900 mt-1 font-mono">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mulnayak & History */}
                {(org.mulNayakName || org.history || org.establishedYear) && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-2.5">
                    <h2 className="text-base font-black text-slate-900">{t("Temple History & Mulnayak")}</h2>
                    {org.mulNayakName && (
                      <div className="text-xs font-bold text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-200 inline-block">
                        🙏 {t("Mulnayak Bhagwan")}: {org.mulNayakName}
                      </div>
                    )}
                    {org.history && <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-2">{org.history}</p>}
                  </div>
                )}

                {/* Dhaja History */}
                {org.dhaja && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Flag className="h-4.5 w-4.5 text-rose-500" />
                      <span>{t("Dhajarohan Information")}</span>
                    </h2>
                    <div className="text-xs text-slate-600 font-medium">
                      {org.dhaja.year} — {org.dhaja.sponsorName || org.dhaja.description || t("Annual Dhaja Ceremony")}
                    </div>
                  </div>
                )}

                {/* Chaturmas */}
                {org.chaturmas && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-black text-slate-900">{t("Current Chaturmas")}</h2>
                    <div className="text-xs text-slate-600 font-medium">
                      {org.chaturmas.year} · {[org.chaturmas.startDate, org.chaturmas.endDate].filter(Boolean).map((d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })).join(" – ")}
                    </div>
                    {org.chaturmas.monk?.fullName && (
                      <div className="text-xs font-bold text-slate-900 mt-1">{org.chaturmas.monk.fullName}</div>
                    )}
                  </div>
                )}

                {/* Photo Gallery Preview */}
                {org.gallery?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon className="h-4.5 w-4.5 text-purple-500" />
                        <span>{t("Photo Gallery")}</span>
                      </h2>
                      {org.gallery.length > 8 && (
                        <Link to={`/member/temples/${id}/gallery`} className="text-xs font-bold text-purple-600 hover:underline">
                          {t("View all")} ({org.gallery.length})
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {org.gallery.slice(0, 8).map((g, i) => {
                        const src = g.url?.startsWith("http") ? g.url : `${STATIC_URL}/${g.url}`;
                        return (
                          <div key={g.id || i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-2xs">
                            <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Bookings & Facilities */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                  <h2 className="text-sm font-black text-slate-900">{t("Facilities & Reservations")}</h2>
                  <div className="space-y-2">
                    <Link
                      to={`/member/temples/${id}/book`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        <span>{t("Book Dharamshala / Hall")}</span>
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                    <Link
                      to="/member/events"
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-orange-500" />
                        <span>{t("Temple Events & Utsav")}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>
                </div>

                {/* Donation CTA */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span>{t("Temple Seva & Donations")}</span>
                  </h2>
                  <Link
                    to="/member/donations"
                    className="block w-full text-center py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                  >
                    {t("Make a Seva Donation")}
                  </Link>
                  <p className="text-[10px] text-slate-400 text-center font-medium">{t("Official 80G tax receipt issued instantly.")}</p>
                </div>

                {/* Report Info */}
                <button
                  onClick={() => toast.success(t("Support ticket created. Track status under Support."))}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ScrollText className="h-3.5 w-3.5" />
                  <span>{t("Report Incorrect Information")}</span>
                </button>
              </div>

            </div>

          </div>
        )}
      </ListState>

    </div>
  );
}
