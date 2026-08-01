import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, Trophy, LayoutGrid, Plus, RotateCcw, Sigma, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { initials } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

const TILE_TONES = ["green", "orange", "purple", "red", "blue", "green", "orange", "purple"];

export default function CountersPage() {
  const { t } = useLanguage();
  const [counters, setCounters] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("top");

  // Load counter types list & overview stats
  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get("/counters/admin/overview");
      setCounters(res.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to load counter dashboard data."));
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard based on active tab selection
  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const params = {};
      if (selectedTab === "today") {
        params.scope = "today";
      } else if (selectedTab !== "top") {
        params.counterTypeId = selectedTab;
      }
      const res = await api.get("/counters/leaderboard", { params });
      setLeaderboard(res.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to load leaderboard."));
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [reload]);

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, reload]);


  const totalMembers = counters.reduce((s, c) => s + (c.memberCount || 0), 0);
  const totalToday = counters.reduce((s, c) => s + (c.todayCount || 0), 0);
  const mostActive = [...counters].sort((a, b) => (b.count || 0) - (a.count || 0))[0];

  const handleAddCounterType = async () => {
    if (!newTypeName.trim()) {
      toast.error(t("Please enter a counter type name."));
      return;
    }
    setSaving(true);
    try {
      await api.post("/counters/types", { name: newTypeName.trim() });
      toast.success(t("Counter type added successfully."));
      setAddOpen(false);
      setNewTypeName("");
      setReload(k => k + 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add counter type.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (id, name) => {
    if (!confirm(`Are you sure you want to reset all user counts for "${name}" to zero?`)) return;
    try {
      await api.post(`/counters/types/${id}/reset`);
      toast.success(`Reset counts for ${name}`);
      setReload(k => k + 1);
    } catch (e) {

      toast.error(e?.response?.data?.message || "Failed to reset counter.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the counter type "${name}"?`)) return;
    try {
      await api.delete(`/counters/types/${id}`);
      toast.success(`Deleted ${name}`);
      setReload(k => k + 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete counter type.");
    }
  };

  return (
    <div data-testid="counters-page">
      <PageHeader
        title={t("Spiritual Counting Management")}
        subtitle={t("Manage digital mala counters, member participation, and spiritual engagement analytics.")}
        actions={
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setAddOpen(true)} data-testid="counters-add-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("Add Counter Type")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label={t("Total Active Members")} value={loading ? "..." : totalMembers.toLocaleString()} delta={t("Community wide")} icon={Users} tone="green" />
        <StatCard label={t("Total Counts Today")} value={loading ? "..." : totalToday.toLocaleString()} delta={t("Aggregate today")} icon={TrendingUp} tone="orange" />
        <StatCard label={t("Most Active Counter")} value={loading ? "..." : (mostActive?.name || "—")} delta={mostActive ? `${(mostActive.count || 0).toLocaleString()} counts` : t("No data")} icon={Trophy} tone="purple" />
        <StatCard label={t("Total Counter Types")} value={loading ? "..." : counters.length} delta={t("Active types")} icon={LayoutGrid} tone="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2 p-5 rounded-xl border-border bg-white shadow-sm">
          <h2 className="font-heading text-base font-semibold mb-4">{t("Counter Types Management")}</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
            </div>
          ) : counters.length === 0 ? (
            <EmptyState title={t("No counters yet")} description={t("Create counter types like Navkar Mantra, Samaik, Logas to track member spiritual engagement.")} icon={Sigma} className="border-0" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {counters.map((c, i) => {
                const tone = TILE_TONES[i % TILE_TONES.length];
                return (
                  <div key={c.id} className="p-4 rounded-lg border border-slate-100 hover:shadow-md transition-all bg-white relative flex flex-col justify-between" data-testid={`counter-tile-${i}`}>
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-lg bg-orange-50 text-orange-600 h-10 w-10 flex items-center justify-center`}><Sigma className="h-5 w-5" /></div>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleReset(c.id, c.name)} title={t("Reset counts")} className="text-slate-400 hover:text-orange-500 transition-colors p-1"><RotateCcw className="h-3.5 w-3.5" /></button>
                          <PermissionGate action="DELETE">
                            <button onClick={() => handleDelete(c.id, c.name)} title={t("Delete counter type")} className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                          </PermissionGate>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{c.name || "Counter"}</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-1 text-[11px] border-t pt-2 border-slate-50">
                      <div>
                        <div className="text-slate-400 font-medium">{t("Total Counts")}</div>
                        <div className="font-bold font-mono-num text-slate-800">{(c.count || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">{t("Active Users")}</div>
                        <div className="font-bold font-mono-num text-slate-800">{c.memberCount || 0}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-xl border-border bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold text-slate-800">{t("Leaderboard")}</h2>
            </div>
            <div className="flex gap-1.5 mb-4 flex-wrap">
              <button
                onClick={() => setSelectedTab("top")}
                className={`text-[10px] px-2.5 py-1.5 rounded-full transition-all ${
                  selectedTab === "top" ? "bg-orange-500 text-white" : "border border-border text-slate-600 bg-white hover:border-orange-200"
                }`}
              >
                {t("Overall")}
              </button>
              <button
                onClick={() => setSelectedTab("today")}
                className={`text-[10px] px-2.5 py-1.5 rounded-full transition-all ${
                  selectedTab === "today" ? "bg-orange-500 text-white" : "border border-border text-slate-600 bg-white hover:border-orange-200"
                }`}
              >
                {t("Today")}
              </button>
              {counters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedTab(c.id)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-full transition-all ${
                    selectedTab === c.id ? "bg-orange-500 text-white" : "border border-border text-slate-600 bg-white hover:border-orange-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            
            {leaderboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <EmptyState title={t("No leaderboard data")} description={t("Once members start counting, the leaderboard will populate.")} icon={Trophy} className="border-0 py-8" />
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((l, i) => {
                  const trophies = ["🥇", "🥈", "🥉"];
                  const name = l.member?.fullName || l.name || "Devotee";
                  return (
                    <div key={l.id || i} className={`flex items-center gap-3 p-2.5 rounded-lg ${i === 0 ? "bg-amber-50/50 border border-amber-200" : "bg-slate-50/50 border border-slate-100"}`}>
                      <div className="text-lg w-6 text-center font-bold text-muted-foreground">{trophies[i] || (i + 1)}</div>
                      <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-orange-100 text-orange-600">{initials(name)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-slate-800">{name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{l.counterType || "Counter"}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400">{t("Total")}</div>
                        <div className="text-sm font-bold font-mono-num text-slate-800">{(Number(l.count) || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t("Add Counter Type")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("Counter Type Name *")}</Label>
              <Input value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder={t("e.g. Navkar Mantra, Logas, Samaik")} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={handleAddCounterType} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? t("Saving...") : t("Add Counter")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
