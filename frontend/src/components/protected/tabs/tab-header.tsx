import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface TabHeaderProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="flex items-center text-xl font-medium text-gray-700 mb-2 dark:text-gray-200">
        <Icon size={32} className="text-gray-300 dark:text-gray-600 mr-2" />
        {title}
      </h3>
    </div>
    <div>{children}</div>
  </div>
);

export default TabHeader;
