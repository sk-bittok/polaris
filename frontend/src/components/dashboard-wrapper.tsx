import type React from "react";

import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useAppSelector } from "@/redux";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />

      <main className={`flex flex-col h-full w-full px-9 py-7 ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"}`}>
        <Navbar />

        {children}
      </main>
    </div>
  );
}

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  )
}

