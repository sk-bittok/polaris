const LoadingStateView: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-64 gap-4">
    <div className="h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-l-blue-500 dark:border-l-blue-600 rounded-full animate-spin" />
    <p className="text-gray-500 dark:text-gray-400 font-medium italic">
      {message}
    </p>
  </div>
);

export default LoadingStateView;
