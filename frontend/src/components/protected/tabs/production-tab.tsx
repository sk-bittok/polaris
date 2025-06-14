import type { NewProductRecord } from "@/lib/schemas/records";
import { useNewProductionRecordMutation } from "@/state/api";
import { format } from "date-fns";
import { Award } from "lucide-react";
import type React from "react";
import { useCallback, useState, useMemo } from "react";
import { toast } from "sonner";
import { ProductRecordDialogue } from "../modals";
import { type ColumnTable, HeaderButton, SearchAndFilter } from "../utilities";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ProductionRecordResponse } from "@/lib/models/records";
import { extractErrorMessage, formatDisplayDate } from "@/lib/utils";
import {
	RecordsTable,
	ActionButtons,
	ErrorStateView,
	LoadingStateView,
} from "@/components/protected/utilities";
import TabHeader from "./tab-header";

type Props = {
	isLoading: boolean;
	data?: ProductionRecordResponse[];
	isError: boolean;
	error?: FetchBaseQueryError | SerializedError;
	className?: string;
};

const SORT_DIRECTION = {
	Descending: "desc",
	Ascending: "asc",
};

const SORTABLE_FIELDS = {
	RecordDate: "recordDate",
	AnimalName: "animalName",
	ProductType: "productType",
	CreatedBy: "createdByName",
};

function ProductionRecordsTable({
	data,
	onSort,
	sortField,
	sortDirection,
}: {
	data: ProductionRecordResponse[];
	onSort?: (field: string) => void;
	sortField?: string;
	sortDirection?: string;
}) {
	const columns: ColumnTable<ProductionRecordResponse>[] = [
		{ key: "animalName", header: "Name" },
		{
			key: "productType",
			header: "Type",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "unit",
			header: "Unit",
			sortable: true,
			onSort,
			sortField,
			sortDirection,
		},
		{
			key: "quantity",
			header: "Quantity",
			sortable: true,
			onSort,
			sortDirection,
			sortField,
		},
		{ key: "quality", header: "Quality" },
		{
			key: "recordDate",
			header: "Record Date",
			sortable: true,
			onSort,
			sortDirection,
			sortField,
			render: (record) => formatDisplayDate(record.recordDate),
		},
		{
			key: "createdByName",
			header: "Created By",
			sortable: true,
			sortField,
			onSort,
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
			caption="A list of products produced by your livestock"
			columns={columns}
			data={data}
			keyExtractor={(record) => record.id}
			emptyMessage="No production records found"
		/>
	);
}

export default function ProductTab({
	isLoading,
	isError,
	data,
	error,
	className,
}: Props) {
	const [sortField, setSortField] = useState(SORTABLE_FIELDS.RecordDate);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState("");
	const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.Descending);
	const [isModalOpen, setModalOpen] = useState(false);
	const [addProductRecord] = useNewProductionRecordMutation();

	const onClose = () => {
		setModalOpen(false);
	};

	const onSubmit = async (data: NewProductRecord) => {
		data.recordDate = format(data.recordDate, "yyyy-MM-dd");
		data.quantity = Number.parseInt(`${data.quantity}00`);
		try {
			const response = await addProductRecord(data);

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
						record.productType,
						record.createdByName,
						record.unit,
						record.quantity,
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
				return !filterType || record.productType === filterType;
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
				if (sortField === "quantity") {
					aValue = Number.parseFloat(aValue) || 0;
					bValue = Number.parseFloat(bValue) || 0;
				}
				if (sortDirection === "asc") {
					return aValue > bValue ? 1 : -1;
				}
				return aValue < bValue ? 1 : -1;
			});
	}, [data, searchQuery, filterType, sortField, sortDirection]);

	const getUniqueProductTypes = () => {
		if (!data) return [];
		const types = [...new Set(data.map((record) => record.productType))];
		return types;
	};

	const uniqueProductTypes = getUniqueProductTypes();

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
			return <LoadingStateView message="Product records loading..." />;
		}

		if (data && data !== undefined) {
			return (
				<ProductionRecordsTable
					data={filteredData}
					onSort={handleSort}
					sortDirection={sortDirection}
					sortField={sortField}
				/>
			);
		}
	};

	return (
		<div
			className={`bg-white rounded-xl shadow-sm p-6 min-h-96 dark:bg-gray-800 ${className}`}
		>
			<TabHeader icon={Award} title="Production Records">
				<ProductRecordDialogue
					isOpen={isModalOpen}
					onClose={onClose}
					onCreate={onSubmit}
				>
					<HeaderButton
						onClick={() => setModalOpen(true)}
						label="Add Production Record"
					/>
				</ProductRecordDialogue>
			</TabHeader>
			<SearchAndFilter
				searchQuery={searchQuery}
				filterType={filterType}
				filterTargets={uniqueProductTypes}
				onSearch={setSearchQuery}
				onFilter={setFilterType}
			/>
			{renderView()}
		</div>
	);
}
