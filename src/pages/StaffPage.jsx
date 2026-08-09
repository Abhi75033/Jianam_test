

import { useEffect, useState, useRef } from "react";
import { formatAadhaar, formatPan, isValidAadhaar, isValidPan } from "@/lib/idFormats";
import { useLocation, useNavigate } from "react-router-dom";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  UserPlus,
  UserX,
  LogIn,
  LogOut,
  Calendar,
  Check,
  X,
  Clock,
  FileText,
  Lock,
  QrCode,
  Download,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Heart,
  User,
  Building,
  Printer,
  Trash2,
  AlertTriangle,
  Plus,
  Settings,
  ChevronRight,
  TrendingUp,
  Briefcase,
  FileSpreadsheet,
  Activity,
  Sliders
} from "lucide-react";
import { formatDate, formatDateTime, initials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { TabPermissionSelector, PLATFORM_MODULE_LIST } from "@/components/common/TabPermissionSelector";
import { sanitizeGrant, toPermissionsPayload, buildGrantMeta, normalizeGrants } from "@/lib/access";
import { PermissionGate, ReadEditOnlyNotice } from "@/components/common/PermissionGate";
import {
  GENDER_OPTIONS, BLOOD_GROUP_OPTIONS, WORK_CATEGORY_OPTIONS, LEAVE_TYPE_OPTIONS,
  ATTENDANCE_STATUSES, toOptions,
} from "@/constants/dropdownOptions";

// WORK_CATEGORIES and LEAVE_TYPES imported from @/constants/dropdownOptions

// Map ?tab= query param values to Tabs component values
const TAB_PARAM_MAP = {
  attendance: "attendance_console",
  leave: "leaves",
  leaves: "leaves",
  qr: "registry",
  documents: "registry",
  hours: "config",
  registration: "registry",
};

import { useLanguage } from "@/contexts/LanguageContext";
import { PhoneField } from "@/components/common/PhoneInput";
import CountryDropdown from "@/components/common/CountryDropdown";

export default function StaffPage() {
  const {
    canDo, user, isSuperAdmin, permissions, modules,
    delegatableModules, capabilities, role: actorRole,
  } = useAuth();
  const { t } = useLanguage();
  const { orgs } = useOrgs();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  /**
   * What this account may delegate onward. Super Admin can hand out the full
   * catalogue; an Admin, sub-admin or staff member who onboards someone can
   * only pass on tabs they themselves hold — so the grant chain narrows at
   * every level and never widens.
   */
  const actorAllowedModules = delegatableModules;

  // Tab permissions editing state for Staff
  const [tabAccessStaff, setTabAccessStaff] = useState(null);
  const [selectedStaffTabs, setSelectedStaffTabs] = useState([]);
  const [savingStaffTabs, setSavingStaffTabs] = useState(false);

  // Derive active tab from URL ?tab= query param
  const urlTab = new URLSearchParams(location.search).get("tab");
  const activeTab = (urlTab && TAB_PARAM_MAP[urlTab]) || urlTab || "dashboard";

  const handleTabChange = (value) => {
    // Reverse-map tab value to URL param
    const reverseMap = Object.fromEntries(Object.entries(TAB_PARAM_MAP).map(([k, v]) => [v, k]));
    const param = reverseMap[value] || (value === "dashboard" ? null : value);
    if (param) {
      navigate(`/staff?tab=${param}`, { replace: true });
    } else {
      navigate("/staff", { replace: true });
    }
  };

  // States
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  
  // Dashboard Metrics & Timings Config
  const [metrics, setMetrics] = useState({
    total: 0, active: 0, inactive: 0, present: 0, absent: 0, onLeave: 0,
    yetToCheckOut: 0, newThisMonth: 0, docsExpiringSoon: 0
  });
  const [timings, setTimings] = useState({ start: "09:00", end: "18:00", late: "09:30", early: "17:30" });
  const [updatingTimings, setUpdatingTimings] = useState(false);

  // Dialog Toggles
  const [addOpen, setAddOpen] = useState(false);
  const [detailStaff, setDetailStaff] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrTokenData, setQrTokenData] = useState(null);
  
  // Attendance Override dialog
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedStaffForAtt, setSelectedStaffForAtt] = useState(null);
  const [manualAttStatus, setManualAttStatus] = useState("PRESENT");
  const [manualAttHours, setManualAttHours] = useState(8);

  // Documents dialog
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [newDocType, setNewDocType] = useState("Aadhaar Card");
  const [newDocNumber, setNewDocNumber] = useState("");
  const [newDocExpiry, setNewDocExpiry] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Leave Dialog
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [applyingLeave, setApplyingLeave] = useState(false);

  // Department / Designation master cache
  const [depts, setDepts] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  // Form Registration fields
  const [wizardTab, setWizardTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    organizationId: "",
    name: "",
    mobile: "",
    email: "",
    gender: "Male",
    dob: "",
    joiningDate: "",
    category: "Temple Staff",
    categorySpecify: "",
    departmentId: "",
    designationId: "",
    reportingTo: "",
    aadhaar: "",
    pan: "",
    currentAddress: { line: "", area: "", city: "", state: "", country: "India", pincode: "" },
    permanentAddress: { line: "", area: "", city: "", state: "", country: "India", pincode: "" },
    sameAsCurrent: false,
    emergencyName: "",
    emergencyRelation: "",
    emergencyMobile: "",
    bloodGroup: "O+",
    medicalConditions: "",
    allergies: "",
    govtDocs: [],
    modulePermissions: []
  });

  const loadData = async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    try {
      const statsRes = await api.get(`/staff/dashboard/${orgId}`);
      const listRes = await api.get(`/staff/org/${orgId}`);
      
      setMetrics(statsRes.data?.data?.stats || statsRes.data?.data || metrics);
      const conf = statsRes.data?.data?.config;
      if (conf) {
        setTimings({
          start: conf.staffWorkingHoursStart || "09:00",
          end: conf.staffWorkingHoursEnd || "18:00",
          late: conf.staffLateArrivalAfter || "09:30",
          early: conf.staffEarlyExitBefore || "17:30"
        });
      }

      setRows(listRes.data?.data?.items || listRes.data?.data || []);
      
      // Load Masters
      const deptsRes = await api.get("/master-data/staff-departments").catch(() => ({ data: { data: [] } }));
      const desigRes = await api.get("/master-data/staff-designations").catch(() => ({ data: { data: [] } }));
      setDepts(deptsRes.data?.data?.items || deptsRes.data?.data || []);
      setDesignations(desigRes.data?.data?.items || desigRes.data?.data || []);
    } catch (e) {
      toast.error(t("Failed to load staff metrics"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, reloadKey]);

  useEffect(() => {
    if (orgId && !form.organizationId) {
      setForm((f) => ({ ...f, organizationId: orgId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const validatePersonalTab = () => {
    if (!form.name.trim()) { toast.error(t("Staff Full Name is required.")); return false; }
    if (!form.mobile.trim()) { toast.error(t("Mobile Number is required.")); return false; }
    if (!form.dob) { toast.error(t("Date of Birth is required.")); return false; }
    if (!form.gender) { toast.error(t("Gender is required.")); return false; }
    if (!form.email.trim()) { toast.error(t("Email Address is required.")); return false; }
    if (!form.aadhaar.trim()) { toast.error(t("Aadhaar Card Number is required.")); return false; }
    if (!isValidAadhaar(form.aadhaar)) { toast.error(t("Aadhaar Number must be exactly 12 digits.")); return false; }
    if (!form.pan.trim()) { toast.error(t("PAN Number is required.")); return false; }
    if (!isValidPan(form.pan)) { toast.error(t("PAN must be 10 characters in the format ABCDE1234F.")); return false; }
    if (!form.currentAddress.line?.trim()) { toast.error(t("Current Address Street / House is required.")); return false; }
    if (!form.currentAddress.area?.trim()) { toast.error(t("Current Address Area is required.")); return false; }
    if (!form.currentAddress.city?.trim()) { toast.error(t("Current Address City is required.")); return false; }
    if (!form.currentAddress.state?.trim()) { toast.error(t("Current Address State is required.")); return false; }
    if (!form.currentAddress.country?.trim()) { toast.error(t("Current Address Country is required.")); return false; }
    if (!form.currentAddress.pincode?.trim()) { toast.error(t("Current Address Pincode is required.")); return false; }
    if (!form.sameAsCurrent) {
      if (!form.permanentAddress.line?.trim()) { toast.error(t("Permanent Address Street / House is required.")); return false; }
      if (!form.permanentAddress.area?.trim()) { toast.error(t("Permanent Address Area is required.")); return false; }
      if (!form.permanentAddress.city?.trim()) { toast.error(t("Permanent Address City is required.")); return false; }
      if (!form.permanentAddress.state?.trim()) { toast.error(t("Permanent Address State is required.")); return false; }
      if (!form.permanentAddress.country?.trim()) { toast.error(t("Permanent Address Country is required.")); return false; }
      if (!form.permanentAddress.pincode?.trim()) { toast.error(t("Permanent Address Pincode is required.")); return false; }
    }
    return true;
  };

  const validateEmploymentTab = () => {
    if (!form.joiningDate) { toast.error(t("Joining Date is required.")); return false; }
    if (!form.category) { toast.error(t("Staff Category Designation is required.")); return false; }
    if (form.category === "Other" && !form.categorySpecify?.trim()) { toast.error(t("Please specify Staff Category Name.")); return false; }
    if (!form.reportingTo?.trim()) { toast.error(t("Reporting Manager Name is required.")); return false; }
    if (!form.departmentId) { toast.error(t("Department Assign is required.")); return false; }
    if (form.departmentId === "OTHER" && !form.departmentSpecify?.trim()) { toast.error(t("Please specify Department Name.")); return false; }
    if (!form.designationId) { toast.error(t("Designation Assign is required.")); return false; }
    if (form.designationId === "OTHER" && !form.designationSpecify?.trim()) { toast.error(t("Please specify Designation Name.")); return false; }
    return true;
  };

  const validateEmergencyTab = () => {
    if (!form.emergencyName?.trim()) { toast.error(t("Emergency Contact Name is required.")); return false; }
    if (!form.emergencyRelation?.trim()) { toast.error(t("Emergency Relationship is required.")); return false; }
    if (!form.emergencyMobile?.trim()) { toast.error(t("Emergency Mobile Number is required.")); return false; }
    if (!form.bloodGroup) { toast.error(t("Blood Group is required.")); return false; }
    if (!form.medicalConditions?.trim()) { toast.error(t("Medical Conditions details are required.")); return false; }
    if (!form.allergies?.trim()) { toast.error(t("Allergies details are required.")); return false; }
    return true;
  };

  const handleNextTab = () => {
    if (wizardTab === "personal") {
      if (validatePersonalTab()) setWizardTab("employment");
    } else if (wizardTab === "employment") {
      if (validateEmploymentTab()) setWizardTab("emergency");
    } else if (wizardTab === "emergency") {
      if (validateEmergencyTab()) setWizardTab("permissions");
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!validatePersonalTab()) return;
    if (!validateEmploymentTab()) return;
    if (!validateEmergencyTab()) return;

    setSaving(true);
    try {
      const payload = {
        organizationId: orgId,
        // Top-level identity fields (required by POST /staff)
        name: form.name,
        mobile: form.mobile,
        email: form.email || undefined,
        joiningDate: form.joiningDate ? new Date(form.joiningDate).toISOString() : undefined,
        departmentId: form.departmentId || undefined,
        departmentSpecify: form.departmentId === "OTHER" ? form.departmentSpecify : undefined,
        designationId: form.designationId || undefined,
        designationSpecify: form.designationId === "OTHER" ? form.designationSpecify : undefined,
        category: form.category,
        modulePermissions: (form.modulePermissions && form.modulePermissions.length > 0
          ? form.modulePermissions
          : actorAllowedModules
        ).map((m) => ({ module: m, actions: ["VIEW", "CREATE", "EDIT"] })),
        categorySpecify: form.category === "Other" ? form.categorySpecify : undefined,
        reportingTo: form.reportingTo || undefined,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        gender: form.gender,
        addresses: form.currentAddress,
        permanentAddress: form.sameAsCurrent ? form.currentAddress : form.permanentAddress,
        aadhaar: form.aadhaar || undefined,
        pan: form.pan || undefined,
        emergencyMedicalInfo: {
          emergencyName: form.emergencyName,
          emergencyRelation: form.emergencyRelation,
          emergencyMobile: form.emergencyMobile,
          bloodGroup: form.bloodGroup,
          medicalConditions: form.medicalConditions,
          allergies: form.allergies
        },
        newMember: {
          name: form.name,
          mobile: form.mobile,
          category: "JAIN"
        }
      };

      // Whoever onboards this staff member decides their tabs — clamped to the
      // onboarder's own access, and carrying View/Add/Edit but never Delete.
      const requestedTabs = form.modulePermissions || actorAllowedModules;
      const { granted: grantedTabs, rejected: rejectedTabs } = sanitizeGrant(
        requestedTabs, capabilities, actorRole
      );
      if (rejectedTabs.length > 0) {
        toast.warning(
          `${rejectedTabs.length} tab(s) skipped — you can only delegate access you hold yourself.`
        );
      }
      payload.modules = grantedTabs;
      payload.permissions = toPermissionsPayload(grantedTabs);
      Object.assign(payload, buildGrantMeta(user));

      await api.post("/staff", payload);
      toast.success(t("Staff profile created and unique Staff ID auto-generated!"));
      setAddOpen(false);
      setReloadKey(k => k + 1);
      setForm({
        organizationId: orgId, name: "", mobile: "", email: "", gender: "Male", dob: "", joiningDate: "",
        category: "Temple Staff", categorySpecify: "", departmentId: "", designationId: "", reportingTo: "",
        aadhaar: "", pan: "",
        currentAddress: { line: "", area: "", city: "", state: "", country: "India", pincode: "" },
        permanentAddress: { line: "", area: "", city: "", state: "", country: "India", pincode: "" },
        sameAsCurrent: false, emergencyName: "", emergencyRelation: "", emergencyMobile: "", bloodGroup: "O+",
        medicalConditions: "", allergies: "", govtDocs: [], modulePermissions: []
      });
    } catch (e) {
      toast.error(extractErrorMessage(e) || "Failed to register staff");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTimings = async () => {
    // Super Admins have no organizationIds of their own; without a selected org
    // this used to PATCH /staff/org/undefined/settings and fail server-side.
    if (!orgId) {
      toast.error(t("Please select an organization first."));
      return;
    }
    setUpdatingTimings(true);
    try {
      await api.patch(`/staff/org/${orgId}/settings`, timings);
      toast.success(t("Standard Working Hours configuration updated."));
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setUpdatingTimings(false);
    }
  };

  const showStaffQr = async (staffId) => {
    try {
      const res = await api.get(`/staff/me/qr`);
      setQrTokenData(res.data?.data || null);
      setQrModalOpen(true);
    } catch (err) {
      toast.error(t("Failed to generate QR signature."));
    }
  };

  const handleManualAttendance = async () => {
    if (!selectedStaffForAtt) return;
    try {
      await api.post(`/staff/${selectedStaffForAtt.id}/manual-attendance`, {
        date: new Date().toISOString(),
        status: manualAttStatus,
        // Empty input produced NaN, which serialises to null and fails validation.
        workingHours: Number.isFinite(Number(manualAttHours)) ? Number(manualAttHours) : 0
      });
      toast.success(`Attendance successfully logged override for ${selectedStaffForAtt.member?.fullName}`);
      setAttendanceOpen(false);
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const handleUploadDocument = async () => {
    if (!detailStaff || !newDocNumber) return;
    setUploadingDoc(true);
    try {
      await api.post(`/staff/${detailStaff.id}/documents`, {
        docType: newDocType,
        docNumber: newDocNumber,
        imageUrl: newDocUrl || "attached_doc_placeholder.png",
        expiryDate: newDocExpiry ? new Date(newDocExpiry).toISOString() : undefined
      });
      toast.success(t("Document uploaded. Preserving document replace audit logs."));
      setDocModalOpen(false);
      setNewDocNumber("");
      setNewDocExpiry("");
      setNewDocUrl("");
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!detailStaff || !leaveStart) return;
    setApplyingLeave(true);
    try {
      // The dialog is always opened for a specific staff record, so the leave
      // must be filed against that staff member. This previously posted to
      // /staff/me/leaves, which filed it against the logged-in admin instead
      // (and 404s when the admin has no staff record of their own).
      // Mirrors the existing /staff/{id}/manual-attendance and
      // /staff/{id}/documents endpoints.
      const isSelf = detailStaff.member?.userId && detailStaff.member.userId === user?.id;
      await api.post(isSelf ? `/staff/me/leaves` : `/staff/${detailStaff.id}/leaves`, {
        type: leaveType,
        startDate: new Date(leaveStart).toISOString(),
        endDate: new Date(leaveEnd || leaveStart).toISOString(),
        reason: leaveReason
      });
      toast.success(t("Leave request submitted successfully."));
      setLeaveModalOpen(false);
      setLeaveReason("");
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setApplyingLeave(false);
    }
  };

  const handleDecideLeave = async (leaveId, status) => {
    try {
      await api.patch(`/staff/leaves/${leaveId}`, { status });
      toast.success(`Leave request status updated: ${status}`);
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const openStaffTabModal = (staffRow) => {
    setTabAccessStaff(staffRow);
    // `GET /staff/:id/modules` is not a route on the API — the staff record
    // already carries its grants, so read them off the row instead of firing a
    // request that always 404s and silently reset the selection.
    const existing = normalizeGrants(
      staffRow.permissions || staffRow.modules || staffRow.grantedModules
    );
    const activeMods = Object.keys(existing);
    setSelectedStaffTabs(activeMods.length > 0 ? activeMods : actorAllowedModules);
  };

  const handleSaveStaffTabs = async () => {
    if (!tabAccessStaff) return;
    setSavingStaffTabs(true);
    try {
      // Subset rule: clamp the request to what this account actually holds, so
      // a delegator can never grant a tab it wasn't given itself.
      const { granted, rejected } = sanitizeGrant(selectedStaffTabs, capabilities, actorRole);
      if (rejected.length > 0) {
        toast.warning(
          `${rejected.length} tab(s) skipped — you can only delegate access you hold yourself.`
        );
      }

      await api.patch(`/staff/${tabAccessStaff.id}/permissions`, {
        // Actions are stamped by the engine: View/Add/Edit, never Delete.
        permissions: toPermissionsPayload(granted),
        modules: granted,
        ...buildGrantMeta(user),
      });
      setSelectedStaffTabs(granted);
      toast.success(`Tab access permissions updated for ${tabAccessStaff.member?.fullName || "Staff"}.`);
      setTabAccessStaff(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSavingStaffTabs(false);
    }
  };

  const handleExportReports = async (type, format) => {
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/staff/org/${orgId}/reports/export?reportType=${type}&format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Report compilation failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `staff-${type}-${orgId}-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success(t("Report file downloaded successfully."));
    } catch (e) {
      toast.error(t("Download failed"));
    }
  };

  const filtered = q
    ? rows.filter(
        (r) =>
          r.publicId?.toLowerCase().includes(q.toLowerCase()) ||
          r.member?.fullName?.toLowerCase().includes(q.toLowerCase()) ||
          r.category?.toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  const columns = [
    { key: "publicId", header: t("Staff ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId || "—"}</Badge> },
    {
      key: "name",
      header: t("Name"),
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden border">
            {r.member?.photoUrl ? <img src={r.member.photoUrl} alt="" className="h-full w-full object-cover" /> : initials(r.member?.fullName || "")}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-xs">{r.member?.fullName || "—"}</div>
            <div className="text-[10px] text-slate-400 font-mono-num">{r.member?.mobile}</div>
          </div>
        </div>
      )
    },
    { key: "category", header: t("Category"), render: (r) => <Badge variant="secondary" className="text-[9px]">{r.category || "Staff"}</Badge> },
    { key: "reporting", header: t("Reporting To"), render: (r) => <span className="text-slate-500 font-medium text-xs">{r.reportingTo || "Admin"}</span> },
    { key: "joining", header: t("Joining Date"), render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDate(r.joiningDate)}</span> },
    {
      key: "status",
      header: t("Employment"),
      render: (r) => (
        <Badge variant={r.employmentStatus === "ACTIVE" ? "success" : "destructive"} className="text-[9px]">
          {r.employmentStatus}
        </Badge>
      )
    },
    {
      key: "actions",
      header: t("Quick Actions"),
      render: (r) => (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="h-7 text-[10px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold" onClick={() => openStaffTabModal(r)}>
            <Sliders className="h-3 w-3 mr-1" /> {t("Tab Access")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => showStaffQr(r.publicId)}>
            <QrCode className="h-3 w-3 mr-1" /> {t("QR Badge")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setSelectedStaffForAtt(r); setAttendanceOpen(true); }}>
            <Calendar className="h-3 w-3 mr-1" /> {t("Override")}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6" data-testid="staff-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 to-emerald-800 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-teal-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{t("title.staff", "Staff Operations Center")}</h1>
          </div>
          <p className="text-teal-100 text-xs mt-1 max-w-lg">
            {t("subtitle.staff", "Manage your facility staff register, attendance overrides, leaves log, document checks, and configurations.")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {canDo("STAFF", "CREATE") && (
            <Button
              onClick={() => { setWizardTab("personal"); setAddOpen(true); }}
              data-testid="staff-add-button"
              className="bg-white hover:bg-teal-50 text-teal-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <UserPlus className="h-4 w-4 mr-2" /> {t("action.onboardStaff", "Onboard New Staff")}
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label={t("Select Active Facility Location")} testId="staff-org-select" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="dashboard" className="px-5 py-2 font-bold text-xs rounded-lg">{t("tab.dashboard", "📊 Staff Dashboard")}</TabsTrigger>
          <TabsTrigger value="registry" className="px-5 py-2 font-bold text-xs rounded-lg">{t("tab.registry", "👤 Staff Registry")} ({rows.length})</TabsTrigger>
          <TabsTrigger value="attendance_console" className="px-5 py-2 font-bold text-xs rounded-lg">{t("tab.attendance", "📅 Daily Attendance Overrides")}</TabsTrigger>
          <TabsTrigger value="leaves" className="px-5 py-2 font-bold text-xs rounded-lg">{t("tab.leaves", "🏥 Leaves Manager")}</TabsTrigger>
          <TabsTrigger value="config" className="px-5 py-2 font-bold text-xs rounded-lg">{t("tab.config", "⚙️ Working Hours Config")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Staff Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-teal-50 text-teal-700"><User className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("stat.totalStaff", "Total Staff")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.total || rows.length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Active Staff")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.active || rows.filter(r => r.employmentStatus === "ACTIVE").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700"><UserX className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Inactive Staff")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.inactive ?? Math.max(0, (metrics.total || rows.length) - (metrics.active || 0))}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-sky-50 text-sky-700"><Clock className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Staff Present Today")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.present ?? 0}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-red-50 text-red-700"><X className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Staff Absent Today")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.absent ?? 0}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700"><Calendar className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Staff on Leave")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.onLeave ?? 0}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700"><LogOut className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("Staff Yet to Check Out")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.yetToCheckOut ?? 0}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800"><UserPlus className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{t("New Staff Added This Month")}</div>
                <div className="text-xl font-black text-slate-800">{metrics.newThisMonth ?? 0}</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-12 gap-5">
            {/* Quick Actions Panel */}
            <Card className="col-span-12 md:col-span-4 p-5 bg-white border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800">{t("Quick Operations")}</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <Button variant="outline" className="justify-start h-10 font-bold" onClick={() => { setWizardTab("personal"); setAddOpen(true); }}>
                  <UserPlus className="h-4 w-4 mr-2.5 text-teal-600" /> {t("Onboard New Staff Profile")}
                </Button>
                <Button variant="outline" className="justify-start h-10 font-bold" onClick={() => handleExportReports("register", "xlsx")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2.5 text-emerald-600" /> {t("Export Excel Staff Register")}
                </Button>
                <Button variant="outline" className="justify-start h-10 font-bold" onClick={() => handleExportReports("attendance", "csv")}>
                  <Download className="h-4 w-4 mr-2.5 text-sky-600" /> {t("Export CSV Attendance Log")}
                </Button>
                <Button variant="outline" className="justify-start h-10 font-bold" onClick={() => handleExportReports("leaves", "csv")}>
                  <Calendar className="h-4 w-4 mr-2.5 text-indigo-600" /> {t("Export Leave Ledger")}
                </Button>
              </div>
            </Card>

            {/* Expiring Docs Warning panel */}
            <Card className="col-span-12 md:col-span-8 p-5 bg-white border rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-orange-500" /> {t("Identity Audit Notices")}</h3>
                {metrics.docsExpiringSoon > 0 && <Badge className="bg-orange-100 text-orange-850">{t("Expiring Soon (")}{metrics.docsExpiringSoon})</Badge>}
              </div>
              <div className="space-y-2.5 max-h-56 overflow-y-auto text-xs text-slate-500">
                {metrics.docsExpiringSoon === 0 ? (
                  <div className="p-4 text-center text-slate-400">{t("All document clearances are active and verified.")}</div>
                ) : (
                  rows.filter(r => (r.documents || []).some(d => d.expiryDate && new Date(d.expiryDate).getTime() < new Date().getTime() + 30 * 24 * 3600 * 1000)).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-orange-100 bg-orange-50/50">
                      <div>
                        <div className="font-bold text-slate-800">{s.member?.fullName} ({s.publicId})</div>
                        <div className="text-[10px] text-slate-400 font-mono-num">
                          {t("Expiring:")} {(s.documents || []).map(d => `${d.docType}`).join(", ")}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setDetailStaff(s); setDocModalOpen(true); }}>
                        {t("Replace Doc")}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Registry Grid */}
        <TabsContent value="registry" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search staff registry ID, category...")}
                className="pl-8 text-xs bg-slate-50 border-slate-205 h-9 rounded-lg"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            loading={loading}
            testId="staff-table"
            emptyTitle={t("No staff onboarded")}
            emptyDescription={t("Registered facility profiles will display here.")}
            onRowClick={(s) => setDetailStaff(s)}
          />
        </TabsContent>

        {/* Tab 3: Attendance Overrides */}
        <TabsContent value="attendance_console" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t("Admin Attendance Logs Override")}</h3>
              <p className="text-[11px] text-slate-400">{t("Select a staff registry record below to override their attendance log for today.")}</p>
            </div>
            
            <DataTable
              columns={[
                { key: "publicId", header: t("Staff ID"), render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
                { key: "name", header: t("Staff Name"), render: (r) => <span className="font-semibold text-slate-800 text-xs">{r.member?.fullName}</span> },
                { key: "category", header: t("Category"), render: (r) => <span className="text-slate-600 text-xs">{r.category}</span> },
                {
                  key: "actions",
                  header: t("Attendance Action"),
                  render: (r) => (
                    <Button
                      size="sm"
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold h-7 text-[10px]"
                      onClick={() => { setSelectedStaffForAtt(r); setAttendanceOpen(true); }}
                    >
                      {t("Override Status")}
                    </Button>
                  )
                }
              ]}
              rows={rows}
              loading={loading}
              emptyTitle={t("No staff registered")}
              emptyDescription={t("Register staff profiles to enable manual attendance configurations.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 4: Leave Approvals Portal */}
        <TabsContent value="leaves" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t("Staff Leave Ledger & Approval Requests")}</h3>
              <p className="text-[11px] text-slate-400">{t("Approve or reject leave logs submitted by organization staff.")}</p>
            </div>

            <DataTable
              columns={[
                {
                  key: "staff",
                  header: t("Staff Profile"),
                  render: (r) => (
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{r.staff?.member?.fullName || "—"}</div>
                      <div className="text-[9px] text-slate-400 font-mono-num">{r.staff?.publicId}</div>
                    </div>
                  )
                },
                { key: "type", header: t("Leave Type"), render: (r) => <Badge variant="secondary" className="text-[10px]">{r.type}</Badge> },
                { key: "start", header: t("Start Date"), render: (r) => <span className="text-xs font-mono text-slate-500">{formatDate(r.startDate)}</span> },
                { key: "end", header: t("End Date"), render: (r) => <span className="text-xs font-mono text-slate-500">{formatDate(r.endDate)}</span> },
                { key: "reason", header: t("Reason"), render: (r) => <span className="text-xs text-slate-600 truncate max-w-xs block">{r.reason || "—"}</span> },
                {
                  key: "status",
                  header: t("Status"),
                  render: (r) => (
                    <Badge variant={r.status === "APPROVED" ? "success" : r.status === "PENDING" ? "warning" : "destructive"}>
                      {r.status}
                    </Badge>
                  )
                },
                {
                  key: "actions",
                  header: t("Decisions"),
                  render: (r) => r.status === "PENDING" ? (
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 text-[10px]" onClick={() => handleDecideLeave(r.id, "APPROVED")}>
                        {t("Approve")}
                      </Button>
                      <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-7 text-[10px]" onClick={() => handleDecideLeave(r.id, "REJECTED")}>
                        {t("Reject")}
                      </Button>
                    </div>
                  ) : <span className="text-slate-400 text-xs">—</span>
                }
              ]}
              rows={rows.flatMap(s => (s.leaves || []).map(l => ({ ...l, staff: s })))}
              loading={loading}
              emptyTitle={t("No leave applications")}
              emptyDescription={t("Leaves ledger logs will display here.")}
            />
          </Card>
        </TabsContent>

        {/* Tab 5: Timings Configuration */}
        <TabsContent value="config" className="space-y-4">
          <Card className="p-5 bg-white border rounded-xl shadow-sm max-w-md space-y-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-800">{t("Configure Standard Working Hours")}</h3>
              <p className="text-[11px] text-slate-400">{t("Used strictly for calculating lateness, overtime and early exits on audit logs.")}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Shift Start Time")}</Label>
                <Input type="time" value={timings.start} onChange={(e) => setTimings({ ...timings, start: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Shift End Time")}</Label>
                <Input type="time" value={timings.end} onChange={(e) => setTimings({ ...timings, end: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Late Arrival Cutoff")}</Label>
                <Input type="time" value={timings.late} onChange={(e) => setTimings({ ...timings, late: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 uppercase font-bold">{t("Early Exit Cutoff")}</Label>
                <Input type="time" value={timings.early} onChange={(e) => setTimings({ ...timings, early: e.target.value })} className="mt-1" />
              </div>
            </div>

            <Button onClick={handleUpdateTimings} disabled={updatingTimings} className="bg-teal-600 hover:bg-teal-700 text-white font-bold w-full h-9 text-xs">
              {updatingTimings ? t("Updating Timing Settings...") : t("Save Working Hours Configurations")}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Onboard Staff Wizard Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-100 max-h-[85vh] flex flex-col">
          <div className="flex border-b shrink-0 overflow-x-auto">
            {["personal", "employment", "emergency", "permissions"].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setWizardTab(tab)}
                className={`flex-1 py-3 px-2 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap ${
                  wizardTab === tab ? "border-teal-600 text-teal-700 bg-teal-50/20" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "personal" ? t("1. Personal") : tab === "employment" ? t("2. Employment") : tab === "emergency" ? t("3. Emergency") : t("4. 🛡️ Tab Access")}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateStaff} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {wizardTab === "personal" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Staff Full Name *")}</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("e.g. Anand Shah")} required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Mobile Number *")}</Label>
                    <PhoneField value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} placeholder={t("Mobile Number")} required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Date of Birth *")}</Label>
                    <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Gender *")}</Label>
                    <SearchableSelect
                      value={form.gender}
                      onValueChange={(v) => setForm({ ...form, gender: v })}
                      options={GENDER_OPTIONS}
                      placeholder={t("Select gender *")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Email ID *")}</Label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@domain.com" required className="h-9" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Aadhaar Card Number *")}</Label>
                    <Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: formatAadhaar(e.target.value) })} placeholder={t("e.g. 1234 5678 9012")} required className="h-9" maxLength={14} inputMode="numeric" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("PAN Number *")}</Label>
                    <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: formatPan(e.target.value) })} placeholder={t("e.g. ABCDE1234F")} required className="h-9" maxLength={10} />
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs">{t("Current Residence Address *")}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Street / House *")}</Label>
                      <Input value={form.currentAddress.line} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, line: e.target.value } })} required className="h-9" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Area *")}</Label>
                      <Input value={form.currentAddress.area} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, area: e.target.value } })} required className="h-9" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("City *")}</Label>
                      <Input value={form.currentAddress.city} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, city: e.target.value } })} required className="h-9" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("State *")}</Label>
                      <Input value={form.currentAddress.state} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, state: e.target.value } })} required className="h-9" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Country *")}</Label>
                      <CountryDropdown value={form.currentAddress.country || "India"} onValueChange={(v) => setForm({ ...form, currentAddress: { ...form.currentAddress, country: v } })} />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Pincode *")}</Label>
                      <Input value={form.currentAddress.pincode} onChange={(e) => setForm({ ...form, currentAddress: { ...form.currentAddress, pincode: e.target.value } })} required className="h-9" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={form.sameAsCurrent} onChange={(e) => setForm({ ...form, sameAsCurrent: e.target.checked })} className="rounded border-slate-350 text-teal-650 h-3.5 w-3.5" />
                    {t("Permanent Address same as Current Address")}
                  </label>
                </div>

                {!form.sameAsCurrent && (
                  <div className="border-t pt-3 space-y-3">
                    <h4 className="font-bold text-slate-700 text-xs">{t("Permanent Address Details *")}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Street / House *")}</Label>
                        <Input value={form.permanentAddress.line} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, line: e.target.value } })} required className="h-9" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Area *")}</Label>
                        <Input value={form.permanentAddress.area} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, area: e.target.value } })} required className="h-9" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("City *")}</Label>
                        <Input value={form.permanentAddress.city} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, city: e.target.value } })} required className="h-9" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("State *")}</Label>
                        <Input value={form.permanentAddress.state} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, state: e.target.value } })} required className="h-9" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Country *")}</Label>
                        <CountryDropdown value={form.permanentAddress.country || "India"} onValueChange={(v) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, country: v } })} />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Pincode *")}</Label>
                        <Input value={form.permanentAddress.pincode} onChange={(e) => setForm({ ...form, permanentAddress: { ...form.permanentAddress, pincode: e.target.value } })} required className="h-9" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {wizardTab === "employment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Joining Date *")}</Label>
                    <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} required className="h-9 animate-none" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Staff Category Designation *")}</Label>
                    <SearchableSelect
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                      options={WORK_CATEGORY_OPTIONS}
                      placeholder={t("Select category *")}
                      className="mt-1"
                    />
                  </div>
                </div>

                {form.category === "Other" && (
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Please Specify Category Name *")}</Label>
                    <Input value={form.categorySpecify} onChange={(e) => setForm({ ...form, categorySpecify: e.target.value })} placeholder={t("e.g. Yatra Coordinator")} required className="h-9" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Reporting To (Manager / Admin Name) *")}</Label>
                    <Input value={form.reportingTo} onChange={(e) => setForm({ ...form, reportingTo: e.target.value })} placeholder={t("e.g. Ramesh Shah")} required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Department Assign *")}</Label>
                    <SearchableSelect
                      value={form.departmentId}
                      onValueChange={(v) => setForm({ ...form, departmentId: v })}
                      options={[
                        { value: "", label: t("Select Department *") },
                        ...depts.map(d => ({ value: d.id, label: d.name })),
                        { value: "OTHER", label: t("Other (Please Specify)") },
                      ]}
                      placeholder={t("Select Department *")}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Designation Assign *")}</Label>
                    <SearchableSelect
                      value={form.designationId}
                      onValueChange={(v) => setForm({ ...form, designationId: v })}
                      options={[
                        { value: "", label: t("Select Designation *") },
                        ...designations.map(d => ({ value: d.id, label: d.name })),
                        { value: "OTHER", label: t("Other (Please Specify)") },
                      ]}
                      placeholder={t("Select Designation *")}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Other (Please Specify) for Department */}
                {form.departmentId === "OTHER" && (
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Please Specify Department *")}</Label>
                    <Input
                      value={form.departmentSpecify || ""}
                      onChange={(e) => setForm({ ...form, departmentSpecify: e.target.value })}
                      placeholder={t("e.g. Yatra Management")}
                      required
                      className="h-9 mt-1"
                    />
                  </div>
                )}

                {/* Other (Please Specify) for Designation */}
                {form.designationId === "OTHER" && (
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Please Specify Designation *")}</Label>
                    <Input
                      value={form.designationSpecify || ""}
                      onChange={(e) => setForm({ ...form, designationSpecify: e.target.value })}
                      placeholder={t("e.g. Event Coordinator")}
                      required
                      className="h-9 mt-1"
                    />
                  </div>
                )}
              </div>
            )}

            {wizardTab === "emergency" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Emergency Contact Name *")}</Label>
                    <Input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder={t("e.g. Suresh Shah")} required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Emergency Relation *")}</Label>
                    <Input value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} placeholder={t("e.g. Brother")} required className="h-9" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Emergency Contact Mobile *")}</Label>
                    <Input value={form.emergencyMobile} onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })} placeholder={t("e.g. 9876543210")} required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Blood Group *")}</Label>
                    <SearchableSelect
                      value={form.bloodGroup}
                      onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                      options={BLOOD_GROUP_OPTIONS}
                      placeholder={t("Select blood group *")}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Medical Conditions * (Admins-only visibility)")}</Label>
                    <Input value={form.medicalConditions} onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })} placeholder={t("e.g. None / Hypertension")} required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Allergies *")}</Label>
                    <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder={t("e.g. None / Peanuts")} required className="h-9" />
                  </div>
                </div>
              </div>
            )}

            {wizardTab === "permissions" && (
              <div className="space-y-4">
                <TabPermissionSelector
                  selectedModules={form.modulePermissions || actorAllowedModules}
                  onChange={(mods) => setForm({ ...form, modulePermissions: mods })}
                  isSuperAdmin={isSuperAdmin}
                  allowedModules={actorAllowedModules}
                  title={t("Assign Initial Tab Access Permissions for this Staff Member")}
                />
              </div>
            )}

            <DialogFooter className="gap-2 border-t pt-3 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>{t("Cancel Onboarding")}</Button>
              {wizardTab !== "permissions" ? (
                <Button type="button" onClick={handleNextTab} className="bg-slate-800 hover:bg-slate-900 text-white font-bold">
                  {t("Continue Form")}
                </Button>
              ) : (
                <Button type="submit" disabled={saving} className="bg-teal-650 hover:bg-teal-700 text-white font-bold">
                  {saving ? t("Registering profile...") : t("Confirm Onboarding & Save Tab Access")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Attendance Override Modal */}
      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="h-5 w-5 text-indigo-600" /> {t("Manual Attendance Override")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 border rounded-lg">
              <div className="font-bold text-slate-800">{selectedStaffForAtt?.member?.fullName}</div>
              <div className="text-[10px] text-slate-400 font-semibold font-mono-num mt-0.5">{t("Staff ID:")} {selectedStaffForAtt?.publicId}</div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Attendance Status Option *")}</Label>
              <SearchableSelect
                value={manualAttStatus}
                onValueChange={setManualAttStatus}
                options={ATTENDANCE_STATUSES}
                placeholder={t("Select status")}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Working Hours *")}</Label>
              <Input type="number" min={0} max={24} value={manualAttHours} onChange={(e) => setManualAttHours(e.target.value)} className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAttendanceOpen(false)}>{t("Cancel")}</Button>
              <Button onClick={handleManualAttendance} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {t("Apply Override Status")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Staff Profile Detail Drawer Modal */}
      <Dialog open={detailStaff !== null} onOpenChange={(o) => { if (!o) setDetailStaff(null); }}>
        <DialogContent className="max-w-2xl text-xs max-h-[85vh] overflow-y-auto">
          {detailStaff && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden border border-slate-300">
                    {detailStaff.member?.photoUrl ? <img src={detailStaff.member.photoUrl} alt="" className="h-full w-full object-cover" /> : initials(detailStaff.member?.fullName || "")}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{detailStaff.member?.fullName}</h2>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono-num">{t("Auto-Generated ID:")} {detailStaff.publicId} {t("| Joining Date:")} {formatDate(detailStaff.joiningDate)}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview">
                <TabsList className="bg-slate-100 p-0.5 rounded-lg w-full justify-start">
                  <TabsTrigger value="overview" className="text-[10px] px-3 font-semibold rounded-md">{t("👤 Overview")}</TabsTrigger>
                  <TabsTrigger value="documents" className="text-[10px] px-3 font-semibold rounded-md">{t("📄 Documents Ledger")}</TabsTrigger>
                  <TabsTrigger value="leaves" className="text-[10px] px-3 font-semibold rounded-md">{t("🏥 Leaves Log")}</TabsTrigger>
                  <TabsTrigger value="emergency" className="text-[10px] px-3 font-semibold rounded-md">{t("🚨 Emergency Contact")}</TabsTrigger>
                </TabsList>

                {/* SubTab 1: Overview */}
                <TabsContent value="overview" className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Staff Category")}</div>
                      <div className="font-semibold text-slate-700 mt-0.5">{detailStaff.category}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Reporting Manager")}</div>
                      <div className="font-semibold text-slate-700 mt-0.5">{detailStaff.reportingTo || "Admin / SuperAdmin"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Gender & DOB")}</div>
                      <div className="font-semibold text-slate-700 mt-0.5">{detailStaff.gender || "Male"} | {detailStaff.dob ? formatDate(detailStaff.dob) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Employment Status")}</div>
                      <div className="font-semibold mt-0.5">
                        <Badge variant={detailStaff.employmentStatus === "ACTIVE" ? "success" : "destructive"}>
                          {detailStaff.employmentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-[11px]">{t("Primary Address:")}</h4>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded border">
                      {detailStaff.addresses?.line || "Verified Address Block"}, {detailStaff.addresses?.area || "—"}, {detailStaff.addresses?.city || "—"}, {detailStaff.addresses?.state || "—"} - {detailStaff.addresses?.pincode || "—"}
                    </p>
                  </div>
                </TabsContent>

                {/* SubTab 2: Documents Ledger */}
                <TabsContent value="documents" className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-[11px]">{t("Government Document Registrations")}</h4>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDocModalOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> {t("Replace / Upload")}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(detailStaff.documents || []).length === 0 ? (
                      <div className="p-4 text-center text-slate-400">{t("No identity documents registered for this profile.")}</div>
                    ) : (
                      (detailStaff.documents || []).map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-slate-50/50">
                          <div>
                            <div className="font-bold text-slate-800">{doc.docType}</div>
                            {doc.expiryDate && <div className="text-[9px] text-slate-400 mt-0.5">{t("Expiry:")} {formatDate(doc.expiryDate)}</div>}
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">{t("Active current doc")}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* SubTab 3: Leaves Log */}
                <TabsContent value="leaves" className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-[11px]">{t("Leave Audit History Log")}</h4>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setLeaveModalOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> {t("File Leave Request")}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(detailStaff.leaves || []).length === 0 ? (
                      <div className="p-4 text-center text-slate-400">{t("No leave history logs found.")}</div>
                    ) : (
                      (detailStaff.leaves || []).map((l, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-slate-50/50">
                          <div>
                            <div className="font-bold text-slate-850">{l.type}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{t("Dates:")} {formatDate(l.startDate)} to {formatDate(l.endDate)}</div>
                          </div>
                          <Badge variant={l.status === "APPROVED" ? "success" : l.status === "PENDING" ? "warning" : "destructive"}>
                            {l.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* SubTab 4: Emergency Contacts */}
                <TabsContent value="emergency" className="space-y-4 pt-2">
                  <h4 className="font-bold text-slate-800 text-[11px]">{t("Authorized Emergency Contact Data")}</h4>
                  <div className="grid grid-cols-2 gap-4 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Contact Name")}</div>
                      <div className="font-bold text-slate-800 mt-0.5">{detailStaff.emergencyMedicalInfo?.emergencyName || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Relation")}</div>
                      <div className="font-bold text-slate-800 mt-0.5">{detailStaff.emergencyMedicalInfo?.emergencyRelation || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Emergency Phone")}</div>
                      <div className="font-bold text-slate-800 mt-0.5">{detailStaff.emergencyMedicalInfo?.emergencyMobile || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">{t("Blood Group & Allergies")}</div>
                      <div className="font-bold text-rose-700 mt-0.5">
                        {detailStaff.emergencyMedicalInfo?.bloodGroup || "—"} | {detailStaff.emergencyMedicalInfo?.allergies || "None"}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-3 border-t">
                <Button variant="ghost" onClick={() => setDetailStaff(null)}>{t("Close Profile Screen")}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Badge Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-xs text-xs text-center">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-slate-850">{t("Unique Staff QR Badge")}</DialogTitle>
          </DialogHeader>
          <div className="py-5 space-y-4 flex flex-col items-center">
            {qrTokenData ? (
              <>
                <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <img src={qrTokenData.qrDataUrl} alt={t("QR Code")} className="h-44 w-44" />
                </div>
                <div>
                  <div className="font-black text-sm text-slate-800">{qrTokenData.name}</div>
                  <div className="text-[10px] text-indigo-700 font-bold font-mono uppercase tracking-wider mt-0.5">{qrTokenData.staffPublicId}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">{qrTokenData.organization?.name}</div>
                </div>
                <div className="w-full pt-2">
                  <Button variant="outline" onClick={() => window.print()} className="w-full font-bold h-8 text-[11px]">
                    <Printer className="h-3.5 w-3.5 mr-1.5" /> {t("Print QR Badge card")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-10 text-center text-slate-400">{t("Generating digital QR badge...")}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace Document Dialog */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" /> {t("Upload / Replace Government Document")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Document Type *")}</Label>
              <SearchableSelect
                value={newDocType}
                onValueChange={setNewDocType}
                options={toOptions(["Aadhaar Card", "PAN Card", "Driving Licence", "Police Verification", "Employment Agreement", "Medical Certificate", "Other Documents"])}
                placeholder={t("Select document type")}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Document number / alphanumeric *")}</Label>
              <Input value={newDocNumber} onChange={(e) => setNewDocNumber(e.target.value)} placeholder={t("e.g. 1234-5678-9012")} className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Expiry Date (Optional)")}</Label>
              <Input type="date" value={newDocExpiry} onChange={(e) => setNewDocExpiry(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Document file URL (Optional)")}</Label>
              <Input value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} placeholder={t("e.g. /static/docs/doc1.png")} className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDocModalOpen(false)}>{t("Cancel")}</Button>
              <Button onClick={handleUploadDocument} disabled={uploadingDoc} className="bg-teal-650 hover:bg-teal-700 text-white font-bold">
                {uploadingDoc ? t("Saving Doc & Archiving Old...") : t("Save and Audit Doc")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Leave Modal */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" /> {t("Apply / Request Leave")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Leave Type Category *")}</Label>
              <SearchableSelect
                value={leaveType}
                onValueChange={setLeaveType}
                options={LEAVE_TYPE_OPTIONS}
                placeholder={t("Select leave type")}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Start Date *")}</Label>
                <Input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">{t("End Date *")}</Label>
                <Input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">{t("Reason for Leave *")}</Label>
              <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder={t("Please explain the details here")} className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" onClick={() => setLeaveModalOpen(false)}>{t("Cancel")}</Button>
              <Button onClick={handleApplyLeave} disabled={applyingLeave} className="bg-teal-650 hover:bg-teal-700 text-white font-bold">
                {applyingLeave ? t("Submitting Request...") : t("File Leave Request")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin / Staff Manager Manage Tab Access Dialog for Staff (Sub-Admin) */}
      <Dialog open={tabAccessStaff !== null} onOpenChange={(o) => { if (!o) setTabAccessStaff(null); }}>
        <DialogContent className="max-w-3xl text-xs max-h-[85vh] overflow-y-auto">
          {tabAccessStaff && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-800 font-bold">
                  <Sliders className="h-5 w-5 text-indigo-600" />
                  {t("Manage Tab Access Permissions:")} {tabAccessStaff.member?.fullName || tabAccessStaff.publicId}
                </DialogTitle>
              </DialogHeader>

              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900">
                <strong>{t("Delegated Staff Control")}</strong>{t(": Selecting tabs here will delegate specific module access to")} <strong>{tabAccessStaff.member?.fullName || "Staff"}</strong>{t(". You can only assign access to tabs that you currently hold.")}
              </div>

              <TabPermissionSelector
                selectedModules={selectedStaffTabs}
                onChange={setSelectedStaffTabs}
                isSuperAdmin={isSuperAdmin}
                allowedModules={actorAllowedModules}
                title={`Delegated Tab Permissions for ${tabAccessStaff.member?.fullName || "Staff"}`}
              />

              <DialogFooter className="gap-2 border-t pt-3">
                <Button variant="ghost" onClick={() => setTabAccessStaff(null)}>{t("Cancel")}</Button>
                <Button
                  onClick={handleSaveStaffTabs}
                  disabled={savingStaffTabs}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {savingStaffTabs ? t("Saving Permissions...") : t("Save & Update Staff Tab Access")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
