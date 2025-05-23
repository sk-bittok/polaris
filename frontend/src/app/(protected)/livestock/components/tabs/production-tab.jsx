import { useNewLivestockProductionRecordMutation } from "@/state/api";
import { format } from "date-fns";
import {
	AlertCircle,
	Award,
	ChevronDown,
	ChevronUp,
	FileText,
	Filter,
	Loader2,
	Plus,
	RefreshCw,
	Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProductDialog from "../production-modals";

const ModalButton = ({ handleClick, children }) => (
	<button
		type="button"
		onClick={handleClick}
		className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
	>
		{children}
	</button>
);

const ProductionTab = ({
	activeTab,
	productionData,
	productionIsLoading,
	productionIsError,
	productionError,
	className,
}) => {
	const [sortField, setSortField] = useState("recordDate");
	const [sortDirection, setSortDirection] = useState("desc");
	const [filterType, setFilterType] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setModalOpen] = useState(false);

	const [addProductionRecord] = useNewLivestockProductionRecordMutation();

	const handleSubmit = async (data) => {
		data.quantity = Number.parseInt(`${data.quantity}00`);
		data.recordDate =
			data.recordDate !== null && data.recordDate !== undefined
				? format(data.recordDate, "yyyy-MM-dd")
				: null;

		try {
			const response = await addProductionRecord(data);

			if (response.data) {
				// Close the modal
				toast.success(`Record ${response.data.id} added successfully`);
				setModalOpen(false);
				return;
			}

			if (response.error) {
				// Handle the error;
				if (response.error.data) {
					toast.error(`Error ${response.error.data}`);
					return;
				}
				toast.error(`Error ${response.error}`);
				return;
			}
		} catch (e) {
			console.error(e);
			toast.error(`Error ${e}`);
		}
	};

	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleClick = () => {
		setModalOpen(true);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const getFilteredAndSortedData = () => {
		if (!productionData) return [];

		let filtered = [...productionData];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(record) =>
					record.livestockName.toLowerCase().includes(query) ||
					record.productType.toLowerCase().includes(query) ||
					record.createdByName.toLowerCase().includes(query),
			);
		}

		if (filterType) {
			filtered = filtered.filter((record) => record.productType === filterType);
		}
		filtered.sort((a, b) => {
			let aValue = a[sortField];
			let bValue = b[sortField];

			// Handle date comparisons
			if (
				sortField === "recordDate" ||
				sortField === "createdAt" ||
				sortField === "updatedAt"
			) {
				aValue = aValue ? new Date(aValue).getTime() : 0;
				bValue = bValue ? new Date(bValue).getTime() : 0;
			}

			// Handle numeric comparisons
			if (sortField === "quantity") {
				aValue = Number.parseFloat(aValue) || 0;
				bValue = Number.parseFloat(bValue) || 0;
			}

			if (sortDirection === "asc") {
				return aValue > bValue ? 1 : -1;
			}
			return aValue < bValue ? 1 : -1;
		});

		return filtered;
	};

	// Get unique product types for filter
	const getUniqueProductTypes = () => {
		if (!productionData) return [];
		const types = [
			...new Set(productionData.map((record) => record.productType)),
		];
		return types;
	};

	// Tab class name
	const classNames = `bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${className}`;

	// Render loading state
	if (productionIsLoading) {
		return (
			<div className={classNames}>
				<div className="flex flex-col items-center justify-center h-64">
					<Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
					<p className="text-gray-500 dark:text-gray-400">
						Loading production records...
					</p>
				</div>
			</div>
		);
	}

	// Render error state
	if (productionIsError) {
		return (
			<div className={classNames}>
				<div className="flex flex-col items-center justify-center h-64">
					<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
					<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
						Failed to load production records
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
						{productionError?.message ||
							"An unexpected error occurred. Please try again."}
					</p>
					<button
						type="button"
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
					>
						<RefreshCw size={16} />
						Retry
					</button>
				</div>
			</div>
		);
	}

	// Render empty state
	if (!productionData || productionData.length === 0) {
		return (
			<div className={classNames}>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="flex items-center text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
							<Award
								size={32}
								className="text-gray-300 dark:text-gray-600 mr-2"
							/>
							Production Records
						</h3>
					</div>
					<div>
						<ProductDialog
							isOpen={isModalOpen}
							onCreate={handleSubmit}
							onClose={() => setModalOpen(false)}
						>
							<ModalButton handleClick={handleClick}>
								<Plus size={16} />
								Add Production Record
							</ModalButton>
						</ProductDialog>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center h-64">
					<FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
						No production records found
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
						Start tracking your livestock production by adding your first
						record.
					</p>
					<ProductDialog
						isOpen={isModalOpen}
						onCreate={handleSubmit}
						onClose={() => setModalOpen(false)}
					>
						<ModalButton handleClick={handleClick}>
							<Plus size={16} />
							Add First Record
						</ModalButton>
					</ProductDialog>
				</div>
			</div>
		);
	}

	// Render data table with records
	const filteredData = getFilteredAndSortedData();
	const uniqueProductTypes = getUniqueProductTypes();

	return (
		<div className={classNames}>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="flex items-center text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
						<Award
							size={32}
							className="text-gray-300 dark:text-gray-600 mr-2"
						/>
						Production Records
					</h3>
				</div>
				<div>
					<ProductDialog
						isOpen={isModalOpen}
						onCreate={handleSubmit}
						onClose={() => setModalOpen(false)}
					>
						<ModalButton handleClick={handleClick}>
							<Plus size={16} />
							Add Production Record
						</ModalButton>
					</ProductDialog>
				</div>
			</div>

			<div className="flex items-center justify-between mb-6">
				<div className="relative w-64">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<Search className="h-4 w-4 text-gray-400" />
					</div>
					<input
						type="text"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
						placeholder="Search records..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="relative">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-gray-400" />
						<select
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							value={filterType}
							onChange={(e) => setFilterType(e.target.value)}
						>
							<option value="">All Types</option>
							{uniqueProductTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{filteredData.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-64">
					<FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
						No matching records
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
						Try adjusting your search or filter criteria.
					</p>
				</div>
			) : (
				<div className="overflow-y-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
									onClick={() => handleSort("livestockName")}
								>
									<div className="flex items-center">
										Name
										{sortField === "livestockName" &&
											(sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4 ml-1" />
											) : (
												<ChevronDown className="h-4 w-4 ml-1" />
											))}
									</div>
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
									onClick={() => handleSort("productType")}
								>
									<div className="flex items-center">
										Type
										{sortField === "productType" &&
											(sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4 ml-1" />
											) : (
												<ChevronDown className="h-4 w-4 ml-1" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Unit
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
									onClick={() => handleSort("quantity")}
								>
									<div className="flex items-center">
										Quantity
										{sortField === "quantity" &&
											(sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4 ml-1" />
											) : (
												<ChevronDown className="h-4 w-4 ml-1" />
											))}
									</div>
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
									onClick={() => handleSort("recordDate")}
								>
									<div className="flex items-center">
										Date
										{sortField === "recordDate" &&
											(sortDirection === "asc" ? (
												<ChevronUp className="h-4 w-4 ml-1" />
											) : (
												<ChevronDown className="h-4 w-4 ml-1" />
											))}
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Created By
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									Quality
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
							{filteredData.map((record) => (
								<tr
									key={record.id}
									className="hover:bg-gray-50 dark:hover:bg-gray-700"
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										{record.livestockName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
										{record.productType}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
										{record.unit}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
										{record.quantity}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
										{formatDate(record.recordDate)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
										{record.createdByName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
										{record.quality || "N/A"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
				Showing {filteredData.length} of {productionData.length} records
			</div>
		</div>
	);
};

export default ProductionTab;
