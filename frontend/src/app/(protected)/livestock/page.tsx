"use client";

import {
	useDeleteLivestockByIdMutation,
	useGetLivestockQuery,
} from "@/state/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import { type Livestock, Status } from "@/models/livestock";
import {
	type ColumnTable,
	PageHeader,
	RecordsTable,
	ErrorStateView,
	LoadingStateView,
	ActionButtons,
} from "@/components/protected/utilities";
import { extractErrorMessage, extractErrorStatus } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

function LivestockTable({
	data,
	confirmDelete,
}: {
	data: Livestock[];
	confirmDelete: (record: Livestock) => void;
}) {
	const router = useRouter();
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<Livestock | null>(null);

	const handleDeleteClick = (record: Livestock) => {
		setSelectedRecord(record);
		setDeleteModalOpen(true);
	};
	const handleConfirmDelete = async () => {
		if (selectedRecord) {
			confirmDelete(selectedRecord);
			setDeleteModalOpen(false);
			setSelectedRecord(null);
		}
	};

	const columns: ColumnTable<Livestock>[] = [
		{ key: "tagId", header: "Tag ID" },
		{ key: "name", header: "Name" },
		{ key: "specieName", header: "Category" },
		{ key: "breedName", header: "Breed" },
		{ key: "gender", header: "Gender" },
		{
			key: "status",
			header: "Status",
			render: (record) => (
				<span
					className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:text-white ${
						record.status === Status.Active
							? "bg-blue-300 dark:bg-blue-600 text-blue-900"
							: record.status === Status.Sold
								? "bg-green-300 dark:bg-green-600 text-green-900"
								: "bg-red-300 dark:bg-red-600 text-red-900"
					}`}
				>
					{record.status}
				</span>
			),
		},
		{
			key: "updatedAt",
			header: "Updated",
			render: (record) =>
				formatDistanceToNow(new Date(record.updatedAt), { addSuffix: true }),
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
					onView={(record) => router.push(`/livestock/${record.pid}`)}
					onEdit={(record) => router.push(`/livestock/${record.pid}/edit`)}
					onDelete={(record) => handleDeleteClick(record)}
					confirmDelete={handleConfirmDelete}
				/>
			),
		},
	];

	return (
		<>
			<RecordsTable
				caption="A list of your livestock"
				columns={columns}
				data={data}
				keyExtractor={(record) => record.id}
				emptyMessage="No production records found"
			/>
		</>
	);
}

export default function LivestockListPage() {
	const { data, isError, isLoading, isSuccess, error } = useGetLivestockQuery();
	const [deleteRecord] = useDeleteLivestockByIdMutation();

	const confirmDelete = async (record: Livestock) => {
		try {
			const response = await deleteRecord(record.pid);
			if (!response.error) {
				toast.success("Record deleted successfully", {
					position: "top-center",
				});
				return;
			}
			const error = response.error;
			toast.error(`Error ${extractErrorMessage(error)}`, {
				position: "top-center",
			});
		} catch (e) {
			toast.error("Failed to delete record", {
				position: "top-center",
			});
		}
	};

	const renderView = () => {
		if (isError) {
			return (
				<ErrorStateView
					message={extractErrorMessage(error)}
					title={extractErrorStatus(error).toString()}
				/>
			);
		}

		if (isLoading) {
			return <LoadingStateView message="Loading production records..." />;
		}

		if (isSuccess && data !== undefined) {
			return <LivestockTable data={data} confirmDelete={confirmDelete} />;
		}

		return (
			<ErrorStateView message={extractErrorMessage(error)} title="Error: 500" />
		);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<PageHeader title="Livestock">
				<Link
					href="/livestock/new"
					className="flex items-center gap-2 text-white bg-blue-500 dark:bg-blue-600 hover:opacity-80 px-4 py-2 rounded-lg"
				>
					<Plus className="w-5 h-5 font-bold" size={16} />
					Add new
				</Link>
			</PageHeader>
			{renderView()}
		</div>
	);
}
