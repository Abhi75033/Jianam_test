import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { EmptyState } from "@/components/common/EmptyState";
import { Armchair, Plus, Loader2, Lock, LockOpen, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * SeatingPage — basic sections → rows → seats layout builder.
 * Selects a paid event → shows its map, allows adding sections/rows/seats and locking.
 */
export default function SeatingPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [map, setMap] = useState({ sections: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", mode: "OPEN" });
  const [newRow, setNewRow] = useState({ sectionId: "", label: "" });
  const [newSeats, setNewSeats] = useState({ rowId: "", count: "" });

  useEffect(() => {
    api.get("/events", { params: { isPaid: true } })
      .then((res) => setEvents(res.data?.data?.items || res.data?.data || []))
      .catch(() => setEvents([]));
  }, []);

  const loadMap = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/seating/event/${id}`);
      setMap(res.data?.data || { sections: [] });
    } catch {
      setMap({ sections: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (eventId) loadMap(eventId); }, [eventId]);

  const addSection = async () => {
    if (!newSection.name || !eventId) return;
    setSaving(true);
    try {
      await api.post("/seating/sections", { eventId, name: newSection.name, mode: newSection.mode });
      toast.success(t("Section added."));
      setNewSection({ name: "", mode: "OPEN" });
      loadMap(eventId);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally { setSaving(false); }
  };

  const addRow = async () => {
    if (!newRow.sectionId || !newRow.label) return;
    setSaving(true);
    try {
      await api.post(`/seating/sections/${newRow.sectionId}/rows`, { label: newRow.label });
      toast.success(t("Row added."));
      setNewRow({ sectionId: "", label: "" });
      loadMap(eventId);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const addSeats = async () => {
    const count = Number(newSeats.count);
    if (!newSeats.rowId || !count) return;
    setSaving(true);
    try {
      await api.post(`/seating/rows/${newSeats.rowId}/seats`, { count });
      toast.success(`${count} seats added.`);
      setNewSeats({ rowId: "", count: "" });
      loadMap(eventId);
    } catch (err) { toast.error(extractErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const toggleLock = async (seat) => {
    try {
      const isLocked = seat.status === "LOCKED";
      await api.post(`/seating/seats/${seat.id}/${isLocked ? "release" : "lock"}`);
      toast.success(isLocked ? "Seat released" : "Seat locked");
      loadMap(eventId);
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const allRows = (map.sections || []).flatMap((s) => (s.rows || []).map((r) => ({ ...r, sectionName: s.name })));

  return (
    <div data-testid="seating-page">
      <PageHeader
        title={t("Seating")}
        subtitle={t("Build seat maps for paid events. Sections → Rows → Seats. Redis-backed seat locking on click.")}
      />

      <Card className="p-4 rounded-xl border-border mb-4">
        <Label className="text-xs">{t("Event")}</Label>
        <SearchableSelect
          value={eventId}
          onValueChange={setEventId}
          options={events.map((e) => ({ value: e.id, label: e.title }))}
          placeholder={t("Select a paid event")}
          searchPlaceholder={t("Search events…")}
          className="mt-1 max-w-md"
        />
      </Card>

      {!eventId ? (
        <EmptyState icon={Armchair} title={t("Select an event")} description={t("Pick a paid event above to configure its seat map.")} />
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {t("Loading map…")}</div>
      ) : (
        <>
          {/* Builder controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Card className="p-4 rounded-xl border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Add section")}</div>
              <div className="space-y-2">
                <Input placeholder={t("e.g. VIP")} value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} data-testid="section-name-input" />
                <SearchableSelect
                  value={newSection.mode}
                  onValueChange={(v) => setNewSection({ ...newSection, mode: v })}
                  options={[
                    { value: "OPEN", label: t("Open seating") },
                    { value: "RESERVED", label: t("Reserved seating") },
                  ]}
                  placeholder={t("Mode")}
                />
                <Button onClick={addSection} disabled={saving} className="w-full" data-testid="section-add-btn">
                  <Plus className="h-3 w-3 mr-1" /> {t("Add section")}
                </Button>
              </div>
            </Card>
            <Card className="p-4 rounded-xl border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Add row")}</div>
              <div className="space-y-2">
                <SearchableSelect
                  value={newRow.sectionId}
                  onValueChange={(v) => setNewRow({ ...newRow, sectionId: v })}
                  options={(map.sections || []).map((s) => ({ value: s.id, label: s.name }))}
                  placeholder={t("Section")}
                  searchPlaceholder={t("Search sections…")}
                />
                <Input placeholder={t("Row label (e.g. A)")} value={newRow.label} onChange={(e) => setNewRow({ ...newRow, label: e.target.value })} data-testid="row-label-input" />
                <Button onClick={addRow} disabled={saving} className="w-full" data-testid="row-add-btn">
                  <Plus className="h-3 w-3 mr-1" /> {t("Add row")}
                </Button>
              </div>
            </Card>
            <Card className="p-4 rounded-xl border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Add seats")}</div>
              <div className="space-y-2">
                <SearchableSelect
                  value={newSeats.rowId}
                  onValueChange={(v) => setNewSeats({ ...newSeats, rowId: v })}
                  options={allRows.map((r) => ({ value: r.id, label: `${r.sectionName} · ${r.label}` }))}
                  placeholder={t("Row")}
                  searchPlaceholder={t("Search rows…")}
                />
                <Input type="number" min="1" placeholder={t("Number of seats")} value={newSeats.count} onChange={(e) => setNewSeats({ ...newSeats, count: e.target.value })} data-testid="seats-count-input" />
                <Button onClick={addSeats} disabled={saving} className="w-full" data-testid="seats-add-btn">
                  <Plus className="h-3 w-3 mr-1" /> {t("Add seats")}
                </Button>
              </div>
            </Card>
          </div>

          {/* Map visualization */}
          <div className="space-y-6">
            {(map.sections || []).length === 0 ? (
              <EmptyState icon={Armchair} title={t("No sections yet")} description={t("Add your first section to start building the map.")} />
            ) : (
              (map.sections || []).map((s) => (
                <Card key={s.id} className="p-5 rounded-xl border-border" data-testid={`section-${s.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold">{s.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.mode || "OPEN"}</span>
                  </div>
                  <div className="space-y-3">
                    {(s.rows || []).map((r) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <div className="w-8 text-xs text-muted-foreground font-semibold">{t(r.label)}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(r.seats || []).map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => toggleLock(seat)}
                              className={cn(
                                "h-8 w-8 rounded-md text-[10px] font-semibold border transition-all",
                                seat.status === "BOOKED" && "bg-red-100 text-red-700 border-red-200 cursor-not-allowed",
                                seat.status === "LOCKED" && "bg-amber-100 text-amber-700 border-amber-300",
                                seat.status === "UNAVAILABLE" && "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
                                (!seat.status || seat.status === "AVAILABLE") && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                              )}
                              title={`Seat ${seat.label || seat.seatNumber} · ${seat.status || "AVAILABLE"}`}
                              data-testid={`seat-${seat.id}`}
                            >
                              {seat.label || seat.seatNumber}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-200" /> {t("Available")}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-100 border border-amber-300" /> {t("Locked")}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-100 border border-red-200" /> {t("Booked")}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-100 border border-slate-200" /> {t("Unavailable")}</span>
          </div>
        </>
      )}
    </div>
  );
}
