"use client";

import {
  PageHeader,
  HeaderButton,
  type ColumnTable,
  RecordsTable,
  LoadingStateView,
  ErrorStateView,
  ActionButtons,
} from "@/components/protected/utilities";
import type { HealthRecordResponse } from "@/lib/models/records";
import { useGetLivestockHealthRecordsQuery } from "@/state/api";
import { extractErrorMessage, formatDisplayDate } from "@/lib/utils";

function HealthRecordsTable({ data }: { data: HealthRecordResponse[] }) {
  const columns: ColumnTable<HealthRecordResponse>[] = [
    { key: "animalTagId", header: "Tag ID" },
    { key: "animalName", header: "Name" },
    { key: "recordType", header: "Record Type" },
    {
      key: "recordDate",
      header: "Record Date",
      render: (record) => formatDisplayDate(record.recordDate),
    },
    { key: "treatment", header: "Treatment" },
    { key: "description", header: "Description" },
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
      caption="A list of all your livestock weight records"
      data={data}
      columns={columns}
      keyExtractor={(record) => record.id}
      emptyMessage="No health records found for your livestock"
    />
  );
}

export default function HealthRecordsPage() {
  const { data, error, isLoading, isError, isSuccess } =
    useGetLivestockHealthRecordsQuery(null);

  const renderView = () => {
    if (isLoading) {
      return <LoadingStateView message="Loading health records..." />;
    }

    if (isError) {
      return (
        <ErrorStateView
          message={extractErrorMessage(error)}
          title={error.data.status || 500}
        />
      );
    }

    if (isSuccess && data !== undefined) {
      return <HealthRecordsTable data={data} />;
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Health Records">
        <HeaderButton label="Add new" onClick={() => {}} />
      </PageHeader>
      {renderView()}
    </div>
  );
}
