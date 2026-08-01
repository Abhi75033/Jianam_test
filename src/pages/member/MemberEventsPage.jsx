import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PartyPopper, MapPin, Calendar, Loader2, Users } from "lucide-react";
import { eventsApi } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * Events (Member View) — §B19.
 * Scopes per §B19.2; card fields per §B19.4; RSVP engine per §B19.6.
 * Paid-event ticket purchase needs the payment gateway (§OI-09) and is not in
 * this slice — paid events link out to the ticket flow once that lands.
 */
const SCOPES = [
  { key: "upcoming", label: "Upcoming" },
  { key: "today", label: "Today" },
  { key: "past", label: "Past" },
];

export default function MemberEventsPage() {
  const { t } = useLanguage();
  const [scope, setScope] = useState("upcoming");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // RSVP dialog (§B19.6)
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [attendees, setAttendees] = useState(1);
  const [memberIds, setMemberIds] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    eventsApi
      .browse({ scope })
      .then(setRows)
      .catch((e) => { setRows([]); toast.error(extractErrorMessage(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [scope]);

  const submitRsvp = async (e) => {
    e.preventDefault();
    if (!rsvpEvent) return;
    // Option A: total count. Option B: explicit JiNANAM Member IDs (§B19.6).
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
      else toast.success(t("RSVP confirmed."));
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
      toast.success(t("RSVP cancelled. The next member on the waiting list has been promoted."));
      load();
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const scopeTabs = useMemo(() => SCOPES, []);

  return (
    <div data-testid="member-events-page">
      <h1 className="font-heading text-xl font-bold text-slate-900">{t("Events")}</h1>
      <p className="text-xs text-slate-500 mt-1">
        {t("Events matched to your community and location.")}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {scopeTabs.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setScope(s.key)}
            data-testid={`events-scope-${s.key}`}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              scope === s.key
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-slate-600 border-slate-200 hover:border-orange-400"
            }`}
          >
            {t(s.label)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 rounded-xl">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3 mt-3" />
            </Card>
          ))}

        {!loading && rows.length === 0 && (
          <EmptyState
            icon={PartyPopper}
            title={t("No events found")}
            description={t("Events matching your community and location will appear here.")}
          />
        )}

        {!loading &&
          rows.map((ev) => {
            const rsvped = String(ev.rsvp_status || "").toUpperCase();
            const isPaid = !!ev.is_paid;
            const soldOut = ev.seats_left === 0;
            return (
              <Card key={ev.uid || ev.id} className="overflow-hidden rounded-xl" data-testid={`event-${ev.uid || ev.id}`}>
                {ev.banner_url && (
                  <img src={ev.banner_url} alt={ev.title} className="h-32 w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ev.category && (
                      <Badge variant="outline" className="text-[10px]">{t(ev.category)}</Badge>
                    )}
                    <Badge className={`text-[10px] border-0 ${isPaid ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {isPaid ? t("Paid Event") : t("Free Event")}
                    </Badge>
                    {rsvped && (
                      <Badge className="text-[10px] bg-blue-100 text-blue-700 border-0">
                        {t(rsvped === "WAITING_LIST" ? "Waiting List" : "RSVP Confirmed")}
                      </Badge>
                    )}
                  </div>

                  <h2 className="font-heading font-bold text-sm text-slate-900 mt-2">{ev.title}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ev.organization_name}</p>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    {ev.starts_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(ev.starts_at).toLocaleString()}
                      </div>
                    )}
                    {(ev.city || ev.venue) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {[ev.venue, ev.city].filter(Boolean).join(", ")}
                        {ev.distance_km != null && ` · ${ev.distance_km} km`}
                      </div>
                    )}
                    {isPaid && ev.seats_left != null && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-400" />
                        {t("{0} seats left", [ev.seats_left])}
                      </div>
                    )}
                  </div>

                  {scope !== "past" && (
                    <div className="mt-3 flex gap-2">
                      {!isPaid && !rsvped && (
                        <Button
                          size="sm"
                          className="flex-1 font-bold"
                          onClick={() => setRsvpEvent(ev)}
                          data-testid={`event-rsvp-${ev.uid || ev.id}`}
                        >
                          {t("RSVP")}
                        </Button>
                      )}
                      {!isPaid && rsvped && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => cancelRsvp(ev)}
                        >
                          {t("Cancel RSVP")}
                        </Button>
                      )}
                      {isPaid && (
                        <Button size="sm" className="flex-1 font-bold" disabled={soldOut}>
                          {soldOut ? t("Sold Out") : t("Book Ticket")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
      </div>

      {/* RSVP dialog — §B19.6 */}
      <Dialog open={!!rsvpEvent} onOpenChange={() => setRsvpEvent(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("RSVP")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitRsvp} className="space-y-3">
            <p className="text-xs text-slate-600">{rsvpEvent?.title}</p>
            <div>
              <Label className="text-xs">{t("Number of Attendees")}</Label>
              <Input
                type="number"
                min={1}
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="mt-1 bg-white"
                data-testid="rsvp-attendees"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Or enter JiNANAM Member IDs (comma separated)")}</Label>
              <Input
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
                placeholder={t("e.g. JFJM102, JFNJM501")}
                className="mt-1 bg-white font-mono text-xs"
                data-testid="rsvp-member-ids"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {t("Name, gender and age are shown automatically for each linked member.")}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRsvpEvent(null)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={saving} data-testid="rsvp-submit">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t("Confirm RSVP")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
