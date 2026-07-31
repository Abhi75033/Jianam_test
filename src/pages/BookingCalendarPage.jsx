import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CalendarDays, Home, ChevronLeft, ChevronRight, Check, Plus, Calendar, Ban, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BookingCalendarPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organizationIds?.[0];

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [byDay, setByDay] = useState({});
  const [bookingsList, setBookingsList] = useState([]);

  // Date Click Action Modal State
  const [dateOptionsOpen, setDateOptionsOpen] = useState(false);
  const [selectedClickedDate, setSelectedClickedDate] = useState(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const loadCalendarBookings = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/bookings/calendar`, {
        params: { month, year, organizationId: orgId }
      });
      setByDay(res.data.data.byDay || {});
      setBookingsList(res.data.data.bookings || []);
    } catch (e) {
      toast.error(t("Failed to load booking calendar."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, month, year]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleDateClick = (day, dayBookings) => {
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    setSelectedClickedDate({
      day,
      dateStr,
      formattedDate: `${day} ${monthNames[month - 1]} ${year}`,
      dayBookings,
      status: dayBookings.length > 0 ? "BOOKED" : "AVAILABLE"
    });
    setDateOptionsOpen(true);
  };

  // Helper to render calendar days
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i + 1);

  const dharamshalaCount = bookingsList.filter(b => b.type === "DHARAMSHALA" || b.type === "ROOM").length;
  const hallsCount = bookingsList.filter(b => b.type === "HALL" || b.type === "COMMUNITY_HALL").length;

  return (
    <div className="space-y-4" data-testid="booking-calendar-page">
      <PageHeader
        title={t("Reservations Calendar")}
        subtitle={t("Visual grid view tracking all temple halls, bhojanshalas, and room booking requests.")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label={t("Total Bookings This Month")} value={bookingsList.length} icon={CalendarDays} tone="warning" />
        <StatCard label={t("Dharamshala Bookings")} value={`${dharamshalaCount} Rooms`} icon={Home} tone="default" />
        <StatCard label={t("Halls Confirmed")} value={`${hallsCount} Reservation(s)`} icon={Check} tone="info" />
      </div>

      <Card className="p-5 border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            {monthNames[month - 1]} {year}
          </h3>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="h-24 bg-slate-50/50 rounded-xl border border-dashed border-slate-100"></div>
          ))}

          {days.map((day) => {
            const dayBookings = byDay[day] || [];
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
            const isBooked = dayBookings.length > 0;

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day, dayBookings)}
                className={`h-24 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                  isToday ? "border-orange-500 bg-orange-50/30" :
                  isBooked ? "border-rose-200 bg-rose-50/40 text-rose-800" :
                  "border-slate-200 hover:border-orange-400 bg-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center ${
                    isToday ? "bg-orange-600 text-white shadow-sm" : "text-slate-700 bg-slate-100"
                  }`}>{day}</span>
                  <Plus className="h-3 w-3 text-slate-400 hover:text-orange-600" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 my-1">
                  {dayBookings.slice(0, 2).map((b) => (
                    <div key={b.id} className="text-[8px] px-1 rounded py-0.5 truncate font-bold bg-orange-100 text-orange-900 border border-orange-200/60" title={`${b.member?.fullName} (${b.bookingItem?.name || "Unit"})`}>
                      {b.member?.fullName || "Booked"} ({b.bookingItem?.name || "Unit"})
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-[8px] font-bold text-orange-700">+{dayBookings.length - 2} {t("more")}</div>
                  )}
                </div>

                <span className={`text-[8px] uppercase tracking-wider font-extrabold w-fit px-1.5 py-0.5 rounded ${
                  isBooked ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {isBooked ? `BOOKED (${dayBookings.length})` : "AVAILABLE"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Date Click Action Options Modal */}
      <Dialog open={dateOptionsOpen} onOpenChange={setDateOptionsOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between font-bold text-slate-850">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                {t("Actions for")} {selectedClickedDate?.formattedDate}
              </span>
              <StatusBadge status={selectedClickedDate?.status || "AVAILABLE"} />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <p className="text-slate-500 text-[11px]">
              {t("Select an operational action to perform on")} <strong className="text-slate-800">{selectedClickedDate?.formattedDate}</strong>:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  navigate(`/bookings?tab=admin_bookings`);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-700 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("Submit New Booking Request")}</div>
                    <div className="text-[10px] text-slate-400">{t("Pre-fill booking start date for")} {selectedClickedDate?.formattedDate}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  navigate(`/bookings?tab=reservations`);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("Add Internal Reservation / Block")}</div>
                    <div className="text-[10px] text-slate-400">{t("Reserve unit for VIP, Monk, Trust, or Private event")}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  navigate(`/bookings?tab=availability_calendar`);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("Mark Maintenance / Blackout Date")}</div>
                    <div className="text-[10px] text-slate-400">{t("Block facility for repairs or cleaning blackout")}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateOptionsOpen(false);
                  navigate(`/bookings?tab=admin_bookings`);
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{t("View Ledger Requests on This Date")}</div>
                    <div className="text-[10px] text-slate-400">{t("Filter and audit bookings for")} {selectedClickedDate?.formattedDate}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setDateOptionsOpen(false)}>{t("Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
