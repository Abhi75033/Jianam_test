import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const MODULE_NAV_MAP = {
  "Member Requests": "nav.memberRequests",
  "Member Verification": "nav.memberVerification",
  "Family Groups": "nav.familyGroups",
  "Export Members": "nav.exportMembers",
  "Volunteer Registration": "nav.volunteerRegistration",
  "Volunteer Assignment": "nav.volunteerAssignment",
  "Volunteer Attendance": "nav.volunteerAttendance",
  "Volunteer Reports": "nav.volunteerReports",
  "Guru Hierarchy": "nav.guruHierarchy",
  "MS Groups": "nav.msGroups",
  "MS Associations": "nav.msAssociations",
  "Route Planning": "nav.routePlanning",
  "Committee": "nav.committee",
  "Committee Members": "nav.committeeMembers",
  "Committee Designations": "nav.designations",
  "Contact Directory": "nav.contactDirectory",
  "Bhojanshala Management": "nav.bhojanshalaManagement",
  "Varshitap Management": "nav.varshitap",
  "Sponsors": "nav.sponsors",
  "Partner Businesses": "nav.partnerBusinesses",
  "Document Management": "nav.documents",
  "Task Management": "nav.tasks",
  "Chaturmas Tracking": "nav.chaturmasTracking",
  "Attendance": "nav.attendance",
  "Callback Requests": "nav.callbackRequests",
  "Payment Settings": "nav.paymentSettings",
};

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const rawModuleName = searchParams.get("module") || "Feature";
  const navKey = MODULE_NAV_MAP[rawModuleName];
  const moduleName = navKey ? t(navKey, rawModuleName) : rawModuleName;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-slate-50 text-center p-6">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 font-bold text-2xl animate-pulse">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t("comingSoon.title", "Module Coming Soon")}</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm">
          {t("comingSoon.descBefore", "The ")}
          <strong className="text-slate-800 font-bold">{moduleName}</strong>
          {t("comingSoon.descAfter", " module is currently in development and will be available in a future update.")}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("action.goBack", "Go Back")}
          </Button>
          <Button
            onClick={() => navigate("/")}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            {t("action.goToDashboard", "Go to Dashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
