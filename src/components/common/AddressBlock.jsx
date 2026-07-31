import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CountryDropdown from "./CountryDropdown";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * AddressBlock — Standard address form used across member + org forms.
 *
 * Field order per spec:
 *   1. Address (text)
 *   2. Country (dropdown, default India)
 *   3. Pincode
 *   4. Area (e.g. "Thane E / Thane W")
 *   5. City
 *   6. District
 *   7. State
 *
 * Props:
 *   value    — { address, country, pincode, area, city, district, state }
 *   onChange — (updatedValue) => void
 *   prefix   — string prefix for test IDs (default "address")
 *   label    — optional section label string
 *   className
 */
export default function AddressBlock({
  value = {},
  onChange,
  prefix = "address",
  label,
  className = "",
}) {
  const { t } = useLanguage();
  const update = (key, val) => onChange?.({ ...value, [key]: val });

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1">
          {label}
        </h4>
      )}

      {/* 1. Address */}
      <div>
        <Label className="text-xs">{t("Address")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("Flat/House No., Street, Locality")}
          value={value.address || value.line1 || ""}
          onChange={(e) => update("address", e.target.value)}
          data-testid={`${prefix}-address`}
        />
      </div>

      {/* 2. Country */}
      <div>
        <Label className="text-xs">{t("Country")}</Label>
        <CountryDropdown
          value={value.country || "India"}
          onValueChange={(v) => update("country", v)}
          className="mt-1"
        />
      </div>

      {/* 3. Pincode */}
      <div>
        <Label className="text-xs">{t("Pincode / ZIP Code")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. 400001")}
          value={value.pincode || ""}
          onChange={(e) => update("pincode", e.target.value)}
          data-testid={`${prefix}-pincode`}
        />
      </div>

      {/* 4. Area */}
      <div>
        <Label className="text-xs">{t("Area")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. Thane East / Thane West")}
          value={value.area || ""}
          onChange={(e) => update("area", e.target.value)}
          data-testid={`${prefix}-area`}
        />
      </div>

      {/* 5 & 6. City + District */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{t("City")}</Label>
          <Input
            className="mt-1 bg-white"
            placeholder={t("e.g. Mumbai")}
            value={value.city || ""}
            onChange={(e) => update("city", e.target.value)}
            data-testid={`${prefix}-city`}
          />
        </div>
        <div>
          <Label className="text-xs">{t("District")}</Label>
          <Input
            className="mt-1 bg-white"
            placeholder={t("e.g. Mumbai Suburban")}
            value={value.district || ""}
            onChange={(e) => update("district", e.target.value)}
            data-testid={`${prefix}-district`}
          />
        </div>
      </div>

      {/* 7. State */}
      <div>
        <Label className="text-xs">{t("State / Province")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. Maharashtra")}
          value={value.state || ""}
          onChange={(e) => update("state", e.target.value)}
          data-testid={`${prefix}-state`}
        />
      </div>
    </div>
  );
}
