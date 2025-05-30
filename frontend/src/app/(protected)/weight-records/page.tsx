"use client";

import {
  useGetLivestockWeightRecordsQuery,
  useNewLivestockWeightRecordMutation,
} from "@/state/api";
import { formatDisplayDate, extractErrorMessage } from "@/lib/utils";
import { Plus } from "lucide-react";
import {
  LoadingStateView,
  EmptyStateView,
  ErrorStateView,
  PageHeader,
  HeaderButton,
  type ColumnTable,
  ActionButtons,
  RecordsTable,
} from "@/components/protected/utilities";
import type { WeightRecordResponse } from "@/lib/models/records";
import { WeightRecordDialogue } from "@/components/protected/modals";
import { useState } from "react";
import { format } from "date-fns";
import type { NewWeightRecord } from "@/lib/schemas/records";
import { toast } from "sonner";

function WeightRecordsTable({ data }: { data: WeightRecordResponse[] }) {
  const columns: ColumnTable<WeightRecordResponse>[] = [
    { key: "animalTagId", header: "Tag ID" },
    { key: "animalName", header: "Name" },
    { key: "mass", header: "Weight" },
    {
      key: "recordDate",
      header: "Date",
      render: (record) => formatDisplayDate(record.recordDate),
    },
    { key: "createdByName", header: "Created By" },
    {
      key: "createdAt",
      header: "Created At",
      render: (record) => formatDisplayDate(record.createdAt),
    },
    {
      key: "action",
      header: "Actions",
      render: (record) => (
        <ActionButtons
          record={record}
          showDelete={true}
          showEdit={true}
          showView={true}
          onEdit={(record) => console.log("Editing ", record.id)}
          onView={(record) => console.log("Viewing ", record.id)}
          onDelete={(record) => console.log("Deleting ", record.id)}
        />
      ),
    },
  ];

  return (
    <RecordsTable
      columns={columns}
      data={data}
      caption="A list of all your livestock weight records"
      keyExtractor={(record) => record.id}
      emptyMessage="No weight records found."
    />
  );
}

export default function WeightRecordsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    isLoading,
    isError,
    isSuccess,
    data: weightData,
    error: weightError,
  } = useGetLivestockWeightRecordsQuery(null);
  const [addWeightRecord] = useNewLivestockWeightRecordMutation();

  const handleSubmit = async (data: NewWeightRecord) => {
    data.recordDate = format(data.recordDate, "yyyy-MM-dd");
    data.mass = Number.parseInt(`${data.mass}00`);

    try {
      const response = await addWeightRecord(data);

      if (response.data && response.error === undefined) {
        toast.success("Record added successfully", {
          position: "top-center",
        });
        return;
      }
      if (response.error) {
        const error = response.error;
        const message = extractErrorMessage(error);
        toast.error(message, {
          position: "top-center",
        });
        return;
      }
    } catch (e) {
      toast.error("Something went wrong on our end", {
        position: "top-center",
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingStateView message={"Loading weight records"} />;
    }

    if (isError) {
      return (
        <ErrorStateView
          title={weightError.status || 500}
          message={extractErrorMessage(weightError)}
        />
      );
    }

    if (isSuccess && weightData) {
      return weightData.length > 0 ? (
        <WeightRecordsTable data={weightData} />
      ) : (
        <EmptyStateView
          title="No weight records yet"
          description="Start tracking the weight performance of your livestock by adding yout first record"
        >
          <button
            onClick={() => setModalOpen(true)}
            type="button"
            className="bg-blue-500 dark:bg-blue-600 hover:opacity-80 px-4 py-2 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add first record
          </button>
        </EmptyStateView>
      );
    }

    return (
      <ErrorStateView
        title="Error 500"
        message="Internal Server Error: Unable to load records"
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Weight Records">
        <WeightRecordDialogue
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleSubmit}
        >
          <HeaderButton onClick={() => setModalOpen(true)} label="Add new" />
        </WeightRecordDialogue>
      </PageHeader>
      <div>{renderContent()}</div>
    </div>
  );
}
