import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Users2, Globe, Phone, Mail, MapPin, Share2, LogIn, LogOut, Loader2, Newspaper,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberItem, useMemberList, relativeTime } from "@/hooks/useMemberList";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import ListState from "@/components/member/ListState";
import { STATIC_URL } from "@/lib/api";

/**
 * MemberCommunityPageDetailPage — a page's public profile, with §6/§7 of the
 * Community Pages spec: Join Community, member count, feed, socials.
 *
 * Field names mirror MemberCommunityPagesPage's mapper (see that file for
 * where they came from). Join/leave and membership state are the one thing
 * this screen adds beyond the list.
 */
function mapPage(p) {
  return {
    ...p,
    about: p.about || "",
    category: p.category?.name || "",
    memberCount: p._count?.members ?? 0,
    phone: p.contacts?.phone || "",
    email: p.contacts?.email || "",
    website: p.socialLinks?.website || "",
    logoSrc: p.logoUrl ? (p.logoUrl.startsWith("http") ? p.logoUrl : `${STATIC_URL}/${p.logoUrl}`) : null,
    bannerSrc: p.bannerUrl ? (p.bannerUrl.startsWith("http") ? p.bannerUrl : `${STATIC_URL}/${p.bannerUrl}`) : null,
    // The list endpoint doesn't say whether the signed-in member has already
    // joined; only the detail response is expected to carry this.
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
        count={page ? 1 : 0}
        emptyTitle={t("Community page not found")}
        onRetry={reload}
      >
        {page && (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center shrink-0 overflow-hidden">
                    {page.logoSrc ? (
                      <img src={page.logoSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Users2 className="h-9 w-9" />
                    )}
                  </div>
                  <div>
                    {page.category && (
                      <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-[10px] font-bold">{page.category}</span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">{page.name}</h1>
                    <div className="text-xs text-white/90 mt-1 flex items-center gap-1">
                      <Users2 className="h-3 w-3" /> {page.memberCount} {t("members")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={page.isMember ? leave : join}
                    disabled={busy || page.isPending}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition-all disabled:opacity-70 ${
                      page.isMember ? "bg-white/20 text-white border-white/30" : "bg-white text-indigo-600 border-white"
                    }`}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : page.isMember ? (
                      <LogOut className="h-3.5 w-3.5" />
                    ) : (
                      <LogIn className="h-3.5 w-3.5" />
                    )}
                    {page.isPending ? t("Request Pending") : page.isMember ? t("Leave") : t("Join Community")}
                  </button>
                  <button onClick={onShare} className="p-2.5 rounded-2xl bg-white/20 border border-white/30 text-white hover:bg-white/30">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                {page.about && (
                  <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
                    <h2 className="text-base font-bold text-slate-900">{t("About")}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{page.about}</p>
                  </section>
                )}

                <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-indigo-500" /> {t("Page Feed")}
                  </h2>
                  {!feed?.length ? (
                    <div className="text-xs text-slate-400 italic text-center py-6">{t("No posts yet")}</div>
                  ) : (
                    <div className="space-y-2.5">
                      {feed.slice(0, 6).map((f) => (
                        <div key={f.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
                          <div className="text-xs font-bold text-slate-900">{f.title}</div>
                          {f.body && <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{f.body}</div>}
                          {f.time && <div className="text-[10px] text-slate-400 mt-1">{f.time}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2.5">
                  <h2 className="text-sm font-bold text-slate-900 mb-1">{t("Contact")}</h2>
                  {page.phone && (
                    <a href={`tel:${page.phone}`} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {page.phone}
                    </a>
                  )}
                  {page.email && (
                    <a href={`mailto:${page.email}`} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {page.email}
                    </a>
                  )}
                  {page.website && (
                    <a href={page.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600">
                      <Globe className="h-3.5 w-3.5 text-slate-400" /> {t("Website")}
                    </a>
                  )}
                  {!page.phone && !page.email && !page.website && (
                    <div className="text-[11px] text-slate-400">{t("No contact details listed")}</div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </ListState>
    </div>
  );
}
