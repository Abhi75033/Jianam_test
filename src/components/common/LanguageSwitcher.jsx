import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export function LanguageSwitcher() {
  const { t } = useLanguage();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const activeLang = languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs"
          title={t("Change Platform Language / ભાષા બદલો / भाषा बदलें")}
          data-testid="language-switcher-button"
        >
          <Globe className="h-3.5 w-3.5 text-orange-600" />
          <span className="text-[11px] uppercase tracking-wider">{activeLang.code}</span>
          <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline-block">({activeLang.nativeName})</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 text-xs font-medium">
        <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b">
          {t("Select Language / ભાષા / भाषा")}
        </div>
        {languages.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="flex items-center justify-between py-2 cursor-pointer font-bold text-slate-700 hover:text-orange-600"
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <span className="text-[10px] text-slate-400 font-normal">({lang.name})</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 font-bold" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
