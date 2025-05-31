"use client";

import {
	useDeleteLivestockByIdMutation,
	useGetLivestockByIdQuery,
	useGetLivestockProductionRecordQuery,
	useGetLivestockHealthRecordsQuery,
	useGetLivestockWeightRecordsQuery,
} from "@/state/api";
import { use, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";
import {
	ProductTab,
	HealthTab,
	WeightTab,
	LineageTab,
	TopNavigationBar,
} from "@/components/protected/tabs";
import { useRouter } from "next/navigation";
import { FinanceTab, PhotoTab, OverviewTab } from "../components/tabs";
import { ErrorStateView } from "@/components/protected/utilities";

// Weight history mock data
const weightMockData = [
	{ date: "2024-08-24", weight: 45 },
	{ date: "2024-09-24", weight: 65 },
	{ date: "2024-10-34", weight: 88 },
	{ date: "2024-11-24", weight: 110 },
	{ date: "2024-12-25", weight: 134 },
	{ date: "2025-01-24", weight: 158 },
	{ date: "2025-02-25", weight: 179 },
	{ date: "2025-03-25", weight: 201 },
	{ date: "2025-04-24", weight: 228 },
];

export default function LivestockPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");

	const { isError, isLoading, isSuccess, data, error } =
		useGetLivestockByIdQuery(resolvedParams.id);
	const [deleteLivestock] = useDeleteLivestockByIdMutation();

	const handleDelete = () => {
		setDeleteModalOpen(true);
	};

	const {
		isError: productionIsError,
		isLoading: productionIsLoading,
		data: productionData,
		isSuccess: productionIsSuccess,
		error: productionError,
	} = useGetLivestockProductionRecordQuery(resolvedParams.id, {
		skip: activeTab !== "production",
		refetchOnMountOrArgChange: true,
		pollingInterval: 300000,
	});

	const {
		isError: healthIsError,
		isLoading: healthIsLoading,
		data: healthData,
		error: healthError,
		isSuccess: healthIsSuccess,
	} = useGetLivestockHealthRecordsQuery(resolvedParams.id, {
		skip: activeTab !== "health",
		refetchOnMountOrArgChange: true,
		pollingInterval: 300000,
	});

	const {
		isError: weightIsError,
		isLoading: weightIsLoading,
		isSuccess: weightIsSuccess,
		data: weightData,
		error: weightError,
	} = useGetLivestockWeightRecordsQuery(resolvedParams.id, {
		skip: activeTab !== "weight",
		refetchOnMountOrArgChange: true,
		pollingInterval: 300000,
	});

	const confirmDelete = async () => {
		try {
			const response = await deleteLivestock(resolvedParams.id);
			if (response.error) {
				toast.error(`Failed to delete record ${response.error.message}`);
				return;
			}

			toast.success("Livestock successfully deleted");
			router.push("/livestock");
		} catch (e) {
			toast.error("Failed to delete record");
		}
	};

	if (isError) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="bg-red-50 dark:bg-red-900 p-8 rounded-lg shadow-md text-center">
					{"data" in error ? (
						<ErrorStateView
							title={`Error ${error.status}`}
							message={(error.data as { message: string }).message}
							actionLabel="Return to livestock"
							actionHref="/livestock"
						/>
					) : (
						<ErrorStateView
							title={"status" in error ? error.status : "Unknown Error"}
							message={
								"error" in error ? error.error : "An unexpected error occurred"
							}
							actionLabel="Return to livestock"
							actionHref="/livestock"
						/>
					)}
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<LoadingSpinner>
				<p className="mt-4 text-gray-600 dark:text-gray-400">
					Loading livestock information...
				</p>
			</LoadingSpinner>
		);
	}

	const tabsClassNames = "sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-6xl";

	return (
		<div className="max-w-8xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
			{isSuccess && data && (
				<div className="flex flex-col h-full">
					<TopNavigationBar
						confirmDelete={confirmDelete}
						handleDelete={handleDelete}
						setActiveTab={setActiveTab}
						activeTab={activeTab}
						id={resolvedParams.id}
						data={data}
					/>

					{/* Main sections */}
					<div className="flex-grow p-4 md:p-6">
						{activeTab === "overview" && (
							<OverviewTab
								data={data}
								className={tabsClassNames}
								weightData={weightMockData}
								id={resolvedParams.id}
							/>
						)}

						{activeTab === "health" && (
							<HealthTab
								data={healthData}
								isSuccess={healthIsSuccess}
								isLoading={healthIsLoading}
								isError={healthIsError}
								error={healthError}
								className={tabsClassNames}
							/>
						)}

						{activeTab === "production" && (
							<ProductTab
								className={tabsClassNames}
								data={productionData}
								isLoading={productionIsLoading}
								isError={productionIsError}
								error={productionError}
							/>
						)}

						{activeTab === "weight" && (
							<WeightTab
								data={weightData}
								isLoading={weightIsLoading}
								isError={weightIsError}
								error={weightError}
								isSuccess={weightIsSuccess}
								className={tabsClassNames}
							/>
						)}

						{activeTab === "lineage" && (
							<LineageTab data={data} className={tabsClassNames} />
						)}

						{activeTab === "finances" && (
							<FinanceTab data={data} className={tabsClassNames} />
						)}

						{activeTab === "photos" && <PhotoTab className={tabsClassNames} />}
					</div>
				</div>
			)}
		</div>
	);
}
