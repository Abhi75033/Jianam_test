import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileDropzone } from "@/components/common/FileDropzone";
import { Download, FileSpreadsheet, Info, Loader2 } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * BulkImportPage — Excel bulk import UI for members.
 * Route: /members/bulk-import
 */
export default function BulkImportPage() {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const uploadExcel = async (files) => {
    const f = Array.isArray(files) ? files[0] : files;
    if (!f) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", f);
      const { data } = await api.post("/members/bulk-import/excel", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data?.data || { imported: 0, errors: [] });
      toast.success(t("Import complete."));
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setResult({ imported: 0, errors: [{ row: 0, message: extractErrorMessage(err) }] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-testid="bulk-import-page">
      <PageHeader
        title={t("Bulk Import Members")}
        subtitle={t("Import many members at once from an Excel (.xlsx) file.")}
      />

      <Tabs defaultValue="excel">
        <TabsList className="mb-4">
          <TabsTrigger value="excel" data-testid="bulk-tab-excel">{t("Excel Upload")}</TabsTrigger>
          <TabsTrigger value="template" data-testid="bulk-tab-template">{t("Template & Guide")}</TabsTrigger>
        </TabsList>

        <TabsContent value="excel">
          <Card className="p-6 rounded-xl border-border">
            <div className="mb-4 flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 leading-relaxed">
                {t("Upload a `.xlsx` file with columns:")} <b>{t("firstName, surname, mobile, gender, dob, communityId, subCommunityId, gacchaId, city, state, pincode, email, profession")}</b>{t(". All fields optional except firstName and mobile.")}
              </div>
            </div>

            <div className="mb-4">
              <FileDropzone
                uploadEndpoint="/members/bulk-import/excel"
                accept={{ "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }}
                onUploaded={(url) => toast.success(t("File uploaded, parsing…"))}
                fieldName="file"
                testId="bulk-excel-drop"
                label={t("Drop .xlsx file here")}
                hint={t("Excel Workbook (.xlsx) up to 10MB")}
              />
            </div>

            <Button
              onClick={() => document.querySelector('[data-testid="bulk-fallback-input"]')?.click()}
              variant="outline"
              disabled={uploading}
              data-testid="bulk-fallback-btn"
            >
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              {t("Or pick file manually")}
            </Button>
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              data-testid="bulk-fallback-input"
              onChange={(e) => e.target.files?.[0] && uploadExcel(e.target.files[0])}
            />

            {result && (
              <div className="mt-6 space-y-3" data-testid="bulk-result">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">{t("Success")}</div>
                  <div className="font-heading font-bold text-2xl text-emerald-800 mt-1">
                    {result.imported || 0} {t("members imported")}
                  </div>
                </div>
                {result.errors?.length > 0 && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                    <div className="text-xs uppercase tracking-widest text-red-700 font-semibold mb-2">
                      {result.errors.length} {t("error(s)")}
                    </div>
                    <ul className="text-xs space-y-1 max-h-60 overflow-y-auto">
                      {result.errors.map((e, i) => (
                        <li key={i} className="text-red-800">
                          {t("Row")} {e.row}: {e.message || JSON.stringify(e)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card className="p-6 rounded-xl border-border">
            <h3 className="font-heading font-semibold text-base mb-3">{t("Template")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("Download the reference Excel template with headers and sample rows.")}
            </p>
            <Button variant="outline" asChild data-testid="bulk-template-download">
              <a href="/static/templates/members-template.xlsx" download>
                <Download className="h-4 w-4 mr-2" /> {t("Download template.xlsx")}
              </a>
            </Button>

            <div className="mt-6 text-xs text-muted-foreground leading-relaxed">
              <h4 className="font-semibold text-foreground mb-2">{t("Tips")}</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>{t("Mobile numbers must include country code (e.g.")} <code>+919000000001</code>).</li>
                <li>{t("Dates in")} <code>{t("YYYY-MM-DD")}</code> {t("format.")}</li>
                <li>{t("Use exact")} <code>communityId</code>/<code>gacchaId</code> {t("values from Master Data.")}</li>
                <li>{t("Rows with errors are skipped; valid rows still get imported.")}</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
