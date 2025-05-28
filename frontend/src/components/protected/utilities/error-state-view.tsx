import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorStateView: React.FC<{ message: string; title: string }> = ({
  title,
  message,
}) => (
  <div className="flex flex-col items-center justify-center h-screen overflow-y-hidden">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">
      {title}
    </h3>
    <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
      {message}
    </p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <RefreshCw />
      Refresh
    </button>
  </div>
);

export default ErrorStateView;
