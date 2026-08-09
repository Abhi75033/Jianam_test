import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Flame, MapPin, Calendar, Loader2, Users, Clock,
  Ticket, CheckCircle2, XCircle, ArrowRight, Share2, Building2
} from "lucide-react";
import { eventsApi } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import ListState from "@/components/member/ListState";
import { cn } from "@/lib/utils";

const SCOPES = [
  { key: "upcoming", label: "Upcoming Events" },
  { key: "today",    label: "Today's Schedule" },
  { key: "past",     label: "Past Archive" },
];

export default function MemberEventsPage() {
  const { t } = useLanguage();
  const [scope, setScope] = useState("upcoming");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // RSVP dialog
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [attendees, setAttendees] = useState(1);
  const [memberIds, setMemberIds] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    eventsApi
      .browse({ scope })
      .then((data) => setRows(data || []))
      .catch((e) => { setRows([]); toast.error(extractErrorMessage(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [scope]);

  const submitRsvp = async (e) => {
    e.preventDefault();
    if (!rsvpEvent) return;
    const ids = memberIds.split(",").map((s) => s.trim()).filter(Boolean);
    const count = Number(attendees);
    if (!ids.length && (!Number.isFinite(count) || count < 1)) {
      toast.error(t("Please enter the number of attendees."));
      return;
    }
    setSaving(true);
    try {
      const res = await eventsApi.rsvp(rsvpEvent.uid || rsvpEvent.id, {
        attendees: count,
        memberIds: ids,
      });
      const status = String(res?.status || "CONFIRMED").toUpperCase();
      if (status === "WAITING_LIST") toast.success(t("You have joined the waiting list."));
      else if (status === "CLOSED") toast.error(t("RSVP is closed for this event."));
      else toast.success(t("RSVP confirmed! See you at the event."));
      setRsvpEvent(null);
      setMemberIds(""); setAttendees(1);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelRsvp = async (ev) => {
    try {
      await eventsApi.cancelRsvp(ev.uid || ev.id);
      toast.success(t("RSVP cancelled successfully."));
      load();
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const onShare = (ev) => {
    const link = window.location.href;
    if (navigator.share) {
      navigator.share({ title: ev.title || ev.name, text: ev.description, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(link);
      toast.success(t("Event link copied to clipboard"));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="member-events-page">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <span>{t("Community Events & Programs")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Browse Pravachan, Pratishtha Mahotsav, Cultural & Youth programs in your area.")}
          </p>
        </div>

        <Link
          to="/member/tickets"
          className="px-4 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs border border-orange-200/80 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto shadow-2xs"
        >
          <Ticket className="h-4 w-4" />
          <span>{t("My Event Passes")}</span>
        </Link>
      </div>

      {/* Scope Filter Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/60 shadow-inner max-w-lg">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setScope(s.key)}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-98 text-center truncate",
              scope === s.key
                ? "bg-white text-orange-600 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t(s.label)}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <ListState
        loading={loading}
        count={rows.length}
        onRetry={load}
        emptyTitle={t("No events in this category")}
        emptyHint={t("Check back later or explore other categories.")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {rows.map((ev) => {
            const when = ev.startsAt || ev.startDate || ev.date;
            const isFull = Boolean(ev.isFull);
            const myRsvp = ev.myRsvp || null;

            return (
              <div
                key={ev.id || ev.uid}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">
                          {ev.category || "Religious"}
                        </span>
                        {isFull && (
                          <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                            {t("Seats Full")}
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 mt-2 leading-snug group-hover:text-orange-600 transition-colors">
                        {ev.title || ev.name}
                      </h2>
                    </div>

                    <button
                      onClick={() => onShare(ev)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 active:scale-95 transition-all"
                      title={t("Share Event")}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                    {when && (
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                        <span>{new Date(when).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                    {(ev.organization?.name || ev.templeName) && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.organization?.name || ev.templeName}</span>
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ev.description}</p>
                  )}
                </div>

                {/* RSVP Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {myRsvp ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t("RSVP Confirmed")}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelRsvp(ev)}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        {t("Cancel RSVP")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setRsvpEvent(ev)}
                      disabled={isFull}
                      className="w-full h-10 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-98 transition-all"
                    >
                      <span>{t("RSVP / Register Free")}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ListState>

      {/* RSVP Modal Dialog */}
      <Dialog open={Boolean(rsvpEvent)} onOpenChange={(o) => { if (!o) setRsvpEvent(null); }}>
        <DialogContent className="max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200 p-6 shadow-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">
              {t("RSVP for Event")}
            </DialogTitle>
          </DialogHeader>

          {rsvpEvent && (
            <form onSubmit={submitRsvp} className="space-y-4">
              <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200/80">
                <div className="text-xs font-black text-slate-900">{rsvpEvent.title || rsvpEvent.name}</div>
                <div className="text-[11px] text-orange-700 font-bold mt-1">
                  {rsvpEvent.startsAt ? new Date(rsvpEvent.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">{t("Total Attendees Count *")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="mt-1 bg-slate-50 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">{t("Optional JiNANAM Member IDs (comma-separated)")}</Label>
                <Input
                  value={memberIds}
                  onChange={(e) => setMemberIds(e.target.value)}
                  placeholder="e.g. JFJM108, JFJM109"
                  className="mt-1 bg-slate-50 rounded-xl font-mono text-xs"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRsvpEvent(null)}
                  className="rounded-xl font-bold text-xs"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  <span>{t("Confirm RSVP")}</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
