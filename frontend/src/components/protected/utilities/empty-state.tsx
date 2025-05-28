import { FileText } from "lucide-react";
import { ReactNode } from "react";

const EmptyStateView: React.FC<{
  title: string;
  description: string;
  children: ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex flex-col items-center h-full">
    <FileText className="h-16 w-16 text-gray-300 mb-4 dark:text-gray-700" />
    <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
      {title}
    </h3>
    <p className="text-gray-500 text-center max-w-md mb-6 dark:text-gray-400">
      {description}
    </p>
    <div>{children}</div>
  </div>
);

export default EmptyStateView;
