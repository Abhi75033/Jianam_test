import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Booking status timeline — §B16.5 / §B15.4.
 * "Every transition is timestamped and shown to the member as a status timeline."
 *
 * steps: [{ key, label, at, state: "done" | "current" | "pending" | "failed" }]
 */
export default function StatusTimeline({ steps = [], className }) {
  const { t } = useLanguage();
  if (!steps.length) return null;

  return (
    <ol className={cn("relative space-y-0", className)} data-testid="status-timeline">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const failed = step.state === "failed";
        const done = step.state === "done";
        const current = step.state === "current";

        return (
          <li key={step.key || i} className="relative flex gap-3 pb-5 last:pb-0">
            {/* connector */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[11px] top-6 bottom-0 w-px",
                  done ? "bg-emerald-300" : "bg-slate-200"
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                failed && "border-red-500 text-red-500",
                done && "border-emerald-500 bg-emerald-500 text-white",
                current && "border-orange-500 text-orange-600",
                !failed && !done && !current && "border-slate-200 text-slate-300"
              )}
            >
              {failed ? (
                <X className="h-3 w-3" />
              ) : done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div
                className={cn(
                  "text-sm font-semibold",
                  failed ? "text-red-600" : current ? "text-orange-700" : done ? "text-slate-800" : "text-slate-400"
                )}
              >
                {t(step.label)}
              </div>
              {step.at && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {new Date(step.at).toLocaleString()}
                </div>
              )}
              {step.note && (
                <div className="text-[11px] text-slate-500 mt-0.5">{t(step.note)}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Turns an API status + timestamp map into timeline steps.
 * Terminal states (§B16.5): Rejected, Cancelled, Expired.
 */
export function buildBookingTimeline(booking) {
  const ts = booking?.timestamps || {};
  const status = String(booking?.status || "").toUpperCase();

  const TERMINAL = { REJECTED: "Rejected", CANCELLED: "Cancelled", EXPIRED: "Booking Expired" };
  const FLOW = [
    { key: "SUBMITTED", label: "Booking Submitted", at: ts.submitted_at || booking?.created_at },
    { key: "PENDING_APPROVAL", label: "Pending Approval", at: ts.pending_at },
    { key: "APPROVED", label: "Approved", at: ts.approved_at },
    { key: "PAYMENT_PENDING", label: "Payment Pending", at: ts.payment_started_at },
    { key: "PAYMENT_VERIFICATION", label: "Payment Verification", at: ts.proof_uploaded_at },
    { key: "CONFIRMED", label: "Confirmed", at: ts.confirmed_at },
  ];

  const reachedIndex = FLOW.findIndex((s) => s.key === status);

  const steps = FLOW.map((s, i) => {
    let state = "pending";
    if (reachedIndex === -1) {
      // terminal status: everything with a timestamp already happened
      state = s.at ? "done" : "pending";
    } else if (i < reachedIndex) state = "done";
    else if (i === reachedIndex) state = "current";
    return { ...s, state };
  });

  if (TERMINAL[status]) {
    steps.push({
      key: status,
      label: TERMINAL[status],
      at: ts.terminal_at || ts.cancelled_at || ts.rejected_at || ts.expired_at,
      note: booking?.reason,
      state: "failed",
    });
  }

  return steps;
}
