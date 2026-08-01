import { useState } from "react";
import { Outlet } from "react-router-dom";
import MemberSidebar from "./MemberSidebar";
import MemberTopbar from "./MemberTopbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

/**
 * MemberLayout.jsx — Admin-style Layout for Member Panel with Member Left Sidebar + Topbar.
 */
export default function MemberLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
          className="flex-1 p-4 sm:p-6 md:p-8 animate-fade-up"
          data-testid="member-main"
        >
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
