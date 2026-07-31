import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { api, extractErrorMessage, STATIC_URL } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  HeartHandshake, ShieldCheck, Clock, TrendingUp, Search, Plus,
  Check, X, FileText, Loader2, Camera, ExternalLink, Info,
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLanguage } from "@/contexts/LanguageContext";

const STATUS_TONE = {
  PENDING: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DonationsPage() {
  const { t } = useLanguage();
  const { canDo, user, isSuperAdmin } = useAuth();
  const orgId = user?.organizationIds?.[0];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [reload, setReload] = useState(0);

  // Dialog State
  const [recordOpen, setRecordOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // New donation form state
  const [amount, setAmount] = useState("");
  const [txRef, setTxRef] = useState("");
  const [donorId, setDonorId] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [splits, setSplits] = useState({}); // { [categoryId]: amount }
  const [submitting, setSubmitting] = useState(false);
  const [orgsList, setOrgsList] = useState([]);
  const [targetOrgId, setTargetOrgId] = useState(orgId || "");

  const fileRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const endpoint = isSuperAdmin ? `/donations` : orgId ? `/donations/org/${orgId}` : `/donations/my`;
    api.get(endpoint)
      .then((res) => setRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [orgId, isSuperAdmin, reload]);

  useEffect(() => {
    if (recordOpen) {
      // Fetch donation categories
      api.get("/master-data/donation-categories")
        .then((r) => {
          const cats = r.data?.data || [];
          setCategories(cats);
          const initialSplits = {};
          cats.forEach((c) => { initialSplits[c.id] = ""; });
          setSplits(initialSplits);
        })
        .catch(() => {});

      // Fetch orgs list if super admin
      if (isSuperAdmin) {
        api.get("/temples")
          .then((r) => {
            const list = r.data?.data?.items || r.data?.data || [];
            setOrgsList(list);
            if (list.length > 0) {
              setTargetOrgId((prev) => prev || list[0].id);
            }
          })
          .catch(() => {});
      }
    }
  }, [recordOpen, isSuperAdmin]);

  const act = async (id, action) => {
    try {
      await api.post(`/donations/${id}/decision`, {
        decision: action === "verify" ? "VERIFY" : "REJECT",
      });
      toast.success(action === "verify" ? "Donation Verified" : "Donation Rejected");
      setReload(k => k+1);
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const totals = rows.reduce((a, r) => {
    const amt = Number(r.totalAmount || r.amount || 0);
    a.count += 1; a.total += amt;
    if (r.status === "VERIFIED") a.verified += amt;
    if (r.status === "PENDING" || !r.status) a.pending += amt;
    return a;
  }, { count: 0, total: 0, verified: 0, pending: 0 });

  const [searchParams] = useSearchParams();
  const donationType = searchParams.get("type"); // "online" | "offline"

  const filtered = rows.filter((r) => {
    if (status !== "ALL" && r.status !== status) return false;
    if (donationType === "online" && (r.flowType === "OFFLINE" || r.flowType === "ORG_MANUAL")) return false;
    if (donationType === "offline" && r.flowType === "ONLINE") return false;
    if (q && !JSON.stringify(r).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const trendData = rows.slice(0, 12).reverse().map((r, i) => ({
    t: formatDateTime(r.createdAt)?.split(",")[0] || `${i}`,
    v: Number(r.totalAmount || r.amount || 0)
  }));

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    let finalOrgId = isSuperAdmin ? targetOrgId : orgId;
    if (!finalOrgId && orgsList.length > 0) {
      finalOrgId = orgsList[0].id;
      setTargetOrgId(orgsList[0].id);
    }
    if (!finalOrgId) { toast.error(t("Please select a temple/organization.")); return; }
    if (!amount || Number(amount) <= 0) { toast.error(t("Please enter a valid amount.")); return; }

    // Validate category splits sum
    const totalAmountNum = Number(amount);
    let currentSplits = { ...splits };
    let filledSum = Object.values(currentSplits).reduce((sum, v) => sum + (Number(v) || 0), 0);

    // Auto-allocate if user did not enter custom category splits
    if (filledSum === 0 && categories.length > 0) {
      const splitAmt = Number((totalAmountNum / categories.length).toFixed(2));
      const autoSplits = {};
      categories.forEach((c) => { autoSplits[c.id] = splitAmt; });
      const autoSum = splitAmt * categories.length;
      const diff = Number((totalAmountNum - autoSum).toFixed(2));
      if (diff !== 0) {
        autoSplits[categories[categories.length - 1].id] = Number((splitAmt + diff).toFixed(2));
      }
      currentSplits = autoSplits;
    }

    let splitsSum = 0;
    const categorySplits = [];
    Object.entries(currentSplits).forEach(([catId, val]) => {
      const valNum = Number(val);
      if (valNum > 0) {
        splitsSum = Number((splitsSum + valNum).toFixed(2));
        categorySplits.push({ donationCategoryId: catId, amount: valNum });
      }
    });

    if (Math.abs(splitsSum - totalAmountNum) > 0.05) {
      toast.error(`Category splits sum (₹${splitsSum}) must equal total amount (₹${totalAmountNum}). Click "Split Evenly" to auto-allocate.`);
      return;
    }

    setSubmitting(true);
    try {
      let proofUrl = undefined;
      // 1. Upload proof file if provided
      if (proofFile) {
        const fd = new FormData();
        fd.append("proof", proofFile);
        const uploadRes = await api.post(`/donations/upload-proof`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        proofUrl = uploadRes.data?.data?.proofUrl;
      }

      // 2. Submit manual donation record
      const payload = {
        organizationId: finalOrgId,
        totalAmount: totalAmountNum,
        currency: "INR",
        categorySplits,
        idempotencyKey: "don_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      };
      if (txRef && txRef.trim()) payload.transactionReference = txRef.trim();
      if (proofUrl) payload.proofUrl = proofUrl;
      if (donorId && donorId.trim()) payload.donorMemberPublicId = donorId.trim();

      await api.post(`/donations/manual`, payload);

      toast.success(t("Donation recorded successfully."));
      setRecordOpen(false);
      setReload((k) => k + 1);
      // reset form
      setAmount("");
      setTxRef("");
      setDonorId("");
      setProofFile(null);
      setProofPreview(null);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "Failed to record donation");
    } finally {
      setSubmitting(false);
    }
  };

  const autoSplitEvenly = () => {
    if (!amount || Number(amount) <= 0 || categories.length === 0) return;
    const total = Number(amount);
    const splitAmt = Number((total / categories.length).toFixed(2));
    const newSplits = {};
    categories.forEach((c) => { newSplits[c.id] = splitAmt; });
    // Adjust last one for precision
    const sum = splitAmt * categories.length;
    if (sum !== total) {
      newSplits[categories[categories.length - 1].id] = Number((splitAmt + (total - sum)).toFixed(2));
    }
    setSplits(newSplits);
  };

  return (
    <div data-testid="donations-page">
      <PageHeader
        title={t("Donations Management")}
        subtitle={t("Verify offline donations, manage campaigns and issue 80G receipts to donors.")}
        actions={
          canDo("DONATIONS", "CREATE") && (
            <Button onClick={() => setRecordOpen(true)} data-testid="donations-new-btn" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> {t("Record Donation")}
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label={t("Total Donations")} value={formatCurrency(totals.total)} delta={`${totals.count} donations`} icon={HeartHandshake} tone="green" />
        <StatCard label={t("Verified")} value={formatCurrency(totals.verified)} delta={t("Receipt issued")} icon={ShieldCheck} tone="green" />
        <StatCard label={t("Pending")} value={formatCurrency(totals.pending)} delta={t("Needs verification")} icon={Clock} tone="orange" />
        <StatCard label={t("Total Donors")} value={totals.count} delta={t("This period")} icon={TrendingUp} tone="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2 p-5 rounded-xl border-border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-base font-semibold">{t("Recent Donations")}</h2>
            <div className="flex gap-2 items-center flex-wrap">
              <Tabs value={status} onValueChange={setStatus}>
                <TabsList>
                  {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((s) => (
                    <TabsTrigger key={s} value={s} className="text-xs">{s}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative w-40">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={t("Search…")} className="pl-8 h-8 text-xs" />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i=><Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState title={t("No donations yet")} description={t("Recorded donations will appear here for verification.")} icon={HeartHandshake} className="border-0" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left font-semibold py-2">{t("Donor")}</th>
                    <th className="text-left font-semibold">{t("Flow")}</th>
                    <th className="text-right font-semibold">{t("Amount")}</th>
                    <th className="text-center font-semibold">{t("Status")}</th>
                    <th className="text-right font-semibold">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 10).map((r, i) => {
                    const name = r.donor?.fullName || r.donorName || "Anonymous";
                    const st = r.status || "PENDING";
                    return (
                      <tr key={r.id || i} className="border-b border-border/60 last:border-0 hover:bg-slate-50/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials(name)}</AvatarFallback></Avatar>
                            <div>
                              <div className="text-sm font-medium">{name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono-num">{r.publicId || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge variant="outline" className="text-[10px]">{r.flowType || "ORG_MANUAL"}</Badge></td>
                        <td className="text-right font-mono-num font-bold text-emerald-700">{formatCurrency(r.totalAmount || r.amount || 0, r.currency || "INR")}</td>
                        <td className="text-center"><span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_TONE[st] || STATUS_TONE.PENDING}`}>{st}</span></td>
                        <td className="text-right">
                          <div className="inline-flex gap-1.5 items-center">
                            {st === "PENDING" && canDo("DONATIONS", "APPROVE") && (
                              <>
                                <button className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200" onClick={() => act(r.id, "verify")} data-testid={`don-verify-${r.id}`}><Check className="h-3 w-3" /></button>
                                <button className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => act(r.id, "reject")} data-testid={`don-reject-${r.id}`}><X className="h-3 w-3" /></button>
                              </>
                            )}
                            <button className="p-1.5 rounded hover:bg-slate-100 border border-slate-200" onClick={() => { setSelectedDonation(r); setDetailOpen(true); }}>
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-xl border-border bg-white shadow-sm">
          <div className="mb-2">
            <div className="text-xs text-muted-foreground">{t("Total Collection")}</div>
            <div className="flex items-baseline gap-3 mt-1">
              <div className="font-heading font-bold text-2xl text-foreground font-mono-num">{formatCurrency(totals.total)}</div>
            </div>
          </div>
          <div className="h-40 -mx-2 mt-3">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="donG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152 65% 42%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(152 65% 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(30, 10%, 92%)" />
                  <XAxis dataKey="t" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 11 }} />
                  <Area type="monotone" dataKey="v" stroke="hsl(152 65% 42%)" strokeWidth={2.5} fill="url(#donG)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">{t("No trend data yet")}</div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{t("Quick Split")}</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>{t("Verified")}</span><span className="font-mono-num font-semibold text-emerald-700">{formatCurrency(totals.verified)}</span></div>
              <div className="flex justify-between"><span>{t("Pending")}</span><span className="font-mono-num font-semibold text-amber-700">{formatCurrency(totals.pending)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="font-semibold">{t("Total")}</span><span className="font-mono-num font-bold">{formatCurrency(totals.total)}</span></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Record Donation Dialog */}
      <Dialog open={recordOpen} onOpenChange={(o) => { setRecordOpen(o); if (!o) { setProofFile(null); setProofPreview(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-orange-600" /> {t("Record Manual Donation")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordSubmit} className="space-y-4 pt-2">
            {isSuperAdmin && (
              <div>
                <Label className="text-xs">{t("Select Temple / Organization *")}</Label>
                <SearchableSelect
                  value={targetOrgId}
                  onValueChange={setTargetOrgId}
                  options={orgsList.map((o) => ({ value: o.id, label: `${o.name} (${o.city})` }))}
                  placeholder={t("Choose temple…")}
                  searchPlaceholder={t("Search temple…")}
                  className="mt-1"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("Amount (INR) *")}</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("e.g. 5000")} min={1} required />
              </div>
              <div>
                <Label className="text-xs">{t("Tx Ref / Receipt Number (Optional)")}</Label>
                <Input value={txRef} onChange={(e) => setTxRef(e.target.value)} placeholder={t("e.g. UPI txn ref or cash no.")} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">{t("Donor Member ID (Optional)")}</Label>
                <Input value={donorId} onChange={(e) => setDonorId(e.target.value)} placeholder={t("e.g. JFJM101 (leave blank for guest/anon)")} />
              </div>
            </div>

            {/* Category Splits */}
            {categories.length > 0 && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">{t("Category Allocation")}</div>
                  <Button type="button" variant="link" size="sm" onClick={autoSplitEvenly} className="text-xs h-auto p-0 text-orange-600 font-semibold">
                    {t("Split Evenly")}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-1">
                      <Label className="text-[11px] text-slate-600 truncate">{cat.name}</Label>
                      <Input type="number" placeholder="₹0" value={splits[cat.id] || ""}
                        onChange={(e) => setSplits({ ...splits, [cat.id]: e.target.value })} className="h-8 text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Proof File */}
            <div>
              <Label className="text-xs">{t("Payment Proof Receipt (Optional)")}</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="h-16 w-16 rounded-lg bg-slate-100 border flex items-center justify-center overflow-hidden">
                  {proofPreview ? (
                    <img src={proofPreview} alt={t("preview")} className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-8">
                    {t("Select Image/Receipt")}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setProofFile(f);
                        setProofPreview(URL.createObjectURL(f));
                      }
                    }} />
                  <div className="text-[10px] text-slate-400 mt-1">{t("Image or PDF. Max 10 MB")}</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRecordOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700 text-white">
                {submitting ? t("Submitting…") : t("Record Donation")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Donation Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-orange-600" /> {t("Donation Details")}
            </DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{t("ID")}</div>
                  <div className="font-mono mt-0.5">{selectedDonation.publicId || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{t("Status")}</div>
                  <Badge className={`text-xs mt-0.5 ${STATUS_TONE[selectedDonation.status] || "bg-amber-100"}`}>
                    {selectedDonation.status || "PENDING"}
                  </Badge>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{t("Amount")}</div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(selectedDonation.totalAmount || selectedDonation.amount || 0, selectedDonation.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{t("Flow Type")}</div>
                  <div className="mt-0.5">{selectedDonation.flowType || "ORG_MANUAL"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{t("Donor")}</div>
                  <div className="mt-0.5 font-medium">{selectedDonation.donor?.fullName || selectedDonation.donorName || "Anonymous"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{t("Tx Reference")}</div>
                  <div className="mt-0.5 font-mono">{selectedDonation.transactionReference || "—"}</div>
                </div>
              </div>

              {/* Splits */}
              {selectedDonation.categorySplits?.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[11px] uppercase font-bold text-slate-500 mb-2">{t("Category Splits")}</div>
                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg text-xs">
                    {selectedDonation.categorySplits.map((s, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{s.donationCategory?.name || "Allocation"}</span>
                        <span className="font-mono-num font-bold text-emerald-700">{formatCurrency(s.amount, selectedDonation.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                {selectedDonation.proofUrl && (
                  <a href={selectedDonation.proofUrl.startsWith("http") ? selectedDonation.proofUrl : `${STATIC_URL}${selectedDonation.proofUrl}`}
                    target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      {t("View Proof")} <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
                {selectedDonation.receipt?.pdfUrl && (
                  <a href={selectedDonation.receipt.pdfUrl.startsWith("http") ? selectedDonation.receipt.pdfUrl : `${STATIC_URL}${selectedDonation.receipt.pdfUrl}`}
                    target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      {t("Download Receipt")} <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
