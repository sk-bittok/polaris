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
import {
	useGetLivestockHealthRecordsQuery,
	useNewLivestockHealthRecordMutation,
} from "@/state/api";
import {
	extractErrorMessage,
	formatDisplayDate,
	extractErrorStatus,
} from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { NewHealthRecord } from "@/lib/schemas/records";
import { HealthRecordDialogue } from "@/components/protected/modals";
import { useRouter } from "next/navigation";

function HealthRecordsTable({ data }: { data: HealthRecordResponse[] }) {
	const router = useRouter();
	const columns: ColumnTable<HealthRecordResponse>[] = [
		{ key: "animalTagId", header: "Tag ID" },
		{ key: "animalName", header: "Name" },
		{ key: "condition", header: "Condition" },
		{ key: "status", header: "Status" },
		{ key: "severity", header: "Severity" },
		{
			key: "recordDate",
			header: "Record Date",
			render: (record) => formatDisplayDate(record.recordDate),
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
					onEdit={(record) => router.push(`/health-records/${record.id}/edit`)}
					onView={(record) => router.push(`/health-records/${record.id}`)}
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
	const [isModalOpen, setModalOpen] = useState(false);
	const { data, error, isLoading, isError, isSuccess } =
		useGetLivestockHealthRecordsQuery(null);
	const [addNewRecord] = useNewLivestockHealthRecordMutation();

	const onSubmit = async (data: NewHealthRecord) => {
		data.recordDate = format(data.recordDate, "yyyy-MM-dd");
		data.cost = Number.parseInt(`${data.cost}00`);
		try {
			const response = await addNewRecord(data);

			if (response.data && response.error === undefined) {
				toast.success("Record added successfully", {
					position: "top-center",
				});
				return;
			}
			const error = response.error;
			const message = extractErrorMessage(error);
			toast.error(message, {
				position: "top-center",
			});
			return;
		} catch (e) {
			console.error(e);
			toast.error("Something went wrong on our end", {
				position: "top-center",
			});
		}
	};

	const renderView = () => {
		if (isLoading) {
			return <LoadingStateView message="Loading health records..." />;
		}

		if (isError) {
			return (
				<ErrorStateView
					message={extractErrorMessage(error)}
					title={`Error ${extractErrorStatus(error)}`}
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
				<HealthRecordDialogue
					isOpen={isModalOpen}
					onClose={() => setModalOpen(false)}
					onCreate={onSubmit}
				>
					<HeaderButton label="Add new" onClick={() => {}} />
				</HealthRecordDialogue>
			</PageHeader>
			{renderView()}
		</div>
	);
}
