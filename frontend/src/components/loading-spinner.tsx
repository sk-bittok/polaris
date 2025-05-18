import React from "react";

export default function LoadingSpinner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400 animate-spin rounded-full" />
      {children}
    </div>
  );
}
