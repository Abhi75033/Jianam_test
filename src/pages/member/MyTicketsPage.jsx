import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Ticket, Calendar, MapPin } from "lucide-react";
import { eventsApi } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * My Tickets — §B19.7 / §B19.8.
 * "For a multi-ticket booking, each attendee gets a unique Ticket ID and QR
 *  code, all linked to one master Booking ID."
 * The QR encodes a server-signed token; it exposes no personal information —
 * we render exactly what the API returns and never construct the payload here.
 */
const STATUS_TONE = {
  TICKET_GENERATED: "bg-emerald-100 text-emerald-700",
  PAYMENT_SUCCESSFUL: "bg-emerald-100 text-emerald-700",
  CHECKED_IN: "bg-blue-100 text-blue-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-200 text-slate-600",
  EXPIRED: "bg-slate-200 text-slate-600",
};

const pretty = (s) =>
  String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function MyTicketsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    eventsApi
      .myTickets()
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((e) => {
        if (cancelled) return;
        setRows([]);
        toast.error(extractErrorMessage(e));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div data-testid="member-tickets-page">
      <h1 className="font-heading text-xl font-bold text-slate-900">{t("My Tickets")}</h1>
      <p className="text-xs text-slate-500 mt-1">
        {t("Show this QR at the venue for check-in.")}
      </p>

      <div className="mt-4 space-y-4">
        {loading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-4 rounded-xl">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-40 w-40 mt-3 mx-auto" />
            </Card>
          ))}

        {!loading && rows.length === 0 && (
          <EmptyState
            icon={Ticket}
            title={t("No tickets yet")}
            description={t("Purchased tickets will appear here.")}
          />
        )}

        {!loading &&
          rows.map((tk) => {
            const status = String(tk.status || "").toUpperCase();
            const scanned = status === "CHECKED_IN";
            return (
              <Card
                key={tk.uid || tk.ticket_id}
                className="overflow-hidden rounded-xl"
                data-testid={`ticket-${tk.uid || tk.ticket_id}`}
              >
                {tk.event_banner_url && (
                  <img src={tk.event_banner_url} alt={tk.event_name} className="h-28 w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-heading font-bold text-sm text-slate-900 truncate">
                        {tk.event_name || t("Event")}
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tk.organization_name}</p>
                    </div>
                    <Badge className={`text-[10px] border-0 shrink-0 ${STATUS_TONE[status] || "bg-slate-100 text-slate-600"}`}>
                      {t(pretty(status))}
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    {tk.starts_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(tk.starts_at).toLocaleString()}
                      </div>
                    )}
                    {tk.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-400" /> {tk.venue}
                      </div>
                    )}
                  </div>

                  {/* QR — server-signed token only (§B19.8) */}
                  {tk.qr_token && !scanned && (
                    <div className="mt-4 flex flex-col items-center">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <QRCodeSVG value={tk.qr_token} size={160} level="M" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {t("Position the QR inside the frame. Detection is automatic.")}
                      </p>
                    </div>
                  )}

                  {scanned && (
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                      <p className="text-xs font-semibold text-blue-800">{t("Checked In")}</p>
                      {tk.checked_in_at && (
                        <p className="text-[10px] text-blue-700 mt-0.5">
                          {new Date(tk.checked_in_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ticket identifiers (§B19.7) */}
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px] border-t pt-3">
                    {[
                      ["Ticket ID", tk.ticket_id],
                      ["Booking ID", tk.booking_id],
                      ["Category", tk.category],
                      ["Seat", tk.seat_number],
                    ]
                      .filter(([, v]) => v)
                      .map(([label, v]) => (
                        <div key={label}>
                          <dt className="text-slate-400 uppercase tracking-wider text-[9px] font-semibold">
                            {t(label)}
                          </dt>
                          <dd className="font-mono font-semibold text-slate-800 truncate">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
