'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useMeQuery } from '@/lib/features/api/authApi';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  useMeQuery();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="mx-auto max-w-[1440px] p-3 sm:p-8">{children}</main>
      </div>
    </div>
  );
}