import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * TimePicker — Clock-based time picker component.
 * Renders as a button showing the current time; clicking opens a dropdown
 * with hour/minute/AM-PM selectors.
 * Output format: "HH:MM AM" / "HH:MM PM"
 *
 * Props:
 *   value      — string like "08:00 AM" or "" (controlled)
 *   onChange   — (formattedTime: string) => void
 *   placeholder— string (default "Select time")
 *   disabled   — boolean
 *   className  — extra class names for the trigger button
 *   id         — for label association
 */
export default function TimePicker({
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
  className = "",
  id,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse value → { hour, minute, period }
  const parseValue = (v) => {
    if (!v) return { hour: "08", minute: "00", period: "AM" };
    const match = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hour: "08", minute: "00", period: "AM" };
    return { hour: match[1].padStart(2, "0"), minute: match[2], period: match[3].toUpperCase() };
  };

  const { hour, minute, period } = parseValue(value);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const emitChange = (h, m, p) => {
    onChange?.(`${h}:${m} ${p}`);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between w-full h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs",
          "hover:border-orange-400 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20",
          disabled && "opacity-50 cursor-not-allowed bg-slate-100",
          open && "ring-2 ring-orange-500/20 border-orange-500"
        )}
        data-testid="time-picker-trigger"
      >
        <span className={cn("truncate font-semibold", !value && "text-slate-400 font-normal")}>
          {value || placeholder}
        </span>
        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 flex gap-3 items-start min-w-[220px]"
          data-testid="time-picker-panel"
        >
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{t("Hour")}</span>
            <div className="h-48 overflow-y-auto scrollbar-thin flex flex-col gap-0.5 pr-1">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => emitChange(h, minute, period)}
                  className={cn(
                    "w-10 h-7 rounded-md text-xs font-mono font-bold transition-colors",
                    h === hour
                      ? "bg-orange-500 text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-700"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="text-sm font-bold text-slate-400 mt-7 select-none">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{t("Min")}</span>
            <div className="h-48 overflow-y-auto scrollbar-thin flex flex-col gap-0.5 pr-1">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => emitChange(hour, m, period)}
                  className={cn(
                    "w-10 h-7 rounded-md text-xs font-mono font-bold transition-colors",
                    m === minute
                      ? "bg-orange-500 text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-700"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{t("Period")}</span>
            <div className="flex flex-col gap-1.5 mt-1">
              {["AM", "PM"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => emitChange(hour, minute, p)}
                  className={cn(
                    "w-12 h-8 rounded-lg text-xs font-bold transition-colors",
                    p === period
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 text-[10px] font-bold text-orange-600 hover:underline"
            >
              {t("Done")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * TimeRangePicker — Two TimePickers (From / To) side by side.
 */
export function TimeRangePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  fromLabel,
  toLabel,
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex-1 min-w-0">
        {fromLabel && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">{fromLabel}</span>}
        <TimePicker value={fromValue} onChange={onFromChange} disabled={disabled} />
      </div>
      <span className="text-slate-400 text-xs font-bold shrink-0 mt-3.5">–</span>
      <div className="flex-1 min-w-0">
        {toLabel && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">{toLabel}</span>}
        <TimePicker value={toValue} onChange={onToChange} disabled={disabled} />
      </div>
    </div>
  );
}
