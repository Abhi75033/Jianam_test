import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Navigation, Calendar, Users, Clock, ArrowLeft,
  Share2, Bookmark, Heart, ShieldCheck, CheckCircle2, MessageSquare, Phone,
  Sparkles, AlertCircle, FileText, Check, ArrowRight, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { useMemberItem, compactNumber } from "@/hooks/useMemberList";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import { toast } from "sonner";

export default function MemberMSDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isEntityFollowed, toggleFollow } = useVisibilityEngine();

  const { item: ms, loading, error } = useMemberItem(id ? `/monks/${id}` : null, {
    map: (m) => ({
      ...m,
      name: m.dikshaName || m.shortName || m.nameBeforeDiksha || m.fullName || m.name,
      image: m.photoUrl || null,
      status: m.tracking?.status || m.status || "Offline",
      location: m.tracking?.currentLocation || m.currentTemple?.city || "",
      currentPlace: m.currentTemple?.name || m.tracking?.currentLocation || "",
      sect: [m.sect, m.subSect || m.gacchaName].filter(Boolean).join(" · "),
      guru: m.dikshaGuru?.dikshaName || m.dikshaGuru?.shortName || m.discipleOf || "",
      followers: compactNumber(m._count?.followers ?? 0),
      vihaarGroupId: m.group?.publicId || m.currentSangh?.publicId || "",
      groupLeader: m.group?.leader?.dikshaName || m.currentSangh?.name || "",
      groupMembersCount: m.group?._count?.members ?? m._count?.group ?? 0,
      upcomingVihaar: m.tracking?.nextStop || m.timeline?.[0]?.title || "",
      pravachan: m.routine?.pravachan || "",
      contactRepresentative: {
        jainPerson: m.sanghContacts?.[0]?.name || "",
        phone: m.sanghContacts?.[0]?.mobile || "",
      },
      chaturmasHistory: m.chaturmasHistory || [],
    }),
  });

  const followed = isEntityFollowed(ms?.publicId);

  const onShare = () => {
    if (navigator.share) {
      navigator.share({ title: ms?.name, text: `MS ID: ${ms?.publicId} - Location: ${ms?.location}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${ms?.name} (${ms?.publicId})`);
      toast.success(t("MS link copied to clipboard"));
    }
  };

  const onReportInfo = () => {
    toast.success(t("Support Ticket created for reporting incorrect info on MS {0} ({1}). Track in Support.", [ms?.name, ms?.publicId]));
  };

  if (loading || error || !ms) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <ListState
          loading={loading}
          error={error}
          count={ms ? 1 : 0}
          emptyTitle={t("Maharaj Saheb not found")}
          emptyHint={t("This profile may have been removed, or the link is out of date.")}
        >
          {null}
        </ListState>
      </div>
    );
  }

  const isVihaar = String(ms.status).toLowerCase().includes("mov") || String(ms.status).toLowerCase().includes("vihaar");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs active:scale-95 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("Back to MS Directory")}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFollow(ms?.publicId, { type: "monk", apiId: ms?.id, name: ms?.name, image: ms?.image, category: "monk" })}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-1.5 active:scale-95 shadow-xs",
              followed
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-orange-500/20"
            )}
          >
            {followed ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            <span>{followed ? t("Following MS") : t("Follow MS Updates")}</span>
          </button>

          <button
            onClick={onShare}
            className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            title={t("Share Profile")}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-4xl shadow-xl shrink-0 overflow-hidden font-bold">
              {ms.image ? (
                <img src={ms.image} alt="" className="w-full h-full object-cover" />
              ) : (
                "🙏"
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-0.5 text-xs font-mono font-bold">
                  {ms?.publicId}
                </span>
                <span className={cn("text-xs font-black px-3 py-0.5 rounded-full border flex items-center gap-1.5", isVihaar ? "bg-amber-300 text-slate-950 border-amber-200" : "bg-blue-900/80 text-blue-100 border-blue-400/40")}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", isVihaar ? "bg-slate-950" : "bg-blue-300")} />
                  <span>{isVihaar ? t("Vihaar (Moving)") : t("Sthir (Staying)")}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">{ms?.name}</h1>
              <div className="text-xs text-orange-100 font-semibold mt-1">
                {ms?.sect} {ms?.guru ? `• Diksha Guru: ${ms?.guru}` : ""}
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-1 sm:max-w-xs shadow-inner">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-amber-200">{t("Current Stay / Vihar Location")}</div>
            <div className="font-black text-white text-sm">{ms?.currentPlace}</div>
            <div className="text-[11px] text-orange-100">{ms?.location}</div>
          </div>
        </div>
      </div>

      {/* Detail 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* About / Bio */}
          {ms?.bio && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5">
              <h2 className="text-base font-black text-slate-900">{t("About & Biography")}</h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ms.bio}</p>
            </div>
          )}

          {/* Vihaar Group & Route Info */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">{t("Vihaar Group Information")}</h2>
              {ms?.vihaarGroupId && (
                <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                  Group ID: {ms.vihaarGroupId}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">{t("Group Leader / Acharya")}</span>
                <div className="font-black text-slate-900 mt-0.5">{ms?.groupLeader || "Pujya Gurudev"}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">{t("Total Group Members")}</span>
                <div className="font-black text-slate-900 mt-0.5">{ms?.groupMembersCount || 1} {t("Sadhu & Sadhvi Bhagwants")}</div>
              </div>
            </div>
            {ms?.upcomingVihaar && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
                🚶 {t("Upcoming Vihaar Schedule")}: {ms.upcomingVihaar}
              </div>
            )}
          </div>

          {/* Chaturmas History */}
          {ms?.chaturmasHistory?.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-base font-black text-slate-900">{t("Chaturmas History")}</h2>
              <div className="space-y-2">
                {ms.chaturmasHistory.map((c, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900">{c.year} Chaturmas</span>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">{c.venue}</div>
                    </div>
                    <span className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full", c.status === "Ongoing" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Daily Routine & Pravachan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>{t("Daily Pravachan & Darshan")}</span>
            </h3>
            {ms?.pravachan && (
              <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs font-bold text-orange-900">
                Pravachan: {ms.pravachan}
              </div>
            )}
            <div className="text-xs text-slate-500 space-y-1.5 font-medium">
              <div>• Morning Darshan: 6:30 AM – 7:30 AM</div>
              <div>• Evening Pratikraman: 6:30 PM</div>
              <div className="text-[10px] text-slate-400 pt-1 font-bold">⚠️ Guidelines: Devotees are requested to maintain silence.</div>
            </div>
          </div>

          {/* Sangh Contact */}
          {ms?.contactRepresentative?.jainPerson && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>{t("Sangh Coordinator Contact")}</span>
              </h3>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-800">{ms.contactRepresentative.jainPerson}</div>
                <div className="font-mono text-slate-600">{ms.contactRepresentative.phone}</div>
              </div>
            </div>
          )}

          {/* Report Info */}
          <button
            onClick={onReportInfo}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{t("Report Incorrect Information")}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
