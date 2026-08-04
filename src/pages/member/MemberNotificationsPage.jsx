import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight, Info, AlertCircle, Calendar, Heart, Ticket, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ListState from "@/components/member/ListState";
import { memberClient as api } from "@/lib/memberClient";
import { useMemberSocket } from "@/hooks/useMemberSocket";
import { useMemberList, relativeTime, compactNumber, longDate } from "@/hooks/useMemberList";
import { cn } from "@/lib/utils";


const ICON_MAP = { booking: "🏨", ms: "🙏", event: "🎉", donation: "🧾", feed: "📣" };
const COLOR_MAP = {
  booking: "bg-sky-50 border-sky-100",
  ms: "bg-amber-50 border-amber-100",
  event: "bg-purple-50 border-purple-100",
  donation: "bg-rose-50 border-rose-100",
  feed: "bg-orange-50 border-orange-100",
};

/** Maps an API notification row onto the fields this page renders. */
function mapNotif(n, i) {
  return {
    id: n.id || i,
    title: n.title,
    body: n.body || n.message || "",
    type: n.category || n.type || "SYSTEM",
    time: relativeTime(n.createdAt || n.sentAt),
    in: relativeTime(n.createdAt || n.sentAt),
    read: Boolean(n.readAt || n.isRead || n.openedAt),
    emoji: n.emoji || "🔔",
  };
}

export default function MemberNotificationsPage() {
  const { t } = useLanguage();
  const { items: fetched, loading, error, reload } = useMemberList("/notifications/my", { map: mapNotif });

  // Local copy so marking as read updates instantly; the server call follows.
  const [notifs, setNotifs] = useState([]);
  useEffect(() => { setNotifs(fetched); }, [fetched]);

  // Live: a notification pushed while the page is open should appear at the
  // top immediately rather than waiting for the next mount.
  useMemberSocket("/dashboards", {
    "notification:new": (evt) => {
      if (!evt) return;
      setNotifs((prev) => [mapNotif(evt, 0), ...prev]);
    },
  });

  const unread = notifs.filter((n) => !n.read).length;

  /** §4.17 — reads are recorded server-side via /notifications/{id}/opened. */
  const markOne = (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    api.post(`/notifications/${id}/opened`).catch(() => {});
  };
  const markAll = () => {
    const unreadIds = notifs.filter((n) => !n.read).map((n) => n.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    unreadIds.forEach((id) => api.post(`/notifications/${id}/opened`).catch(() => {}));
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          <h1 className="text-lg font-bold text-slate-800">{t("Notifications")}</h1>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button onClick={markAll} className="flex items-center gap-1 text-[10px] text-orange-600 font-bold hover:underline">
              <CheckCheck className="h-3.5 w-3.5" /> {t("Mark all read")}
            </button>
          )}
          <Link to="/member/notifications/preferences" className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {notifs.map((n) => (
          <button
            key={n.id}
            onClick={() => markOne(n.id)}
            className={cn(
              "w-full text-left rounded-2xl border p-3 flex items-start gap-3 transition-all hover:shadow-md",
              n.read ? "bg-white border-slate-100" : COLOR_MAP[n.type] || "bg-orange-50 border-orange-100",
            )}
          >
            <div className="text-2xl shrink-0 mt-0.5">{n.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{n.title}</span>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
              <div className="text-[9px] text-slate-400 mt-1">{n.time}</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-1" />
          </button>
        ))}
      </div>

      {notifs.length === 0 && (
        <div className="text-center py-14 text-slate-400">
          <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">{t("All caught up!")}</p>
          <p className="text-xs text-slate-300 mt-1">{t("No new notifications")}</p>
        </div>
      )}
    </div>
  );
}
