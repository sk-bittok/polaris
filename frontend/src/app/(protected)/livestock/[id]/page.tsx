"use client";

import {
	useDeleteLivestockByIdMutation,
	useGetLivestockByIdQuery,
	useGetLivestockProductionRecordQuery,
	useGetLivestockHealthRecordsQuery,
	useGetLivestockWeightRecordsQuery,
	useGetLivestockDescendantsQuery,
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
	OverviewTab,
} from "@/components/protected/tabs";
import { useRouter } from "next/navigation";
import { FinanceTab, PhotoTab } from "../components/tabs";
import { ErrorStateView } from "@/components/protected/utilities";
import { extractErrorMessage, extractErrorStatus } from "@/lib/utils";

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

	const lineageParams =
		data?.gender === "male"
			? `male_parent=${resolvedParams.id}`
			: `female_parent=${resolvedParams.id}`;

	const {
		isError: lineageIsError,
		isLoading: lineageIsLoading,
		data: lineageData,
		isSuccess: lineageSuccess,
		error: lineageError,
	} = useGetLivestockDescendantsQuery(lineageParams, {
		skip: activeTab !== "lineage",
		refetchOnMountOrArgChange: true,
		pollingInterval: 300000,
	});

	const confirmDelete = async () => {
		try {
			const response = await deleteLivestock(resolvedParams.id);
			if (response.error) {
				toast.error(
					`Failed to delete record ${extractErrorMessage(response.error)}`,
				);
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
			<ErrorStateView
				message={extractErrorMessage(error)}
				title={`Error: ${extractErrorStatus(error)}`}
			/>
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
							<LineageTab
								data={data}
								className={tabsClassNames}
								offspring={lineageData}
								isLoading={lineageIsLoading}
								isError={lineageIsError}
								error={lineageError}
							/>
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
