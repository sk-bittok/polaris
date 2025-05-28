"use client";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetLivestockWeightRecordsQuery } from "@/state/api";
import { formatDisplayDate, extractErrorMessage } from "@/lib/utils";
import { Eye, Pencil, Trash, Plus } from "lucide-react";
import {
	LoadingStateView,
	EmptyStateView,
	ErrorStateView,
} from "@/components/protected/utilities";
import type { WeightRecordResponse } from "@/lib/models/records";
import { WeightRecordDialogue } from "@/components/protected/modals";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { NewWeightRecord } from "@/lib/schemas/records";

function WeightRecordsTable({ data }: { data: WeightRecordResponse[] }) {
	return (
		<Table>
			<TableCaption>A list of all your weight records</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Tag ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Weight (KG)</TableHead>
					<TableHead>Record Date</TableHead>
					<TableHead>Created By</TableHead>
					<TableHead>Created At</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((record) => (
					<TableRow key={record.id}>
						<TableCell>{record.animalTagId}</TableCell>
						<TableCell>{record.animalName}</TableCell>
						<TableCell>{record.mass}</TableCell>
						<TableCell>{formatDisplayDate(record.recordDate)}</TableCell>
						<TableCell>{record.createdByName}</TableCell>
						<TableCell>{formatDisplayDate(record.createdAt)}</TableCell>
						<TableCell className="flex items-center justify-start gap-2">
							<button
								type="button"
								className="bg-green-500 dark:bg-green-600 px-3 py-1.5 text-white text-sm rounded-sm hover:opacity-80"
							>
								<Pencil size={16} />
							</button>
							<button
								type="button"
								className="bg-blue-500 dark:bg-blue-600 px-3 py-1.5 text-white text-sm rounded-sm hover:opacity-80"
							>
								<Eye size={16} />
							</button>
							<button
								type="button"
								className="bg-red-500 dark:bg-red-600 px-3 py-1.5 text-white text-sm rounded-sm hover:opacity-80"
							>
								<Trash size={16} />
							</button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
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

	const handleSubmit = (data: NewWeightRecord) => {
		console.table(data);
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
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Weight Records</h1>
				<WeightRecordDialogue
					isOpen={isModalOpen}
					onClose={() => setModalOpen(false)}
					onCreate={handleSubmit}
				>
					<Button
						type="button"
						className="text-white"
						onClick={() => setModalOpen(true)}
					>
						Add new
					</Button>
				</WeightRecordDialogue>
			</div>
			<div>{renderContent()}</div>
		</div>
	);
}
