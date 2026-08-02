import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { bookingsApi, formatMinor } from "@/lib/memberApi";
import { useMemberSocket } from "@/hooks/useMemberSocket";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * My Bookings — §B16.7.
 * "All bookings across the entire platform appear in one place. Members never
 *  have to look in different sections for different booking types."
 * Merges accommodation, general bookings, event tickets and tour registrations,
 * grouped as Upcoming · Active · Past.
 */
const GROUPS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
];

// §B16.1 categories (Super Admin master — extendable without redevelopment)
const CATEGORIES = [
  "Accommodation", "Temple Hall", "Event Hall", "Temple Space", "Pooja Booking",
  "Pooja Material", "Bhojanshala", "Pathshala Hall", "Seminar Hall", "Conference Hall",
  "Meeting Room", "Locker", "Parking", "Religious Ceremony", "Event Ticket",
  "Tour Registration", "Other",
];

const STATUS_TONE = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700",
  PAYMENT_VERIFICATION: "bg-blue-100 text-blue-700",
  WAITING_LIST: "bg-purple-100 text-purple-700",
  RESERVED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-slate-200 text-slate-600",
  NO_SHOW: "bg-slate-200 text-slate-600",
};

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

  /*
   * Booking status is the thing a member refreshes for: submitted → approved →
   * payment pending → confirmed. Patch the row in place when the server moves
   * it, so the list reflects reality without a reload.
   */
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
      // A booking made on another device belongs in this list too.
      setRows((prev) => prev.some((b) => b.id === evt.bookingId) ? prev : [evt, ...prev]);
    },
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bookingsApi
      .mine({ group, ...(category ? { category } : {}) })
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((e) => {
        if (cancelled) return;
        setRows([]);
        toast.error(extractErrorMessage(e));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [group, category]);

  const categoryOptions = useMemo(
    () => [{ value: "", label: t("All Categories") }, ...CATEGORIES.map((c) => ({ value: c, label: t(c) }))],
    [t]
  );

  return (
    <div data-testid="member-bookings-page">
      <h1 className="font-heading text-xl font-bold text-slate-900">{t("My Bookings")}</h1>
      <p className="text-xs text-slate-500 mt-1">
        {t("Every booking across the platform in one place — stays, halls, pooja, tickets and tours.")}
      </p>

      {/* Group tabs */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setGroup(g.key)}
            data-testid={`bookings-group-${g.key}`}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              group === g.key
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-slate-600 border-slate-200 hover:border-orange-400"
            }`}
          >
            {t(g.label)}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <SearchableSelect
          value={category}
          onValueChange={setCategory}
          options={categoryOptions}
          placeholder={t("All Categories")}
          searchPlaceholder={t("Search category…")}
        />
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 rounded-xl">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </Card>
          ))}

        {!loading && rows.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title={t("No bookings found")}
            description={t("Bookings you make will appear here, grouped as Upcoming, Active and Past.")}
          />
        )}

        {!loading &&
          rows.map((b) => (
            <Link key={b.uid || b.id} to={`/member/bookings/${b.uid || b.id}`} className="block">
              <Card
                className="p-4 rounded-xl hover:border-orange-300 transition-colors"
                data-testid={`booking-card-${b.uid || b.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {b.item_name || b.title || t("Booking")}
                      </span>
                      <Badge
                        className={`text-[10px] font-semibold border-0 ${
                          STATUS_TONE[String(b.status || "").toUpperCase()] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t(pretty(b.status))}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      {b.organization_name || b.institution_name || "—"}
                      {b.category ? ` · ${t(b.category)}` : ""}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {b.from_date
                        ? `${new Date(b.from_date).toLocaleDateString()}${
                            b.to_date ? ` → ${new Date(b.to_date).toLocaleDateString()}` : ""
                          }`
                        : b.booking_date
                        ? new Date(b.booking_date).toLocaleDateString()
                        : ""}
                    </div>
                    {b.amount_minor != null && (
                      <div className="text-xs font-bold text-slate-800 mt-1.5">
                        {formatMinor(b.amount_minor, b.currency)}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
