import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface LinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isSidebarCollapsed: boolean;
}

export default function SidebarLink({ href, icon: Icon, label, isSidebarCollapsed }: LinkProps) {
    const pathname = usePathname();
    const isLinkActive = pathname === href || pathname.startsWith(href);


    return (
        <Link href={href}>
            <div className={`cursor-pointer flex items-center ${isSidebarCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"}
            hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 gap-3 transition-colors ${isLinkActive ? "bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-400" : ""}`}>
                <Icon className="w-6 h-6 !text-gray-700 dark:!text-gray-300" />
                <span className={`${isSidebarCollapsed ? "hidden" : "block"} text-gray-700 font-medium dark:text-gray-300`}>{label}</span>
            </div>
        </Link>
    )

}