import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import type React from "react";

export const HeaderButton: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 bg-blue-500 dark:bg-blue-600 hover:opacity-80 px-4 py-2 rounded-lg text-white"
  >
    <Plus size={16} className="w-5 h-5 font-bold" />
    {label}
  </button>
);

const PageHeader: React.FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    {children}
  </div>
);

export default PageHeader;
