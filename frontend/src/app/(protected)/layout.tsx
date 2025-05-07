'use client';

import type React from "react";
import DashboardWrapper from "@/components/dashboard-wrapper";
import ReduxStoreProvider from "@/providers/store-provider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStoreProvider >
      <DashboardWrapper>
        {children}
      </DashboardWrapper>
    </ReduxStoreProvider>
  )
}
