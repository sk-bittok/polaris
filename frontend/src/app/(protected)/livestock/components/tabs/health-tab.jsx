import { useNewLivestockHealthRecordMutation } from "@/state/api";
import { format } from "date-fns";
import {
	AlertCircle,
	ChevronDown,
	ChevronUp,
	FileText,
	Filter,
	HeartPlus,
	Loader2,
	Plus,
	RefreshCw,
	Search,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import HealthRecordDialog from "../health-modal";

const Header = ({ onClick, isOpen, onClose, onCreate }) => (
	<div className="flex items-center justify-between mb-4">
		<div>
			<h3 className="flex items-center text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
				<HeartPlus
					size={32}
					className="text-gray-300 dark:text-gray-700 mr-2"
				/>
				Health Records
			</h3>
		</div>
		<div>
			<HealthRecordDialog
				isOpen={isOpen}
				onClose={onClose}
				onCreate={onCreate}
			>
				<ModalButton onClick={onClick}>
					<Plus size={16} />
					Add health record
				</ModalButton>
			</HealthRecordDialog>
		</div>
	</div>
);

const TabState = ({
	children,
	className,
	onClick,
	isOpen,
	onClose,
	onCreate,
	
}) => (
	<div
		className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${className}`}
	>
		<Header
			onClick={onClick}
			isOpen={isOpen}
			onCreate={onCreate}
			onClose={onClose}
		/>
		{children}
	</div>
);

const ModalButton = ({ children, onClick }) => (
	<button
		className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-lg"
		type="button"
		onClick={onClick}
	>
		{children}
	</button>
);

const EmptyState = ({ onClick, isOpen, onClose, onCreate, }) => (
	<div className="flex flex-col items-center justify-center h-64">
		<FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
		<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
			No health records found
		</h3>
		<p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
			Start tracking your livestock health by adding your first record.
		</p>
		<HealthRecordDialog
			isOpen={isOpen}
			onClose={onClose}
			onCreate={onCreate}
		>
			<ModalButton onClick={onClick}>
				<Plus size={16} />
				Add First Record
			</ModalButton>
		</HealthRecordDialog>
	</div>
);

const ErrorState = ({ message }) => (
	<div className="flex flex-col items-center justify-center h-64">
		<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
		<h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
			Failed to load health records...
		</h3>
		<p className="text-gray-500 text-center mb-4 dark:text-gray-400">
			{message}
		</p>
		<button
			type="button"
			className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
		>
			<RefreshCw size={16} />
			Retry
		</button>
	</div>
);

const LoadingState = () => (
	<div className="flex flex-col items-center justify-center h-64">
		<Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
		<p className="text-gray-500 dark:text-gray-400 mt-4">
			Loading health records..
		</p>
	</div>
);

const FilterAndSearch = ({
	searchQuery,
	setSearchQuery,
	filterType,
	setFilterType,
	recordTypes,
}) => (
	<div className="flex items-center justify-between mb-6">
		{/* Search */}
		<div className="relative w-64">
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				<Search className="w-4 h-4 text-gray-400 dark:text-gray-600" />
			</div>
			<input
				type="search"
				name="search"
				value={searchQuery}
				placeholder="Search health records..."
				onChange={(e) => setSearchQuery(e.target.value)}
				className="bg-gray-50 dark:bg-gray-700 w-full p-2.5 pl-10 border block rounded-lg text-gray-900 dark:text-white text-sm focus:ring-blue-500 dark:focus:ring-blue-600 outline-none focus:ring-2 border-gray-300 dark:border-gray-600 dark:placeholder:gray-600"
			/>
		</div>
		{/* Filter */}
		<div className="relative">
			<div className="flex items-center gap-2">
				<Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
				<select
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}
					className="bg-gray-50 dark:bg-gray-700 w-full border border-gray-300 dark:border-gray-600 block rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
				>
					<option value="all">All types</option>
					{recordTypes.map((type) => (
						<option className="capitalize" key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>
		</div>
	</div>
);

const EmptyFilteredData = () => (
	<div className="flex flex-col items-center justify-center h-64">
		<FileText className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
		<h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
			No matching records
		</h3>
		<p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
			Try adjusting your search or filter criteria{" "}
		</p>
	</div>
);

const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return date.toLocaleDateString();
};

const SORT_FIELDS = {
	ANIMAL_NAME: "animalName",
	RECORD_TYPE: "recordType",
	RECORD_DATE: "recordDate",
	TREATMENT: "treatment",
};

const SORT_DIRECTIONS = {
	ASC: "asc",
	DESC: "desc",
};

const HealthTab = ({  className, data, isLoading, isError, error }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState("");
	const [sortField, setSortField] = useState(SORT_FIELDS.RECORD_DATE);
	const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.DESC);
	const [isModalOpen, setModalOpen] = useState(false);

	const [newHealthRecord] = useNewLivestockHealthRecordMutation();

	const handleClick = () => {
		setModalOpen(true);
	};

	const handleClose = () => {
		setModalOpen(false);
	};

	const handleSubmit = async (data) => {
		data.recordDate =
			data.recordDate === null || data.recordDate === undefined
				? null
				: format(new Date(data.recordDate), "yyyy-MM-dd");
		try {
			const response = await newHealthRecord(data);
			if (response.data) {
				toast.success(`Health record ${response.data.id} added successfully`);
				return;
			}

			const error = response.error;

			if ("status" in error) {
				toast.error(`Error ${error.data.message}`);
				return;
			}
			toast.error("Internal server error");
		} catch (e) {
			toast.error("Internal server error!");
		}
	};

	const handleSort = useCallback(
		(field) => {
			setSortDirection((prev) =>
				sortField === field && prev === "asc" ? "desc" : "asc",
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
						record.perfomedBy,
						record.treatment,
					].filter(Boolean);
					if (
						!searchableFields.some((field) =>
							field.toLowerCase().includes(query),
						)
					) {
						return false;
					}
				}

				// Type filter
				return !filterType || record.recordType === filterType;
			})
			.sort((a, b) => {
				let aValue = a[sortField];
				let bValue = b[sortField];
				// Date comparisons
				if (
					sortField === "recordDate" ||
					sortField === "createdAt" ||
					sortField === "updatedAt"
				) {
					aValue = aValue ? new Date(aValue).getTime() : 0;
					bValue = bValue ? new Date(bValue) : 0;
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

	const sortWithDirections = (field, direction) => {
		if (sortField === field) {
			setSortDirection(direction);
		} else {
			setSortField(field);
			setSortDirection(direction);
		}
	};

	const getUniqueRecordTypes = () => {
		if (!data) return [];
		const types = [...new Set(data.map((record) => record.recordType))];
		return types;
	};

	if (isError) {
		return (
			<TabState
				className={className}
				onClick={handleClick}
				isOpen={isModalOpen}
				onClose={handleClose}
				onCreate={handleSubmit}
			>
				<ErrorState
					message={
						error?.message || "An unexpected error occurred. Please try again"
					}
				/>
			</TabState>
		);
	}

	if (!data || data.length === 0) {
		return (
			<TabState
				className={className}
				onClick={handleClick}
				isOpen={isModalOpen}
				onClose={handleClose}
				onCreate={handleSubmit}
			>
				<EmptyState
					onClick={handleClick}
					isOpen={isModalOpen}
					onClose={handleClose}
					onCreate={handleSubmit}
				/>
			</TabState>
		);
	}

	if (isLoading) {
		return (
			<TabState
				className={className}
				isOpen={isModalOpen}
				onClick={handleClick}
				onClose={handleClose}
				onCreate={handleSubmit}
			>
				<LoadingState />
			</TabState>
		);
	}

	const uniqueRecordTypes = getUniqueRecordTypes();

	const thClassName =
		"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
	const tdClassName = "px-6 py-4 whitespace-nowrap text-sm";
	const tdTextClassName = "text-gray-500 dark:text-gray-400";
	const chevronClassName = "h-4 w-4 ml-1";
	return (
		<TabState
			className={className}
			onClick={handleClick}
			isOpen={isModalOpen}
			onClose={handleClose}
			onCreate={handleSubmit}
		>
			{/* Search and Filter */}
			<FilterAndSearch
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				setFilterType={setFilterType}
				filterType={filterType}
				recordTypes={uniqueRecordTypes}
			/>
			{/* Tables*/}
			{filteredData.length === 0 ? (
				<EmptyFilteredData />
			) : (
				<div className="overflow-y-auto rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th
									className={`${thClassName} cursor-pointer`}
									onClick={() => handleSort("animalName")}
									onKeyUp={() => sortWithDirections("animalName", "asc")}
									onKeyDown={() => sortWithDirections("animalName", "desc")}
								>
									<div className="flex items-center">
										Name
										{sortField === "animalName" && sortDirection === "asc" ? (
											<ChevronUp className={chevronClassName} />
										) : (
											<ChevronDown className={chevronClassName} />
										)}
									</div>
								</th>
								<th
									className={`${thClassName} cursor-pointer`}
									onClick={() => handleSort("recordType")}
									onKeyUp={() => sortWithDirections("recordType", "asc")}
									onKeyDown={() => sortWithDirections("recordType", "desc")}
								>
									<div className="flex items-center">
										Type
										{sortField === "recordType" && sortDirection === "asc" ? (
											<ChevronUp className={chevronClassName} />
										) : (
											<ChevronDown className={chevronClassName} />
										)}
									</div>
								</th>
								<th
									className={`${thClassName} cursor-pointer`}
									onClick={() => handleSort("recordDate")}
									onKeyUp={() => sortWithDirections("recordDate", "asc")}
									onKeyDown={() => sortWithDirections("recordDate", "desc")}
								>
									<div className="flex items-center">
										Date
										{sortField === "recordType" && sortDirection === "asc" ? (
											<ChevronUp className={chevronClassName} />
										) : (
											<ChevronDown className={chevronClassName} />
										)}
									</div>
								</th>
								<th
									className={thClassName}
									onClick={() => handleSort(SORT_FIELDS.TREATMENT)}
								>
									<div className="flex items-center">
										Treatment
										{sortField === SORT_FIELDS.TREATMENT &&
										sortDirection === SORT_DIRECTIONS.ASC ? (
											<ChevronUp className={chevronClassName} />
										) : (
											<ChevronDown className={chevronClassName} />
										)}
									</div>
								</th>
								<th className={thClassName}>Description</th>
								<th className={thClassName}>Created By</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
							{filteredData.map((record) => (
								<tr
									key={record.id}
									className="hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<td
										className={`${tdClassName} font-medium dark:text-white text-gray-900`}
									>
										{record.animalName}
									</td>
									<td className={`${tdClassName} ${tdTextClassName}`}>
										{record.recordType}
									</td>
									<td className={`${tdClassName} ${tdTextClassName}`}>
										{formatDate(record.recordDate)}
									</td>
									<td
										className={`${tdClassName} ${tdTextClassName} capitalize`}
									>
										{record.treatment}
									</td>
									<td className={`${tdClassName} ${tdTextClassName}`}>
										{record.description}
									</td>
									<td className={`${tdClassName} ${tdTextClassName}`}>
										{record.createdByName}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			<div />
		</TabState>
	);
};

export default HealthTab;
