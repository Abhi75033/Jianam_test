import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, MessageSquare, Mail, Smartphone, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function NotificationPreferencesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // prefs shape: { CATEGORY: { CHANNEL: boolean } }
  const [prefs, setPrefs] = useState({});

  useEffect(() => {
    api.get("/notifications/preferences")
      .then((res) => {
        // Backend returns rows of { channel, category, enabled } — fold into { CATEGORY: { CHANNEL: bool } }
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

  const toggle = (cat, ch, value) => {
    setPrefs((prev) => ({
      ...prev,
      [cat]: { ...(prev[cat] || {}), [ch]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Backend upserts one { channel, category, enabled } per request
      const puts = [];
      Object.entries(prefs).forEach(([category, channels]) => {
        Object.entries(channels || {}).forEach(([channel, enabled]) => {
          puts.push(api.put("/notifications/preferences", { category, channel, enabled: Boolean(enabled) }));
        });
      });
      await Promise.all(puts);
      toast.success(t("Preferences saved."));
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="notif-prefs-page">
      <PageHeader
        title={t("Notification Preferences")}
        subtitle={t("Choose how you want to hear from JiNANAM — per category, per channel.")}
        actions={
          <Button onClick={save} disabled={saving} data-testid="notif-prefs-save">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t("Save preferences")}
          </Button>
        }
      />

      {loading ? (
        <div className="text-sm text-muted-foreground">{t("Loading…")}</div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((cat) => (
            <Card key={cat.key} className="p-5 rounded-xl border-border" data-testid={`notif-prefs-cat-${cat.key}`}>
              <div className="mb-4">
                <h3 className="font-heading text-base font-semibold">{t(cat.label)}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.hint}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHANNELS.map((ch) => {
                  const on = Boolean(prefs?.[cat.key]?.[ch.key]);
                  return (
                    <div key={ch.key} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`icon-chip ${on ? "green" : "default"} h-9 w-9`}>
                          <ch.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{t(ch.label)}</div>
                          <div className="text-[11px] text-muted-foreground">{ch.hint}</div>
                        </div>
                      </div>
                      <Switch
                        checked={on}
                        onCheckedChange={(v) => toggle(cat.key, ch.key, v)}
                        data-testid={`notif-prefs-${cat.key}-${ch.key}`}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
