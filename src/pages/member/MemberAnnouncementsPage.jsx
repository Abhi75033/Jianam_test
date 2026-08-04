import { Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemberList, relativeTime } from "@/hooks/useMemberList";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";
import ListState from "@/components/member/ListState";

/**
 * MemberAnnouncementsPage — §4.14 Announcements. Did not exist as a screen;
 * Home's AnnouncementsSection only ever showed a 4-item preview with no way to
 * see the rest ("View All" pointed at /member/news, which is a different feed
 * entirely).
 *
 * Field names (title, body/message, publishedAt/createdAt) are taken from the
 * admin AnnouncementsPage, which reads the real /announcements/ response.
 */
function mapAnnouncement(a, i) {
  return {
    id: a.id || i,
    title: a.title,
    body: a.body || a.message || a.description || "",
    org: a.organization?.name || "",
    time: relativeTime(a.publishedAt || a.createdAt),
    isFollowedOrg: Boolean(a.organization?.publicId),
    orgPublicId: a.organization?.publicId || "",
  };
}

export default function MemberAnnouncementsPage() {
  const { t } = useLanguage();
  const { items: announcements, loading, error, reload } = useMemberList(
    "/announcements/",
    { map: mapAnnouncement }
  );
  const { isEntityFollowed, sortContent } = useVisibilityEngine();

  // §4.15.4 — announcements from linked/followed temples take priority.
  const sorted = sortContent(
    announcements.map((a) => ({ ...a, entityPublicId: a.orgPublicId }))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-600" /> {t("Announcements")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t("Updates from your linked temples and community appear first.")}
        </p>
      </div>

      <ListState
        loading={loading}
        error={error}
        count={sorted.length}
        emptyTitle={t("No announcements")}
        emptyHint={t("Nothing has been posted yet. Check back soon.")}
        onRetry={reload}
      >
        <div className="space-y-3">
          {sorted.map((a) => {
            const followed = a.orgPublicId && isEntityFollowed(a.orgPublicId);
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">{a.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {[a.org, a.time].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {followed && (
                    <span className="shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                      {t("Following")}
                    </span>
                  )}
                </div>
                {a.body && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{a.body}</p>}
              </div>
            );
          })}
        </div>
      </ListState>
    </div>
  );
}
