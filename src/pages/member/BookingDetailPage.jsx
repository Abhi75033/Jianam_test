import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Upload, Loader2, AlertTriangle, Receipt } from "lucide-react";
import StatusTimeline, { buildBookingTimeline } from "@/components/member/StatusTimeline";
import { bookingsApi, formatMinor } from "@/lib/memberApi";
import { extractErrorMessage } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/** Live countdown for the payment window (§B15.5 — "a countdown is displayed prominently"). */
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
    // §B15.5 — payment screenshot is mandatory, reference and notes optional
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
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <Link to="/member/bookings" className="text-xs text-orange-600 font-semibold inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("My Bookings")}
        </Link>
        <p className="mt-6 text-sm text-slate-500">{t("Unable to load data")}</p>
      </div>
    );
  }

  return (
    <div data-testid="member-booking-detail">
      <Link to="/member/bookings" className="text-xs text-orange-600 font-semibold inline-flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> {t("My Bookings")}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-bold text-slate-900 truncate">
            {booking.item_name || booking.title || t("Booking")}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {booking.organization_name || booking.institution_name || "—"}
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] shrink-0">
          {booking.display_id || booking.uid || uid}
        </Badge>
      </div>

      {/* Payment window countdown — §B15.5 */}
      {needsProof && booking.payment_window_expires_at && (
        <Card
          className={`mt-4 p-4 rounded-xl border ${
            windowOpen ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${windowOpen ? "text-orange-600" : "text-red-600"}`} />
            <span className={`text-xs font-bold ${windowOpen ? "text-orange-800" : "text-red-800"}`}>
              {windowOpen ? t("Payment window closes in") : t("Payment window has expired")}
            </span>
          </div>
          {windowOpen && (
            <div className="mt-1.5 font-mono text-2xl font-bold text-orange-700 tabular-nums">
              {formatLeft(msLeft)}
            </div>
          )}
          {!windowOpen && (
            <p className="text-[11px] text-red-700 mt-1">
              {t("The slot has been released. Please submit a fresh booking request.")}
            </p>
          )}
        </Card>
      )}

      {/* Charges */}
      <Card className="mt-4 p-4 rounded-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5 mb-3">
          {t("Charges")}
        </h2>
        <dl className="space-y-1.5 text-xs">
          {[
            ["Amount", booking.amount_minor],
            ["Security Deposit", booking.deposit_minor],
            ["Additional Charges", booking.additional_charges_minor],
            ["Outstanding", booking.outstanding_minor],
          ]
            .filter(([, v]) => v != null)
            .map(([label, v]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-500">{t(label)}</dt>
                <dd className="font-semibold text-slate-800">{formatMinor(v, booking.currency)}</dd>
              </div>
            ))}
        </dl>
      </Card>

      {/* Bank / UPI instructions — shown while payment is pending (§B15.5) */}
      {needsProof && booking.payment_instructions && (
        <Card className="mt-4 p-4 rounded-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5 mb-3">
            {t("Offline Bank & UPI Details")}
          </h2>
          <dl className="space-y-1.5 text-xs">
            {[
              ["Bank Name", booking.payment_instructions.bank_name],
              ["Account Number", booking.payment_instructions.account_number],
              ["IFSC Code", booking.payment_instructions.ifsc],
              ["UPI ID", booking.payment_instructions.upi_id],
            ]
              .filter(([, v]) => v)
              .map(([label, v]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{t(label)}</dt>
                  <dd className="font-mono font-semibold text-slate-800 text-right break-all">{v}</dd>
                </div>
              ))}
          </dl>
          {booking.payment_instructions.qr_url && (
            <img
              src={booking.payment_instructions.qr_url}
              alt={t("Payment QR Code")}
              className="mt-3 h-40 w-40 object-contain mx-auto"
            />
          )}
        </Card>
      )}

      {/* Proof upload */}
      {needsProof && windowOpen && (
        <Card className="mt-4 p-4 rounded-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5 mb-3">
            {t("Upload Payment Screenshot")}
          </h2>
          <form onSubmit={submitProof} className="space-y-3">
            <div>
              <Label className="text-xs">{t("Payment Proof Receipt (Optional)")}</Label>
              <Input ref={fileRef} type="file" accept="image/*,application/pdf" className="mt-1 bg-white" data-testid="proof-file" />
            </div>
            <div>
              <Label className="text-xs">{t("Payment Reference Number / UPI UTR *")}</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={t("e.g. UTR102345564")}
                className="mt-1 bg-white"
                data-testid="proof-reference"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Payment Notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("e.g. Paid via mobile GPay")}
                className="mt-1 bg-white text-xs"
                rows={2}
              />
            </div>
            <Button type="submit" disabled={uploading} className="w-full font-bold" data-testid="proof-submit">
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {t("Confirm Payment Submitted")}
            </Button>
          </form>
        </Card>
      )}

      {/* Status timeline — §B16.5 */}
      <Card className="mt-4 p-4 rounded-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5 mb-3">
          {t("Booking Status")}
        </h2>
        <StatusTimeline steps={steps} />
      </Card>

      {/* Receipts */}
      {Array.isArray(booking.receipts) && booking.receipts.length > 0 && (
        <Card className="mt-4 p-4 rounded-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5 mb-3">
            {t("Receipts")}
          </h2>
          <div className="space-y-2">
            {booking.receipts.map((r) => (
              <a
                key={r.uid || r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-orange-700 font-semibold hover:underline"
              >
                <Receipt className="h-3.5 w-3.5" /> {t(r.label || "Download Receipt")}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Cancellation — request only in Phase 1 (§B16.8) */}
      {["PENDING", "PENDING_APPROVAL", "APPROVED", "CONFIRMED"].includes(
        String(booking.status || "").toUpperCase()
      ) && (
        <div className="mt-4">
          <Button variant="outline" onClick={onCancel} className="w-full text-red-600 border-red-200 hover:bg-red-50">
            {t("Request Cancellation")}
          </Button>
          {booking.cancellation_policy && (
            <p className="text-[10px] text-slate-500 mt-2">{booking.cancellation_policy}</p>
          )}
        </div>
      )}
    </div>
  );
}
