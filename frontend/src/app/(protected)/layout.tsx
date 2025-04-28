'use client';

import type React from "react";
import DashboardWrapper from "@/components/dashboard-wrapper";


export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardWrapper>
            {children}
        </DashboardWrapper>
    )
}