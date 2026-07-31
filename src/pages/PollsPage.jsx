import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, X, Loader2, Vote } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PollsPage() {
  const { t } = useLanguage();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(null);
  const [form, setForm] = useState({ question: "", options: ["", ""] });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/feed", { params: { page: 1, pageSize: 50 } });
        const items = res.data?.data?.items || [];
        const pollPosts = items.map((i) => i.post || i).filter((p) => p?.poll);
        const withResults = await Promise.all(
          pollPosts.map(async (p) => {
            try {
              const r = await api.get(`/polls/${p.poll.id}/results`);
              const d = r.data?.data || {};
              return { ...p.poll, title: p.title, results: d.counts || d.options || [], totalVotes: d.totalVotes };
            } catch {
              return { ...p.poll, title: p.title, results: [] };
            }
          })
        );
        setPolls(withResults);
      } catch {
        setPolls([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadKey]);

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ""] }));
  const removeOption = (i) => setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const setOption = (i, v) => setForm((f) => ({ ...f, options: f.options.map((x, idx) => (idx === i ? v : x)) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/polls", {
        question: form.question,
        options: form.options.filter(Boolean),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      });
      toast.success(t("Poll created."));
      setOpen(false);
      setForm({ question: "", options: ["", ""], endsAt: "" });
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const vote = async (pollId, optionIndex) => {
    setVoting(`${pollId}-${optionIndex}`);
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      toast.success(t("Vote recorded."));
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setVoting(null);
    }
  };

  const closePoll = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/close`);
      toast.success(t("Poll closed successfully."));
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const deletePoll = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      toast.success(t("Poll deleted."));
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div data-testid="polls-page">
      <PageHeader
        title={t("polls.title", "Polls")}
        subtitle={t("Community polls attached to feed posts.")}
        actions={
          <Button onClick={() => setOpen(true)} data-testid="polls-create-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Create Poll")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : polls.length === 0 ? (
        <EmptyState title={t("No polls yet")} description={t("Create a poll to gather community opinions.")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map((p) => (
            <Card key={p.id} className="p-5 rounded-xl border-border" data-testid={`poll-${p.id}`}>
              <div className="font-heading font-semibold text-base mb-3">{p.question || p.title}</div>
              <div className="space-y-2.5 mb-3">
                {(p.results || []).map((o) => (
                  <button
                    key={o.index}
                    onClick={() => vote(p.id, o.index)}
                    disabled={Boolean(voting)}
                    className="w-full text-left group"
                    data-testid={`poll-vote-${p.id}-${o.index}`}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="group-hover:text-primary transition-colors">{t(o.label)}</span>
                      <span className="font-mono-num text-xs text-muted-foreground">{o.votes || 0}</span>
                    </div>
                    <Progress value={p.totalVotes > 0 ? (o.votes / p.totalVotes) * 100 : 0} className="h-1.5" />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{p.totalVotes || 0} {t("votes")}</Badge>
                  {p.endsAt && new Date(p.endsAt) < new Date() && (
                    <Badge variant="secondary" className="bg-red-50 text-red-700 font-bold border-red-200">{t("Closed")}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => closePoll(p.id)}>{t("Close")}</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px] text-red-600 hover:text-red-700" onClick={() => deletePoll(p.id)}>{t("Delete")}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" data-testid="poll-form-dialog">
          <DialogHeader><DialogTitle>{t("Create poll")}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-xs">{t("Question *")}</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
                placeholder={t("e.g. What time works best for evening pravachan?")}
                data-testid="poll-question"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Expiry Date (Optional)")}</Label>
              <Input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Options")}</Label>
              <div className="space-y-2 mt-1">
                {form.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={o}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      required
                      data-testid={`poll-option-${i}`}
                    />
                    {form.options.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)} data-testid={`poll-option-remove-${i}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={addOption} className="mt-2" data-testid="poll-add-option">
                <Plus className="h-3 w-3 mr-1" /> {t("Add option")}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={saving} data-testid="poll-submit">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {t("Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
