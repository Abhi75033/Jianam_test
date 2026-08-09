import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Share2, RefreshCw, Download, CheckCircle, Shield, Briefcase, Printer,
  Sparkles, CheckCircle2, QrCode, ShieldCheck, Copy, Phone, User
} from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { initials, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function buildQrPayload(memberId, staffId, ts) {
  const nonce = Math.random().toString(36).slice(2, 10).toUpperCase();
  const parts = [`jinanam://verify?id=${memberId}`, `t=${ts}`, `nonce=${nonce}`];
  if (staffId) parts.push(`staff=${staffId}`);
  return parts.join("&");
}

export default function MemberDigitalIdPage() {
  const { t } = useLanguage();
  const { user } = useMemberAuth();
  const qrRef = useRef(null);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.fullName ||
    "JiNANAM Member";

  const staffId = user?.staffId || null;
  const memberId = user?.publicId || null;

  const [ts, setTs] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const qrValue = memberId ? buildQrPayload(memberId, staffId, ts) : null;

  const onRefresh = () => {
    if (!memberId) return;
    setRefreshing(true);
    setTimeout(() => {
      setTs(Date.now());
      setRefreshing(false);
      toast.success(t("QR code refreshed"));
    }, 600);
  };

  const onShare = () => {
    if (!memberId) return;
    if (navigator.share) {
      navigator
        .share({ title: `${displayName} — JiNANAM Digital ID`, text: `Member ID: ${memberId}` })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            navigator.clipboard.writeText(`JiNANAM Member: ${displayName} (${memberId})`);
            toast.success(t("Member ID copied to clipboard"));
          }
        });
    } else {
      navigator.clipboard.writeText(`JiNANAM Member: ${displayName} (${memberId})`);
      toast.success(t("Member ID copied to clipboard"));
    }
  };

  const onDownload = useCallback(() => {
    if (!memberId) return;
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) { toast.error(t("QR not ready")); return; }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 3;
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `JiNANAM_ID_${memberId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(t("Digital pass downloaded!"));
    };
    img.src = url;
  }, [memberId, t]);

  const onPrint = () => window.print();

  if (!memberId) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pt-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-base font-black text-slate-800">{t("Digital ID Not Available")}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t("Your member ID isn't assigned to this session yet. Please sign in again or contact sangh administration.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <QrCode className="h-4.5 w-4.5" />
            </div>
            <span>{t("Verified Digital ID & QR Pass")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Official scannable identity card for temple entry, events, and dharamshala check-in.")}
          </p>
        </div>

        <button
          onClick={onPrint}
          className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
        >
          <Printer className="h-4 w-4" />
          <span>{t("Print Pass")}</span>
        </button>
      </div>

      {/* ── Holographic Digital Membership Card ───────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/40 group">
        <div className="bg-gradient-to-br from-[#06102E] via-[#0B132B] to-[#1E293B] p-6 sm:p-8 text-white relative">
          
          {/* Subtle Ambient Mesh Glow */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/30">
                  J
                </div>
                <div>
                  <div className="font-black text-sm tracking-tight text-white leading-tight">
                    Ji<span className="text-orange-400">NANAM</span>
                  </div>
                  <div className="text-[8px] font-bold text-amber-300 tracking-widest uppercase">
                    CONNECTING JAIN LIFE
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-extrabold shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t("Verified Member Pass")}</span>
              </div>
            </div>

            {/* Member Details & Avatar */}
            <div className="flex items-center gap-4 sm:gap-5">
              <Avatar className="h-18 w-18 sm:h-20 sm:w-20 ring-2 ring-amber-400/60 shadow-xl rounded-2xl shrink-0">
                {user?.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} className="rounded-2xl object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl font-black rounded-2xl">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">{displayName}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="font-mono text-xs bg-white/15 px-2.5 py-0.5 rounded-lg font-bold text-amber-200 border border-white/10">
                    ID: {memberId}
                  </span>
                  {staffId && (
                    <span className="font-mono text-xs bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-lg font-bold border border-purple-400/30">
                      Staff: {staffId}
                    </span>
                  )}
                </div>
                {user?.sect && (
                  <div className="text-[11px] text-slate-300 mt-1 font-semibold">
                    {user.sect} {user?.subCommunity ? `• ${user.subCommunity}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Scannable High-Res QR Code Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center justify-center text-slate-900 space-y-3">
              <div ref={qrRef} className="p-2 bg-white rounded-2xl transition-all duration-300">
                <QRCodeSVG
                  value={qrValue}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0B132B"
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="text-center space-y-0.5">
                <div className="font-mono text-xs font-black text-slate-900 tracking-wider">{memberId}</div>
                <p className="text-[10px] text-slate-400 font-bold">
                  {t("Scan with JiNANAM Scanner at any Derasar, Dharamshala or Event check-in")}
                </p>
              </div>
            </div>

            {/* Quick Card Controls */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onDownload}
                className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/15 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4 text-amber-300" />
                <span>{t("Save Pass")}</span>
              </button>

              <button
                type="button"
                onClick={onShare}
                className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/15 active:scale-95 transition-all"
              >
                <Share2 className="h-4 w-4 text-sky-300" />
                <span>{t("Share")}</span>
              </button>

              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/15 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4 text-emerald-300", refreshing && "animate-spin")} />
                <span>{t("Refresh")}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
