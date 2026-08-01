import React from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const COUNTRY_CODES = [
  { value: "+91", label: "🇮🇳 India (+91)" },
  { value: "+1", label: "🇺🇸 USA / Canada (+1)" },
  { value: "+44", label: "🇬🇧 United Kingdom (+44)" },
  { value: "+971", label: "🇦🇪 UAE (+971)" },
  { value: "+61", label: "🇦🇺 Australia (+61)" },
  { value: "+65", label: "🇸🇬 Singapore (+65)" },
  { value: "+254", label: "🇰🇪 Kenya (+254)" },
  { value: "+27", label: "🇿🇦 South Africa (+27)" },
  { value: "+49", label: "🇩🇪 Germany (+49)" },
  { value: "+33", label: "🇫🇷 France (+33)" },
  { value: "+81", label: "🇯🇵 Japan (+81)" },
  { value: "+86", label: "🇨🇳 China (+86)" },
  { value: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
  { value: "+974", label: "🇶🇦 Qatar (+974)" },
  { value: "+968", label: "🇴🇲 Oman (+968)" },
  { value: "+965", label: "🇰🇼 Kuwait (+965)" },
  { value: "+973", label: "🇧🇭 Bahrain (+973)" },
  { value: "+977", label: "🇳🇵 Nepal (+977)" },
  { value: "+94", label: "🇱🇰 Sri Lanka (+94)" },
  { value: "+880", label: "🇧🇩 Bangladesh (+880)" },
  { value: "+60", label: "🇲🇾 Malaysia (+60)" },
  { value: "+66", label: "🇹🇭 Thailand (+66)" },
  { value: "+62", label: "🇮🇩 Indonesia (+62)" },
  { value: "+63", label: "🇵🇭 Philippines (+63)" },
  { value: "+64", label: "🇳🇿 New Zealand (+64)" },
];

/**
 * PhoneInput — Reusable Mobile Input with Country Code Selector (+XX)
 */
export default function PhoneInput({
  countryCode = "+91",
  onCountryCodeChange,
  value = "",
  onChange,
  placeholder = "Mobile Number",
  disabled = false,
  className = "",
  id,
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-36 shrink-0">
        <SearchableSelect
          options={COUNTRY_CODES}
          value={countryCode}
          onValueChange={onCountryCodeChange}
          placeholder="+XX"
          disabled={disabled}
        />
      </div>
      <Input
        id={id}
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 font-mono font-medium"
      />
    </div>
  );
}

/* ─── Single-string variant ──────────────────────────────────────────────────
 * Forms across the app store one field (`mobile: "+919876543210"`), so a
 * two-field component can't drop in without reshaping every form's state.
 * PhoneField keeps that single E.164 string as its value while still giving
 * the user a searchable +XX selector — making it a one-line swap for a bare
 * <Input>, and keeping the payload sent to the API identical.
 * ------------------------------------------------------------------------ */

/** Longest dial codes first so "+971" wins over "+97"/"+9". */
const DIAL_CODES = [...COUNTRY_CODES]
  .map((c) => c.value)
  .sort((a, b) => b.length - a.length);

/** Split "+919876543210" into ["+91", "9876543210"]. */
export function splitPhone(raw, fallbackCode = "+91") {
  const s = String(raw || "").replace(/[\s()-]/g, "");
  if (!s) return [fallbackCode, ""];
  if (!s.startsWith("+")) {
    // Bare national number, or a legacy value stored without the "+".
    const hit = DIAL_CODES.find((d) => s.startsWith(d.slice(1)) && s.length > d.length - 1);
    if (hit && s.length > 10) return [hit, s.slice(hit.length - 1)];
    return [fallbackCode, s];
  }
  const code = DIAL_CODES.find((d) => s.startsWith(d));
  return code ? [code, s.slice(code.length)] : [fallbackCode, s.replace(/^\+/, "")];
}

/** Recombine into the E.164 string the API expects. */
export function joinPhone(code, national) {
  const n = String(national || "").replace(/\D/g, "");
  return n ? `${code}${n}` : "";
}

/**
 * Drop-in replacement for a bare mobile <Input>.
 *
 *   <PhoneField value={form.mobile} onChange={(v) => setForm({...form, mobile: v})} />
 *
 * `onChange` receives the combined string, not an event.
 */
export function PhoneField({
  value,
  onChange,
  placeholder = "Mobile Number",
  disabled = false,
  className = "",
  id,
  defaultCountryCode = "+91",
  required = false,
}) {
  const [code, national] = splitPhone(value, defaultCountryCode);
  return (
    <PhoneInput
      id={id}
      className={className}
      disabled={disabled}
      countryCode={code}
      onCountryCodeChange={(c) => onChange?.(joinPhone(c, national))}
      value={national}
      onChange={(e) => onChange?.(joinPhone(code, e.target.value))}
      placeholder={placeholder}
      required={required}
    />
  );
}
