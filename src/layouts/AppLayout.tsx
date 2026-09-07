import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/layouts/Sidebar';
import MobileNav from '@/layouts/MobileNav';
import Topbar from '@/layouts/Topbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-sand-50 dark:bg-sand-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
