import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Megaphone, Store, Eye, Tag, TrendingUp, Upload, RefreshCw, Calendar, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdsPage() {
  const { t } = useLanguage();
  const [ads, setAds] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);
  const [adForm, setAdForm] = useState({
    bannerUrl: "",
    targetLink: "",
    slot: "TOP_BANNER",
    startAt: new Date().toISOString().slice(0, 10),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    pricingModel: "FLAT",
    priceRate: "100"
  });
  const [savingAd, setSavingAd] = useState(false);

  const calculateTotal = () => {
    if (!adForm.startAt || !adForm.endAt) return null;
    const s = new Date(adForm.startAt);
    const e = new Date(adForm.endAt);
    if (e <= s) return "End date must be after start date";
    const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const rate = parseFloat(adForm.priceRate) || 0;
    if (adForm.pricingModel === "FLAT") {
      return `Estimated Total: Rs. ${(days * rate).toLocaleString()} (${days} days @ Rs. ${rate}/day)`;
    } else if (adForm.pricingModel === "CPC") {
      return `CPC Model: Pay-per-click @ Rs. ${rate}/click`;
    } else {
      return `CPM Model: Pay-per-thousand-views @ Rs. ${rate}/1000 views`;
    }
  };

  const handleSaveAd = async () => {
    if (!adForm.bannerUrl) {
      toast.error(t("Banner image URL is required."));
      return;
    }
    setSavingAd(true);
    try {
      const payload = {
        bannerUrl: adForm.bannerUrl,
        targetLink: adForm.targetLink || undefined,
        slot: adForm.slot,
        startAt: new Date(adForm.startAt).toISOString(),
        endAt: new Date(adForm.endAt).toISOString(),
        pricingModel: adForm.pricingModel,
        priceRate: parseFloat(adForm.priceRate) || 0
      };
      await api.post("/ads", payload);
      toast.success(t("Advertisement created successfully."));
      setCreateOpen(false);
      setReload(k => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSavingAd(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get("/ads").catch(() => ({ data: { data: [] } })),
      api.get("/offers").catch(() => ({ data: { data: [] } })),
    ]).then(([a, o]) => {
      setAds(a.data?.data?.items || a.data?.data || []);
      setOffers(o.data?.data?.items || o.data?.data || []);
    }).finally(() => setLoading(false));
  }, [reload]);

  const totalViews = ads.reduce((s, a) => s + (a.viewCount || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clickCount || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0";

  const gradients = [
    "linear-gradient(135deg,#F59E0B,#F97316)",
    "linear-gradient(135deg,#10B981,#059669)",
    "linear-gradient(135deg,#8B5CF6,#7C3AED)",
    "linear-gradient(135deg,#F97316,#DC2626)",
  ];

  return (
    <div data-testid="ads-page">
      <PageHeader
        title={t("Advertisement & Offers Management")}
        subtitle={t("Manage sponsors, support partners, banners, offers, and monetization.")}
        actions={<Button onClick={() => setCreateOpen(true)} data-testid="ads-create-btn"><Plus className="h-4 w-4 mr-2" /> {t("Create Advertisement")}</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label={t("Active Ads")} value={ads.length} delta={t("Across all platforms")} icon={Megaphone} tone="green" />
        <StatCard label={t("Community Partners")} value={ads.filter(a=>a.isPartner).length || "—"} delta={t("Verified partners")} icon={Store} tone="orange" />
        <StatCard label={t("Total Banner Views")} value={totalViews.toLocaleString()} delta={t("Across placements")} icon={Eye} tone="purple" />
        <StatCard label={t("Active Offers")} value={offers.filter(o => o.status === "ACTIVE" || !o.status).length} delta={t("Live on offers page")} icon={Tag} tone="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2 p-5 rounded-xl border-border">
          <h2 className="font-heading text-base font-semibold mb-4">{t("Banner Management")}</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i=><Skeleton key={i} className="h-40" />)}</div>
          ) : ads.length === 0 ? (
            <EmptyState title={t("No ads yet")} description={t("Create your first advertisement banner.")} icon={Megaphone} className="border-0" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ads.slice(0, 4).map((b, i) => (
                <div key={b.id} className="rounded-lg overflow-hidden border border-border" data-testid={`banner-${i}`}>
                  <div className="h-32 relative flex flex-col items-center justify-center text-white p-4" style={{background: gradients[i % 4]}}>
                    <Badge className="absolute top-2 left-2 bg-white/25 text-white border-white/40 text-[9px]">{b.slot || "TOP_BANNER"}</Badge>
                    <div className="text-center text-xs md:text-sm font-bold tracking-wide">{b.title || b.tagline || "Banner"}</div>
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold truncate">{b.title || b.name || b.slot}</div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px]">{b.isActive ? t("Active") : t("Inactive")}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{formatDate(b.startAt || b.startDate)} — {formatDate(b.endAt || b.endDate)}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                      <span>{t("Rate: Rs.")} {b.priceRate || 0} ({b.pricingModel || "FLAT"})</span>
                      <span className="font-bold text-slate-700">{t("Cost: Rs.")} {b.totalCost || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-xl border-border">
          <h2 className="font-heading text-base font-semibold mb-4">{t("Analytics")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("Impressions"), value: totalViews.toLocaleString(), tone: "green" },
              { label: t("Clicks"), value: totalClicks.toLocaleString(), tone: "blue" },
              { label: "CTR", value: `${ctr}%`, tone: "purple" },
              { label: t("Ads Live"), value: ads.length, tone: "orange" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-lg border border-border">
                <div className="text-[11px] text-muted-foreground">{t(s.label)}</div>
                <div className="font-bold text-xl font-mono-num mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {[
              { icon: Upload, label: t("Upload Banner"), tone: "green" },
              { icon: RefreshCw, label: t("Replace Logo"), tone: "purple" },
              { icon: Calendar, label: t("Schedule Campaign"), tone: "orange" },
              { icon: BarChart3, label: t("Export Analytics"), tone: "red" },
            ].map((q, i) => (
              <button key={i} className="w-full p-3 rounded-lg text-white text-left flex items-center gap-2 transition-transform hover:scale-[1.01]" style={{background: `hsl(var(--c-${q.tone}))`}} data-testid={`ads-qa-${i}`}>
                <q.icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{t(q.label)}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Offers */}
      <Card className="p-5 rounded-xl border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold">{t("Offers Page Management")}</h2>
          <Button size="sm" onClick={() => setCreateOfferOpen(true)} data-testid="offers-create-btn">
            <Plus className="h-4 w-4 mr-1.5" /> {t("Add Offer")}
          </Button>
        </div>
        {offers.length === 0 ? (
          <EmptyState title={t("No offers yet")} description={t("Create offers from community partners.")} icon={Tag} className="border-0" />
        ) : (
          <div className="space-y-2">
            {offers.map((o, i) => (
              <div key={o.id || i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border">
                <div className="h-10 w-10 rounded bg-gradient-to-br from-orange-200 to-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{o.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{o.description || o.companyName || o.merchantName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">{formatDate(o.endAt || o.validUntil)}</div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] mt-1">{o.status || "ACTIVE"}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md" data-testid="ads-form-dialog">
          <DialogHeader>
            <DialogTitle>{t("Create Advertisement")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">{t("Banner Image URL *")}</Label>
              <Input
                value={adForm.bannerUrl}
                onChange={(e) => setAdForm({ ...adForm, bannerUrl: e.target.value })}
                placeholder="https://example.com/banner.png"
                data-testid="ads-form-bannerUrl"
              />
            </div>
            <div>
              <Label className="text-xs">{t("Click-through URL (Target Link)")}</Label>
              <Input
                value={adForm.targetLink}
                onChange={(e) => setAdForm({ ...adForm, targetLink: e.target.value })}
                placeholder="https://example.com/target"
                data-testid="ads-form-targetLink"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("Placement Slot *")}</Label>
                <select
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                  value={adForm.slot}
                  onChange={(e) => setAdForm({ ...adForm, slot: e.target.value })}
                >
                  <option value="TOP_BANNER">{t("Top Banner")}</option>
                  <option value="IN_FEED">{t("In-Feed")}</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">{t("Pricing Model *")}</Label>
                <select
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                  value={adForm.pricingModel}
                  onChange={(e) => setAdForm({ ...adForm, pricingModel: e.target.value })}
                >
                  <option value="FLAT">{t("Flat Rate (Per Day)")}</option>
                  <option value="CPC">{t("CPC (Per Click)")}</option>
                  <option value="CPM">{t("CPM (Per 1000 Views)")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label className="text-xs">{t("Campaign Period *")}</Label>
                <div className="flex gap-1.5 mt-1">
                  <Input
                    type="date"
                    className="h-9"
                    value={adForm.startAt}
                    onChange={(e) => setAdForm({ ...adForm, startAt: e.target.value })}
                  />
                  <span className="text-slate-400 mt-2 text-xs">to</span>
                  <Input
                    type="date"
                    className="h-9"
                    value={adForm.endAt}
                    onChange={(e) => setAdForm({ ...adForm, endAt: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("Rate (Rs.) *")}</Label>
                <Input
                  type="number"
                  className="mt-1 h-9"
                  value={adForm.priceRate}
                  onChange={(e) => setAdForm({ ...adForm, priceRate: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing Calculator Live Output */}
            {adForm.startAt && adForm.endAt && (
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs font-semibold text-orange-850 text-center">
                📊 {calculateTotal()}
              </div>
            )}

          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSaveAd} disabled={savingAd} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
              {savingAd ? t("Saving…") : t("Create Ad")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EntityFormDialog
        open={createOfferOpen}
        onOpenChange={setCreateOfferOpen}
        title={t("Create Offer")}
        endpoint="/offers"
        onSaved={() => setReload((k) => k + 1)}
        testId="offers-form"
        fields={[
          { name: "title", label: t("Title"), required: true },
          { name: "description", label: t("Description"), type: "textarea" },
          { name: "companyName", label: t("Merchant / Partner"), required: true },
          { name: "bannerUrl", label: t("Banner URL") },
          { name: "companyLogoUrl", label: t("Logo URL") },
          { name: "startAt", label: t("Valid from"), type: "date", required: true },
          { name: "endAt", label: t("Valid until"), type: "date", required: true },
        ]}
      />
    </div>
  );
}
