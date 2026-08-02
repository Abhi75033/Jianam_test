import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UsersRound, Plus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { memberClient as api } from "@/lib/memberClient";
import { extractErrorMessage } from "@/lib/api";
import { PhoneField } from "@/components/common/PhoneInput";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * FamilyMembersCard — PRD §4.2.7 Family Member Addition.
 *
 * "User can add multiple family members: Name, Mobile Number. Upon submission
 *  SMS/WhatsApp sent: 'Your profile has been created by [Name]. Download the app
 *  to continue.'"
 *
 * The invite message is composed server-side; this only submits name + mobile
 * and reports what came back. Members cannot delete family links here — §3.5
 * reserves deletion for Super Admin — so the list is add-and-view only.
 */
export default function FamilyMembersCard({ className = "" }) {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/family/my")
      .then((r) => {
        const raw = r.data?.data;
        setMembers(Array.isArray(raw) ? raw : raw?.items || []);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error(t("Name is required.")); return; }
    if (!mobile.trim()) { toast.error(t("Mobile number is required.")); return; }

    setAdding(true);
    try {
      await api.post("/family/", { name: name.trim(), mobile: mobile.trim() });
      toast.success(t("Family member added. An invite has been sent to their mobile."));
      setName(""); setMobile(""); setOpen(false);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className={`p-5 rounded-2xl border-slate-200 bg-white space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UsersRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t("Family Members")}</h3>
            <p className="text-[11px] text-slate-500">
              {t("Add family so they can join with their own profile.")}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={open ? "ghost" : "outline"}
          className="h-8 text-[11px] font-bold shrink-0"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <><X className="h-3.5 w-3.5 mr-1" />{t("Cancel")}</>
                : <><Plus className="h-3.5 w-3.5 mr-1" />{t("Add")}</>}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <Label className="text-xs font-bold text-slate-700">{t("Name *")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("e.g. Ramesh Shah")}
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700">{t("Mobile Number *")}</Label>
            <PhoneField value={mobile} onChange={setMobile} placeholder={t("Mobile Number")} className="mt-1" />
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {t("They will receive an SMS/WhatsApp invite to download the app and continue.")}
          </p>
          <Button type="submit" disabled={adding} className="w-full h-9 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
            {adding ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{t("Sending invite…")}</>
                    : <><Send className="h-3.5 w-3.5 mr-1.5" />{t("Add & Send Invite")}</>}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="text-[11px] text-slate-400 text-center py-4">{t("Loading…")}</div>
      ) : members.length === 0 ? (
        <div className="text-[11px] text-slate-400 italic text-center py-4">
          {t("No family members added yet.")}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m, i) => {
            const label = m.fullName || m.name || m.member?.fullName || t("Family member");
            return (
              <div key={m.id || m.linkId || i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{label}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {m.mobile || m.member?.mobile || "—"}
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                  {m.status || m.relation || t("Linked")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
