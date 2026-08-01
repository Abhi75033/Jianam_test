import { useEffect, useState } from "react";
import { api, STATIC_URL, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Plus, Upload, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileDropzone } from "@/components/common/FileDropzone";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionGate } from "@/components/common/PermissionGate";

export default function GalleryPage() {
  const { t } = useLanguage();
  const { user, isSuperAdmin, canDo } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadTo, setUploadTo] = useState(null); // album obj
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    api.get(`/gallery/albums/org/${orgId}`)
      .then((res) => setAlbums(res.data?.data?.items || res.data?.data || []))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false));
  }, [orgId, reloadKey]);

  const createAlbum = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/gallery/albums", { organizationId: orgId, name });
      toast.success(t("Album created."));
      setCreateOpen(false);
      setName("");
      setDescription("");
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async (imgId) => {
    if (!isSuperAdmin) {
      toast.error(t("Only Super Admin can delete images."));
      return;
    }
    if (!window.confirm("Delete this image?")) return;
    try {
      await api.delete(`/gallery/images/${imgId}`);
      toast.success(t("Image deleted."));
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div data-testid="gallery-page">
      <PageHeader
        title={t("Gallery")}
        subtitle={t("Photo albums organised by events, festivals, or seasons.")}
        actions={canDo("GALLERY", "CREATE") && (
          <Button onClick={() => setCreateOpen(true)} data-testid="gallery-create-album-btn">
            <Plus className="h-4 w-4 mr-2" /> {t("New Album")}
          </Button>
        )}
      />

      {isSuperAdmin && (
        <div className="mb-4">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label={t("Organization")} testId="gallery-org-select" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : albums.length === 0 ? (
        <EmptyState title={t("No albums yet")} description={t("Create your first album to start sharing photos.")} icon={ImageIcon} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((a) => (
            <Card key={a.id} className="rounded-xl border-border overflow-hidden hover:shadow-md transition-all" data-testid={`album-${a.id}`}>
              <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                {a.coverUrl ? (
                  <img src={a.coverUrl.startsWith("http") ? a.coverUrl : `${STATIC_URL}${a.coverUrl}`} alt="" className="h-full w-full object-cover" />
                ) : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="p-4">
                <div className="font-medium truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                  <span>{formatDate(a.createdAt)}</span>
                  <Badge variant="outline" className="text-[10px]">{a.images?.length ?? a.imageCount ?? 0} {t("photos")}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => setUploadTo(a)} data-testid={`album-upload-${a.id}`}>
                    <Upload className="h-3 w-3 mr-1" /> {t("Upload")}
                  </Button>
                  {isSuperAdmin && a.images?.[0] && (
                    <PermissionGate action="DELETE">
                      <Button size="sm" variant="outline" onClick={() => removeImage(a.images[0].id)} data-testid={`album-del-first-${a.id}`}>
                        <Trash2 className="h-3 w-3 mr-1 text-destructive" /> {t("Delete first")}
                      </Button>
                    </PermissionGate>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md" data-testid="gallery-create-dialog">
          <DialogHeader><DialogTitle>{t("New album")}</DialogTitle></DialogHeader>
          <form onSubmit={createAlbum} className="space-y-3">
            <div>
              <Label className="text-xs">{t("Album name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required data-testid="album-name-input" />
            </div>
            <div>
              <Label className="text-xs">{t("Description")}</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} data-testid="album-desc-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>{t("Cancel")}</Button>
              <Button type="submit" disabled={saving} data-testid="album-create-submit">{t("Create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(uploadTo)} onOpenChange={() => setUploadTo(null)}>
        <DialogContent className="max-w-lg" data-testid="album-upload-dialog">
          <DialogHeader><DialogTitle>{t("Upload to ·")} {uploadTo?.name}</DialogTitle></DialogHeader>
          <FileDropzone
            uploadEndpoint="/uploads"
            accept={{ "image/*": [] }}
            multiple
            fieldName="file"
            onUploaded={async (urls) => {
              const imageUrls = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
              if (!imageUrls.length || !uploadTo) return;
              try {
                await api.post(`/gallery/albums/${uploadTo.id}/images`, { imageUrls });
                toast.success(t("Images added to album"));
                setReloadKey((k) => k + 1);
                setUploadTo(null);
              } catch (err) {
                toast.error(extractErrorMessage(err));
              }
            }}
            testId="album-upload-drop"
            label={t("Drop images here")}
            hint={t("PNG, JPG up to 10MB · multiple files allowed")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
