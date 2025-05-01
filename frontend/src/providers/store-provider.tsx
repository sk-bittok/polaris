import type React from "react";
import StoreProvider from "@/redux";

export default function ReduxStoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <StoreProvider>
            {children}
        </StoreProvider>
    );
}