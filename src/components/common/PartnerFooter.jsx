import { Landmark } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * "Supported by Community Partners" banner shown at the bottom of pages,
 * matching the Vihaar-style community footer.
 */
export function PartnerFooter() {
  const { t } = useLanguage();
  const partners = ["Lotus Foundation", "Seva Partner", "Dharma Support", "Shanti Welfare", "Jain Care"];

  return (
    <div
      className="mt-6 md:mt-8 rounded-xl overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(135deg, #192857 0%, #111d45 100%)",
      }}
      data-testid="partner-footer"
    >
      <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-lg bg-white/10 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-yellow-300" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-300/90">
              {t("Supported by")}
            </div>
            <div className="font-heading text-base md:text-lg font-semibold">
              {t("Community Partners")}
            </div>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 w-full">
          {partners.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-md h-12 md:h-14 flex items-center justify-center text-center px-2"
            >
              <div className="leading-tight">
                <div className="text-[8px] md:text-[9px] uppercase tracking-widest text-muted-foreground">
                  {t("Your")}
                </div>
                <div className="text-[11px] md:text-xs font-bold text-primary">LOGO</div>
                <div className="text-[8px] md:text-[9px] uppercase tracking-widest text-muted-foreground truncate">
                  {p.split(" ")[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PartnerFooter;
