/**
 * MonksPage — Full MS (Monk / Sadhvi) profile management.
 * Features: List • Search • Register (all fields) • Click-to-ID-Card •
 *           Edit • Photo Upload • Status Toggle • Bulk Import • Export
 */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search, UserPlus, Upload, Download, FileSpreadsheet,
  AlertCircle, CheckCircle2, XCircle, Loader2, X, Trash2, Plus,
  Camera, Pencil, Eye, Users, Flower, BookOpen, MapPin,
  CalendarDays, Star,
} from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions } from "@/constants/dropdownOptions";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import TimePicker, { TimeRangePicker } from "@/components/common/TimePicker";
import MemberLinkSelect from "@/components/common/MemberLinkSelect";

const SHWETAMBAR_SUB = ["Murtipujak", "Sthanakvasi", "Terapanth", "Other"];
const DIGAMBAR_SUB = ["Bisapantha", "Terapantha", "Taranapantha", "Gumanapantha", "Totapantha", "Kanjipantha", "Other Digambar Traditions"];

const MURTIPUJAK_GACCHAS = [
  "Upkeśa Gaccha", "Achal Gaccha", "Jiravala Gaccha", "Kharatara Gaccha", "Lonka (Richmati) Gaccha",
  "Tapa Gaccha", "Gangeshvara Gaccha", "Korantavala Gaccha", "Anandapura Gaccha", "Bharavali Gaccha",
  "Udhaviya Gaccha", "Gudava Gaccha", "Dekawa Gaccha", "Bhinmala Gaccha", "Mahudiya Gaccha",
  "Gachhapala Gaccha", "Goshavala Gaccha", "Magatragada Gaccha", "Vrihmaniya Gaccha", "Talara Gaccha",
  "Vikadiya Gaccha", "Munjhiya Gaccha", "Chitroda Gaccha", "Sachora Gaccha", "Jachandiya Gaccha",
  "Sidhalava Gaccha", "Miyanniya Gaccha", "Agamiya Gaccha", "Maladhari Gaccha", "Bhavariya Gaccha",
  "Paliwala Gaccha", "Nagadigeshvara Gaccha", "Dharmaghosha Gaccha", "Nagapura Gaccha", "Uchatavala Gaccha",
  "Nannavala Gaccha", "Sadera Gaccha", "Mandovara Gaccha", "Surani Gaccha", "Khambhavati Gaccha",
  "Panchanda Gaccha", "Sopariya Gaccha", "Mandaliya Gaccha", "Kochhipana Gaccha", "Jaganna Gaccha",
  "Laparavala Gaccha", "Vosarada Gaccha", "Duivandaniya Gaccha", "Chitravala Gaccha", "Vegada Gaccha",
  "Vapada Gaccha", "Vijahara Gaccha", "Kapuri Gaccha", "Kachala Gaccha", "Handaliya Gaccha",
  "Mahukara Gaccha", "Putaliya Gaccha", "Kannariseya Gaccha", "Revardiya Gaccha", "Dhandhuka Gaccha",
  "Thambhanipana Gaccha", "Panchivala Gaccha", "Palanpura Gaccha", "Gandhariya Gaccha", "Veliya Gaccha",
  "Sadhapunamiya Gaccha", "Nagarakotiya Gaccha", "Hasora Gaccha", "Bhatanera Gaccha", "Janahara Gaccha",
  "Jagayana Gaccha", "Bhimasena Gaccha", "Takadiya Gaccha", "Kamboja Gaccha", "Senata Gaccha",
  "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha", "Ghoghari Gaccha", "Nigamiya Gaccha"
];

const MemberSelect = ({ label, value, onChange, placeholder = "Select Member...", category = null }) => {
  return (
    <div>
      {label && <Label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</Label>}
      <MemberLinkSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        returnValueType="id"
        category={category}
      />
    </div>
  );
};

const MonkSelect = ({ label, value, onChange, placeholder = "Select Sadhuji / Sadhviji..." }) => {
  const { t } = useLanguage();
  const [monks, setMonks] = useState([]);
  useEffect(() => {
    api.get("/monks")
      .then((r) => setMonks(r.data?.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600">{label}</Label>
      <SearchableSelect
        value={value || ""}
        onValueChange={onChange}
        options={monks.map(m => ({
          value: m.id,
          label: `${m.dikshaName} (${m.publicId || "No ID"})`
        }))}
        placeholder={placeholder}
        searchPlaceholder={t("Search MS by name/ID…")}
        className="mt-1"
      />
    </div>
  );
};

/* ─── Helpers ───────────────────────────────────────────────────────── */
function ini(name = "") {
  return (name || "").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "MS";
}
function fmtDate(d) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}

/* ─────────────────────────────────────────────────────────────────────
 * Jain Monk ID Card — unique lotus/Om themed design
 * ───────────────────────────────────────────────────────────────────── */
function MonkIdCardVisual({ monk }) {
  const { t } = useLanguage();
  const isSadhvi = monk?.gender === "SADHVI";
  const accent   = isSadhvi ? "#9B2D7F" : "#4A1D6B"; // purple tones
  const light    = isSadhvi ? "#F5E6FF" : "#EDE0FF";

  return (
    <div className="flex flex-col items-center select-none">
      {/* Decorative top bead chain */}
      <div className="flex gap-1 mb-1" aria-hidden>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full"
            style={{ background: i === 4 ? "#FFD700" : i % 2 === 0 ? accent : light }} />
        ))}
      </div>
      <div className="w-0.5 h-6 bg-gradient-to-b" style={{ background: `linear-gradient(${accent},${light})` }} />

      {/* Card body */}
      <div className="relative w-64 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FAFAF8", border: `2px solid ${accent}22` }}>

        {/* Top decorative band */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, #B06FD0, ${accent})` }} />

        {/* Header area with texture */}
        <div className="px-4 pt-3 pb-4 relative"
          style={{ background: `linear-gradient(145deg, ${accent} 0%, #7B3FA0 100%)` }}>

          {/* Om symbol watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-white text-7xl font-serif select-none">
            ॐ
          </div>

          {/* Org row */}
          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white text-[8px] font-black">जि</span>
              </div>
              <span className="text-[9px] font-bold tracking-widest text-white/80 uppercase">{t("JiNANAM")}</span>
            </div>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
              monk?.status === "ACTIVE"
                ? "bg-green-400/30 text-white border-green-300/50"
                : "bg-white/10 text-white/60 border-white/20"
            }`}>
              {monk?.status || "ACTIVE"}
            </span>
          </div>

          {/* Photo */}
          <div className="relative flex justify-center">
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 shadow-lg"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}>
              {monk?.photoUrl ? (
                <img src={monk.photoUrl} alt={monk.dikshaName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}>
                  <span className="text-3xl font-black text-white/80">{ini(monk?.dikshaName)}</span>
                </div>
              )}
            </div>
            {/* Lotus petal accent */}
            <div className="absolute -bottom-1 text-yellow-300 text-xs" aria-hidden>🪷</div>
          </div>

          {/* Name */}
          <div className="text-center mt-3">
            <div className="font-black text-white text-base leading-tight">{monk?.dikshaName || "—"}</div>
            <div className="text-[10px] text-white/70 mt-0.5 font-semibold tracking-wide">
              {monk?.gender === "SADHVI" ? t("🌸 Sadhvi") : t("🧘 Sadhu")}
              {monk?.gaccha?.name && ` · ${monk.gaccha.name}`}
            </div>
          </div>
        </div>

        {/* White info area */}
        <div className="px-4 pb-3 pt-3 space-y-1.5 bg-white">
          {monk?.nameBeforeDiksha && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Users className="h-3 w-3 shrink-0" style={{ color: accent }} />
              <span>{t("Born:")} <strong>{monk.nameBeforeDiksha}</strong></span>
            </div>
          )}
          {monk?.dikshaDate && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <CalendarDays className="h-3 w-3 shrink-0" style={{ color: accent }} />
              <span>{t("Diksha:")} <strong>{fmtDate(monk.dikshaDate)}</strong>
                {monk.dikshaPlace && ` at ${monk.dikshaPlace}`}
              </span>
            </div>
          )}
          {monk?.currentTemple?.name && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" style={{ color: accent }} />
              <span className="truncate">{monk.currentTemple.name}{monk.currentTemple.city ? `, ${monk.currentTemple.city}` : ""}</span>
            </div>
          )}
          {monk?.community?.name && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Flower className="h-3 w-3 shrink-0" style={{ color: accent }} />
              <span>{monk.community.name}</span>
            </div>
          )}
          {monk?.bio && (
            <div className="flex items-start gap-2 text-[10px] text-slate-400 italic mt-1">
              <BookOpen className="h-3 w-3 shrink-0 mt-0.5" style={{ color: accent }} />
              <span className="line-clamp-2">{monk.bio}</span>
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div className="px-4 py-2 flex items-center justify-between"
          style={{ background: accent }}>
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-yellow-300" />
            <span className="text-[9px] text-white/70">{monk?._count?.followers ?? monk?.followers ?? 0} {t("Followers")}</span>
          </div>
          <span className="text-[10px] font-black font-mono text-white tracking-widest">
            {monk?.publicId || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Switch ─────────────────────────────────────────────── */
function StatusSwitch({ status, onChange }) {
  const { t } = useLanguage();
  const on = status === "ACTIVE";
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border"
      style={{ borderColor: "#7B2D8B22", background: "#F9F0FF" }}>
      <div>
        <div className="text-sm font-semibold">{t("Monk Status")}</div>
        <div className={`text-xs ${on ? "text-emerald-600" : "text-slate-400"}`}>
          {on ? t("Active — visible to community") : t("Inactive — hidden from listings")}
        </div>
      </div>
      <button type="button" onClick={() => onChange(on ? "INACTIVE" : "ACTIVE")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

/* ─── Monk ID Card Dialog ───────────────────────────────────────── */
function MonkIdCardDialog({ open, onClose, monk, onSave, onPhotoSave, isSuperAdmin }) {
  const { t } = useLanguage();
  const [mode, setMode]   = useState("preview");
  const [form, setForm]   = useState({});
  const [status, setStatus] = useState(monk?.status || "ACTIVE");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [temples, setTemples] = useState([]);

  useEffect(() => {
    api.get("/temples").then((r) => setTemples(r.data?.data?.items || r.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (monk) {
      setForm({
        dikshaName:       monk.dikshaName || "",
        nameBeforeDiksha: monk.nameBeforeDiksha || "",
        gender:           monk.gender || "SADHU",
        dikshaDate:       monk.dikshaDate ? monk.dikshaDate.slice(0, 10) : "",
        dikshaPlace:      monk.dikshaPlace || "",
        dob:              monk.dob ? monk.dob.slice(0, 10) : "",
        dobPlace:         monk.dobPlace || "",
        bio:              monk.bio || "",
        currentTempleId:  monk.currentTempleId || monk.currentTemple?.id || "",
      });
      setStatus(monk.status || "ACTIVE");
      setPreview(monk.photoUrl || null);
    }
  }, [monk]);


  const tabs = [
    { id: "image",   Icon: Camera, label: t("Photo") },
    { id: "edit",    Icon: Pencil, label: t("Edit") },
    { id: "preview", Icon: Eye,    label: t("Preview") },
  ];

  const handleStatusChange = async (s) => {
    setStatus(s);
    try { await onSave?.({ _statusOnly: true, status: s }); }
    catch { setStatus(monk?.status || "ACTIVE"); toast.error(t("Failed to update status.")); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave?.({
        dikshaName:       form.dikshaName || undefined,
        nameBeforeDiksha: form.nameBeforeDiksha || undefined,
        gender:           form.gender || undefined,
        dikshaDate:       form.dikshaDate ? new Date(form.dikshaDate).toISOString() : undefined,
        dikshaPlace:      form.dikshaPlace || undefined,
        dob:              form.dob ? new Date(form.dob).toISOString() : undefined,
        dobPlace:         form.dobPlace || undefined,
        bio:              form.bio || undefined,
        currentTempleId:  form.currentTempleId || undefined,
      });
      toast.success(t("Profile updated."));
      setMode("preview");
    } catch { toast.error(t("Failed to save changes.")); }
    finally { setSaving(false); }
  };

  const savePhoto = async () => {
    if (!photoFile) { toast.error(t("Select an image first.")); return; }
    setSaving(true);
    try {
      await onPhotoSave?.(photoFile);
      toast.success(t("Photo updated."));
      setMode("preview");
    } catch { toast.error(t("Photo upload failed.")); }
    finally { setSaving(false); }
  };

  const f = (k) => ({ value: form[k] || "", onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const accent = monk?.gender === "SADHVI" ? "#9B2D7F" : "#4A1D6B";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setMode("preview"); onClose(); } }}>
      <DialogContent className="max-w-sm p-0 border-0 overflow-hidden rounded-2xl shadow-2xl bg-transparent">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1A0A2E" }}>

          {/* Tab bar */}
          <div className="flex gap-1 p-3 pb-0">
            {tabs.map(({ id, Icon, label }) => {
              const active = mode === id;
              return (
                <button key={id} onClick={() => setMode(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                    active ? "text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                  style={active ? { background: accent, boxShadow: `0 4px 15px ${accent}60` } : {}}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              );
            })}
          </div>

          <div className="p-4">
            {/* PREVIEW */}
            {mode === "preview" && (
              <div className="flex flex-col items-center gap-4">
                <MonkIdCardVisual monk={{ ...monk, status }} />
                {isSuperAdmin && (
                  <StatusSwitch status={status} onChange={handleStatusChange} />
                )}
                <Button className="w-full text-white" style={{ background: accent }}
                  onClick={onClose}>{t("Close")}</Button>
              </div>
            )}

            {/* EDIT */}
            {mode === "edit" && (
              <form onSubmit={submitEdit}
                className="bg-white rounded-xl p-4 max-h-[70vh] overflow-y-auto space-y-3">
                <div className="text-sm font-semibold flex items-center gap-2 mb-1">
                  <Pencil className="h-4 w-4" style={{ color: accent }} /> {t("Edit Monk Profile")}
                </div>

                {isSuperAdmin && <StatusSwitch status={status} onChange={handleStatusChange} />}

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label className="text-xs">{t("Diksha Name *")}</Label>
                    <Input {...f("dikshaName")} required />
                  </div>
                  <div>
                    <Label className="text-xs">{t("Gender")}</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="SADHU">{t("Sadhu (Male)")}</option>
                      <option value="SADHVI">{t("Sadhvi (Female)")}</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("Name Before Diksha")}</Label>
                    <Input {...f("nameBeforeDiksha")} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("Diksha Date")}</Label>
                    <Input type="date" {...f("dikshaDate")} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("Diksha Place")}</Label>
                    <Input placeholder={t("e.g. Palitana")} {...f("dikshaPlace")} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("Date of Birth")}</Label>
                    <Input type="date" {...f("dob")} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("Birth Place")}</Label>
                    <Input placeholder={t("e.g. Jaipur")} {...f("dobPlace")} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold">{t("Current Temple / Upashray")}</Label>
                    <SearchableSelect
                      value={form.currentTempleId || ""}
                      onValueChange={(v) => setForm({ ...form, currentTempleId: v })}
                      options={temples.map((t) => ({
                        value: t.id,
                        label: `[${t.publicId || t.code || t.id?.slice(0, 8) || "TMP"}] ${t.name}${t.city ? ` (${t.city})` : ""}`
                      }))}
                      placeholder={t("Search temple by name or Temple ID…")}
                      searchPlaceholder={t("Type temple name or ID…")}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">{t("Bio / Description")}</Label>
                    <textarea rows={3} className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                      value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setMode("preview")}>{t("Cancel")}</Button>
                  <Button type="submit" className="flex-1 text-white" style={{ background: accent }} disabled={saving}>
                    {saving ? t("Saving…") : t("Save Changes")}
                  </Button>
                </div>
              </form>
            )}

            {/* PHOTO */}
            {mode === "image" && (
              <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-4">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4" style={{ color: accent }} /> {t("Upload Photo")}
                </div>
                <div
                  className="h-32 w-32 rounded-full overflow-hidden border-4 cursor-pointer flex items-center justify-center"
                  style={{ borderColor: `${accent}40`, background: "#F5EEFF" }}
                  onClick={() => fileRef.current?.click()}>
                  {preview ? (
                    <img src={preview} alt={t("preview")} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 mx-auto mb-1" style={{ color: accent }} />
                      <div className="text-xs" style={{ color: accent }}>{t("Click to upload")}</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setPhotoFile(f);
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(f);
                  }}
                />
                <div className="flex gap-2 w-full mt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setMode("preview")}>{t("Cancel")}</Button>
                  <Button className="flex-1 text-white" style={{ background: accent }} disabled={saving} onClick={savePhoto}>
                    {t("Save Photo")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Register Monk Dialog ─────────────────────────────────────── */
function RegisterMonkDialog({ onCreated }) {
  const { t } = useLanguage();
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab]       = useState("basic");
  const [temples, setTemples] = useState([]);

  const parseRange = (val) => {
    if (!val) return { from: "", to: "" };
    const parts = val.split("-").map(s => s.trim());
    return { from: parts[0] || "", to: parts[1] || "" };
  };

  const setRangeVal = (key, part, timeStr) => {
    const current = form[key] || "";
    const parts = current.split("-").map(s => s.trim());
    if (part === "from") {
      setForm(prev => ({ ...prev, [key]: `${timeStr} - ${parts[1] || ""}` }));
    } else {
      setForm(prev => ({ ...prev, [key]: `${parts[0] || ""} - ${timeStr}` }));
    }
  };
  
  const [form, setForm] = useState({
    dikshaName: "",
    shortName: "",
    gender: "SADHU",
    nameBeforeDiksha: "",
    bio: "",
    dob: "",
    dobPlace: "",
    status: "ACTIVE",
    nirvanaDate: "",
    nirvanaPlace: "",
    
    // Diksha & Journey
    dikshaDate: "",
    dikshaPlace: "",
    dikshaGuruId: "",
    sect: "Shwetambar",
    subSect: "Murtipujak",
    gacchaName: "",
    
    // Hierarchy
    acharyaGuruId: "",
    currentSangh: "",
    
    // Vihaar Group
    groupName: "",
    groupNumber: "",
    leaderMonkId: "",
    groupMembersMS: [],
    groupMembersJain: [],
    groupMembersNonJain: [],
    groupNotes: "",
    
    // Pre-diksha Family
    fatherMemberId: "",
    fatherNameText: "",
    motherMemberId: "",
    motherNameText: "",
    siblings: [], // Array of { name: "", relationship: "", memberId: "" }
    preDikshaAddress: "",
    preDikshaCity: "",
    preDikshaState: "",
    preDikshaCountry: "India",
    preDikshaPincode: "",
    
    // Timeline & Tapasya
    timeline: [], // Array of { eventName: "", date: "", place: "", description: "" }
    tapasya: [], // Array of { name: "", count: 0, date: "", place: "", description: "", status: "Completed" }
    
    // Movement & Tracking
    currentLocation: "",
    currentTempleId: "",
    trackingStatus: "Staying",
    vihaarHistory: [], // Array of { from: "", to: "", startDate: "", endDate: "" }
    
    // Chaturmas History
    chaturmasHistory: [], // Array of { year: "", startDate: "", endDate: "", status: "Completed", orgId: "", city: "", state: "" }
    
    // Daily Routine & Guidelines
    pravachanMorning: "",
    pravachanAfternoon: "",
    pravachanEvening: "",
    darshanMorning: "",
    darshanAfternoon: "",
    darshanEvening: "",
    maryadaGuidelines: "",
    specialInstructions: [], // Array of strings
    
    // Languages Spoken
    languagesSpoken: ["Hindi", "Gujarati"],
    
    // Health & Privacy
    healthStatus: "Stable",
    healthNotes: "",
    isHealthSensitive: false,
    
    // Media & Biography
    lifeStory: "",
    galleryImages: [], // Array of { imageUrl: "", category: "Diksha" }
    videoLinks: [], // Array of { url: "", title: "" }
    audioLinks: [], // Array of { url: "", title: "" }
    publications: [], // Array of { title: "", pdfUrl: "" }
    
    // Sangh Contacts
    jainContacts: [], // Array of { memberId: "", designation: "" }
    nonJainContacts: [], // Array of { memberId: "", designation: "" }
    directCallingNumber: "",
    directWhatsAppNumber: "",
    
    // Recognition & Identity
    titlesHonors: [],
    knownFor: [],
    tags: [],
    awards: [],
    
    // Admin Controls
    assignedAdminId: "",
  });

  useEffect(() => {
    if (open) {
      api.get("/temples").then((r) => setTemples(r.data?.data?.items || r.data?.data || [])).catch(() => {});
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.dikshaName) { toast.error(t("Diksha Name is required.")); return; }
    setSaving(true);
    try {
      // Map form states directly to payload
      const payload = {
        dikshaName: form.dikshaName,
        shortName: form.shortName || undefined,
        gender: form.gender,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        dobPlace: form.dobPlace || undefined,
        nameBeforeDiksha: form.nameBeforeDiksha || undefined,
        bio: form.bio || undefined,
        dikshaDate: form.dikshaDate ? new Date(form.dikshaDate).toISOString() : undefined,
        dikshaPlace: form.dikshaPlace || undefined,
        dikshaGuruId: form.dikshaGuruId || undefined,
        currentTempleId: form.currentTempleId || undefined,
        status: form.status,
        nirvanaDate: form.nirvanaDate ? new Date(form.nirvanaDate).toISOString() : undefined,
        nirvanaPlace: form.nirvanaPlace || undefined,
        assignedAdminId: form.assignedAdminId || undefined,

        // Rich JSON sub-structures
        preDikshaFather: { memberId: form.fatherMemberId || undefined, name: form.fatherNameText || undefined },
        preDikshaMother: { memberId: form.motherMemberId || undefined, name: form.motherNameText || undefined },
        siblings: form.siblings,
        preDikshaLocation: {
          address: form.preDikshaAddress,
          city: form.preDikshaCity,
          state: form.preDikshaState,
          country: form.preDikshaCountry,
          pincode: form.preDikshaPincode,
        },
        timeline: form.timeline,
        tapasya: form.tapasya,
        tracking: {
          currentLocation: form.currentLocation,
          trackingStatus: form.trackingStatus,
          vihaarHistory: form.vihaarHistory,
        },
        chaturmasHistory: form.chaturmasHistory,
        routine: {
          pravachanTimings: {
            morning: form.pravachanMorning,
            afternoon: form.pravachanAfternoon,
            evening: form.pravachanEvening,
          },
          darshanTimings: {
            morning: form.darshanMorning,
            afternoon: form.darshanAfternoon,
            evening: form.darshanEvening,
          },
          maryada: form.maryadaGuidelines,
          specialInstructions: form.specialInstructions,
        },
        languages: form.languagesSpoken,
        health: {
          status: form.healthStatus,
          notes: form.healthNotes,
          isSensitive: form.isHealthSensitive,
        },
        media: {
          lifeStory: form.lifeStory,
          galleryImages: form.galleryImages,
          videoLinks: form.videoLinks,
          audioLinks: form.audioLinks,
          publications: form.publications,
        },
        sanghContacts: {
          jainContacts: form.jainContacts,
          nonJainContacts: form.nonJainContacts,
          directCallingNumber: form.directCallingNumber,
          directWhatsAppNumber: form.directWhatsAppNumber,
        },
        recognitions: {
          titlesHonors: form.titlesHonors,
          knownFor: form.knownFor,
          tags: form.tags,
          awards: form.awards,
        },
        socialLinks: {
          website: form.website,
          facebook: form.facebook,
          instagram: form.instagram,
          youtube: form.youtube,
          twitter: form.twitter,
        },
        verified: false,
      };

      // Handle Monk Group Creation & Linking
      if (form.groupName) {
        const groupRes = await api.post("/monks/groups", {
          name: form.groupName,
          leaderMonkId: undefined,
          memberMonkIds: form.groupMembersMS,
          jainMembers: form.groupMembersJain,
          nonJainMembers: form.groupMembersNonJain,
          notes: form.groupNotes,
        });
        payload.groupId = groupRes.data?.data?.id;
      }

      await api.post("/monks", payload);
      toast.success(t("MS (Maharaj Saheb) profile created successfully."));
      setOpen(false);
      onCreated?.();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const field = (lbl, key, type = "text", placeholder = "") => (
    <div>
      <Label className="text-xs font-semibold text-slate-600">{lbl}</Label>
      <Input
        type={type}
        className="mt-1 h-9 bg-white"
        placeholder={placeholder}
        value={form[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  const toggle = (lbl, key) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
        checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
      />
      <span className="text-xs font-semibold text-slate-700">{lbl}</span>
    </label>
  );

  // Array Add/Remove functions
  const addSibling = () => {
    setForm(prev => ({
      ...prev,
      siblings: [...(prev.siblings || []), { name: "", relationship: "Brother", memberId: "" }]
    }));
  };
  const updateSibling = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      siblings: prev.siblings.map((s, i) => i === idx ? { ...s, [key]: val } : s)
    }));
  };
  const removeSibling = (idx) => {
    setForm(prev => ({ ...prev, siblings: prev.siblings.filter((_, i) => i !== idx) }));
  };

  const addTimelineEvent = () => {
    setForm(prev => ({
      ...prev,
      timeline: [...(prev.timeline || []), { eventName: "", date: "", place: "", description: "" }]
    }));
  };
  const updateTimelineEvent = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      timeline: prev.timeline.map((e, i) => i === idx ? { ...e, [key]: val } : e)
    }));
  };
  const removeTimelineEvent = (idx) => {
    setForm(prev => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== idx) }));
  };

  const addTapasya = () => {
    setForm(prev => ({
      ...prev,
      tapasya: [...(prev.tapasya || []), { name: "Upvas", count: 1, date: "", place: "", description: "", status: "Completed" }]
    }));
  };
  const updateTapasya = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      tapasya: prev.tapasya.map((t, i) => i === idx ? { ...t, [key]: val } : t)
    }));
  };
  const removeTapasya = (idx) => {
    setForm(prev => ({ ...prev, tapasya: prev.tapasya.filter((_, i) => i !== idx) }));
  };

  const addVihaarHistory = () => {
    setForm(prev => ({
      ...prev,
      vihaarHistory: [...(prev.vihaarHistory || []), { from: "", to: "", startDate: "", endDate: "" }]
    }));
  };
  const updateVihaarHistory = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      vihaarHistory: prev.vihaarHistory.map((v, i) => i === idx ? { ...v, [key]: val } : v)
    }));
  };
  const removeVihaarHistory = (idx) => {
    setForm(prev => ({ ...prev, vihaarHistory: prev.vihaarHistory.filter((_, i) => i !== idx) }));
  };

  const addChaturmasHistory = () => {
    setForm(prev => ({
      ...prev,
      chaturmasHistory: [...(prev.chaturmasHistory || []), { year: new Date().getFullYear().toString(), startDate: "", endDate: "", status: "Completed", orgId: "", city: "", state: "" }]
    }));
  };
  const updateChaturmasHistory = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      chaturmasHistory: prev.chaturmasHistory.map((c, i) => i === idx ? { ...c, [key]: val } : c)
    }));
  };
  const removeChaturmasHistory = (idx) => {
    setForm(prev => ({ ...prev, chaturmasHistory: prev.chaturmasHistory.filter((_, i) => i !== idx) }));
  };

  const addJainContact = () => {
    setForm(prev => ({
      ...prev,
      jainContacts: [...(prev.jainContacts || []), { memberId: "", designation: "Sangh Trustee" }]
    }));
  };
  const updateJainContact = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      jainContacts: prev.jainContacts.map((jc, i) => i === idx ? { ...jc, [key]: val } : jc)
    }));
  };
  const removeJainContact = (idx) => {
    setForm(prev => ({ ...prev, jainContacts: prev.jainContacts.filter((_, i) => i !== idx) }));
  };

  const addNonJainContact = () => {
    setForm(prev => ({
      ...prev,
      nonJainContacts: [...(prev.nonJainContacts || []), { memberId: "", designation: "Coordinator" }]
    }));
  };
  const updateNonJainContact = (idx, key, val) => {
    setForm(prev => ({
      ...prev,
      nonJainContacts: prev.nonJainContacts.map((nj, i) => i === idx ? { ...nj, [key]: val } : nj)
    }));
  };
  const removeNonJainContact = (idx) => {
    setForm(prev => ({ ...prev, nonJainContacts: prev.nonJainContacts.filter((_, i) => i !== idx) }));
  };

  const steps = [
    { id: "basic", label: t("👤 Basic Information") },
    { id: "journey", label: t("🧘 Journey & Sect") },
    { id: "hierarchy", label: t("🌳 Guru Parampara") },
    { id: "group", label: t("👥 Vihaar Group") },
    { id: "family", label: t("🏠 Family Details") },
    { id: "tapasya", label: t("Tapasya") },
    { id: "movement", label: t("📍 Location & Chaturmas") },
    { id: "routine", label: t("🕒 Routine & Guidelines") },
    { id: "contacts", label: t("📞 representatives") },
    { id: "media", label: t("🔗 Media & Links") },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)} data-testid="monks-add-button"
        className="bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md">
        <UserPlus className="h-4 w-4 mr-2" /> {t("New MS Profile")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] p-0 overflow-hidden flex flex-col bg-slate-50 border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="p-4 bg-white border-b shrink-0">
            <DialogTitle className="font-heading text-lg text-purple-950 flex items-center gap-2">
              {t("Onboard Maharaj Saheb / Sadhvi Profile")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Sidebar navigation */}
            <div className="w-56 bg-purple-950/5 border-r border-slate-200 shrink-0 p-3 overflow-y-auto space-y-1">
              {steps.map(s => {
                const active = tab === s.id;
                return (
                  <button key={s.id} onClick={() => setTab(s.id)} type="button"
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                      active
                        ? "bg-purple-700 text-white shadow-md shadow-purple-200"
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-purple-950"
                    }`}>
                    {t(s.label)}
                  </button>
                );
              })}
            </div>

            {/* Form tab contents scroll pane */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              <form onSubmit={submit} className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-24">
                  
                  {tab === "basic" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5 flex items-center gap-2">{t("👤 Personal & Basic Details")}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">{field("Full Name (Diksha Name) *", "dikshaName", "text", "e.g. Param Pujya Acharya Maharaj")}</div>
                        {field("Short / Popular Name (Optional)", "shortName")}
                        <div>
                          <Label className="text-xs font-semibold">{t("Gender *")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                            <option value="SADHU">{t("🧘 Sadhu (Male)")}</option>
                            <option value="SADHVI">{t("🌸 Sadhvi (Female)")}</option>
                          </select>
                        </div>
                        {field("Name Before Diksha", "nameBeforeDiksha")}
                        {field("Date of Birth", "dob", "date")}
                        {field("Place of Birth", "dobPlace", "text", "City, State")}
                        <div>
                          <Label className="text-xs font-semibold">{t("Current Spiritual Status")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            <option value="ACTIVE">{t("Active (Vihaar / Darshan)")}</option>
                            <option value="SAMADHI">{t("Samadhi (Devlok / Nirvana)")}</option>
                          </select>
                        </div>
                      </div>
                      
                      {form.status === "SAMADHI" && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                          {field("Date of Nirvana / Samadhi", "nirvanaDate", "date")}
                          {field("Place of Nirvana / Samadhi", "nirvanaPlace")}
                        </div>
                      )}

                      <div>
                        <Label className="text-xs font-semibold">{t("Short Bio (3-5 Lines Summary)")}</Label>
                        <textarea rows={3} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          placeholder={t("Introduce Maharaj Saheb...")} />
                      </div>
                    </div>
                  )}

                  {tab === "journey" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5 flex items-center gap-2">{t("🧘 Diksha & Sect Details")}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {field("Diksha Date", "dikshaDate", "date")}
                        {field("Diksha Place", "dikshaPlace", "text", "e.g. Palitana")}
                        <div className="col-span-2">
                          <MonkSelect label={t("Diksha Guru")} value={form.dikshaGuruId} onChange={(val) => setForm({ ...form, dikshaGuruId: val })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                          <Label className="text-xs font-semibold">{t("Community")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={form.sect} onChange={(e) => setForm({ ...form, sect: e.target.value, subSect: e.target.value === "Digambar" ? "Bisapantha" : "Murtipujak" })}>
                            <option value="Shwetambar">{t("Shwetambar")}</option>
                            <option value="Digambar">{t("Digambar")}</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("Sub-Sect / Tradition")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={form.subSect} onChange={(e) => setForm({ ...form, subSect: e.target.value })}>
                            {form.sect === "Digambar" ? (
                              DIGAMBAR_SUB.map(s => <option key={s} value={s}>{t(s)}</option>)
                            ) : (
                              SHWETAMBAR_SUB.map(s => <option key={s} value={s}>{t(s)}</option>)
                            )}
                          </select>
                        </div>
                      </div>

                      {form.sect === "Shwetambar" && form.subSect === "Murtipujak" && (
                        <div>
                          <Label className="text-xs font-semibold">{t("Gaccha")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={form.gacchaName} onChange={(e) => setForm({ ...form, gacchaName: e.target.value })}>
                            <option value="">{t("Select Gaccha...")}</option>
                            {MURTIPUJAK_GACCHAS.map(g => <option key={g} value={g}>{t(g)}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === "hierarchy" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🌳 Guru-Disciple Lineage")}</h3>
                      <div className="space-y-3">
                        <MonkSelect label={t("Acharya Guru (Parent Guru)")} value={form.acharyaGuruId} onChange={(val) => setForm({ ...form, acharyaGuruId: val })} />
                        {field("Current Sangh / Acharya Name (Optional)", "currentSangh", "text", "e.g. Acharya Shanti Suriswarji Sangh")}
                      </div>
                    </div>
                  )}

                  {tab === "group" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("👥 Vihaar Group Onboarding")}</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {field("Vihaar Group Name", "groupName", "text", "e.g. Vihar Group A")}
                          <div className="bg-slate-50 p-2.5 rounded-lg border text-xs text-slate-500 flex items-center justify-between mt-5">
                            <span>{t("🔢 Group ID:")} <strong>{t("Auto (starts with JFMSV108)")}</strong></span>
                          </div>
                        </div>
                        
                        {/* Member collections */}
                        <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                          <Label className="text-xs font-bold text-slate-700 block">{t("Link other MS Profiles in Group")}</Label>
                          <MonkSelect label={t("Search & Add MS Profile")} value="" onChange={(val) => {
                            if (val && !form.groupMembersMS.includes(val)) {
                              setForm(prev => ({ ...prev, groupMembersMS: [...prev.groupMembersMS, val] }));
                            }
                          }} />
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {form.groupMembersMS.map(ms => (
                              <Badge key={ms} className="bg-purple-100 text-purple-800 border border-purple-200">
                                {ms}
                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, groupMembersMS: prev.groupMembersMS.filter(x => x !== ms) }))} />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                          <Label className="text-xs font-bold text-slate-700 block">{t("Link Jain Devotees travelling along")}</Label>
                          <MemberSelect label={t("Search Jain Member")} category="JAIN" value="" onChange={(val) => {
                            if (val && !form.groupMembersJain.includes(val)) {
                              setForm(prev => ({ ...prev, groupMembersJain: [...prev.groupMembersJain, val] }));
                            }
                          }} />
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {form.groupMembersJain.map(jm => (
                              <Badge key={jm} className="bg-purple-100 text-purple-800 border border-purple-200">
                                {jm}
                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, groupMembersJain: prev.groupMembersJain.filter(x => x !== jm) }))} />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                          <Label className="text-xs font-bold text-slate-700 block">{t("Link Non-Jain helpers")}</Label>
                          <MemberSelect label={t("Search Non-Jain Helper")} category="NON_JAIN" value="" onChange={(val) => {
                            if (val && !form.groupMembersNonJain.includes(val)) {
                              setForm(prev => ({ ...prev, groupMembersNonJain: [...prev.groupMembersNonJain, val] }));
                            }
                          }} />
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {form.groupMembersNonJain.map(nj => (
                              <Badge key={nj} className="bg-purple-100 text-purple-800 border border-purple-200">
                                {nj}
                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, groupMembersNonJain: prev.groupMembersNonJain.filter(x => x !== nj) }))} />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">{t("Vihaar Notes")}</Label>
                          <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                            value={form.groupNotes} onChange={(e) => setForm({ ...form, groupNotes: e.target.value })}
                            placeholder={t("Vihar details / routes...")} />
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "family" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🏠 Pre-Diksha Family Details")}</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">{t("👨 Father")}</span>
                        <MemberSelect label={t("Link Father's JiNANAM Member Profile (Optional)")} value={form.fatherMemberId} onChange={(val) => setForm({ ...form, fatherMemberId: val })} />
                        {!form.fatherMemberId && field("Father's Name (Text Entry)", "fatherNameText")}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">{t("👩 Mother")}</span>
                        <MemberSelect label={t("Link Mother's JiNANAM Member Profile (Optional)")} value={form.motherMemberId} onChange={(val) => setForm({ ...form, motherMemberId: val })} />
                        {!form.motherMemberId && field("Mother's Name (Text Entry)", "motherNameText")}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">{t("👦 Siblings")}</span>
                          <Button type="button" size="sm" onClick={addSibling} className="bg-purple-700 hover:bg-purple-800 text-white font-bold h-8 px-4 text-xs rounded-lg">
                            {t("+ Add Sibling")}
                          </Button>
                        </div>
                        {(form.siblings || []).map((s, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border relative space-y-2">
                            <button type="button" onClick={() => removeSibling(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="grid grid-cols-12 gap-2 items-end pr-6">
                              {/* Column 1: Link Profile OR Name */}
                              <div className="col-span-6">
                                {s.memberId ? (
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 block">{t("LINK PROFILE")}</Label>
                                    <MemberSelect label="" value={s.memberId} onChange={(val) => updateSibling(idx, "memberId", val)} />
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 block">{t("SIBLING NAME")}</Label>
                                    <Input className="h-8 mt-0" value={s.name} onChange={(e) => updateSibling(idx, "name", e.target.value)} placeholder={t("Full Name")} />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => updateSibling(idx, "memberId", s.memberId ? "" : "__search__")}
                                  className="mt-1 text-[10px] text-purple-600 hover:text-purple-800 font-semibold underline underline-offset-1"
                                >
                                  {s.memberId ? t("Switch to Name Entry") : t("Link Platform Profile instead")}
                                </button>
                              </div>
                              {/* Column 2: Relationship */}
                              <div className="col-span-4">
                                <Label className="text-[10px] font-bold text-slate-500 block">RELATIONSHIP</Label>
                                <select className="w-full mt-1 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                  value={s.relationship} onChange={(e) => updateSibling(idx, "relationship", e.target.value)}>
                                  <option value="Brother">{t("Brother")}</option>
                                  <option value="Sister">{t("Sister")}</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">{t("📍 Family Location Address")}</span>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-semibold">{t("Address *")}</Label>
                            <Input className="mt-1 bg-white" value={form.preDikshaAddress} onChange={(e) => setForm({ ...form, preDikshaAddress: e.target.value })} placeholder={t("Full address, House/Flat No, Street")} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-semibold">{t("Country (default India)")}</Label>
                              <Input className="mt-1 bg-white" value={form.preDikshaCountry || "India"} onChange={(e) => setForm({ ...form, preDikshaCountry: e.target.value })} placeholder={t("India")} />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold">{t("Pincode")}</Label>
                              <Input className="mt-1 bg-white" value={form.preDikshaPincode} onChange={(e) => setForm({ ...form, preDikshaPincode: e.target.value })} placeholder={t("6-digit Pincode")} maxLength={6} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-semibold">{t("Area")}</Label>
                              <Input className="mt-1 bg-white" value={form.preDikshaArea || ""} onChange={(e) => setForm({ ...form, preDikshaArea: e.target.value })} placeholder={t("Thane E or Thane W")} />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold">{t("City")}</Label>
                              <Input className="mt-1 bg-white" value={form.preDikshaCity} onChange={(e) => setForm({ ...form, preDikshaCity: e.target.value })} placeholder={t("e.g. Thane")} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-semibold">{t("District")}</Label>
                              <Input className="mt-1 bg-white" value={form.preDikshaDistrict || ""} onChange={(e) => setForm({ ...form, preDikshaDistrict: e.target.value })} placeholder={t("e.g. Thane District")} />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold">{t("State")}</Label>
                              <Input className="mt-1 bg-white" value={form.preDikshaState} onChange={(e) => setForm({ ...form, preDikshaState: e.target.value })} placeholder={t("e.g. Maharashtra")} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "tapasya" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <h3 className="text-sm font-bold text-slate-800">{t("Tapasya")}</h3>
                        <Button type="button" size="sm" onClick={addTapasya} className="bg-purple-700 hover:bg-purple-800 text-white font-bold h-7 text-xs">
                          {t("+ Add Tapasya")}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(form.tapasya || []).map((tItem, idx) => (
                          <div key={idx} className="border p-4 rounded-xl bg-white space-y-3 relative shadow-sm">
                            <PermissionGate action="DELETE">
                              <button type="button" onClick={() => removeTapasya(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </PermissionGate>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs font-semibold">{t("Tapasya Name")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={tItem.name} onChange={(e) => updateTapasya(idx, "name", e.target.value)}>
                                  <option value="Upvas">{t("Upvas")}</option>
                                  <option value="Ayambil">{t("Ayambil")}</option>
                                  <option value="Varsitap">{t("Varsitap")}</option>
                                  <option value="Other">{t("Other")}</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">{t("Number Completed")}</Label>
                                <Input type="number" className="mt-1 h-9" value={tItem.count} onChange={(e) => updateTapasya(idx, "count", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">{t("Status")}</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={tItem.status} onChange={(e) => updateTapasya(idx, "status", e.target.value)}>
                                  <option value="Completed">{t("Completed")}</option>
                                  <option value="Ongoing">{t("Ongoing")}</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-semibold">{t("Date Completed / Start Date")}</Label>
                                <Input type="date" className="mt-1 h-9" value={tItem.date} onChange={(e) => updateTapasya(idx, "date", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">{t("Place Completed")}</Label>
                                <Input className="mt-1 h-9" value={tItem.place} onChange={(e) => updateTapasya(idx, "place", e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold">{t("Description")}</Label>
                              <Input className="mt-1 h-9" value={tItem.description} onChange={(e) => updateTapasya(idx, "description", e.target.value)} placeholder={t("Tapasya detail...")} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Milestones / Life Events */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center border-b pb-1.5 mb-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{t("📜 Timeline Events")}</h4>
                            <p className="text-[10px] text-purple-700 font-medium">{t("📢 Timeline events added here will be automatically published to members in their feed.")}</p>
                          </div>
                          <Button type="button" size="sm" variant="outline" onClick={addTimelineEvent} className="h-7 text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-50">
                            {t("+ Add Event")}
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {(form.timeline || []).map((e, idx) => (
                            <div key={idx} className="bg-slate-50 border p-3 rounded-lg space-y-2 relative">
                              <button type="button" onClick={() => removeTimelineEvent(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label className="text-[10px] font-bold">{t("Event Name")}</Label>
                                  <Input className="h-8 mt-0.5 bg-white text-xs" value={e.eventName} onChange={(val) => updateTimelineEvent(idx, "eventName", val.target.value)} placeholder={t("e.g. Gadi Padvi")} />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold">{t("Event Date")}</Label>
                                  <Input type="date" className="h-8 mt-0.5 bg-white text-xs" value={e.date} onChange={(val) => updateTimelineEvent(idx, "date", val.target.value)} />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold">{t("Place")}</Label>
                                  <Input className="h-8 mt-0.5 bg-white text-xs" value={e.place} onChange={(val) => updateTimelineEvent(idx, "place", val.target.value)} />
                                </div>
                              </div>
                              <div>
                                <Label className="text-[10px] font-bold">{t("Description")}</Label>
                                <textarea rows={1} className="w-full mt-0.5 rounded border bg-white px-2 py-1 text-xs focus:outline-none"
                                  value={e.description} onChange={(val) => updateTimelineEvent(idx, "description", val.target.value)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "movement" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("📍 Current Location & Chaturmas History")}</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">{t("📍 Live Status Details")}</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold">{t("Current Movement status")}</Label>
                            <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                              value={form.trackingStatus} onChange={(e) => setForm({ ...form, trackingStatus: e.target.value })}>
                              <option value="Staying">{t("Staying (Sthirata)")}</option>
                              <option value="Moving">{t("Moving (Viharing)")}</option>
                              <option value="Chaturmas">{t("Chaturmas")}</option>
                            </select>
                          </div>
                          {field("Current Location Description", "currentLocation", "text", "Ashram / City name")}
                          <div className="col-span-2">
                            <Label className="text-xs font-semibold">{t("Current Temple / Jain Centre / Upashray")}</Label>
                            <SearchableSelect
                              value={form.currentTempleId || ""}
                              onValueChange={(v) => setForm({ ...form, currentTempleId: v })}
                              options={temples.map((t) => ({
                                value: t.id,
                                label: `[${t.publicId || t.code || t.id?.slice(0, 8) || "TMP"}] ${t.name}${t.city ? ` (${t.city})` : ""}`
                              }))}
                              placeholder={t("Search temple by name or Temple ID…")}
                              searchPlaceholder={t("Search by name or Temple ID…")}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vihaar History List */}
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">{t("🚗 Vihar Journey History (Movement Log)")}</span>
                          <Button type="button" size="sm" variant="outline" onClick={addVihaarHistory} className="h-6 text-[10px] font-bold">
                            {t("+ Add Vihar")}
                          </Button>
                        </div>
                        {(form.vihaarHistory || []).map((v, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => removeVihaarHistory(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold">{t("From Location")}</Label>
                              <Input className="h-8 mt-1" value={v.from} onChange={(e) => updateVihaarHistory(idx, "from", e.target.value)} />
                            </div>
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold">{t("To Location")}</Label>
                              <Input className="h-8 mt-1" value={v.to} onChange={(e) => updateVihaarHistory(idx, "to", e.target.value)} />
                            </div>
                            <div className="w-32">
                              <Label className="text-[10px] font-bold">{t("Start Date")}</Label>
                              <Input type="date" className="h-8 mt-1" value={v.startDate} onChange={(e) => updateVihaarHistory(idx, "startDate", e.target.value)} />
                            </div>
                            <div className="w-32">
                              <Label className="text-[10px] font-bold">{t("End Date")}</Label>
                              <Input type="date" className="h-8 mt-1" value={v.endDate} onChange={(e) => updateVihaarHistory(idx, "endDate", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chaturmas History List (Read-Only from Activities -> Chaturmas) */}
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">{t("🍁 Chaturmas History (Auto-populated from Activities → Chaturmas)")}</span>
                        </div>
                        {(!form.chaturmasHistory || form.chaturmasHistory.length === 0) ? (
                          <div className="text-xs text-slate-500 italic p-3 border border-dashed rounded-lg bg-white text-center leading-relaxed">
                            {t("No Chaturmas history entries found. Entries created in")} <strong>{t("Activities → Chaturmas")}</strong> {t("for this year/location will automatically be linked and shown here.")}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {form.chaturmasHistory.map((c, idx) => (
                              <div key={idx} className="border p-3 rounded-lg bg-white space-y-1 text-xs relative shadow-sm">
                                <div className="flex justify-between items-center font-bold text-purple-950">
                                  <span>{t("📅 Year:")} {c.year}</span>
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">{c.status || "Completed"}</Badge>
                                </div>
                                <div className="text-slate-600 mt-1 space-y-0.5">
                                  <div>{t("📍 Location:")} <strong>{c.city}, {c.state}</strong></div>
                                  {c.orgId && (
                                    <div>{t("🛕 Temple:")} <strong>{temples.find(t => t.id === c.orgId)?.name || c.orgId}</strong></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {tab === "routine" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🕒 Daily Routine & Maryada Guidelines")}</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">{t("🗣 Pravachan Slots")}</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-slate-600">{t("Morning Pravachan")}</Label>
                            <TimePicker 
                              value={form.pravachanMorning} 
                              onChange={(val) => setForm(prev => ({ ...prev, pravachanMorning: val }))} 
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600">{t("Afternoon Pravachan")}</Label>
                            <TimePicker 
                              value={form.pravachanAfternoon} 
                              onChange={(val) => setForm(prev => ({ ...prev, pravachanAfternoon: val }))} 
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600">{t("Evening Pravachan")}</Label>
                            <TimePicker 
                              value={form.pravachanEvening} 
                              onChange={(val) => setForm(prev => ({ ...prev, pravachanEvening: val }))} 
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">{t("🧘 Darshan & Interaction Slots")}</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs font-semibold text-slate-600 mb-1 block">{t("Morning Interaction")}</Label>
                            {(() => {
                              const range = parseRange(form.darshanMorning);
                              return (
                                <TimeRangePicker
                                  fromValue={range.from}
                                  toValue={range.to}
                                  onFromChange={(val) => setRangeVal("darshanMorning", "from", val)}
                                  onToChange={(val) => setRangeVal("darshanMorning", "to", val)}
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600 mb-1 block">{t("Afternoon Interaction")}</Label>
                            {(() => {
                              const range = parseRange(form.darshanAfternoon);
                              return (
                                <TimeRangePicker
                                  fromValue={range.from}
                                  toValue={range.to}
                                  onFromChange={(val) => setRangeVal("darshanAfternoon", "from", val)}
                                  onToChange={(val) => setRangeVal("darshanAfternoon", "to", val)}
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-600 mb-1 block">{t("Evening Interaction")}</Label>
                            {(() => {
                              const range = parseRange(form.darshanEvening);
                              return (
                                <TimeRangePicker
                                  fromValue={range.from}
                                  toValue={range.to}
                                  onFromChange={(val) => setRangeVal("darshanEvening", "from", val)}
                                  onToChange={(val) => setRangeVal("darshanEvening", "to", val)}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">{t("Maryada / Guidelines")}</Label>
                        <textarea rows={3} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          value={form.maryadaGuidelines} onChange={(e) => setForm({ ...form, maryadaGuidelines: e.target.value })}
                          placeholder={t("Guidelines, rules for visiting, dietary controls, photography restricts...")} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div className="col-span-2">
                          <Label className="text-xs font-semibold block mb-1.5">{t("Languages Spoken (Select Multiple Indian Languages)")}</Label>
                          <div className="grid grid-cols-4 gap-2 p-3 border rounded-lg bg-white">
                            {[
                              "Hindi", "Gujarati", "Marwari", "Sanskrit", "Prakrit", "English",
                              "Marathi", "Rajasthani", "Kutchi", "Kannada", "Tamil", "Telugu",
                              "Malayalam", "Bengali", "Punjabi", "Odia", "Assamese", "Urdu"
                            ].map((lang) => {
                              const checked = (form.languagesSpoken || []).includes(lang);
                              return (
                                <label key={lang} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const current = form.languagesSpoken || [];
                                      const next = e.target.checked
                                        ? [...current, lang]
                                        : current.filter(l => l !== lang);
                                      setForm({ ...form, languagesSpoken: next });
                                    }}
                                    className="rounded border-slate-300 text-purple-700 focus:ring-purple-700 h-3.5 w-3.5"
                                  />
                                  <span>{lang}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">{t("Health & Darshan status")}</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-250 bg-white px-3 text-sm focus:outline-none"
                            value={form.healthStatus} onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}>
                            <option value="Stable">{t("Stable")}</option>
                            <option value="Under Care">{t("Under Care")}</option>
                            <option value="Travel Restricted">{t("Travel Restricted")}</option>
                            <option value="Not Available for Darshan">{t("Not Available for Darshan")}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "contacts" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("👥 Sangh Contact Representatives")}</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">{t("👳 Jain Sangh Representatives")}</span>
                          <Button type="button" size="sm" variant="outline" onClick={addJainContact} className="h-6 text-[10px] font-bold">
                            {t("+ Add Representative")}
                          </Button>
                        </div>
                        {(form.jainContacts || []).map((jc, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => removeJainContact(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <MemberSelect label={t("Link Jain Member Profile")} category="JAIN" value={jc.memberId} onChange={(val) => updateJainContact(idx, "memberId", val)} />
                            </div>
                            <div className="w-48">
                              <Label className="text-[10px] font-bold">{t("Designation")}</Label>
                              <Input className="h-8 mt-1" value={jc.designation} onChange={(e) => updateJainContact(idx, "designation", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">{t("👥 Non-Jain Representatives / Coordinators")}</span>
                          <Button type="button" size="sm" variant="outline" onClick={addNonJainContact} className="h-6 text-[10px] font-bold">
                            {t("+ Add Representative")}
                          </Button>
                        </div>
                        {(form.nonJainContacts || []).map((nj, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => removeNonJainContact(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <MemberSelect label={t("Link Non-Jain Member Profile")} category="NON_JAIN" value={nj.memberId} onChange={(val) => updateNonJainContact(idx, "memberId", val)} />
                            </div>
                            <div className="w-48">
                              <Label className="text-[10px] font-bold">{t("Designation")}</Label>
                              <Input className="h-8 mt-1" value={nj.designation} onChange={(e) => updateNonJainContact(idx, "designation", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        {field("Direct Calling Number (Optional)", "directCallingNumber", "tel", "+91...")}
                        {field("Direct WhatsApp Number (Optional)", "directWhatsAppNumber", "tel", "+91...")}
                      </div>
                    </div>
                  )}

                  {tab === "media" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">{t("🔗 Media, Biography & Social Links")}</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {field("Official Website Link", "website", "url", "https://...")}
                        {field("Facebook Profile URL", "facebook", "url", "https://facebook.com/...")}
                        {field("Instagram Profile URL", "instagram", "url", "https://instagram.com/...")}
                        {field("YouTube Channel Link", "youtube", "url", "https://youtube.com/...")}
                        {field("Twitter (X) Profile Link", "twitter", "url", "https://twitter.com/...")}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">{t("Detailed Life Biography Story (No character limit)")}</Label>
                        <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          value={form.lifeStory} onChange={(e) => setForm({ ...form, lifeStory: e.target.value })}
                          placeholder={t("Tell the complete life journey of Maharaj Saheb...")} />
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0 absolute bottom-0 left-56 right-0">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>{t("Cancel")}</Button>
                  <Button type="submit" disabled={saving || !form.dikshaName} className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6">
                    {saving ? t("Registering...") : t("Register MS Profile")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Bulk Import Dialog ───────────────────────────────────────── */
function MonkBulkImportDialog({ onImported }) {
  const { t } = useLanguage();
  const [open, setOpen]     = useState(false);
  const [file, setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const reset = () => { setFile(null); setResult(null); };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.xlsx?$/i)) { toast.error(t("Only .xlsx files are accepted.")); return; }
    setFile(f); setResult(null);
  };

  const downloadTemplate = async () => {
    const token = localStorage.getItem("jinanam_access_token");
    const r = await fetch(`${API_BASE}/monks/import-template`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jinanam-monks-import-template.xlsx";
    a.click();
  };

  const doUpload = async () => {
    if (!file) { toast.error(t("Select a file first.")); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await api.post("/monks/bulk-import/excel", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res.data?.data;
      setResult(data);
      if (data?.created > 0) { toast.success(`${data.created} monk(s) imported.`); onImported?.(); }
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setUploading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-2" /> {t("Bulk Import")}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-purple-600" /> {t("Bulk Import Monks")}
          </DialogTitle>
        </DialogHeader>

        {/* Format desc */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-red-700 font-semibold text-xs uppercase tracking-wide">
            <AlertCircle className="h-3.5 w-3.5" /> {t("Required Excel Format")}
          </div>
          <p className="text-xs text-red-600">
            {t("Upload")} <strong>{t(".xlsx")}</strong> {t("with a")} <strong>{t("header row")}</strong> {t("(case-insensitive). Column marked")} <strong>*</strong> {t("is required.")}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {[
              ["dikshaName *",       "Full diksha name"],
              ["gender",             "SADHU or SADHVI"],
              ["nameBeforeDiksha",   "Birth name"],
              ["dikshaDate",         "DD/MM/YYYY"],
              ["dikshaPlace",        "Place of initiation"],
              ["dob",                "DD/MM/YYYY"],
              ["dobPlace",           "Place of birth"],
              ["community",          "e.g. Digambar"],
              ["gaccha",             "Tradition/Gaccha name"],
              ["currentTemple",      "Temple name"],
              ["bio",                "Short biography"],
            ].map(([col, desc]) => (
              <div key={col} className="flex items-baseline gap-1 text-[10px]">
                <code className="font-mono font-bold text-red-700 bg-red-100 px-1 rounded">{col}</code>
                <span className="text-red-500">{desc}</span>
              </div>
            ))}
          </div>
          <button onClick={downloadTemplate}
            className="text-[11px] font-semibold text-red-700 underline underline-offset-2 flex items-center gap-1">
            <Download className="h-3 w-3" /> {t("Download blank template")}
          </button>
        </div>

        {/* Drop zone */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
              dragging ? "border-purple-400 bg-purple-50" : file ? "border-green-400 bg-green-50" : "border-slate-300 hover:border-purple-300 hover:bg-purple-50/40"
            }`}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <div className="text-sm font-semibold text-green-700">{file.name}</div>
                <div className="text-xs text-green-500">{(file.size / 1024).toFixed(1)} {t("KB")}</div>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-300" />
                <div className="text-sm font-medium text-slate-500">{t("Drag & drop or click to browse")}</div>
                <div className="text-xs text-slate-400">{t(".xlsx only · Max 10 MB")}</div>
              </>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border p-4 space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {t("Import complete")}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["Created", result.created ?? 0, "text-green-600", "bg-green-50 border-green-200"],
                ["Skipped", result.skipped ?? 0, "text-amber-600", "bg-amber-50 border-amber-200"],
                ["Errors",  result.errors?.length ?? 0, "text-red-600", "bg-red-50 border-red-200"]].map(([label, n, tc, bg]) => (
                  <div key={label} className={`rounded-lg border p-2 ${bg}`}>
                    <div className={`text-xl font-black ${tc}`}>{n}</div>
                    <div className={`text-[10px] font-semibold uppercase ${tc}`}>{label}</div>
                  </div>
              ))}
            </div>
            {result.errors?.length > 0 && (
              <div className="rounded bg-red-50 border border-red-200 p-2 max-h-28 overflow-y-auto">
                {result.errors.slice(0, 8).map((e, i) => (
                  <div key={i} className="text-[11px] text-red-600 flex gap-1">
                    <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{t("Row")} {e.row}: {e.message}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={reset} className="w-full">{t("Import Another")}</Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => { setOpen(false); reset(); }}>{t("Cancel")}</Button>
          {!result && (
            <Button onClick={doUpload} disabled={!file || uploading}
              className="bg-purple-700 hover:bg-purple-800 text-white">
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("Importing…")}</> : t("Import Monks")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Export Button ────────────────────────────────────────────── */
function ExportButton() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const doExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res  = await fetch(`${API_BASE}/monks/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = `jinanam-monks-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      toast.success(t("Monks exported."));
    } catch { toast.error(t("Export failed.")); }
    finally { setLoading(false); }
  };
  return (
    <Button variant="outline" onClick={doExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      {t("Export")}
    </Button>
  );
}

import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

/* ─── Main Page ────────────────────────────────────────────────── */
export default function MonksPage() {
  const { isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const [monks, setMonks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState("");
  const [genderFilter, setGender] = useState("ALL");
  const [reloadKey, setReload]    = useState(0);

  const [selectedMonk, setSelectedMonk] = useState(null);
  const [cardOpen, setCardOpen]         = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/monks", { params: { search: q, gender: genderFilter === "ALL" ? undefined : genderFilter } })
      .then((r) => mounted && setMonks(r.data?.data || []))
      .catch(() => mounted && setMonks([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [q, genderFilter, reloadKey]);

  const navigate = useNavigate();

  const openCard = (row) => {
    navigate(`/monks/${row.id}`);
  };

  const handleSave = async (fields) => {
    if (!selectedMonk?.id) return;
    if (fields._statusOnly) {
      await api.patch(`/monks/${selectedMonk.id}/status`, { status: fields.status });
      setSelectedMonk((p) => p ? { ...p, status: fields.status } : p);
      setMonks((prev) => prev.map((m) => m.id === selectedMonk.id ? { ...m, status: fields.status } : m));
      return;
    }
    await api.patch(`/monks/${selectedMonk.id}`, fields);
    setReload((k) => k + 1);
  };

  const handlePhotoSave = async (file) => {
    if (!selectedMonk?.id) return;
    const fd = new FormData(); fd.append("photo", file);
    const r = await api.post(`/monks/${selectedMonk.id}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    const photoUrl = r.data?.data?.photoUrl;
    if (photoUrl) setSelectedMonk((p) => p ? { ...p, photoUrl } : p);
    setReload((k) => k + 1);
  };

  const columns = [
    {
      key: "avatar", header: "", width: 48,
      render: (r) => (
        <Avatar className="h-9 w-9">
          {r.photoUrl ? <img src={r.photoUrl} alt={r.dikshaName} className="object-cover" /> : (
            <AvatarFallback className="text-xs font-bold text-white"
              style={{ background: r.gender === "SADHVI" ? "#9B2D7F" : "#4A1D6B" }}>
              {ini(r.dikshaName)}
            </AvatarFallback>
          )}
        </Avatar>
      ),
    },
    {
      key: "publicId", header: t("ID"), width: 110,
      render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.publicId}</Badge>,
    },
    {
      key: "dikshaName", header: t("Diksha Name"),
      render: (r) => (
        <div>
          <div className="font-semibold">{r.dikshaName}</div>
          <div className="text-xs text-muted-foreground">
            {r.gender === "SADHVI" ? t("🌸 Sadhvi") : t("🧘 Sadhu")}
            {r.nameBeforeDiksha && ` · ${r.nameBeforeDiksha}`}
          </div>
        </div>
      ),
    },
    {
      key: "dikshaDate", header: t("Diksha Date"),
      render: (r) => r.dikshaDate ? fmtDate(r.dikshaDate) : "—",
    },
    {
      key: "currentTemple", header: t("Current Temple"),
      render: (r) => r.currentTemple?.name
        ? <span>{r.currentTemple.name}{r.currentTemple.city ? <span className="text-muted-foreground text-xs"> · {r.currentTemple.city}</span> : null}</span>
        : "—",
    },
    {
      key: "status", header: t("Status"),
      render: (r) => (
        <Badge className={`text-[10px] border-0 ${r.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {r.status || "ACTIVE"}
        </Badge>
      ),
    },
    {
      key: "followers", header: t("Followers"), width: 100,
      render: (r) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3.5 w-3.5 text-purple-400" />
          {r._count?.followers ?? 0}
        </div>
      ),
    },
  ];

  return (
    <div data-testid="monks-page">
      <PageHeader
        title={t("Monks (MS Profiles)")}
        subtitle={t("Sadhus & Sadhvis registered on the platform.")}
        actions={
          <>
            <MonkBulkImportDialog onImported={() => setReload((k) => k + 1)} />
            <ExportButton />
            <RegisterMonkDialog onCreated={() => setReload((k) => k + 1)} />
          </>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("action.search", "Search monks…")} className="pl-9 bg-white" />
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-white p-1">
          {["ALL", "SADHU", "SADHVI"].map((g) => (
            <button key={g} onClick={() => setGender(g)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                genderFilter === g ? "bg-purple-700 text-white" : "text-slate-500 hover:text-purple-700"
              }`}>
              {g === "ALL" ? t("All") : g === "SADHU" ? t("🧘 Sadhu") : t("🌸 Sadhvi")}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={monks}
        loading={loading}
        testId="monks-table"
        emptyTitle={t("No monk profiles yet")}
        emptyDescription={t("Create a new monk profile or bulk import from Excel.")}
        onRowClick={openCard}
        rowClassName="cursor-pointer hover:bg-purple-50/40 transition-colors"
      />

      <MonkIdCardDialog
        open={cardOpen}
        onClose={() => { setCardOpen(false); setSelectedMonk(null); }}
        monk={selectedMonk}
        onSave={handleSave}
        onPhotoSave={handlePhotoSave}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
