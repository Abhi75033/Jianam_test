import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Browser-camera QR scanner. Renders a video preview and calls onScan(qrText) when detected.
 */
export function QrScanner({ onScan, onClose, testId = "qr-scanner" }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const qrRef = useRef(null);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const el = containerRef.current;
        if (!el) return;
        const qr = new Html5Qrcode(el.id);
        qrRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (cancelled) return;
            onScan?.(decodedText);
            try { qr.stop().then(() => qr.clear()); } catch { /* noop */ }
          },
          () => { /* per-frame decode errors — ignore */ }
        );
        if (!cancelled) setStarting(false);
      } catch (e) {
        setError("Could not start camera. Please grant camera permission.");
        setStarting(false);
      }
    };
    start();
    return () => {
      cancelled = true;
      const qr = qrRef.current;
      if (qr && qr.isScanning) {
        qr.stop().then(() => qr.clear()).catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" data-testid={testId}>
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{t("Scan Ticket QR")}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="qr-scanner-close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative bg-black" style={{ minHeight: 320 }}>
          <div id="qr-scanner-reader" ref={containerRef} className="w-full" />
          {starting && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> {t("Starting camera…")}
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm p-6 text-center">
              {error}
            </div>
          )}
        </div>
        <div className="p-3 text-[11px] text-muted-foreground text-center">
          {t("Position the QR inside the frame. Detection is automatic.")}
        </div>
      </div>
    </div>
  );
}
