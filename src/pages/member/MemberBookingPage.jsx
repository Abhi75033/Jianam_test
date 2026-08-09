import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, BedDouble, Users2, Loader2, CalendarDays, IndianRupee,
  Hotel, Utensils, Sparkles, Building2, CheckCircle2, Clock, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { memberClient } from "@/lib/memberClient";
import { bookingsApi } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import ListState from "@/components/member/ListState";

const ORG_ENDPOINTS = ["/temples", "/dharamshalas", "/jain-centers"];

function mapItem(it) {
  return {
    id: it.id,
    name: it.name,
    category: it.category || "Accommodation",
    isFree: String(it.type).toUpperCase() === "FREE",
    chargeAmount: it.chargeAmount ?? null,
    capacityMaxPeople: it.capacityMaxPeople ?? null,
    durationType: it.durationType || "",
    description: it.description || "",
  };
}

const DURATION_LABEL = {
  HOURLY: "Hourly Slot", HALF_DAY: "Half Day", FULL_DAY: "Full Day", MULTIPLE_DAYS: "Overnight Stay",
};

export default function MemberBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [orgName, setOrgName] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [slot, setSlot] = useState("09:00 - 10:00");
  const [peopleCount, setPeopleCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    for (const prefix of ORG_ENDPOINTS) {
      try {
        const res = await memberClient.get(`${prefix}/${id}`);
        const data = res?.data?.data;
        if (data) {
          setOrgName(data.name || "");
          const rows = await bookingsApi.items(id).catch(() => []);
          setItems(rows.map(mapItem));
          setLoading(false);
          return;
        }
      } catch {
        /* try next */
      }
    }
    setError(extractErrorMessage({ message: "Not found" }));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const isMultiDay = selected?.durationType === "MULTIPLE_DAYS";

  const submit = async (e) => {
    e.preventDefault();
    if (!selected || !dateFrom) return;
    setSubmitting(true);
    try {
      await bookingsApi.create({
        bookingItemId: selected.id,
        dateFrom,
        dateTo: isMultiDay ? dateTo : undefined,
        slot,
        peopleCount,
      });
      toast.success(t("Booking request submitted! Awaiting administrator approval."));
      navigate("/member/bookings");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs active:scale-95 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("Back to Details")}</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Hotel className="h-4.5 w-4.5" />
          </div>
          <span>{t("Reserve Room, Dharamshala or Hall")}</span>
        </h1>
        {orgName && <p className="text-xs text-slate-500 font-semibold">{orgName}</p>}
      </div>

      <ListState
        loading={loading}
        error={error}
        count={items.length}
        emptyTitle={t("No bookable rooms or halls available")}
        emptyHint={t("This location hasn't configured any bookable facilities yet.")}
        onRetry={load}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Facility Selection List */}
          <div className="lg:col-span-7 space-y-3.5">
            {items.map((it) => {
              const isSel = selected?.id === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelected(it)}
                  className={cn(
                    "w-full text-left bg-white rounded-3xl border p-5 shadow-xs transition-all active:scale-99 relative",
                    isSel
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-slate-200/80 hover:border-emerald-300"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">{it.name}</h3>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {it.category} • {DURATION_LABEL[it.durationType] || it.durationType}
                      </div>
                    </div>
                    <span className={cn(
                      "shrink-0 text-xs font-black px-3 py-1 rounded-full",
                      it.isFree ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                    )}>
                      {it.isFree ? t("Free") : formatCurrency(it.chargeAmount)}
                    </span>
                  </div>

                  {it.description && <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{it.description}</p>}
                  
                  {it.capacityMaxPeople != null && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-2.5">
                      <Users2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t("Capacity")}: {t("Up to")} {it.capacityMaxPeople} {t("guests")}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Booking Reservation Form */}
          <div className="lg:col-span-5">
            <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 sticky top-6">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                <span>{t("Reservation Schedule")}</span>
              </h2>

              {!selected ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  {t("Select a room or facility card on the left to proceed.")}
                </div>
              ) : (
                <>
                  <div className="text-xs font-extrabold text-slate-800 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
                    <span>{selected.name}</span>
                    <span className="font-mono">{selected.isFree ? t("Free") : formatCurrency(selected.chargeAmount)}</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
                      {isMultiDay ? t("Check-in Date *") : t("Date of Booking *")}
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                    />
                  </div>

                  {isMultiDay ? (
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">{t("Check-out Date *")}</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        min={dateFrom || undefined}
                        required
                        className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">{t("Preferred Slot *")}</label>
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => setSlot(e.target.value)}
                        placeholder="09:00 - 10:00"
                        className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">{t("Number of Guests *")}</label>
                    <input
                      type="number"
                      min={1}
                      max={selected.capacityMaxPeople || undefined}
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                    />
                  </div>

                  {!selected.isFree && selected.chargeAmount != null && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                      <IndianRupee className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{formatCurrency(selected.chargeAmount)} — {t("Payment instructions follow after admin approval.")}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !dateFrom}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{t("Submit Booking Request")}</span>
                  </button>
                </>
              )}
            </form>
          </div>

        </div>
      </ListState>

    </div>
  );
}
