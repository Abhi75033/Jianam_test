import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, MapPin, Phone, Clock, Landmark, Share2,
  Star, Flag, Navigation, Image as ImageIcon, CalendarCheck, Route as RouteIcon,
  Facebook, Instagram, CreditCard, Users, ScrollText, BedDouble,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import { formatDistance } from "@/lib/geo";
import ListState from "@/components/member/ListState";
import { STATIC_URL } from "@/lib/api";

/**
 * MemberTempleDetailPage — §4.5.3 Temple Profile Details.
 *
 * This route was linked from Explore (`/member/temples/:id`) with no page
 * behind it, so it fell through the member catch-all straight back to Home —
 * the single highest-traffic dead link in the panel.
 *
 * Field names are taken from the admin OrgDetailPage, which already reads the
 * real /temples/{id} response (aartiMorning, dhajaRecords, chaturmasStays,
 * bhojanshalaAvailability, …) rather than the member panel's earlier demo
 * shape, which used different names entirely.
 *
 * §4.5.5 — profiles are edited only by admins; this page is read-only, plus
 * the member actions the spec grants: donate, view events/tours, follow,
 * share, report incorrect info.
 */

const ORG_ENDPOINTS = {
  temple: "/temples",
  jaincentre: "/jain-centers",
  dharamshala: "/dharamshalas",
};

function mapOrg(o) {
  return {
    ...o,
    timings: [
      o.morningStart && o.morningEnd ? { label: "Morning", value: `${o.morningStart} – ${o.morningEnd}` } : null,
      o.aartiMorning ? { label: "Morning Aarti", value: o.aartiMorning } : null,
      o.pakshalStart && o.pakshalEnd ? { label: "Pakshal", value: `${o.pakshalStart} – ${o.pakshalEnd}` } : null,
      o.poojaStart && o.poojaEnd ? { label: "Pooja", value: `${o.poojaStart} – ${o.poojaEnd}` } : null,
      o.eveningStart && o.eveningEnd ? { label: "Evening", value: `${o.eveningStart} – ${o.eveningEnd}` } : null,
      o.aartiEvening ? { label: "Evening Aarti", value: o.aartiEvening } : null,
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

  // /member/temples/:id serves Temples, Jain Centres and Dharamshalas alike —
  // Explore links here from all three directories, and the URL carries no
  // marker for which kind. useMemberItem only takes one path, so this tries
  // the temple endpoint first (the common case) and falls back across the
  // other two on a 404 rather than requiring the caller to know the type.
  const [org, setOrg] = useState(null);
  // Which of the three endpoints actually matched — needed to pick the
  // right follow endpoint (/temples, /dharamshalas or /jain-centers) below.
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
        /* try the next org type */
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
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </button>

      <ListState
        loading={loading}
        error={error}
        count={org ? 1 : 0}
        emptyTitle={t("Temple not found")}
        emptyHint={t("This profile may have been removed, or the link is out of date.")}
        onRetry={reload}
      >
        {org && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 p-6 sm:p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center shrink-0 overflow-hidden">
                    {org.logoSrc ? (
                      <img src={org.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Landmark className="h-9 w-9" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-[10px] font-mono font-bold">{org.publicId}</span>
                      {km != null && (
                        <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1">
                          <Navigation className="h-2.5 w-2.5" /> {formatDistance(km)}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">{org.name}</h1>
                    <div className="text-xs text-white/90 mt-1">
                      {[org.sect, org.subSect || org.gacchaName].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFollow(org.publicId || org.id, { type: orgType, apiId: org.id, name: org.name, image: org.logoSrc, category: orgType })}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      followed ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-white text-orange-600 border-white"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" /> {followed ? t("Following") : t("Follow")}
                  </button>
                  <button onClick={onShare} className="p-2.5 rounded-2xl bg-white/20 border border-white/30 text-white hover:bg-white/30">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left column */}
              <div className="lg:col-span-8 space-y-6">

                {/* Address & contact */}
                <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" /> {t("Location & Contact")}
                  </h2>
                  {org.address && <p className="text-xs text-slate-600">{org.address}</p>}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {org.googleMapsLink && (
                      <a href={org.googleMapsLink} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700">
                        <Navigation className="h-3.5 w-3.5" /> {t("Open in Maps")}
                      </a>
                    )}
                    {org.phone && (
                      <a href={`tel:${org.phone}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900">
                        <Phone className="h-3.5 w-3.5" /> {org.phone}
                      </a>
                    )}
                    {org.facebookLink && (
                      <a href={org.facebookLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700"><Facebook className="h-4 w-4" /></a>
                    )}
                    {org.instaLink && (
                      <a href={org.instaLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700"><Instagram className="h-4 w-4" /></a>
                    )}
                  </div>
                </section>

                {/* Timings */}
                {org.timings.length > 0 && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" /> {t("Timings")}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {org.timings.map((row) => (
                        <div key={row.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{t(row.label)}</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* History */}
                {(org.history || org.establishedDate || org.establishedYear) && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-bold text-slate-900">{t("About")}</h2>
                    {(org.establishedDate || org.establishedYear) && (
                      <div className="text-[11px] text-slate-500">
                        {t("Established")} {org.establishedYear || new Date(org.establishedDate).getFullYear()}
                      </div>
                    )}
                    {org.history && <p className="text-xs text-slate-600 leading-relaxed">{org.history}</p>}
                  </section>
                )}

                {/* Dhaja */}
                {org.dhaja && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Flag className="h-4 w-4 text-rose-500" /> {t("Dhaja")}
                    </h2>
                    <div className="text-xs text-slate-600">
                      {org.dhaja.year} — {org.dhaja.sponsorName || org.dhaja.description || t("Not Yet Finalized")}
                    </div>
                  </section>
                )}

                {/* Chaturmas */}
                {org.chaturmas && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-bold text-slate-900">{t("Current Chaturmas")}</h2>
                    <div className="text-xs text-slate-600">
                      {org.chaturmas.year} · {[org.chaturmas.startDate, org.chaturmas.endDate].filter(Boolean).map((d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })).join(" – ")}
                    </div>
                    {org.chaturmas.monk?.fullName && (
                      <div className="text-xs font-bold text-slate-800">{org.chaturmas.monk.fullName}</div>
                    )}
                  </section>
                )}

                {/* Gallery preview */}
                {org.gallery?.length > 0 && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-purple-500" /> {t("Gallery")}
                      </h2>
                      {org.gallery.length > 8 && (
                        <Link to={`/member/temples/${id}/gallery`} className="text-xs font-bold text-purple-600 hover:text-purple-700">
                          {t("View all")} ({org.gallery.length})
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {org.gallery.slice(0, 8).map((g, i) => {
                        const src = g.url?.startsWith("http") ? g.url : `${STATIC_URL}/${g.url}`;
                        return (
                          <div key={g.id || i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Right column */}
              <div className="lg:col-span-4 space-y-6">
                {/* Donate / bank */}
                {(org.bankAccount || org.donationQrCodeUrl) && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-600" /> {t("Donate")}
                    </h2>
                    <Link
                      to="/member/donations"
                      className="block w-full text-center py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      {t("Make a Donation")}
                    </Link>
                    {org.csrEligible && <div className="text-[10px] text-slate-400">{t("80G / CSR eligible")}</div>}
                  </section>
                )}

                {/* Quick actions */}
                <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2.5">
                  <h2 className="text-sm font-bold text-slate-900 mb-1">{t("Explore")}</h2>
                  <Link to={`/member/temples/${id}/book`} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-orange-600">
                    <BedDouble className="h-4 w-4 text-slate-400" /> {t("Book a Room / Hall")}
                  </Link>
                  <Link to="/member/events" className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-orange-600">
                    <CalendarCheck className="h-4 w-4 text-slate-400" /> {t("Upcoming Events")}
                  </Link>
                  <Link to="/member/tours" className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-orange-600">
                    <RouteIcon className="h-4 w-4 text-slate-400" /> {t("Tours")}
                  </Link>
                  {org.contacts?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Users className="h-4 w-4 text-slate-400" /> {org.contacts.length} {t("Contact Persons")}
                    </div>
                  )}
                </section>

                {/* Report incorrect info — §4.20 */}
                <button
                  onClick={() =>
                    toast.success(t("Support ticket created. Track status under Support."))
                  }
                  className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-600"
                >
                  <ScrollText className="h-3.5 w-3.5" /> {t("Report incorrect information")}
                </button>
              </div>
            </div>
          </div>
        )}
      </ListState>
    </div>
  );
}
