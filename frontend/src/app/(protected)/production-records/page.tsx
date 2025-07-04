"use client";

import { ProductRecordDialogue } from "@/components/protected/modals";
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
import {
	extractErrorMessage,
	extractErrorStatus,
	formatDisplayDate,
} from "@/lib/utils";
import {
	useGetProductionRecordsQuery,
	useNewProductionRecordMutation,
	useDeleteProductionRecordByIdMutation,
} from "@/state/api";
import type React from "react";
import { useState } from "react";
import { format } from "date-fns";
import type { NewProductRecord } from "@/lib/schemas/records";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function ProductionRecordsTable({
	data,
	confirmDelete,
}: {
	data: ProductionRecordResponse[];
	confirmDelete: (record: ProductionRecordResponse) => void;
}) {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] =
		useState<ProductionRecordResponse | null>(null);

	const router = useRouter();

	const handleDeleteClick = (record: ProductionRecordResponse) => {
		setSelectedRecord(record);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (selectedRecord) {
			confirmDelete(selectedRecord);
			setIsDeleteModalOpen(false);
			setSelectedRecord(null);
		}
	};

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
					onEdit={(record) =>
						router.push(`/production-records/${record.id}/edit`)
					}
					onView={(record) => router.push(`/production-records/${record.id}`)}
					onDelete={handleDeleteClick}
					confirmDelete={handleConfirmDelete}
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
		useGetProductionRecordsQuery(null);
	const [addNewRecord] = useNewProductionRecordMutation();
	const [deleteRecord] = useDeleteProductionRecordByIdMutation();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const onSubmit = async (data: NewProductRecord) => {
		data.recordDate = format(data.recordDate, "yyyy-MM-dd");
		data.quantity = Number.parseInt(`${data.quantity}00`);
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

	const confirmDelete = async (record: ProductionRecordResponse) => {
		const response = await deleteRecord(record.id);
		console.log(response);
	};

	const renderViewState = () => {
		if (isLoading) {
			return <LoadingStateView message="Loading production records..." />;
		}

		if (isError && error !== undefined) {
			return (
				<ErrorStateView
					message={extractErrorMessage(error)}
					title={`Error ${extractErrorStatus(error)}`}
				/>
			);
		}

		if (isSuccess && data !== undefined) {
			return (
				<ProductionRecordsTable data={data} confirmDelete={confirmDelete} />
			);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<PageHeader title="Production Records">
				<ProductRecordDialogue
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onCreate={onSubmit}
				>
					<HeaderButton label="Add new" onClick={() => setIsModalOpen(true)} />
				</ProductRecordDialogue>
			</PageHeader>
			{renderViewState()}
		</div>
	);
}
