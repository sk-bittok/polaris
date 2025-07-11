import type { WeightRecordResponse } from "@/lib/models/records";
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
import type { NewWeightRecord } from "@/lib/schemas/records";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNewWeightRecordMutation } from "@/state/api";
import { Weight } from "lucide-react";
import TabHeader from "./tab-header";
import { WeightRecordDialogue } from "../modals";

interface TableProps {
	data: WeightRecordResponse[];
	onSort?: (field: string) => void;
	sortField?: string;
	sortDirection?: string;
}

type Props = {
	data?: WeightRecordResponse[];
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	error?: FetchBaseQueryError | SerializedError;
	className?: string;
};

function WeightRecordsTable({
	data,
	onSort,
	sortField,
	sortDirection,
}: TableProps) {
	const columns: ColumnTable<WeightRecordResponse>[] = [
		{
			key: "animalName",
			header: "Name",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "mass",
			header: "Weight",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "previousMass",
			header: "Previous Weight",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "unit",
			header: "Weight Unit",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "status",
			header: "Livestock Status",
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
			emptyMessage="No weight records added yet."
			caption="A history of your livestock weight gain"
		/>
	);
}

const SORT_DIRECTION = {
	Ascending: "asc",
	Descending: "desc",
};

const SORTABLE_FIELDS = {
	RecordType: "status",
	Unit: "unit",
	Mass: "mass",
	PreviousMass: "previousMass",
	RecordDate: "recordDate",
	CreatedBy: "createdByName",
	Name: "animalName",
};

export default function WeightTab({
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
	const [addWeightRecord] = useNewWeightRecordMutation();

	const onClose = () => {
		setModalOpen(false);
	};

	const onSubmit = async (data: NewWeightRecord) => {
		data.recordDate = format(data.recordDate, "yyyy-MM-dd");
		data.mass = Number.parseInt(`${data.mass}00`);
		try {
			const response = await addWeightRecord(data);

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
						record.mass,
						record.createdByName,
						record.recordDate,
						record.previousMass,
						record.unit,
						record.status,
					].filter(Boolean);
					if (
						!searchableFields.some((field) =>
							field.toString().toLowerCase().includes(query),
						)
					) {
						return false;
					}
				}

				// Filter
				return !filterType || record.status === filterType;
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
				if (sortField === "mass" || sortField === "previousMass") {
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
		const types = [...new Set(data.map((record) => record.status))];
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
			return <LoadingStateView message="Weight records loading..." />;
		}

		if (data && data !== undefined) {
			return (
				<WeightRecordsTable
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
			<TabHeader icon={Weight} title="Weight Records">
				<WeightRecordDialogue
					isOpen={isModalOpen}
					onClose={onClose}
					onCreate={onSubmit}
				>
					<HeaderButton
						onClick={() => setModalOpen(true)}
						label="Add Weight Record"
					/>
				</WeightRecordDialogue>
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
