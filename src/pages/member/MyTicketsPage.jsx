import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, MapPin, Download, Share2, CheckCircle2, QrCode } from "lucide-react";
import { eventsApi } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import ListState from "@/components/member/ListState";
import { cn } from "@/lib/utils";

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

  const loadData = () => {
    setLoading(true);
    eventsApi
      .myTickets()
      .then((data) => setRows(data || []))
      .catch((e) => {
        setRows([]);
        toast.error(extractErrorMessage(e));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="member-tickets-page">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Ticket className="h-4.5 w-4.5" />
          </div>
          <span>{t("My Event Tickets & Entry Passes")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          {t("Present the QR code at the venue gate for instant check-in verification.")}
        </p>
      </div>

      {/* Tickets List */}
      <ListState
        loading={loading}
        count={rows.length}
        onRetry={loadData}
        emptyTitle={t("No event tickets yet")}
        emptyHint={t("RSVP for upcoming community events to generate your digital entry passes.")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {rows.map((tk) => {
            const status = String(tk.status || "").toUpperCase();
            const scanned = status === "CHECKED_IN";
            const ticketId = tk.uid || tk.ticket_id || tk.id;

            return (
              <div
                key={ticketId}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                data-testid={`ticket-${ticketId}`}
              >
                {/* Event Banner */}
                {tk.event_banner_url && (
                  <div className="h-32 bg-slate-100 relative overflow-hidden">
                    <img src={tk.event_banner_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-5 space-y-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {tk.event_name || t("Community Event")}
                      </h2>
                      {tk.organization_name && (
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{tk.organization_name}</p>
                      )}
                    </div>
                    <span className={cn("text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0", STATUS_TONE[status] || "bg-slate-100 text-slate-600")}>
                      {t(pretty(status))}
                    </span>
                  </div>

                  {/* Scannable Pass QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <QRCodeSVG
                      value={tk.qr_payload || `ticket://${ticketId}`}
                      size={130}
                      bgColor="#ffffff"
                      fgColor="#0B132B"
                      level="H"
                    />
                    <span className="font-mono text-[10px] font-black text-slate-500 tracking-wider">
                      #{ticketId}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                    {tk.event_starts_at && (
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span>{new Date(tk.event_starts_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      </div>
                    )}
                    {tk.seat_number && (
                      <div className="text-xs font-extrabold text-orange-600">
                        {t("Seat / Zone")}: {tk.seat_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>{scanned ? t("Checked In") : t("Ready for entry")}</span>
                  {tk.attendee_name && <span>{tk.attendee_name}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </ListState>

    </div>
  );
}
