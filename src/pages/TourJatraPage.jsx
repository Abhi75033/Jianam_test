import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, PlusCircle, Download, ChevronLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { STATIC_URL } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * TourJatraPage — deep flow: daily jatra count entry, milestone display, certificate download.
 * Route: /tours/:tourId/participants/:participantId
 */
export default function TourJatraPage() {
  const { t } = useLanguage();
  const { tourId, participantId } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [count, setCount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        api.get(`/tours/${tourId}/participants`).catch(() => ({ data: { data: [] } })),
        api.get(`/tours/${tourId}/participants/${participantId}/milestones`).catch(() => ({ data: { data: null } })),
      ]);
      const list = pRes.data?.data?.items || pRes.data?.data || [];
      setParticipant(list.find((p) => p.id === participantId) || list[0] || null);
      setMilestones(mRes.data?.data || null);
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
      await api.post(`/tours/${tourId}/participants/${participantId}/jatra`, {
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
      const res = await api.get(
        `/tours/${tourId}/participants/${participantId}/certificate`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${participant?.publicId || participantId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(t("Certificate not available yet. Complete jatra first."));
    } finally {
      setDownloading(false);
    }
  };

  const pct = milestones?.progressPercent ?? 0;
  const target = milestones?.target ?? 99;
  const done = milestones?.completed ?? 0;
  const currentMilestone = pct >= 100 ? "100%" : pct >= 75 ? "75%" : pct >= 50 ? "50%" : pct >= 25 ? "25%" : "—";

  return (
    <div data-testid="tour-jatra-page">
      <PageHeader
        title={`Jatra Progress · ${participant?.member?.firstName || "Participant"}`}
        subtitle={t("Record daily jatra counts. Milestones and certificate unlock automatically.")}
        actions={
          <Button variant="outline" onClick={() => navigate(`/tours`)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> {t("Back to Tours")}
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading progress…")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Progress card */}
          <Card className="lg:col-span-2 p-6 rounded-xl border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t("Current milestone")}</div>
                <div className="font-heading text-4xl font-bold mt-1 flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-500" /> {currentMilestone}
                </div>
              </div>
              <Badge variant="outline" className="font-mono">{participant?.publicId || "—"}</Badge>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">{t("Jatras completed")}</span>
                <span className="font-mono-num font-semibold">{done} / {target}</span>
              </div>
              <Progress value={pct} className="h-3" data-testid="tour-jatra-progress" />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[25, 50, 75, 100].map((m) => (
                <div
                  key={m}
                  className={`p-3 rounded-lg text-center border ${
                    pct >= m
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-secondary/40 border-border text-muted-foreground"
                  }`}
                  data-testid={`milestone-${m}`}
                >
                  <div className="font-bold text-lg">{m}%</div>
                  <div className="text-[10px] uppercase tracking-widest mt-0.5">
                    {pct >= m ? t("Reached") : t("Locked")}
                  </div>
                </div>
              ))}
            </div>

            {pct >= 100 && (
              <Button
                onClick={downloadCertificate}
                disabled={downloading}
                className="w-full h-11"
                data-testid="tour-jatra-certificate-btn"
              >
                {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {t("Download Certificate (PDF + QR)")}
              </Button>
            )}
          </Card>

          {/* Daily count entry */}
          <Card className="p-6 rounded-xl border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              {t("Record daily jatra")}
            </div>
            <form onSubmit={submitCount} className="space-y-4">
              <div>
                <Label htmlFor="jatra-date" className="text-xs">{t("Date")}</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="jatra-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9"
                    required
                    data-testid="jatra-date-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="jatra-count" className="text-xs">{t("Number of jatras today")}</Label>
                <Input
                  id="jatra-count"
                  type="number"
                  min={0}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder={t("e.g. 3")}
                  className="mt-1"
                  required
                  data-testid="jatra-count-input"
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full" data-testid="jatra-submit">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                {t("Add to progress")}
              </Button>
            </form>
            {STATIC_URL && (
              <div className="text-[10px] text-muted-foreground mt-4">
                {t("Static assets served from")} {STATIC_URL}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
