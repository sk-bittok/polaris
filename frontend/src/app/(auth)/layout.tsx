'use client';

import type React from "react";
import ReduxStoreProvider from "@/providers/store-provider";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStoreProvider>{children}</ReduxStoreProvider>
  );
}
