import { useState, useEffect } from "react";
import {
  Sparkles, Plus, Minus, RotateCcw, Calendar, Moon, Sun,
  TrendingUp, Compass, Award, CheckCircle2, Flame, Heart,
  Volume2, VolumeX, ShieldCheck, ChevronRight, Check
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  5: "Gyan Panchami",
  8: "Mahashtami",
  14: "Chaturdashi — Paryushan",
  15: "Kartik Purnima",
  20: "Rohini Vrat",
  29: "Amavasya",
};

function TithiCalendar() {
  const { t } = useLanguage();
  const today = new Date();
  const tithiIdx = (today.getDate() - 1) % 30;
  const [selectedTithi, setSelectedTithi] = useState(tithiIdx);

  return (
    <div className="space-y-6">
      {/* Today's Tithi Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15 border border-white/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {today.toLocaleDateString("en-IN", { weekday: "long" })}
            </span>
            <span className="bg-amber-300 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
              {tithiIdx < 15 ? t("Shukla Paksha") : t("Krishna Paksha")}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-amber-100 uppercase tracking-widest">{t("Selected Tithi")}</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mt-1">
              {TITHIS[selectedTithi]}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-orange-100 mt-2">
              📅 {today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} • Vikram Samvat 2082
            </p>
          </div>

          {FESTIVALS[selectedTithi + 1] && (
            <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl px-3.5 py-1.5 text-xs font-bold border border-white/20">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{FESTIVALS[selectedTithi + 1]}</span>
            </div>
          )}
        </div>
      </div>

      {/* 30-Day Tithi Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>{t("Monthly Jain Panchang Calendar")}</span>
          </h3>
          <span className="text-xs text-slate-400 font-bold">30 Days</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-2.5">
          {TITHIS.map((tithi, i) => {
            const isToday = i === tithiIdx;
            const isSelected = i === selectedTithi;
            const hasFest = Boolean(FESTIVALS[i + 1]);

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedTithi(i)}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all active:scale-95 text-center relative",
                  isSelected
                    ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-500/20"
                    : isToday
                    ? "bg-orange-50 border-orange-300 text-orange-700 font-bold"
                    : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100 text-slate-700"
                )}
              >
                <span className="text-xs font-black">{i + 1}</span>
                <span className="text-[9px] font-bold mt-0.5 leading-tight truncate max-w-full">
                  {tithi.slice(0, 5)}
                </span>
                {hasFest && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
                )}
              </button>
            );
          })}
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
    { date: "Yesterday", count: 108, name: "Navkar Mahamantra" },
    { date: "2 days ago", count: 108, name: "Uvasaggaharam Stotra" },
  ]);

  const pct = Math.min((count / goal) * 100, 100);

  const tap = () => {
    setCount((c) => {
      const next = c + 1;
      if (next >= goal) {
        setSessions((prev) => [{ date: "Today", count: goal, name: "Navkar Mahamantra" }, ...prev]);
        toast.success(t("108 Mala Beads Completed! Anumodana 🙏"));
        return 0;
      }
      return next;
    });
  };

  const reset = () => {
    setCount(0);
    toast.info(t("Mala counter reset to 0"));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col items-center gap-6 text-center">
        
        <div className="space-y-1">
          <div className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Compass className="h-4 w-4" />
            <span>{t("Navkar Mahamantra Jaap")}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">{t("Digital Mala Beads Counter")}</h2>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 select-none">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="7" fill="none" />
            <circle
              cx="50" cy="50" r="42"
              stroke="#ea580c" strokeWidth="7" fill="none"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-200"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-5xl font-black text-slate-900 tracking-tight font-mono">{count}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">{t("Target")}: {goal}</div>
          </div>
        </div>

        {/* Large Touch Tap Button */}
        <button
          type="button"
          onClick={tap}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-white flex flex-col items-center justify-center shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all select-none group"
        >
          <span className="text-3xl sm:text-4xl">🙏</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 mt-0.5">{t("Tap")}</span>
        </button>
        <p className="text-xs text-slate-500 font-medium">{t("Tap the button for each completed Navkar Mantra count.")}</p>

        {/* Counter Controls */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 w-full justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("Reset")}</span>
          </button>

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            {[27, 54, 108].map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                  goal === g
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-3">
        <div className="text-xs font-black text-slate-900 uppercase tracking-wider">{t("Recent Sadhana History")}</div>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">{s.name}</div>
                <div className="text-[10px] text-slate-400">{s.date}</div>
              </div>
              <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-xl font-mono">
                {s.count} {t("Beads")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Varshitap & Tapasya Tracker ────────────────────────────────────────── */
function VarshitapTracker() {
  const { t } = useLanguage();
  const [fasting, setFasting] = useState(false);
  const [completedDays, setCompletedDays] = useState(54);
  const totalDays = 400;
  const pct = Math.round((completedDays / totalDays) * 100);

  const toggleFast = () => {
    if (!fasting) {
      setCompletedDays((c) => c + 1);
      setFasting(true);
      toast.success(t("Today's Tapasya logged! Jai Jinendra 🙏"));
    } else {
      setCompletedDays((c) => Math.max(0, c - 1));
      setFasting(false);
      toast.info(t("Tapasya entry undone"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t("Shree Varshitap Mahatapasya")}</div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{completedDays} / {totalDays} {t("Days Completed")}</h2>
          </div>
          <div className="text-3xl p-3 bg-emerald-50 rounded-2xl border border-emerald-100">🌿</div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>{t("Progress")}</span>
            <span className="text-emerald-700">{pct}% {t("completed")}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Today's Status & Action */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase">{t("Today's Tapasya Log")}</div>
            <div className={cn("text-xs sm:text-sm font-black mt-0.5 flex items-center gap-1.5", fasting ? "text-emerald-600" : "text-slate-500")}>
              {fasting ? <CheckCircle2 className="h-4 w-4" /> : null}
              <span>{fasting ? t("Upvas Marked Active") : t("Not marked for today")}</span>
            </div>
          </div>

          <button
            onClick={toggleFast}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all",
              fasting
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            )}
          >
            {fasting ? t("Undo Log") : t("Mark Upvas")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Spiritual Hub Page ────────────────────────────────────────────── */
export default function MemberSpiritualPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("mala");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Compass className="h-4.5 w-4.5" />
          </div>
          <span>{t("Spiritual Hub & Sadhana")}</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          {t("Digital Mala Counter, Daily Tithi Calendar, and Varshitap Sadhana Tracker.")}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/60 shadow-inner">
        {[
          { key: "mala",      label: "📿 Digital Mala" },
          { key: "tithi",     label: "🗓️ Tithi Calendar" },
          { key: "varshitap", label: "🌿 Varshitap" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 select-none",
              tab === key
                ? "bg-white text-orange-600 shadow-sm shadow-slate-900/5 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {tab === "mala"      && <DigitalMala />}
      {tab === "tithi"     && <TithiCalendar />}
      {tab === "varshitap" && <VarshitapTracker />}

    </div>
  );
}
