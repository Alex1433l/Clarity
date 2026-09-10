import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/layouts/Sidebar';
import MobileNav from '@/layouts/MobileNav';
import Topbar from '@/layouts/Topbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-sand-50 dark:bg-sand-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={handleMenuClick}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 px-2 sm:px-3 lg:px-4 py-3 pb-24 lg:pb-3 w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
