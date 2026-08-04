import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { memberClient } from "@/lib/memberClient";
import { extractErrorMessage, STATIC_URL } from "@/lib/api";
import ListState from "@/components/member/ListState";

/**
 * MemberGalleryPage — full photo grid for one org, reached via "View all"
 * from the gallery preview on MemberTempleDetailPage.
 *
 * There is no dedicated GET-images-by-org endpoint for members; the org
 * detail response already carries the full `gallery` array inline (same
 * field the admin GalleryTab reads via `org.gallery`, see OrgDetailPage.jsx),
 * so this page re-fetches the org record rather than inventing an endpoint.
 * Same three-endpoint fallback as MemberTempleDetailPage, since the route
 * carries no marker for temple vs dharamshala vs jain centre.
 */
const ORG_ENDPOINTS = ["/temples", "/dharamshalas", "/jain-centers"];

const IMAGE_TYPE_LABELS = {
  exterior: "Exterior",
  interior: "Interior",
  idol: "Idol / Murti",
  event: "Event",
  architecture: "Architecture",
  other: "Other",
};

function mapImage(g) {
  return {
    id: g.id,
    src: g.url?.startsWith("http") ? g.url : `${STATIC_URL}${g.url?.startsWith("/") ? "" : "/"}${g.url}`,
    type: g.type ? (IMAGE_TYPE_LABELS[g.type] || g.type) : null,
  };
}

export default function MemberGalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [orgName, setOrgName] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [lightbox, setLightbox] = useState(-1);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    for (const prefix of ORG_ENDPOINTS) {
      try {
        const res = await memberClient.get(`${prefix}/${id}`);
        const data = res?.data?.data;
        if (data) {
          setOrgName(data.name || "");
          setImages((data.gallery || []).map(mapImage));
          setLoading(false);
          return;
        }
      } catch {
        /* try the next org type */
      }
    }
    setError(extractErrorMessage({ message: "Not found" }));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const types = ["all", ...Array.from(new Set(images.map((g) => g.type).filter(Boolean)))];
  const shown = activeType === "all" ? images : images.filter((g) => g.type === activeType);

  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(-1);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % shown.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i - 1 + shown.length) % shown.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, shown.length]);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Back")}
      </button>

      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-500" /> {t("Gallery")}
        </h1>
        {orgName && <p className="text-xs text-slate-500 mt-1">{orgName}</p>}
      </div>

      <ListState
        loading={loading}
        error={error}
        count={images.length}
        emptyTitle={t("No gallery images")}
        emptyHint={t("Photos will appear here once the organisation uploads them.")}
        onRetry={load}
      >
        {types.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {types.map((ty) => (
              <button
                key={ty}
                onClick={() => setActiveType(ty)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  activeType === ty
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"
                }`}
              >
                {ty === "all" ? t("All") : ty}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {shown.map((g, i) => (
            <button
              key={g.id || i}
              onClick={() => setLightbox(i)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
            >
              <img src={g.src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              {g.type && (
                <span className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                  {g.type}
                </span>
              )}
            </button>
          ))}
        </div>
      </ListState>

      {lightbox >= 0 && shown[lightbox] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(-1)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(-1); }}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X className="h-6 w-6" />
          </button>
          {shown.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + shown.length) % shown.length); }}
                className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % shown.length); }}
                className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={shown[lightbox].src}
            alt=""
            className="max-h-[85vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
