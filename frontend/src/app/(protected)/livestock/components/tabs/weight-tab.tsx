import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNewLivestockWeightRecordMutation } from "@/state/api";
import type { NewWeightRecord } from "@/lib/schemas/records";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
// UI Components - Now purely presentational
import type React from "react";
import { RefreshCw, AlertCircle, FileText, Plus, Weight } from "lucide-react";
import { WeightRecordDialog } from "../dialogues";
import { WeightRecordResponse } from "@/lib/models/records";

import { formatDisplayDate, extractErrorMessage } from "@/lib/utils";

// Custom hook that encapsulates all the weight record business logic
const useWeightRecordOperations = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [addWeightRecord] = useNewLivestockWeightRecordMutation();

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Centralized error handling logic
  const handleApiError = (error: any) => {
    if ("error" in error) {
      toast.error(`Record creation failed: ${error.error}`, {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if ("status" in error) {
      const statusCode = error.status.toString();
      if (statusCode.startsWith("5")) {
        toast.error("Internal server error occurred while creating record", {
          position: "top-center",
          duration: 4000,
        });
        return;
      }
      if (statusCode.startsWith("4")) {
        toast.error(`${error?.data?.message}`, {
          position: "top-center",
          duration: 4000,
        });
        return;
      }
    }

    toast.error("Failed to create record", {
      position: "top-center",
      duration: 4000,
    });
  };

  // Main submission handler with clean separation of data transformation and API call
  const submitWeightRecord = async (data: NewWeightRecord) => {
    try {
      // Transform data for API - this could be moved to a separate utility function
      const transformedData = {
        ...data,
        recordDate: format(new Date(data.recordDate), "yyyy-MM-dd"),
        mass: Number.parseInt(`${data.mass}00`),
      };

      console.log("Submitting weight record:", transformedData);

      const response = await addWeightRecord(transformedData);

      if (response.data && response.error === undefined) {
        toast.success("Record added successfully", {
          position: "top-right",
          duration: 4000,
        });
        closeModal(); // Close modal on success
        return;
      }

      if (response.error) {
        handleApiError(response.error);
      }
    } catch (error) {
      console.error("Weight record submission error:", error);
      toast.error("An error occurred while creating the weight record.");
    }
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    submitWeightRecord,
  };
};

// Props interfaces for better type safety
interface WeightTabProps {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: WeightRecordResponse[];
  error?: FetchBaseQueryError | SerializedError;
  className: string;
}

interface ModalActionProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSubmit: (data: NewWeightRecord) => void;
}

// Reusable Modal Button Component
const WeightRecordModalButton: React.FC<{
  children: React.ReactNode;
  onOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewWeightRecord) => void;
}> = ({ children, onOpen, isOpen, onClose, onSubmit }) => (
  <WeightRecordDialog onCreate={onSubmit} onClose={onClose} isOpen={isOpen}>
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-3 bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-lg hover:opacity-80 text-white transition-opacity"
    >
      <Plus size={16} />
      {children}
    </button>
  </WeightRecordDialog>
);

// Header Section Component
const WeightRecordsHeader: React.FC<ModalActionProps> = ({
  isOpen,
  onClose,
  onOpen,
  onSubmit,
}) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="flex items-center text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
        <Weight size={32} className="text-gray-300 dark:text-gray-600 mr-2" />
        Weight Records
      </h2>
    </div>
    <div>
      <WeightRecordModalButton
        onSubmit={onSubmit}
        onClose={onClose}
        isOpen={isOpen}
        onOpen={onOpen}
      >
        Add weight record
      </WeightRecordModalButton>
    </div>
  </div>
);

// Empty State Component
const EmptyStateView: React.FC<ModalActionProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onOpen,
}) => (
  <div className="flex flex-col items-center justify-center h-64">
    <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
    <h3 className="text-lg mb-2 font-medium text-gray-700 dark:text-gray-300">
      No weight records found
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
      Start tracking your livestock weight over time by adding your first
      record.
    </p>
    <div>
      <WeightRecordModalButton
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        onOpen={onOpen}
      >
        Add first record
      </WeightRecordModalButton>
    </div>
  </div>
);

// Error State Component
const ErrorStateView: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-gray-700 dark:text-gray-200 text-lg font-medium mb-2">
      Failed to fetch weight records
    </h3>
    <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
      {message}
    </p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <RefreshCw size={16} />
      Retry
    </button>
  </div>
);

// Loading State Component
const LoadingStateView: React.FC = () => (
  <div className="flex items-center justify-center h-64 gap-4">
    <div className="h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-l-blue-500 dark:border-l-blue-600 rounded-full animate-spin" />
    <p className="text-gray-500 dark:text-gray-400 font-medium italic">
      Loading weight records...
    </p>
  </div>
);

// Success State Component with Data Table
const WeightRecordsTable: React.FC<{ data: WeightRecordResponse[] }> = ({
  data,
}) => {
  // Consistent styling classes
  const headerCellClass =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
  const dataCellClass = "px-6 py-4 whitespace-nowrap text-sm";
  const textSecondaryClass = "text-gray-500 dark:text-gray-400";

  return (
    <div className="overflow-y-auto rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className={headerCellClass}>Tag ID</th>
            <th className={headerCellClass}>Name</th>
            <th className={headerCellClass}>Mass (KG)</th>
            <th className={headerCellClass}>Date</th>
            <th className={headerCellClass}>Created By</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {data.map((record) => (
            <tr
              key={record.id}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <td
                className={`${dataCellClass} text-lg font-semibold dark:text-gray-100 text-gray-900`}
              >
                {record.animalTagId}
              </td>
              <td
                className={`${dataCellClass} ${textSecondaryClass} font-medium`}
              >
                {record.animalName}
              </td>
              <td className={`${dataCellClass} ${textSecondaryClass}`}>
                {record.mass}
              </td>
              <td className={`${dataCellClass} ${textSecondaryClass}`}>
                {formatDisplayDate(record.recordDate)}
              </td>
              <td className={`${dataCellClass} ${textSecondaryClass}`}>
                {record.createdByName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Component - Now much cleaner and focused on orchestration
export default function WeightTab({
  isSuccess,
  isLoading,
  isError,
  error,
  data,
  className,
}: WeightTabProps) {
  // Use our custom hook for all weight record operations
  const { isModalOpen, openModal, closeModal, submitWeightRecord } =
    useWeightRecordOperations();

  // Props object for modal actions - reduces prop drilling
  const modalActionProps: ModalActionProps = {
    isOpen: isModalOpen,
    onClose: closeModal,
    onOpen: openModal,
    onSubmit: submitWeightRecord,
  };

  // Conditional rendering logic is now clear and organized
  const renderContent = () => {
    if (isLoading) {
      return <LoadingStateView />;
    }

    if (isError) {
      return <ErrorStateView message={extractErrorMessage(error)} />;
    }

    if (isSuccess && data) {
      return data.length > 0 ? (
        <WeightRecordsTable data={data} />
      ) : (
        <EmptyStateView {...modalActionProps} />
      );
    }

    // Fallback case
    return <ErrorStateView message="Unable to load weight records" />;
  };

  const containerClass = `bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${className}`;

  return (
    <div className={containerClass}>
      <WeightRecordsHeader {...modalActionProps} />
      {renderContent()}
    </div>
  );
}
