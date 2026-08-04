import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Navigation, Calendar, Users, Clock, ArrowLeft,
  Share2, Bookmark, Heart, ShieldCheck, CheckCircle, MessageSquare, Phone,
  Sparkles, AlertCircle, FileText, Check
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

  /**
   * Maps the real /monks/{id} response onto the fields this page renders.
   * The page was written against a demo object (contactRepresentative,
   * vihaarGroupId, guru …) whose names don't match the API. Field names below
   * are taken from the admin MonkDetailPage, which works against the live API.
   */
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
      // The demo shape nested these; the API keeps them flat or under group.
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

  // `ms` is null while loading, on error, and when the id doesn't resolve.
  // The previous code always fell back to a demo object so it was never null;
  // now every read has to tolerate that, and the render bails out below.
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

  // Loading / error / not-found all resolve here rather than rendering a
  // half-empty profile built from nulls.
  if (loading || error || !ms) {
    return (
      <div className="space-y-8">
        <ListState
          loading={loading}
          error={error}
          count={ms ? 1 : 0}
          emptyTitle="Maharaj Saheb not found"
          emptyHint="This profile may have been removed, or the link is out of date."
        >
          {null}
        </ListState>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to MS Updates</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFollow(ms?.publicId, { type: "monk", apiId: ms?.id, name: ms?.name, image: ms?.image, category: "monk" })}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5",
              followed
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
            )}
          >
            {followed ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            <span>{followed ? "Following MS" : "Follow MS Updates"}</span>
          </button>

          <button
            onClick={onShare}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-4xl shadow-lg shrink-0">
              {ms?.image}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-mono font-bold">
                  {ms?.publicId}
                </span>
                <span className={cn("text-xs font-bold px-3 py-1 rounded-full", ms?.status === "Staying" ? "bg-blue-900/80 text-blue-200" : "bg-amber-900/80 text-amber-200")}>
                  {ms?.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">{ms?.name}</h1>
              <div className="text-xs text-white/90 font-medium mt-1">
                {ms?.sect} • Guru: {ms?.guru}
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Current Location</div>
            <div className="font-extrabold text-amber-200">{ms?.currentPlace}</div>
            <div className="text-[10px] opacity-80">{ms?.location}</div>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* About / Bio */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">About & Biography</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{ms?.bio}</p>
          </div>

          {/* Vihaar Group & Route Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Current Vihaar Group Info</h2>
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                Group ID: {ms?.vihaarGroupId}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold">Group Leader</span>
                <div className="font-extrabold text-slate-800">{ms?.groupLeader}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold">Total Group Members</span>
                <div className="font-extrabold text-slate-800">{ms?.groupMembersCount} Sadhus & Devotees</div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
              🚀 Upcoming Vihaar Schedule: {ms?.upcomingVihaar}
            </div>
          </div>

          {/* Chaturmas History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">Chaturmas History</h2>
            <div className="space-y-2">
              {ms?.chaturmasHistory?.map((c) => (
                <div key={c.year} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{c.year} Chaturmas</span>
                    <div className="text-[10px] text-slate-500">{c.venue}</div>
                  </div>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", c.status === "Ongoing" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Daily Routine & Pravachan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Daily Pravachan & Interaction</span>
            </h3>
            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs font-bold text-orange-900">
              Pravachan: {ms?.pravachan}
            </div>
            <div className="text-[10px] text-slate-500 space-y-1">
              <div>• Morning Darshan: 6:30 AM – 7:15 AM</div>
              <div>• Evening Aarti & Satsang: 6:30 PM</div>
              <div className="text-slate-400 pt-1">⚠️ Guidelines: Silence Please · No Photography</div>
            </div>
          </div>

          {/* Sangh Representative Contact */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-emerald-600" />
              <span>Sangh Representative Contact</span>
            </h3>
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-800">{ms?.contactRepresentative?.jainPerson}</div>
              <div className="font-mono text-slate-600">{ms?.contactRepresentative?.phone}</div>
            </div>
          </div>

          {/* Report Incorrect Info */}
          <div className="pt-2">
            <button
              onClick={onReportInfo}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Report Incorrect Info (Creates Support Ticket)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Section 27 Disclaimer Banner */}
      <div className="text-[10px] text-slate-400 text-center leading-relaxed bg-white p-4 rounded-2xl border border-slate-200">
        📌 <em>All information is maintained with utmost respect and accuracy. Members are advised to verify important details with the respective Sangh or authorized representatives whenever required.</em>
      </div>

    </div>
  );
}
