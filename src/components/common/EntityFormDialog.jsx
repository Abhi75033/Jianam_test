import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Loader2 } from "lucide-react";
import { api, extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Generic create/edit dialog driven by a `fields` schema.
 * `fields`: Array<{ name, label, type?: "text"|"textarea"|"number"|"date"|"datetime-local"|"select"|"switch"|"url", options?, required?, placeholder? }>
 * `endpoint`: POST endpoint (e.g. "/ads")
 * `method`: "post" | "patch"
 * `patchPath(id)`: fn returning PATCH url (used when initial has id)
 */
export function EntityFormDialog({
  open,
  onOpenChange,
  title = "Create",
  endpoint,
  method = "post",
  patchPath,
  fields = [],
  initial = {},
  onSaved,
  submitLabel,
  testId = "entity-form",
  transform, // optional (payload) => payload, applied before sending
  onSubmit, // optional async (payload) => response-data, replaces the default request
}) {
  const { t } = useLanguage();
  const [values, setValues] = useState(() => ({ ...initial }));
  const [saving, setSaving] = useState(false);

  const setField = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = { ...values };
      // Cast number fields
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.name] !== undefined && payload[f.name] !== "") {
          payload[f.name] = Number(payload[f.name]);
        }
      });
      // Drop empty strings so optional backend fields don't fail validation
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === undefined) delete payload[k];
      });
      if (transform) payload = transform(payload);
      let saved;
      if (onSubmit) {
        saved = await onSubmit(payload);
      } else if (method === "patch" && initial?.id && patchPath) {
        const res = await api.patch(patchPath(initial.id), payload);
        saved = res.data?.data;
      } else {
        const res = await api.post(endpoint, payload);
        saved = res.data?.data;
      }
      toast.success(`${title} saved`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid={`${testId}-dialog`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name} className="text-xs font-medium">
                {t(f.label)}
                {f.required && <span className="text-destructive"> *</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  required={f.required}
                  placeholder={f.placeholder}
                  className="mt-1"
                  rows={3}
                  data-testid={`${testId}-${f.name}`}
                />
              ) : f.type === "select" ? (
                <SearchableSelect
                  value={values[f.name] || ""}
                  onValueChange={(v) => setField(f.name, v)}
                  options={f.options || []}
                  placeholder={f.placeholder || `Select ${f.label}`}
                  className="mt-1"
                  data-testid={`${testId}-${f.name}`}
                />
              ) : f.type === "switch" ? (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{f.placeholder}</span>
                  <Switch
                    checked={Boolean(values[f.name])}
                    onCheckedChange={(v) => setField(f.name, v)}
                    data-testid={`${testId}-${f.name}`}
                  />
                </div>
              ) : (
                <Input
                  id={f.name}
                  type={f.type || "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  required={f.required}
                  placeholder={f.placeholder}
                  className="mt-1"
                  step={f.type === "number" ? "any" : undefined}
                  data-testid={`${testId}-${f.name}`}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>{t("Cancel")}</Button>
            <Button type="submit" disabled={saving} data-testid={`${testId}-submit`}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitLabel || "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
