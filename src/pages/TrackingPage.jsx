import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LiveBadge } from "@/components/common/LiveBadge";
import { formatDateTime } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { Route as RouteIcon, MapPin, Battery, AlertTriangle, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TimePicker from "@/components/common/TimePicker";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TrackingPage() {
  const { t } = useLanguage();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState({}); // monkId -> {lat,lng,battery,ts}
  const [alerts, setAlerts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [eventForm, setEventForm] = useState({ type: "ARRIVAL", templeId: "", note: "", date: "", time: "08:00 AM" });
  const [savingEvent, setSavingEvent] = useState(false);

  const handleSaveEvent = async () => {
    if (!eventForm.time) {
      toast.error(t("Time is required."));
      return;
    }
    setSavingEvent(true);
    try {
      const timePart = eventForm.time; // "HH:MM AM"
      const match = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      let isoString = undefined;
      if (match) {
        let hrs = parseInt(match[1]);
        const mins = match[2];
        const period = match[3].toUpperCase();
        if (period === "PM" && hrs < 12) hrs += 12;
        if (period === "AM" && hrs === 12) hrs = 0;
        const timeStr = `${String(hrs).padStart(2, "0")}:${mins}:00`;
        isoString = new Date(`${eventForm.date}T${timeStr}`).toISOString();
      }

      await api.post(`/tracking/journeys/${selectedJourney.id}/events`, {
        type: eventForm.type,
        templeId: eventForm.templeId || undefined,
        note: eventForm.note || undefined,
        timestamp: isoString,
      });

      toast.success(t("Journey event logged successfully."));
      setOpenDialog(false);
      
      const res = await api.get("/tracking/journeys/active");
      setJourneys(res.data?.data?.items || res.data?.data || []);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSavingEvent(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    api.get("/tracking/journeys/active")
      .then((res) => mounted && setJourneys(res.data?.data?.items || res.data?.data || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const { connected } = useSocket("/tracking", {
    "monk:location": (evt) => {
      if (!evt?.monkId) return;
      setLocations((prev) => ({ ...prev, [evt.monkId]: { ...evt, ts: evt.timestamp || new Date().toISOString() } }));
    },
    "journey:advanced": (evt) => {
      setJourneys((prev) => prev.map((j) => j.id === evt.journeyId ? { ...j, currentStopIndex: evt.currentStopIdx } : j));
    },
    "journey:completed": (evt) => {
      setJourneys((prev) => prev.filter((j) => j.id !== evt.journeyId));
    },
    "alert:new": (evt) => setAlerts((prev) => [evt, ...prev].slice(0, 20)),
  });

  const columns = [
    { key: "monk", header: t("Monk"), render: (r) => (
      <div>
        <div className="font-medium">{r.monk?.dikshaName || "—"}</div>
        <div className="text-xs text-muted-foreground font-mono">{r.monk?.publicId}</div>
      </div>
    ) },
    { key: "route", header: t("Route"), render: (r) => r.route?.name || "—" },
    { key: "progress", header: t("Progress"), render: (r) => (
      <span className="text-xs">{t("Stop")} {r.currentStopIndex ?? 0} of {r.totalStops ?? 0}</span>
    ) },
    { key: "loc", header: t("Last Location"), render: (r) => {
      const loc = locations[r.monk?.id] || locations[r.monkId];
      if (!loc) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="font-mono-num">{loc.lat?.toFixed(3)}, {loc.lng?.toFixed(3)}</span>
        </div>
      );
    } },
    { key: "battery", header: t("Battery"), render: (r) => {
      const loc = locations[r.monk?.id] || locations[r.monkId];
      if (loc?.battery == null) return <span className="text-xs text-muted-foreground">—</span>;
      const tone = loc.battery < 20 ? "text-red-600" : loc.battery < 40 ? "text-orange-600" : "text-emerald-600";
      return <span className={`text-xs flex items-center gap-1 ${tone}`}><Battery className="h-3 w-3" /> {loc.battery}%</span>;
    } },
    { key: "eta", header: "ETA", render: (r) => <span className="text-xs">{formatDateTime(r.eta)}</span> },
    { key: "status", header: t("Status"), render: (r) => <StatusBadge status={r.status || "ONGOING"} /> },
    {
      key: "actions", header: t("Actions"),
      render: (r) => (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
            setSelectedJourney(r);
            setEventForm({
              type: "ARRIVAL",
              templeId: r.route?.stops?.[r.currentStopIndex]?.templeId || "",
              note: "",
              date: new Date().toISOString().slice(0, 10),
              time: "08:00 AM"
            });
            setOpenDialog(true);
          }}
          className="h-8 text-xs font-semibold border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          {t("Log Event")}
        </Button>
      )
    }
  ];

  return (
    <div data-testid="tracking-page">
      <PageHeader
        title={t("Monk Tracking")}
        subtitle={t("Live GPS journeys, battery status, and safety alerts.")}
        actions={<LiveBadge connected={connected} testId="tracking-live-status" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label={t("Active Journeys")} value={journeys.length} icon={RouteIcon} tone="blue" testId="tracking-stat-active" />
        <StatCard label={t("Locations tracked")} value={Object.keys(locations).length} icon={Signal} tone="green" testId="tracking-stat-locations" />
        <StatCard label={t("Recent alerts")} value={alerts.length} icon={AlertTriangle} tone={alerts.length ? "red" : "default"} testId="tracking-stat-alerts" />
        <StatCard label={t("Realtime")} value={connected ? "Online" : "Offline"} tone={connected ? "green" : "default"} testId="tracking-stat-live" />
      </div>

      {alerts.length > 0 && (
        <Card className="mb-4 p-4 border-red-200 bg-red-50/40" data-testid="tracking-alert-strip">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div className="text-sm font-semibold text-red-800">{t("Live alerts")}</div>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div>
                  <Badge variant="outline" className="mr-2">{a.type || "ALERT"}</Badge>
                  <span>{a.message || `Alert #${a.alertId}`}</span>
                </div>
                <span className="text-muted-foreground">{formatDateTime(a.timestamp || new Date().toISOString())}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={journeys}
        loading={loading}
        testId="tracking-journeys-table"
        emptyTitle={t("No active journeys")}
        emptyDescription={t("Start a journey from the monk profile to see live tracking here.")}
      />
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Log Vihar Journey Event")}</DialogTitle>
          </DialogHeader>
          {selectedJourney && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border">
                <strong>{t("Monk:")}</strong> {selectedJourney.monk?.dikshaName} ({selectedJourney.monk?.publicId})<br />
                <strong>{t("Route:")}</strong> {selectedJourney.route?.name}
              </div>

              <div>
                <Label className="text-xs">{t("Event Type *")}</Label>
                <select
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                >
                  <option value="ARRIVAL">{t("Arrival at Stop")}</option>
                  <option value="DEPARTURE">{t("Departure from Stop")}</option>
                  <option value="DELAY">{t("Vihar Delay Alert")}</option>
                  <option value="MANUAL_UPDATE">{t("Location Checkpoint")}</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">{t("Select Stop / Checkpoint *")}</Label>
                <select
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                  value={eventForm.templeId}
                  onChange={(e) => setEventForm({ ...eventForm, templeId: e.target.value })}
                >
                  <option value="">{t("Select Stop...")}</option>
                  {(selectedJourney.route?.stops || []).map((stop, idx) => (
                    <option key={idx} value={stop.templeId || stop.templeName}>
                      {t("Stop")} {idx + 1}: {stop.templeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("Event Date *")}</Label>
                  <Input
                    type="date"
                    className="mt-1 h-9"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("Event Time *")}</Label>
                  <TimePicker
                    value={eventForm.time}
                    onChange={(val) => setEventForm({ ...eventForm, time: val })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">{t("Notes / Details (Optional)")}</Label>
                <Textarea
                  value={eventForm.note}
                  onChange={(e) => setEventForm({ ...eventForm, note: e.target.value })}
                  placeholder={t("e.g. Arrived safely, taking rest...")}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>{t("Cancel")}</Button>
            <Button 
              onClick={handleSaveEvent} 
              disabled={savingEvent} 
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              {savingEvent ? t("Submitting...") : t("Log Event")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
