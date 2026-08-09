import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  CalendarCheck, ChevronRight, Bookmark, Building2,
  Hotel, Utensils, Flame, Sparkles, MapPin, Calendar,
  Clock, CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { bookingsApi, formatMinor } from "@/lib/memberApi";
import { useMemberSocket } from "@/hooks/useMemberSocket";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import ListState from "@/components/member/ListState";
import { cn } from "@/lib/utils";

const GROUPS = [
  { key: "upcoming", label: "Upcoming Stays & Bookings" },
  { key: "active",   label: "Active & Checked-in" },
  { key: "past",     label: "Past History" },
];

const CATEGORIES = [
  "Accommodation", "Temple Hall", "Event Hall", "Temple Space", "Pooja Booking",
  "Pooja Material", "Bhojanshala", "Pathshala Hall", "Seminar Hall", "Conference Hall",
  "Meeting Room", "Locker", "Parking", "Religious Ceremony", "Event Ticket",
  "Tour Registration", "Other",
];

const STATUS_TONE = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200",
  PAYMENT_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  PAYMENT_VERIFICATION: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING_LIST: "bg-purple-50 text-purple-700 border-purple-200",
  RESERVED: "bg-blue-50 text-blue-700 border-blue-200",
  CHECKED_IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
  NO_SHOW: "bg-slate-100 text-slate-600 border-slate-200",
};

function getBookingIcon(cat) {
  const c = String(cat || "").toLowerCase();
  if (c.includes("room") || c.includes("accommodation") || c.includes("dharamshala")) return Hotel;
  if (c.includes("bhojan") || c.includes("pass")) return Utensils;
  if (c.includes("pooja") || c.includes("ceremony")) return Sparkles;
  if (c.includes("event") || c.includes("hall")) return Flame;
  return Building2;
}

const pretty = (status) =>
  String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function MyBookingsPage() {
  const { t } = useLanguage();
  const [group, setGroup] = useState("upcoming");
  const [category, setCategory] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useMemberSocket("/dashboards", {
    "booking:updated": (evt) => {
      if (!evt?.bookingId) return;
      setRows((prev) => prev.map((b) =>
        (b.id === evt.bookingId || b.uid === evt.bookingId || b.display_id === evt.bookingId)
          ? { ...b, status: evt.status ?? b.status }
          : b
      ));
    },
    "booking:new": (evt) => {
      if (!evt?.bookingId) return;
      setRows((prev) => prev.some((b) => b.id === evt.bookingId) ? prev : [evt, ...prev]);
    },
  });

  const loadData = () => {
    setLoading(true);
    bookingsApi
      .mine({ group, ...(category ? { category } : {}) })
      .then((data) => { setRows(data || []); })
      .catch((e) => {
        setRows([]);
        toast.error(extractErrorMessage(e));
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, category]);

  const categoryOptions = useMemo(
    () => [{ value: "", label: t("All Categories") }, ...CATEGORIES.map((c) => ({ value: c, label: t(c) }))],
    [t]
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <CalendarCheck className="h-4.5 w-4.5" />
          </div>
          <span>{t("My Bookings & Reservations")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {t("Manage your Dharamshala room reservations, Bhojanshala passes, Hall bookings and Pooja ceremonies.")}
        </p>
      </div>

      {/* Filter Tabs & Select */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="grid grid-cols-3 gap-2 bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/60 shadow-inner flex-1">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(g.key)}
              className={cn(
                "py-2 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 text-center truncate",
                group === g.key
                  ? "bg-white text-orange-600 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {t(g.label)}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <SearchableSelect
            value={category}
            onValueChange={setCategory}
            options={categoryOptions}
            placeholder={t("Filter by category…")}
            searchPlaceholder={t("Search category…")}
          />
        </div>
      </div>

      {/* Booking Cards List */}
      <ListState
        loading={loading}
        count={rows.length}
        onRetry={loadData}
        emptyTitle={t("No bookings found")}
        emptyHint={t("You don't have any bookings in this section.")}
      >
        <div className="space-y-3.5">
          {rows.map((b) => {
            const stTone = STATUS_TONE[b.status] || "bg-slate-100 text-slate-700 border-slate-200";
            const Icon = getBookingIcon(b.category);
            const bookingUid = b.uid || b.id || b.display_id;

            return (
              <Link
                key={bookingUid}
                to={`/member/bookings/${bookingUid}`}
                className="block bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-orange-300 active:scale-99 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {b.title || b.organization?.name || b.category || t("Booking")}
                        </h3>
                        <span className={cn("text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0", stTone)}>
                          {t(pretty(b.status))}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                        {b.booking_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{new Date(b.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </span>
                        )}
                        {b.display_id && (
                          <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-500">
                            #{b.display_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {b.total_amount_minor != null && (
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-semibold">{t("Amount")}</div>
                        <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {formatMinor(b.total_amount_minor, b.currency || "INR")}
                        </div>
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-orange-50 text-slate-400 group-hover:text-orange-600 flex items-center justify-center transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ListState>

    </div>
  );
}
