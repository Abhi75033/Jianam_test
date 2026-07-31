import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencySelect from "./CurrencySelect";
import { FileDropzone } from "./FileDropzone";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * BankingDetailsForm — Shared banking details block.
 * Used by Temples, Dharamshalas, and all orgs.
 *
 * Fields in ORDER per spec:
 *  1. Bank Account Name
 *  2. Bank Account Number
 *  3. IFSC Code
 *  4. Bank Name
 *  5. Branch Address
 *  6. UPI ID
 *  7. Currency (dropdown)
 *  8. QR Code upload
 *  9. Checkbox: Eligible for 80G Tax Deductions
 * 10. Checkbox: Eligible for CSR Charity Funding
 *
 * Bug fix: modal content is scrollable (overflow-y-auto on container).
 *
 * Props:
 *   value      — object with banking fields
 *   onChange   — (updatedValue) => void
 *   className  — string
 */
export default function BankingDetailsForm({ value = {}, onChange, className = "" }) {
  const { t } = useLanguage();
  const [qrPreview, setQrPreview] = useState(value.qrCodeUrl || null);

  const update = (key, val) => {
    onChange?.({ ...value, [key]: val });
  };

  const handleQrUpload = async (file) => {
    if (!file) return;
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setQrPreview(e.target.result);
      update("qrCodeUrl", e.target.result); // base64 for now; replace with upload URL in production
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-4 overflow-y-auto max-h-[60vh] pr-1.5 scrollbar-thin", className)}>
      {/* 1. Bank Account Name */}
      <div>
        <Label className="text-xs">{t("Bank Account Name")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. Shree Mahavir Temple Trust")}
          value={value.accountName || ""}
          onChange={(e) => update("accountName", e.target.value)}
          data-testid="bank-account-name"
        />
      </div>

      {/* 2. Bank Account Number */}
      <div>
        <Label className="text-xs">{t("Bank Account Number")}</Label>
        <Input
          className="mt-1 bg-white font-mono tracking-wider"
          placeholder={t("e.g. 123456789012")}
          value={value.accountNumber || ""}
          onChange={(e) => update("accountNumber", e.target.value)}
          data-testid="bank-account-number"
        />
      </div>

      {/* 3. IFSC Code */}
      <div>
        <Label className="text-xs">{t("IFSC Code")}</Label>
        <Input
          className="mt-1 bg-white font-mono uppercase"
          placeholder={t("e.g. SBIN0001234")}
          value={value.ifscCode || ""}
          onChange={(e) => update("ifscCode", e.target.value.toUpperCase())}
          data-testid="bank-ifsc"
        />
      </div>

      {/* 4. Bank Name */}
      <div>
        <Label className="text-xs">{t("Bank Name")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. State Bank of India")}
          value={value.bankName || ""}
          onChange={(e) => update("bankName", e.target.value)}
          data-testid="bank-name"
        />
      </div>

      {/* 5. Branch Address */}
      <div>
        <Label className="text-xs">{t("Branch Address")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. MG Road Branch, Mumbai 400001")}
          value={value.branchAddress || ""}
          onChange={(e) => update("branchAddress", e.target.value)}
          data-testid="bank-branch-address"
        />
      </div>

      {/* 6. UPI ID */}
      <div>
        <Label className="text-xs">{t("UPI ID")}</Label>
        <Input
          className="mt-1 bg-white"
          placeholder={t("e.g. temple@sbi")}
          value={value.upiId || ""}
          onChange={(e) => update("upiId", e.target.value)}
          data-testid="bank-upi-id"
        />
      </div>

      {/* 7. Currency */}
      <div>
        <Label className="text-xs">{t("Currency")}</Label>
        <CurrencySelect
          value={value.currency || "INR"}
          onValueChange={(v) => update("currency", v)}
          className="mt-1"
        />
      </div>

      {/* 8. QR Code Upload */}
      <div>
        <Label className="text-xs">{t("Payment QR Code")}</Label>
        <div className="mt-1">
          {qrPreview ? (
            <div className="flex items-center gap-3">
              <img
                src={qrPreview}
                alt={t("QR Code")}
                className="h-24 w-24 rounded-lg border border-border object-contain bg-white p-1"
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t("QR code uploaded")}</span>
                <button
                  type="button"
                  className="text-xs text-destructive underline"
                  onClick={() => { setQrPreview(null); update("qrCodeUrl", null); }}
                >
                  {t("Remove")}
                </button>
              </div>
            </div>
          ) : (
            <FileDropzone
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".svg"] }}
              onFile={handleQrUpload}
              label={t("Upload QR code image (PNG/JPG)")}
              maxSize={2}
            />
          )}
        </div>
      </div>

      {/* 9 & 10. Checkboxes */}
      <div className="space-y-2 pt-1 border-t border-dashed border-border">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="bank-80g"
            checked={!!value.eligible80G}
            onCheckedChange={(checked) => update("eligible80G", !!checked)}
            data-testid="bank-80g-checkbox"
          />
          <Label htmlFor="bank-80g" className="text-xs font-medium cursor-pointer">
            {t("Eligible for 80G Tax Deductions")}
          </Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="bank-csr"
            checked={!!value.eligibleCSR}
            onCheckedChange={(checked) => update("eligibleCSR", !!checked)}
            data-testid="bank-csr-checkbox"
          />
          <Label htmlFor="bank-csr" className="text-xs font-medium cursor-pointer">
            {t("Eligible for CSR Charity Funding")}
          </Label>
        </div>
      </div>
    </div>
  );
}
