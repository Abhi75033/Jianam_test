import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, PlusCircle, Download, Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";

/**
 * MemberJatraProgressPage — 99 Yatra daily count entry, milestone display,
 * certificate download for the member's own tour registration.
 *
 * Same three endpoints and payload shapes as admin's TourJatraPage.jsx
 * (GET .../milestones, POST .../jatra, GET .../certificate), called
 * through memberClient. The participantId in the route comes from this
 * member's own POST /tours/{id}/participants response at registration
 * time (see MemberToursPage.jsx) — never guessed or looked up by
 * searching other members' records.
 */
export default function MemberJatraProgressPage() {
  const { t } = useLanguage();
  const { tourId, participantId } = useParams();
  const navigate = useNavigate();

  const [milestones, setMilestones] = useState(null);
  const [count, setCount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await memberClient.get(`/tours/${tourId}/participants/${participantId}/milestones`);
      setMilestones(res?.data?.data || null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tourId, participantId]);

  useEffect(() => { load(); }, [load]);

  const submitCount = async (e) => {
    e.preventDefault();
    if (!count) return;
    setSaving(true);
    try {
      await memberClient.post(`/tours/${tourId}/participants/${participantId}/jatra`, {
        count: Number(count),
        date,
      });
      toast.success(t("Jatra count recorded."));
      setCount("");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const res = await memberClient.get(
        `/tours/${tourId}/participants/${participantId}/certificate`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jatra-certificate-${participantId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("Certificate not available yet. Complete the yatra first."));
    } finally {
      setDownloading(false);
    }
  };

  const pct = milestones?.progressPercent ?? 0;
  const target = milestones?.target ?? 99;
  const done = milestones?.completed ?? 0;
  const currentMilestone = pct >= 100 ? "100%" : pct >= 75 ? "75%" : pct >= 50 ? "50%" : pct >= 25 ? "25%" : "—";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </button>

      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" /> {t("My Jatra Progress")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{t("Record daily jatra counts. Milestones and your certificate unlock automatically.")}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading progress…")}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-6 text-xs text-rose-600 font-semibold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t("Current milestone")}</div>
                <div className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Trophy className="h-7 w-7 text-amber-500" /> {currentMilestone}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-semibold">{t("Jatras completed")}</span>
                <span className="font-bold text-slate-800">{done} / {target}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((m) => (
                <div
                  key={m}
                  className={`p-3 rounded-2xl text-center border ${
                    pct >= m ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="font-black text-base">{m}%</div>
                  <div className="text-[9px] uppercase tracking-widest mt-0.5 font-bold">
                    {pct >= m ? t("Reached") : t("Locked")}
                  </div>
                </div>
              ))}
            </div>

            {pct >= 100 && (
              <button
                onClick={downloadCertificate}
                disabled={downloading}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t("Download Certificate (PDF + QR)")}
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">{t("Record daily jatra")}</div>
            <form onSubmit={submitCount} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("Date")}</label>
                <div className="relative mt-1">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{t("Number of jatras today")}</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="e.g. 3"
                  required
                  className="w-full mt-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                {t("Add to progress")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
