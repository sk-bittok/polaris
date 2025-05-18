import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleAlert, Trash2 } from "lucide-react";
import React from "react";

export const InfoCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-b border-gray-100 dark:border-gray-700 ${className}`}
  >
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

export const InfoRow = ({ label, value, className = "" }) => (
  <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span
      className={`font-medium text-gray-800 dark:text-gray-100 ${className}`}
    >
      {value}
    </span>
  </div>
);

// Reusable EmptySection Component
export const EmptySection = ({ icon, message, description, buttonText }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
    {icon && (
      <span className="mx-auto mb-2 text-gray-400 dark:text-gray-500 flex justify-center">
        {icon}
      </span>
    )}
    <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 mb-4">
      {description}
    </p>
    {buttonText && (
      <Button variant="outline" size="sm" className="mt-3 text-xs">
        {buttonText}
      </Button>
    )}
  </div>
);

// Reusable Section with Header and Action Button
export const SectionWithAction = ({
  title,
  actionText,
  onAction,
  children,
}: {
  title: string;
  actionText: string;
  onAction: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 dark:text-blue-300"
        onClick={onAction}
      >
        {actionText}
      </Button>
    </div>
    {children}
  </div>
);

export const DeleteDialog = ({
  confirmDelete,
  children,
}: {
  confirmDelete: () => void;
  children: React.ReactNode;
}) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="sm:max-w-[435px]">
      <DialogHeader>
        <DialogTitle>Remove animal</DialogTitle>
        <DialogDescription>
          <span className="flex items-center mb-4">
            <CircleAlert size={24} className="mr-2" />
            This action cannot be undone. Are you sure you want to permanently
            delete this record from our servers?
          </span>
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center justify-end">
        <Button
          onClick={confirmDelete}
          type="button"
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <Trash2 className="mr-2" size={20} />
          Delete
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
