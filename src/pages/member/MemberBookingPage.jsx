import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, BedDouble, Users2, Loader2, CalendarDays, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { memberClient } from "@/lib/memberClient";
import { bookingsApi } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import ListState from "@/components/member/ListState";

/**
 * MemberBookingPage — request a room/hall/dorm/bhojanshala slot at one org.
 *
 * bookingsApi.items()/create() (added in lib/memberApi.js) mirror the exact
 * endpoints and payload admin's BookingsPage.jsx already uses for its own
 * "Submit Member Booking" action (POST /bookings puts the request in
 * PENDING, awaiting administrator approval) — this is the first screen
 * that lets a member actually create one, rather than only view bookings
 * that already exist (My Bookings, booking detail).
 *
 * Same three-endpoint org-type fallback as MemberTempleDetailPage, since
 * the route carries no marker for temple vs dharamshala vs jain centre.
 */
const ORG_ENDPOINTS = ["/temples", "/dharamshalas", "/jain-centers"];

function mapItem(it) {
  return {
    id: it.id,
    name: it.name,
    category: it.category || "",
    isFree: String(it.type).toUpperCase() === "FREE",
    chargeAmount: it.chargeAmount ?? null,
    capacityMaxPeople: it.capacityMaxPeople ?? null,
    durationType: it.durationType || "",
    description: it.description || "",
  };
}

const DURATION_LABEL = {
  HOURLY: "Hourly", HALF_DAY: "Half Day", FULL_DAY: "Full Day", MULTIPLE_DAYS: "Multiple Days",
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
        /* try the next org type */
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
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </button>

      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-emerald-600" /> {t("Book a Stay")}
        </h1>
        {orgName && <p className="text-xs text-slate-500 mt-1">{orgName}</p>}
      </div>

      <ListState
        loading={loading}
        error={error}
        count={items.length}
        emptyTitle={t("No bookable rooms or halls")}
        emptyHint={t("This location hasn't configured any bookable accommodation yet.")}
        onRetry={load}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Item selection */}
          <div className="lg:col-span-7 space-y-3">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelected(it)}
                className={cn(
                  "w-full text-left bg-white rounded-3xl border p-5 shadow-xs transition-all",
                  selected?.id === it.id ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-200/80 hover:border-emerald-300"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{it.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{it.category} · {DURATION_LABEL[it.durationType] || it.durationType}</div>
                  </div>
                  <span className={cn(
                    "shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-full",
                    it.isFree ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {it.isFree ? t("Free") : formatCurrency(it.chargeAmount)}
                  </span>
                </div>
                {it.description && <p className="text-xs text-slate-600 mt-2">{it.description}</p>}
                {it.capacityMaxPeople != null && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                    <Users2 className="h-3 w-3" /> {t("Up to")} {it.capacityMaxPeople} {t("people")}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Booking form */}
          <div className="lg:col-span-5">
            <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 sticky top-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" /> {t("Booking Details")}
              </h2>

              {!selected ? (
                <p className="text-xs text-slate-400 italic">{t("Select a room or hall to continue.")}</p>
              ) : (
                <>
                  <div className="text-xs font-bold text-slate-700 bg-slate-50 rounded-xl px-3 py-2">{selected.name}</div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{isMultiDay ? t("Check-in date") : t("Date")}</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {isMultiDay ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("Check-out date")}</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        min={dateFrom || undefined}
                        required
                        className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("Time Slot")}</label>
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => setSlot(e.target.value)}
                        placeholder="09:00 - 10:00"
                        className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("Number of People")}</label>
                    <input
                      type="number"
                      min={1}
                      max={selected.capacityMaxPeople || undefined}
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {!selected.isFree && selected.chargeAmount != null && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                      <IndianRupee className="h-3.5 w-3.5 text-amber-600" /> {formatCurrency(selected.chargeAmount)} {t("— payment instructions follow after approval")}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !dateFrom}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {t("Submit Booking Request")}
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
