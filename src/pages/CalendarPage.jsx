import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Star, Plus, AlertTriangle, Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MONTHS, getYearOptions } from "@/constants/dropdownOptions";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CalendarPage() {
  const { t } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [correctionFor, setCorrectionFor] = useState(null);
  const [correction, setCorrection] = useState({ subject: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState([]);

  const now = new Date();
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [detailDay, setDetailDay] = useState(null);

  useEffect(() => {
    api.get("/master-data/tithi-calendar-types")
      .then((res) => {
        const list = res.data?.data?.items || res.data?.data || [];
        setTypes(list);
        if (list[0]?.id && !selectedTypeId) {
          setSelectedTypeId(list[0].id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTypeId) return;
    setLoading(true);
    Promise.all([
      api.get("/calendar/today", { params: { typeId: selectedTypeId } }).catch(() => ({ data: { data: null } })),
      api.get("/calendar/month", { params: { year: selectedYear, month: selectedMonth, typeId: selectedTypeId } }).catch(() => ({ data: { data: [] } })),
    ]).then(([t, m]) => {
      setToday(t.data?.data);
      setMonth(m.data?.data?.items || m.data?.data || []);
    }).finally(() => setLoading(false));
  }, [selectedTypeId, selectedYear, selectedMonth, reloadKey]);

  const getDaysInMonth = (y, m) => {
    const date = new Date(y, m - 1, 1);
    const days = [];
    while (date.getMonth() === m - 1) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const findEntry = (day) => {
    return month.find(e => {
      const d = new Date(e.gregorianDate);
      return d.getFullYear() === day.getFullYear() &&
             d.getMonth() === day.getMonth() &&
             d.getDate() === day.getDate();
    });
  };

  const submitCorrection = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/calendar/correction-tickets", {
        calendarTypeId: correctionFor?.calendarTypeId || selectedTypeId || types[0]?.id,
        date: correctionFor?.gregorianDate,
        issue: `${correction.subject}${correction.description ? ` — ${correction.description}` : ""}`,
      });
      toast.success(t("Correction ticket raised."));
      setCorrectionFor(null);
      setCorrection({ subject: "", description: "" });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="calendar-page">
      <PageHeader
        title={t("Tithi Calendar")}
        subtitle={t("Jain lunar calendar (Tithi) — today's tithi and monthly view.")}
        actions={isSuperAdmin && (
          <Button onClick={() => setAddOpen(true)} data-testid="calendar-add-entry-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Add Entry")}
          </Button>
        )}
      />

      {loading ? (
        <Skeleton className="h-32 w-full mb-4" />
      ) : (
        <Card className="p-6 rounded-xl border-border mb-4 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="text-[11px] uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
            <Sun className="h-3.5 w-3.5" /> {t("Today")}
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <div className="font-brand text-3xl md:text-4xl">{today?.tithiName || today?.tithi || "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {(today?.gregorianDate || "").slice(0, 10) || new Date().toLocaleDateString()}
              </div>
            </div>
            {today?.description && (
              <Badge className="bg-primary text-primary-foreground"><Star className="h-3 w-3 mr-1" /> {today.description}</Badge>
            )}
          </div>
        </Card>
      )}

      {/* Filter and Switcher Control Bar */}
      <Card className="p-4 rounded-xl border border-border bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 font-sans">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-slate-800">{t("Filter View")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchableSelect
            value={selectedTypeId}
            onValueChange={setSelectedTypeId}
            options={types.map((t) => ({ value: t.id, label: t.name }))}
            placeholder={t("Calendar Type")}
            searchPlaceholder={t("Search type…")}
            className="w-44"
          />

          <SearchableSelect
            value={selectedMonth.toString()}
            onValueChange={(val) => setSelectedMonth(Number(val))}
            options={MONTHS}
            placeholder={t("Month")}
            className="w-32"
          />

          <SearchableSelect
            value={selectedYear.toString()}
            onValueChange={(val) => setSelectedYear(Number(val))}
            options={getYearOptions(3, 3)}
            placeholder={t("Year")}
            className="w-24"
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-7 gap-2">{Array.from({ length: 30 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {getDaysInMonth(selectedYear, selectedMonth).map((day) => {
            const entry = findEntry(day);
            const dateStr = day.getDate().toString().padStart(2, "0");
            const fullDateStr = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, "0")}-${dateStr}`;
            return (
              <Card
                key={fullDateStr}
                onClick={() => setDetailDay({ day, entry })}
                className={`p-3 rounded-xl border-border relative group hover:shadow-md hover:border-primary/45 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${entry ? "bg-primary/5 border-primary/20" : "bg-white"}`}
                data-testid={`calendar-day-${fullDateStr}`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-400">{dateStr}</div>
                  <div className="font-semibold text-xs sm:text-sm mt-1 text-slate-800 line-clamp-2">
                    {entry?.tithiName || entry?.tithi || "—"}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-1">
                  {entry?.description || ""}
                </div>
                {entry && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCorrectionFor(entry);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                    title={t("Report incorrect tithi")}
                    data-testid={`calendar-report-${fullDateStr}`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <EntityFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title={t("Add Tithi Entry")}
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="calendar-entry-form"
        fields={[
          { name: "gregorianDate", label: t("Gregorian date"), type: "date", required: true },
          { name: "tithiName", label: t("Tithi name"), required: true, placeholder: t("e.g. Purnima") },
          { name: "calendarTypeId", label: t("Calendar type"), type: "select", required: true,
            options: types.map((t) => ({ value: t.id, label: t.name })),
            defaultValue: selectedTypeId
          },
          { name: "description", label: t("Notes / festival"), type: "textarea" },
        ]}
        onSubmit={async (payload) => {
          // Backend upserts entries per calendar type + year in bulk
          const res = await api.put(`/calendar/types/${payload.calendarTypeId}/entries`, {
            year: new Date(payload.gregorianDate).getFullYear(),
            entries: [{ gregorianDate: payload.gregorianDate, tithiName: payload.tithiName, description: payload.description }],
          });
          return res.data?.data;
        }}
      />

      <Dialog open={Boolean(correctionFor)} onOpenChange={() => setCorrectionFor(null)}>
        <DialogContent className="max-w-md" data-testid="calendar-correction-dialog">
          <DialogHeader>
            <DialogTitle>{t("Report incorrect tithi")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCorrection} className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {t("Date:")} <span className="font-mono-num">{correctionFor?.gregorianDate}</span> {t("· Current:")} <b>{correctionFor?.tithi}</b>
            </div>
            <div>
              <Label className="text-xs">{t("Subject")}</Label>
              <Input
                value={correction.subject}
                onChange={(e) => setCorrection({ ...correction, subject: e.target.value })}
                required
                placeholder={t("What is wrong?")}
                data-testid="correction-subject"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Details")}</Label>
              <Textarea
                value={correction.description}
                onChange={(e) => setCorrection({ ...correction, description: e.target.value })}
                required
                placeholder={t("Provide the correct tithi / reference")}
                rows={4}
                data-testid="correction-description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCorrectionFor(null)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={saving} data-testid="correction-submit">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t("Raise ticket")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tithi Detail View Dialog */}
      <Dialog open={Boolean(detailDay)} onOpenChange={() => setDetailDay(null)}>
        <DialogContent className="max-w-sm" data-testid="calendar-detail-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("Tithi Details")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 font-sans">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs text-muted-foreground">{t("Gregorian Date")}</span>
              <span className="text-sm font-semibold">{detailDay?.day?.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs text-muted-foreground">{t("Tithi")}</span>
              <span className="text-sm font-bold text-primary">{detailDay?.entry?.tithiName || detailDay?.entry?.tithi || "—"}</span>
            </div>
            {detailDay?.entry?.description ? (
              <div className="space-y-1 pt-1">
                <span className="text-xs text-muted-foreground font-semibold">{t("Notes / Festival")}</span>
                <p className="text-xs bg-slate-50 border border-slate-100 rounded-md p-3 text-slate-600 font-medium">
                  {detailDay.entry.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground italic">
                {t("Nothing to show for this date.")}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailDay(null)} className="w-full">
              {t("Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
