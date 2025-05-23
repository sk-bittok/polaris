import LoadingSpinner from "@/components/loading-spinner";
import {
	Award,
	FileText,
	Filter,
	HeartPlus,
	Loader2,
	Plus,
	Search,
} from "lucide-react";
import { useState } from "react";

const Header = () => (
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
			<ModalButton>
				<Plus size={16} />
				Add health record
			</ModalButton>
		</div>
	</div>
);

const TabState = ({ children, className }) => (
	<div
		className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${className}`}
	>
		<Header />
		{children}
	</div>
);

const ModalButton = ({ children }) => (
	<button
		className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-lg"
		type="button"
	>
		{children}
	</button>
);

const EmptyState = () => (
	<div className="flex flex-col items-center justify-center h-64">
		<FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
		<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
			No health records found
		</h3>
		<p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
			Start tracking your livestock health by adding your first record.
		</p>
		<ModalButton>
			<Plus size={16} />
			Add First Record
		</ModalButton>
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
					<option>All types</option>
				</select>
			</div>
		</div>
	</div>
);

const HealthTab = ({ className, data, isLoading, isError, error }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState("");
	const [sortField, setSortField] = useState("recordDate");
	const [sortDirection, setSortDirection] = useState("desc");

	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const getUniqueRecordTyes = () => {
		if (!data) return [];

		const types = [new Set(data.map((record) => record.recordType))];

		return types;
	};

	const filterAndSortData = () => {
		if (!data) return [];

		let filtered = [...data];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(record) =>
					record.animalName.toLowerCase().includes(query) ||
					record.recordType.toLowerCase().includes(query) ||
					record.createdByName.toLowerCase().includes(query) ||
					record.perfomedBy.toLowerCase().includes(query),
			);
		}

		return filtered;
	};

	if (!data || data.length === 0) {
		return (
			<TabState className={className}>
				<EmptyState />
			</TabState>
		);
	}

	if (isLoading) {
		return (
			<TabState className={className}>
				<LoadingState />
			</TabState>
		);
	}

	return (
		<TabState className={className}>
			{/* Search and Filter */}
			<FilterAndSearch
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				setFilterType={setFilterType}
				filterType={filterType}
			/>
			{/* Tables*/}
			<div />
		</TabState>
	);
};

export default HealthTab;
