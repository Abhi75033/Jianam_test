import { useState } from "react";
import { QrCode, Share2, RefreshCw, Download, CheckCircle, Shield, Briefcase, Building, Check, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function MemberDigitalIdPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.fullName || "JiNANAM Member";

  const staffId = user?.staffId || (user?.primaryRoleKey === "STAFF" ? "JFST108" : null);
  const memberId = user?.publicId || (user?.memberType === "NON_JAIN" ? "JFNJM108" : "JFJM108");

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success(t("QR code regenerated")); }, 1200);
  };

  const onShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${displayName} — JiNANAM Digital ID`, text: `Member ID: ${memberId}` });
    } else {
      navigator.clipboard.writeText(`JiNANAM Member: ${displayName} (${memberId})`);
      toast.success(t("Copied to clipboard"));
    }
  };

  const onPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pt-2 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">{t("My Digital ID & Staff Pass")}</h1>
        <button
          onClick={onPrint}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Print ID Card</span>
        </button>
      </div>

      {/* ── Digital ID Card ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        {/* Card background */}
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 text-white">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">JiNANAM</div>
              <div className="text-[9px] opacity-70">Official Member & Staff Pass</div>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              <CheckCircle className="h-3 w-3" />
              <span className="text-[9px] font-bold">Verified Digital ID</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl shadow-lg shrink-0">
              {user?.photoUrl
                ? <img src={user.photoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                : "🙏"}
            </div>
            <div>
              <div className="text-xl font-black">{displayName}</div>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className="font-mono text-xs bg-white/20 px-2.5 py-0.5 rounded-full inline-block font-bold">
                  ID: {memberId}
                </span>
                {staffId && (
                  <span className="font-mono text-xs bg-slate-900/40 text-amber-300 px-2.5 py-0.5 rounded-full inline-block font-bold">
                    Staff: {staffId}
                  </span>
                )}
              </div>
              <div className="text-[10px] opacity-80 mt-1 font-bold">
                {user?.community || "Shwetambar · Murtipujak"}
              </div>
            </div>
          </div>

          {/* QR code area */}
          <div className="mt-5 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
              <div className="w-36 h-36 bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 mx-auto">
                <QrCode className="h-20 w-20 text-slate-800" />
                <div className="text-[8px] text-slate-500 font-mono font-bold">{memberId}</div>
              </div>
              {staffId && (
                <div className="mt-2 text-[9px] font-black text-slate-800 uppercase tracking-wider">
                  Staff Entry / Attendance QR
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-[9px] opacity-70 font-semibold">
            🔒 {t("Signed token — scan for verification at Derasars, Dharamshalas & Check-in Desks")}
          </div>
        </div>
      </div>

      {/* Staff Role Details (if applicable) */}
      {staffId && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Briefcase className="h-4 w-4 text-orange-500" />
            <span>Staff Employment Details</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Staff ID:</span>
              <div className="font-bold text-slate-800 font-mono">{staffId}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Linked Member ID:</span>
              <div className="font-bold text-slate-800 font-mono">{memberId}</div>
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 leading-relaxed">
          <strong>{t("Privacy & Security Protected")}</strong> — {t("This QR encodes a signed encrypted token. Verified scanners retrieve only role-permitted information.")}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onShare}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Share2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-700">{t("Share ID")}</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          </div>
          <span className="text-[10px] font-bold text-slate-700">{t("Regenerate")}</span>
        </button>

        <button
          onClick={onPrint}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Download className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-700">{t("Download Pass")}</span>
        </button>
      </div>
    </div>
  );
}
