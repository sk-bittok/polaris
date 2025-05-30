"use client";

import {
  type ColumnTable,
  HeaderButton,
  PageHeader,
  RecordsTable,
  LoadingStateView,
  ErrorStateView,
  ActionButtons,
} from "@/components/protected/utilities";
import type { ProductionRecordResponse } from "@/lib/models/records";
import { extractErrorMessage, formatDisplayDate } from "@/lib/utils";
import { useGetLivestockProductionRecordQuery } from "@/state/api";
import type React from "react";

function ProductionRecordsTable({
  data,
}: {
  data: ProductionRecordResponse[];
}) {
  const columns: ColumnTable<ProductionRecordResponse>[] = [
    { key: "animalTagId", header: "Tag ID" },
    { key: "animalName", header: "Name" },
    { key: "productType", header: "Type" },
    { key: "unit", header: "Unit" },
    { key: "quantity", header: "Quantity" },
    { key: "quality", header: "Quality" },
    {
      key: "recordDate",
      header: "Record Date",
      render: (record) => formatDisplayDate(record.recordDate),
    },
    {
      key: "actions",
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
      caption="A list of products produced by your livestock"
      columns={columns}
      data={data}
      keyExtractor={(record) => record.id}
      emptyMessage="No production records found"
    />
  );
}

export default function ProductionRecordsPage() {
  const { data, isSuccess, isError, isLoading, error } =
    useGetLivestockProductionRecordQuery(null);

  const renderViewState = () => {
    if (isLoading) {
      return <LoadingStateView message="Loading production records..." />;
    }

    if (isError) {
      return (
        <ErrorStateView
          message={extractErrorMessage(error)}
          title={error.data.status || "500"}
        />
      );
    }

    if (isSuccess && data !== undefined) {
      return <ProductionRecordsTable data={data} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Production Records">
        <HeaderButton label="Add new" onClick={() => {}} />
      </PageHeader>
      {renderViewState()}
    </div>
  );
}
