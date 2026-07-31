import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveBadge } from "@/components/common/LiveBadge";
import { useSocket } from "@/hooks/useSocket";
import { Navigation, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LiveMapPage() {
  const { t } = useLanguage();
  const { connected } = useSocket("/tracking");
  const [monksList, setMonksList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLiveMonks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tracking/live-map");
      const markers = res.data.data || [];
      
      const mappedList = markers.map((m) => ({
        id: m.deviceId,
        name: m.monk?.dikshaName || "Unknown Monk",
        lat: m.lat,
        lng: m.lng,
        battery: m.battery ?? 100,
        status: m.status, // MOVING, IDLE, OFFLINE
        lastUpdate: m.lastUpdate
      }));
      setMonksList(mappedList);
    } catch (e) {
      toast.error(t("Failed to fetch live monk locations."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveMonks();
  }, []);

  return (
    <div className="h-full flex flex-col" data-testid="live-map-page">
      <PageHeader
        title={t("Live Tracking Map")}
        subtitle={t("Geographical visualizer for all ongoing holy Vihar walks, safety rings and device locations.")}
        actions={<LiveBadge connected={connected} />}
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 h-[550px] min-h-[500px]">
        {/* Left Side Pane: Monks List */}
        <Card className="p-3 border border-slate-200 bg-white/70 backdrop-blur-md flex flex-col overflow-y-auto gap-2">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">{t("Monks under monitoring")}</div>
          {loading ? (
            <div className="text-xs text-slate-400 p-2">{t("Loading locations...")}</div>
          ) : monksList.length === 0 ? (
            <div className="text-xs text-slate-400 p-2">{t("No active devices/monks tracking.")}</div>
          ) : (
            monksList.map((m) => (
              <div key={m.id} className="border border-slate-100 rounded-lg p-2.5 bg-white hover:border-orange-200 cursor-pointer transition-all flex flex-col gap-1">
                <div className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-orange-500" />
                  {m.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>{t("Status:")} {m.status}</span>
                  <Badge variant="outline" className="text-[9px] px-1 font-mono-num">{m.battery}{t("% batt")}</Badge>
                </div>
                <div className="text-[10px] text-slate-500 font-mono-num mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {m.lat?.toFixed(4)}, {m.lng?.toFixed(4)}
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Right Side: Map Render Area */}
        <Card className="md:col-span-3 border border-slate-200 bg-slate-900 overflow-hidden relative rounded-xl flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
          
          <div className="z-10 text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-full bg-slate-800 items-center justify-center border border-slate-700 animate-pulse">
              <Navigation className="h-6 w-6 text-orange-400" />
            </div>
            <div className="text-slate-300 font-semibold tracking-wide">{t("Live Geography Engine Active")}</div>
            <div className="text-xs text-slate-500 max-w-sm">{t("Displaying geolocated pins overlayed on standard high-contrast hybrid vector maps.")}</div>
          </div>

          <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-slate-400 font-mono shadow-xl flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full bg-emerald-500 ${connected ? "animate-ping" : "bg-red-500"}`}></div>
            <span>{t("GPS Tracking Stream:")} {connected ? t("Operational") : t("Offline")} ({monksList.length} {t("nodes active)")}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
