import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Users2, Globe, Phone, Mail, MapPin, Share2, LogIn, LogOut, Loader2,
  Newspaper, CheckCircle2, Heart, ShieldCheck, Sparkles, Clock, ChevronRight, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberItem, useMemberList, relativeTime } from "@/hooks/useMemberList";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import ListState from "@/components/member/ListState";
import { STATIC_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

function mapPage(p) {
  return {
    ...p,
    about: p.about || "",
    category: p.category?.name || "Sangh Community",
    memberCount: p._count?.members ?? 0,
    phone: p.contacts?.phone || "",
    email: p.contacts?.email || "",
    website: p.socialLinks?.website || "",
    logoSrc: p.logoUrl ? (p.logoUrl.startsWith("http") ? p.logoUrl : `${STATIC_URL}/${p.logoUrl}`) : null,
    bannerSrc: p.bannerUrl ? (p.bannerUrl.startsWith("http") ? p.bannerUrl : `${STATIC_URL}/${p.bannerUrl}`) : null,
    isMember: Boolean(p.isMember ?? p.membershipStatus === "APPROVED"),
    isPending: p.membershipStatus === "PENDING",
  };
}

function mapFeedPost(f, i) {
  return {
    id: f.id || i,
    title: f.title,
    body: f.body || f.content || "",
    time: relativeTime(f.publishedAt || f.createdAt),
  };
}

export default function MemberCommunityPageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { item: page, loading, error, reload } = useMemberItem(id ? `/community-pages/${id}` : null, {
    map: mapPage,
  });
  const { items: feed } = useMemberList(id ? `/community-pages/${id}/feed` : null, {
    map: mapFeedPost,
    enabled: Boolean(id),
  });

  const [busy, setBusy] = useState(false);

  const join = async () => {
    setBusy(true);
    try {
      await memberClient.post(`/community-pages/${id}/join`, {});
      toast.success(t("Request sent. You'll be notified once approved."));
      reload();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      await memberClient.post(`/community-pages/${id}/leave`, {});
      toast.success(t("You've left this community page."));
      reload();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: page?.name, url });
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
        <span>{t("Back to Community Pages")}</span>
      </button>

      <ListState
        loading={loading}
        error={error}
        count={page ? 1 : 0}
        emptyTitle={t("Community page not found")}
        emptyHint={t("This page may have been removed, or the link is out of date.")}
        onRetry={reload}
      >
        {page && (
          <div className="space-y-6">
            
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-white/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shrink-0 overflow-hidden shadow-xl text-white">
                    {page.logoSrc ? (
                      <img src={page.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Users2 className="h-10 w-10" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white/20 backdrop-blur-md rounded-full px-3 py-0.5 text-xs font-mono font-bold">
                        {page.publicId}
                      </span>
                      <span className="bg-indigo-300 text-slate-950 px-3 py-0.5 rounded-full text-xs font-black">
                        {page.category}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 leading-tight text-white">{page.name}</h1>
                    <div className="text-xs text-indigo-100 font-semibold mt-1">
                      {page.memberCount} {t("Verified Members")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {page.isMember ? (
                    <button
                      onClick={leave}
                      disabled={busy}
                      className="px-4 py-2.5 rounded-2xl text-xs font-black border bg-red-500/20 text-red-100 border-red-400/40 hover:bg-red-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                      <span>{t("Leave Community")}</span>
                    </button>
                  ) : page.isPending ? (
                    <span className="px-4 py-2.5 rounded-2xl text-xs font-black bg-amber-400 text-slate-950">
                      {t("Membership Pending Approval")}
                    </span>
                  ) : (
                    <button
                      onClick={join}
                      disabled={busy}
                      className="px-5 py-2.5 rounded-2xl text-xs font-black bg-white text-indigo-700 hover:bg-indigo-50 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      <span>{t("Join Community")}</span>
                    </button>
                  )}

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

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              
              {/* Left Column (About & Feed) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* About */}
                {page.about && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-black text-slate-900">{t("About this Community")}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{page.about}</p>
                  </div>
                )}

                {/* Community Feed / Announcements */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Newspaper className="h-4.5 w-4.5 text-indigo-600" />
                    <span>{t("Community Announcements & Feed")}</span>
                  </h2>

                  {feed.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-medium">
                      {t("No updates posted on this page yet.")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feed.map((post) => (
                        <div key={post.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{post.title}</h3>
                            <span className="text-[10px] text-slate-400 font-bold">{post.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{post.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Contact & Details) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                  <h2 className="text-sm font-black text-slate-900">{t("Contact Details")}</h2>
                  <div className="space-y-2 text-xs">
                    {page.phone && (
                      <a href={`tel:${page.phone}`} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span>{page.phone}</span>
                      </a>
                    )}
                    {page.email && (
                      <a href={`mailto:${page.email}`} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                        <Mail className="h-4 w-4 text-sky-600" />
                        <span className="truncate">{page.email}</span>
                      </a>
                    )}
                    {page.website && (
                      <a href={page.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-indigo-600 font-bold hover:bg-slate-100 transition-colors">
                        <Globe className="h-4 w-4" />
                        <span className="truncate">{t("Official Website")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </ListState>

    </div>
  );
}
