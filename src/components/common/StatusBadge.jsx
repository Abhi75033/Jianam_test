import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const STATUS_STYLES = {
  // Booking
  SUBMITTED: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-blue-100 text-blue-800 border-blue-200",
  PAYMENT_PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PAYMENT_VERIFICATION: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
  EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
  // Generic
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING_ACTIVATION: "bg-amber-100 text-amber-800 border-amber-200", // B8 status badge styling
  SUSPENDED: "bg-red-100 text-red-800 border-red-200",
  BLOCKED: "bg-red-100 text-red-800 border-red-200",
  DELETED: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  VERIFIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  // Event
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PUBLISHED: "bg-blue-100 text-blue-800 border-blue-200",
  LIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-700 border-slate-200",
  // Alert
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  WARNING: "bg-amber-100 text-amber-800 border-amber-200",
  // Tour
  ONGOING: "bg-blue-100 text-blue-800 border-blue-200",
  // Support
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

export function StatusBadge({ status, className }) {
  const { t } = useLanguage();
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  const styles = STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <Badge
      variant="outline"
      title={
        status === "PENDING_ACTIVATION"
          ? t("This member profile was created by an admin and is pending mobile activation by the user.")
          : undefined
      }
      className={cn(
        "font-medium text-[11px] tracking-wide border cursor-help",
        styles,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
