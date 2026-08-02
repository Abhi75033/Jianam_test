import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";
import ModuleRouteGuard from "./ModuleRouteGuard";
import { Sheet, SheetContent } from "@/components/ui/sheet";


export default function AdminLayout() {
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
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0 transition-all duration-300">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile sidebar (opens via topbar hamburger) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 sidebar-navy border-r-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} collapsed={false} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onToggleSidebar={handleToggleSidebar} />
        <main
          className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 animate-fade-up"
          data-testid="admin-main"
        >
          {/* Tab access is enforced here too, so a typed URL can't reach a
              module the account was never granted. */}
          <ModuleRouteGuard>
            <Outlet />
          </ModuleRouteGuard>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
