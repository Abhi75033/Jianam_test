import { useState, useEffect, useRef } from "react";
import { Sparkles, Plus, Minus, RotateCcw, Calendar, Moon, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/* ─── Tithi Calendar ─────────────────────────────────────────────────────── */
const TITHIS = [
  "Pratipada","Dvitiya","Tritiya","Chaturthi","Panchami",
  "Shashthi","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dvadashi","Trayodashi","Chaturdashi","Purnima",
  "Pratipada","Dvitiya","Tritiya","Chaturthi","Panchami",
  "Shashthi","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dvadashi","Trayodashi","Chaturdashi","Amavasya",
];

const FESTIVALS = {
  5: "Panchami — Gyan Panchami",
  8: "Ashtami — Mahashtami",
  14: "Chaturdashi — Paryushan",
  15: "Purnima — Kartik Purnima",
  29: "Amavasya",
};

function TithiCalendar() {
  const { t } = useLanguage();
  const today = new Date();
  const tithiIdx = (today.getDate() - 1) % 30;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-orange-500" /> {t("Tithi Calendar")}
      </h2>

      {/* Today's Tithi */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-md">
        <div className="text-[10px] uppercase tracking-widest opacity-80">{t("Today's Tithi")}</div>
        <div className="text-2xl font-black mt-1">{TITHIS[tithiIdx]}</div>
        <div className="text-sm opacity-90 mt-0.5">
          {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        {FESTIVALS[tithiIdx + 1] && (
          <div className="mt-2 bg-white/20 rounded-xl px-3 py-1.5 text-xs font-bold">
            🎉 {FESTIVALS[tithiIdx + 1]}
          </div>
        )}
      </div>

      {/* Mini calendar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="grid grid-cols-5 gap-1">
          {TITHIS.map((tithi, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center p-1.5 rounded-xl cursor-pointer transition-all",
                i === tithiIdx
                  ? "bg-orange-500 text-white shadow-md scale-105"
                  : "hover:bg-orange-50 text-slate-700"
              )}
            >
              <div className="text-[9px] font-black">{i + 1}</div>
              <div className="text-[7px] leading-tight text-center">{tithi.slice(0, 4)}</div>
              {FESTIVALS[i + 1] && <div className="text-[8px]">🎉</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Digital Mala (Spiritual Counter) ──────────────────────────────────── */
function DigitalMala() {
  const { t } = useLanguage();
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(108);
  const [sessions, setSessions] = useState([
    { date: "Yesterday", count: 108 },
    { date: "2 days ago", count: 54 },
  ]);
  const pct = Math.min((count / goal) * 100, 100);

  const tap = () => setCount((c) => {
    if (c + 1 >= goal) {
      setSessions((prev) => [{ date: "Today", count: goal }, ...prev]);
      return 0;
    }
    return c + 1;
  });

  const reset = () => setCount(0);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        📿 {t("Digital Mala")}
      </h2>

      {/* Counter circle */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4">
        {/* Circle progress */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r="42"
              stroke="#f97316" strokeWidth="8" fill="none"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-slate-800">{count}</div>
            <div className="text-[10px] text-slate-400">of {goal}</div>
          </div>
        </div>

        {/* Tap button */}
        <button
          onClick={tap}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white text-3xl shadow-xl hover:shadow-2xl active:scale-95 transition-all select-none"
        >
          🙏
        </button>
        <div className="text-xs text-slate-500">{t("Tap to count")}</div>

        <div className="flex items-center gap-3">
          <button onClick={reset} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-500 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> {t("Reset")}
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <button onClick={() => setGoal((g) => Math.max(g - 54, 54))} className="p-1 rounded-full border text-slate-500 hover:bg-slate-100 transition-colors">
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-[11px] font-bold text-slate-700">{t("Goal")}: {goal}</span>
            <button onClick={() => setGoal((g) => g + 54)} className="p-1 rounded-full border text-slate-500 hover:bg-slate-100 transition-colors">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">{t("Recent Sessions")}</div>
        {sessions.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
            <span className="text-xs text-slate-600">{s.date}</span>
            <span className="text-xs font-bold text-orange-600">📿 {s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Varshitap Tracker ──────────────────────────────────────────────────── */
function VarshitapTracker() {
  const { t } = useLanguage();
  const [fasting, setFasting] = useState(false);
  const completedDays = 52;
  const totalDays = 400;
  const pct = Math.round((completedDays / totalDays) * 100);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        🌿 {t("Varshitap Tracker")}
      </h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-800">{completedDays} <span className="text-sm font-medium text-slate-400">/ {totalDays} days</span></div>
            <div className="text-[10px] text-slate-500 mt-0.5">{pct}% {t("complete")}</div>
          </div>
          <div className="text-4xl">🌿</div>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t("Today's Status")}</div>
            <div className={cn("text-sm font-bold mt-0.5", fasting ? "text-emerald-600" : "text-slate-400")}>
              {fasting ? "✅ Upvas (Fasting)" : "⬜ Not marked yet"}
            </div>
          </div>
          <button
            onClick={() => setFasting(!fasting)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
              fasting
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-emerald-500 border-emerald-500 text-white shadow-sm"
            )}
          >
            {fasting ? t("Undo") : t("Mark Upvas")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function MemberSpiritualPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("mala");

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 pt-1">
        <Sparkles className="h-5 w-5 text-orange-500" />
        <h1 className="text-lg font-bold text-slate-800">{t("Spiritual Tools")}</h1>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 rounded-2xl p-1">
        {[
          { key: "mala",      label: "📿 Mala" },
          { key: "tithi",     label: "🗓️ Tithi" },
          { key: "varshitap", label: "🌿 Varshitap" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "py-2 rounded-xl text-[11px] font-bold transition-all",
              tab === key
                ? "bg-white shadow-sm text-orange-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "mala"      && <DigitalMala />}
      {tab === "tithi"     && <TithiCalendar />}
      {tab === "varshitap" && <VarshitapTracker />}
    </div>
  );
}
