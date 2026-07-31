import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Reusable drag-and-drop upload zone.
 * Uploads via POST multipart/form-data to `uploadEndpoint`.
 * Backend response expected: { success: true, data: { url } }
 */
export function FileDropzone({
  uploadEndpoint = "/uploads",
  accept = { "image/*": [] },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  onUploaded,          // (url or url[]) => void
  fieldName = "file",
  testId = "file-dropzone",
  label = "Drop files here or click to browse",
  hint = "PNG, JPG, PDF up to 10MB",
}) {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles?.length) return;
    setFiles((prev) => (multiple ? [...prev, ...acceptedFiles] : acceptedFiles));

    setUploading(true);
    const results = [];
    try {
      for (const f of acceptedFiles) {
        const form = new FormData();
        form.append(fieldName, f);
        const { data } = await api.post(uploadEndpoint, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const url = data?.data?.url || data?.data?.path || data?.url;
        if (url) results.push(url);
      }
      if (onUploaded) onUploaded(multiple ? results : results[0]);
      toast.success(`Uploaded ${results.length} file(s)`);
    } catch (e) {
      toast.error("Upload failed. Check backend `POST " + uploadEndpoint + "`.");
    } finally {
      setUploading(false);
    }
  }, [uploadEndpoint, multiple, fieldName, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept, maxSize, multiple,
  });

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div data-testid={testId}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary/60 hover:bg-primary/5",
          isDragActive ? "border-primary bg-primary/10" : "border-border bg-secondary/30"
        )}
        data-testid={`${testId}-zone`}
      >
        <input {...getInputProps()} data-testid={`${testId}-input`} />
        <UploadCloud className={cn("h-8 w-8 mx-auto mb-2", isDragActive ? "text-primary" : "text-muted-foreground")} />
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2" data-testid={`${testId}-list`}>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-2 rounded-md border border-border bg-white">
              {f.type?.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-primary" />
              ) : (
                <FileText className="h-4 w-4 text-primary" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{f.name}</div>
                <div className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(1)} {t("KB")}</div>
              </div>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-muted-foreground hover:text-destructive"
                  data-testid={`${testId}-remove-${i}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
