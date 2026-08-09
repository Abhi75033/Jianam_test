import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Upload, Loader2, AlertTriangle, Receipt,
  Building2, CheckCircle2, QrCode, Clock, ShieldCheck,
  Calendar, MapPin, XCircle
} from "lucide-react";
import StatusTimeline, { buildBookingTimeline } from "@/components/member/StatusTimeline";
import { bookingsApi, formatMinor } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function useCountdown(deadline) {
  const [left, setLeft] = useState(() => (deadline ? new Date(deadline) - Date.now() : null));
  useEffect(() => {
    if (!deadline) return undefined;
    const tick = () => setLeft(new Date(deadline) - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return left;
}

function formatLeft(ms) {
  if (ms == null) return null;
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function BookingDetailPage() {
  const { t } = useLanguage();
  const { uid } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    bookingsApi
      .detail(uid)
      .then(setBooking)
      .catch((e) => { setBooking(null); toast.error(extractErrorMessage(e)); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [uid]);

  const steps = useMemo(() => (booking ? buildBookingTimeline(booking) : []), [booking]);
  const msLeft = useCountdown(booking?.payment_window_expires_at);
  const windowOpen = msLeft != null && msLeft > 0;
  const needsProof = String(booking?.status || "").toUpperCase() === "PAYMENT_PENDING";

  const submitProof = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error(t("Please attach the payment screenshot.")); return; }
    setUploading(true);
    try {
      await bookingsApi.uploadProof(uid, { file, reference, notes });
      toast.success(t("Payment proof submitted successfully! Verification pending."));
      setReference(""); setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onCancel = async () => {
    try {
      await bookingsApi.requestCancel(uid, "");
      toast.success(t("Cancellation request submitted for admin approval."));
      load();
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto text-center py-12">
        <Link to="/member/bookings" className="text-xs text-orange-600 font-bold inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("Back to My Bookings")}
        </Link>
        <p className="text-sm font-bold text-slate-700">{t("Booking Details Not Found")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="member-booking-detail">
      
      {/* Back Button */}
      <Link
        to="/member/bookings"
        className="text-xs text-orange-600 font-black inline-flex items-center gap-1.5 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("Back to My Bookings")}</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {booking.item_name || booking.title || t("Booking Details")}
            </h1>
            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              #{booking.display_id || booking.uid || uid}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {booking.organization_name || booking.institution_name || "Sangh Trust"}
          </p>
        </div>
      </div>

      {/* Payment Window Countdown Banner */}
      {needsProof && booking.payment_window_expires_at && (
        <div
          className={cn(
            "rounded-3xl p-5 sm:p-6 border shadow-xs space-y-2",
            windowOpen ? "border-orange-200 bg-orange-50/80 text-orange-950" : "border-red-200 bg-red-50/80 text-red-950"
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn("h-5 w-5", windowOpen ? "text-orange-600" : "text-red-600")} />
            <span className="text-xs sm:text-sm font-black">
              {windowOpen ? t("Complete Payment Before Slot Closes") : t("Payment Window Expired")}
            </span>
          </div>
          {windowOpen && (
            <div className="font-mono text-3xl font-black text-orange-600 tracking-tight">
              {formatLeft(msLeft)}
            </div>
          )}
          {!windowOpen && (
            <p className="text-xs text-red-700 font-medium">
              {t("The reserved slot has expired. Please create a new booking.")}
            </p>
          )}
        </div>
      )}

      {/* Charges Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          {t("Charges & Payment Breakdown")}
        </h2>
        <div className="space-y-2 text-xs">
          {[
            ["Booking Amount", booking.amount_minor],
            ["Security Deposit", booking.deposit_minor],
            ["Additional Facility Charges", booking.additional_charges_minor],
            ["Outstanding Amount", booking.outstanding_minor],
          ]
            .filter(([, v]) => v != null)
            .map(([label, v]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-slate-500 font-medium">{t(label)}</span>
                <span className="font-black text-slate-900 font-mono">{formatMinor(v, booking.currency)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Bank & UPI QR Code Section */}
      {needsProof && booking.payment_instructions && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {t("Bank Transfer & UPI QR Instructions")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 text-xs">
              {[
                ["Bank Name", booking.payment_instructions.bank_name],
                ["Account Number", booking.payment_instructions.account_number],
                ["IFSC Code", booking.payment_instructions.ifsc],
                ["UPI ID", booking.payment_instructions.upi_id],
              ]
                .filter(([, v]) => v)
                .map(([label, v]) => (
                  <div key={label} className="flex justify-between gap-3 py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{t(label)}</span>
                    <span className="font-mono font-bold text-slate-900 text-right">{v}</span>
                  </div>
                ))}
            </div>

            {booking.payment_instructions.qr_url && (
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={booking.payment_instructions.qr_url}
                  alt={t("Payment QR Code")}
                  className="h-36 w-36 object-contain"
                />
                <span className="text-[10px] text-slate-400 font-bold mt-2">{t("Scan with GPay, PhonePe or Paytm")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Proof Upload Form */}
      {needsProof && windowOpen && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {t("Upload Payment Proof Screenshot")}
          </h2>
          <form onSubmit={submitProof} className="space-y-3.5">
            <div>
              <Label className="text-xs font-bold text-slate-700">{t("Payment Screenshot (Image or PDF) *")}</Label>
              <Input ref={fileRef} type="file" accept="image/*,application/pdf" className="mt-1 bg-slate-50 rounded-xl" data-testid="proof-file" />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700">{t("UPI UTR or Bank Reference Number *")}</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={t("e.g. UTR40291039482")}
                className="mt-1 bg-slate-50 rounded-xl"
                data-testid="proof-reference"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700">{t("Additional Notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("e.g. Paid via Google Pay on 9th August")}
                className="mt-1 bg-slate-50 rounded-xl text-xs"
                rows={2}
              />
            </div>
            <Button
              type="submit"
              disabled={uploading}
              className="w-full h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 active:scale-98 transition-all"
            >
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              <span>{t("Confirm Payment Proof Submitted")}</span>
            </Button>
          </form>
        </div>
      )}

      {/* Booking Status Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          {t("Booking Lifecycle Status")}
        </h2>
        <StatusTimeline steps={steps} />
      </div>

      {/* Receipts */}
      {Array.isArray(booking.receipts) && booking.receipts.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {t("Attached Invoices & Receipts")}
          </h2>
          <div className="space-y-2">
            {booking.receipts.map((r) => (
              <a
                key={r.uid || r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-orange-600 font-bold hover:underline p-3 bg-orange-50/60 rounded-2xl border border-orange-100"
              >
                <Receipt className="h-4 w-4" />
                <span>{t(r.label || "Download Receipt")}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Cancellation Request */}
      {["PENDING", "PENDING_APPROVAL", "APPROVED", "CONFIRMED"].includes(
        String(booking.status || "").toUpperCase()
      ) && (
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full h-11 rounded-2xl text-red-600 border-red-200 hover:bg-red-50 font-bold active:scale-98 transition-all"
          >
            {t("Request Cancellation")}
          </Button>
          {booking.cancellation_policy && (
            <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">{booking.cancellation_policy}</p>
          )}
        </div>
      )}

    </div>
  );
}
