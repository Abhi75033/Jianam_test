import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import MemberSidebar from "./MemberSidebar";
import MemberTopbar from "./MemberTopbar";
import MemberBottomNav from "./MemberBottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMemberLocation } from "@/hooks/useMemberLocation";
import { useVisibilityEngine } from "@/contexts/VisibilityEngineContext";

/**
 * MemberLayout.jsx — Admin-style Layout for Member Panel with Member Left Sidebar + Topbar.
 */
export default function MemberLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /*
   * §4.3.4 / §4.15.6 — content priority runs off "current GPS location, else
   * registered address". The GPS half didn't exist anywhere in the member
   * panel; mounting the hook here means every screen under this layout gets a
   * live device fix through the visibility engine without fetching it itself.
   */
  const location = useMemberLocation();
  const { updateDeviceCoords } = useVisibilityEngine();
  useEffect(() => {
    updateDeviceCoords(location.coords);
  }, [location.coords, updateDeviceCoords]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      
      {/* Desktop Left Sidebar (Sticky, Collapsible like Admin) */}
      <div className="hidden md:block h-screen sticky top-0 transition-all duration-300 z-40">
        <MemberSidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-[#0B1A48]">
          <MemberSidebar onNavigate={() => setMobileOpen(false)} collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Right Content Area: Topbar + Main Canvas */}
      <div className="flex-1 min-w-0 flex flex-col">
        <MemberTopbar onToggleSidebar={handleToggleSidebar} />
        
        <main
          // pb-24 on mobile keeps the last card clear of the fixed bottom nav.
          className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 animate-fade-up"
          data-testid="member-main"
        >
          {/* Pages reach GPS status/request via useOutletContext(), so the
              "Use my current location" button can live next to whatever
              nearby content it unlocks (Home, Explore, Offers) without a
              dedicated context provider. */}
          <Outlet context={location} />
        </main>
      </div>

      {/* Primary navigation on phones; the sidebar covers desktop. */}
      <MemberBottomNav />

    </div>
  );
}
