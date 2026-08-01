import { useState } from "react";
import { Bell, CheckCheck, ChevronRight, Info, AlertCircle, Calendar, Heart, Ticket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const DEMO_NOTIFS = [
  { id: 1, type: "booking", emoji: "🏨", title: "Booking Confirmed", body: "Your Dharamshala stay at Palitana Board is confirmed. Check-in: 5 Aug 2025.", time: "2h ago", read: false },
  { id: 2, type: "ms", emoji: "🙏", title: "MS Update — Acharya Dev", body: "Param Pujya Acharya Dev has arrived at Mumbai. Pravachan at 7:30 AM tomorrow.", time: "5h ago", read: false },
  { id: 3, type: "event", emoji: "🎉", title: "Event Reminder", body: "Paryushan Pratikraman starts in 2 days. Don't forget to register.", time: "1d ago", read: true },
  { id: 4, type: "donation", emoji: "🧾", title: "Donation Receipt Ready", body: "Your ₹5,000 donation receipt from Shree Ajitnath Derasar is ready for download.", time: "2d ago", read: true },
  { id: 5, type: "feed", emoji: "📣", title: "New Post from Your Temple", body: "Shree Ajitnath Derasar has shared a new notice about Diwali timings.", time: "3d ago", read: true },
];

const ICON_MAP = { booking: "🏨", ms: "🙏", event: "🎉", donation: "🧾", feed: "📣" };
const COLOR_MAP = {
  booking: "bg-sky-50 border-sky-100",
  ms: "bg-amber-50 border-amber-100",
  event: "bg-purple-50 border-purple-100",
  donation: "bg-rose-50 border-rose-100",
  feed: "bg-orange-50 border-orange-100",
};

export default function MemberNotificationsPage() {
  const { t } = useLanguage();
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);
  const unread = notifs.filter((n) => !n.read).length;

  const markAll = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

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
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1 text-[10px] text-orange-600 font-bold hover:underline">
            <CheckCheck className="h-3.5 w-3.5" /> {t("Mark all read")}
          </button>
        )}
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
