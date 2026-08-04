import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Loader2, Mail, MessageSquare, MessagesSquare, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * MemberNotificationPreferencesPage — §15: notification preferences, the one
 * piece of "Settings" with a confirmed self-scoped endpoint. GET/PUT
 * /notifications/preferences carry no orgId or member id — same identity-only
 * shape as GET /auth/me — so this mirrors admin's NotificationPreferencesPage
 * exactly (same category/channel/enabled rows) rather than guessing a
 * member-specific route that doesn't exist.
 */
const CHANNELS = [
  { key: "PUSH", label: "Push Notifications", icon: Smartphone, hint: "In-app + mobile push" },
  { key: "WHATSAPP", label: "WhatsApp", icon: MessagesSquare, hint: "Booking / event updates" },
  { key: "SMS", label: "SMS", icon: MessageSquare, hint: "Critical alerts only" },
  { key: "EMAIL", label: "Email", icon: Mail, hint: "Receipts and reports" },
  { key: "IN_APP", label: "In-App Inbox", icon: Bell, hint: "Always on" },
];

const CATEGORIES = [
  { key: "SERVICE", label: "Service Notifications", hint: "Bookings, donations, tickets, alerts" },
  { key: "MARKETING", label: "Marketing & Updates", hint: "Newsletters, offers, community news" },
];

export default function MemberNotificationPreferencesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // { CATEGORY: { CHANNEL: boolean } }
  const [prefs, setPrefs] = useState({});

  useEffect(() => {
    memberClient.get("/notifications/preferences")
      .then((res) => {
        const rows = res.data?.data || [];
        const folded = {};
        (Array.isArray(rows) ? rows : []).forEach((r) => {
          folded[r.category] = { ...(folded[r.category] || {}), [r.channel]: r.enabled };
        });
        setPrefs(folded);
      })
      .catch(() => setPrefs({}))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (cat, ch) => {
    setPrefs((prev) => ({
      ...prev,
      [cat]: { ...(prev[cat] || {}), [ch]: !prev[cat]?.[ch] },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const puts = [];
      Object.entries(prefs).forEach(([category, channels]) => {
        Object.entries(channels || {}).forEach(([channel, enabled]) => {
          puts.push(memberClient.put("/notifications/preferences", { category, channel, enabled: Boolean(enabled) }));
        });
      });
      await Promise.all(puts);
      toast.success(t("Preferences saved."));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" /> {t("Notification Preferences")}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{t("Choose how you want to hear from JiNANAM — per category, per channel.")}</p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {t("Save Preferences")}
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400">{t("Loading…")}</div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <section key={cat.key} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{t(cat.label)}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{cat.hint}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANNELS.map((ch) => {
                  const on = Boolean(prefs?.[cat.key]?.[ch.key]);
                  return (
                    <button
                      type="button"
                      key={ch.key}
                      onClick={() => toggle(cat.key, ch.key)}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-left transition-colors",
                        on ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200 hover:border-orange-200"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", on ? "bg-orange-100 text-orange-600" : "bg-slate-200 text-slate-500")}>
                          <ch.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800">{t(ch.label)}</div>
                          <div className="text-[10px] text-slate-400">{ch.hint}</div>
                        </div>
                      </div>
                      <div className={cn("w-9 h-5 rounded-full shrink-0 relative transition-colors", on ? "bg-orange-500" : "bg-slate-300")}>
                        <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", on ? "translate-x-4" : "translate-x-0.5")} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
