import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  breadcrumbs,
  className,
  testId,
}) {
  const { t } = useLanguage();

  const titleTranslationKeyMap = {
    "Members": "title.members",
    "Volunteer Operations": "title.volunteers",
    "MS Profiles & Chaturmas": "title.monks",
    "Staff Operations Center": "title.staff",
    "Temple Management": "title.temples",
    "Dharamshala Management": "title.dharamshalas",
    "Event Operations Center": "title.events",
    "Donations Ledger": "title.donations",
    "Booking & Reservation Management": "title.bookings",
    "Platform & Account Settings": "title.settings",
  };

  const displayTitle = titleTranslationKeyMap[title] ? t(titleTranslationKeyMap[title], title) : title;

  return (
    <div className={cn("mb-6", className)} data-testid={testId}>
      {breadcrumbs && (
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          {breadcrumbs}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {displayTitle}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default PageHeader;
