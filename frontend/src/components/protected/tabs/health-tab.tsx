import type { HealthRecordResponse } from "@/lib/models/records";
import {
	ActionButtons,
	type ColumnTable,
	ErrorStateView,
	HeaderButton,
	LoadingStateView,
	RecordsTable,
	SearchAndFilter,
} from "../utilities";
import { extractErrorMessage, formatDisplayDate } from "@/lib/utils";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useCallback, useMemo, useState } from "react";
import type { NewHealthRecord } from "@/lib/schemas/records";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNewLivestockHealthRecordMutation } from "@/state/api";
import { HeartPulse } from "lucide-react";
import TabHeader from "./tab-header";
import HealthRecordDialogue from "../modals/health-dialogue";

interface TableProps {
	data: HealthRecordResponse[];
	onSort?: (field: string) => void;
	sortField?: string;
	sortDirection?: string;
}

type Props = {
	data?: HealthRecordResponse[];
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	error?: FetchBaseQueryError | SerializedError;
	className?: string;
};

function HealthRecordsTable({
	data,
	onSort,
	sortField,
	sortDirection,
}: TableProps) {
	const columns: ColumnTable<HealthRecordResponse>[] = [
		{
			key: "animalName",
			header: "Name",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "recordType",
			header: "Type",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "recordDate",
			header: "Date",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
			render: (record) => formatDisplayDate(record.recordDate),
		},
		{
			key: "treatment",
			header: "Treatment",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "createdByName",
			header: "Created By",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
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
			data={data}
			columns={columns}
			keyExtractor={(record) => record.id}
			emptyMessage="No health records added yet."
			caption="A history of your livestock health"
		/>
	);
}

const SORT_DIRECTION = {
	Ascending: "asc",
	Descending: "desc",
};

const SORTABLE_FIELDS = {
	RecordType: "recordType",
	RecordDate: "recordDate",
	Treatment: "treatment",
	CreatedBy: "createdByName",
	Name: "name",
};

export default function HealthTab({
	data,
	error,
	isSuccess,
	isError,
	isLoading,
	className,
}: Props) {
	const [sortField, setSortField] = useState(SORTABLE_FIELDS.RecordDate);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState("");
	const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.Descending);
	const [isModalOpen, setModalOpen] = useState(false);
	const [addHealthRecord] = useNewLivestockHealthRecordMutation();

	const onClose = () => {
		setModalOpen(false);
	};

	const onSubmit = async (data: NewHealthRecord) => {
		data.recordDate = format(data.recordDate, "yyyy-MM-dd");
		data.cost = Number.parseInt(`${data.cost}00`);
		try {
			const response = await addHealthRecord(data);

			if (response.data) {
				toast.success("Record added successfully", {
					position: "top-center",
				});
				return;
			}
			toast.error("Failed to add record", {
				position: "top-center",
			});
		} catch (e) {
			toast.error("Something went wrong on our end we apologise", {
				position: "top-center",
			});
		}
	};

	const handleSort = useCallback(
		(field) => {
			setSortDirection((prev) =>
				sortField === field && prev === SORT_DIRECTION.Ascending
					? SORT_DIRECTION.Descending
					: SORT_DIRECTION.Ascending,
			);
			setSortField(field);
		},
		[sortField],
	);

	const filteredData = useMemo(() => {
		if (!data) return [];

		return data
			.filter((record) => {
				// Search filter
				if (searchQuery) {
					const query = searchQuery.toLowerCase();
					const searchableFields = [
						record.animalName,
						record.recordType,
						record.createdByName,
						record.treatment,
						record.cost,
					].filter(Boolean);
					if (
						!searchableFields.some((field) =>
							field.toLowerCase().includes(query),
						)
					) {
						return false;
					}
				}

				// Filter
				return !filterType || record.recordType === filterType;
			})
			.sort((a, b) => {
				let aValue = a[sortField];
				let bValue = b[sortField];
				// Date comparisons
				if (
					sortField === "recordDate" ||
					sortField === "updatedAt" ||
					sortField === "createdAt"
				) {
					aValue = aValue ? new Date(aValue).getTime() : 0;
					bValue = bValue ? new Date(bValue).getTime() : 0;
				}
				// Numeric comparisons
				if (sortField === "cost") {
					aValue = Number.parseFloat(aValue) || 0;
					bValue = Number.parseFloat(bValue) || 0;
				}
				if (sortDirection === "asc") {
					return aValue > bValue ? 1 : -1;
				}
				return aValue < bValue ? 1 : -1;
			});
	}, [data, searchQuery, filterType, sortField, sortDirection]);

	const getUniqueRecordTypes = () => {
		if (!data) return [];
		const types = [...new Set(data.map((record) => record.recordType))];
		return types;
	};

	const uniqueRecordTypes = getUniqueRecordTypes();

	const renderView = () => {
		if (isError) {
			return (
				<ErrorStateView
					message={extractErrorMessage(error)}
					title={"Error 500"}
				/>
			);
		}

		if (isLoading) {
			return <LoadingStateView message="Health records loading..." />;
		}

		if (data && data !== undefined) {
			return (
				<HealthRecordsTable
					data={filteredData}
					onSort={handleSort}
					sortDirection={sortDirection}
					sortField={sortField}
				/>
			);
		}

		return <ErrorStateView message="Internal sever error" title="Error 500" />;
	};

	return (
		<div
			className={`bg-white dark:bg-gray-800 min-h-96 shadow-sm rounded-xl p-6 ${className}`}
		>
			<TabHeader icon={HeartPulse} title="Health Records">
				<HealthRecordDialogue
					isOpen={isModalOpen}
					onClose={onClose}
					onCreate={onSubmit}
				>
					<HeaderButton
						onClick={() => setModalOpen(true)}
						label="Add Health Record"
					/>
				</HealthRecordDialogue>
			</TabHeader>
			<SearchAndFilter
				searchQuery={searchQuery}
				filterType={filterType}
				filterTargets={uniqueRecordTypes}
				onSearch={setSearchQuery}
				onFilter={setFilterType}
			/>
			{renderView()}
		</div>
	);
}
