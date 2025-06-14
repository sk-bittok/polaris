import type { RecordData, RecordType } from "@/lib/models/records";
import type React from "react";
import { LoadingStateView } from "../utilities";
import HeroCard, { getHeroConfig } from "./hero-section";
import MetricCard, { getMetricCards } from "./metric-card";
import BackButton from "./back-button";
import CreatorInfo from "./creator-info";
import RecordTimeline from "./record-timeline";
import NotesCard from "./notes-card";
import {
	AdditionalDetailsCard,
	getAdditionalDetails,
	LivestockCard,
} from "./livestock-card";

interface Props {
	data: RecordData;
	recordType: RecordType;
	backHref: string;
	backLabel: string;
	isLoading?: boolean;
	loadingMessage: string;
}

const UniversalRecordPage: React.FC<Props> = ({
	data,
	recordType,
	backHref,
	backLabel,
	isLoading,
	loadingMessage = "Loading ...",
}) => {
	if (isLoading) {
		return <LoadingStateView message={loadingMessage} />;
	}

	const heroConfig = getHeroConfig(data, recordType);
	const metricCards = getMetricCards(data, recordType);
	const additionalDetails = getAdditionalDetails(data, recordType);

	return (
		<div className="max-w-8xl mx-auto p-6">
			{/* Back Button */}
			<BackButton href={backHref}>{backLabel}</BackButton>
			<div className="bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden">
				{/* Hero section */}
				<HeroCard data={data} heroConfig={heroConfig} />
				{/* Key metrics card */}
				<div className="p-6">
					<MetricCard cards={metricCards} />
					{/* Additional details */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Animal Information */}
							<LivestockCard data={data} />
							{/* Record Details */}
							{additionalDetails && (
								<AdditionalDetailsCard data={additionalDetails} />
							)}

							{/* Notes Section */}
							<NotesCard notes={data.notes} id={data.id} />
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Timeline */}
							<RecordTimeline
								createdAt={data.createdAt}
								recordDate={data.recordDate}
								updatedAt={data.updatedAt}
							/>

							{/* Creator Info */}
							<CreatorInfo createdByName={data.createdByName} />

							{/* Quick Stats */}
							<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
									Quick Stats
								</h3>
								<div className="space-y-3">
									{metricCards.slice(0, 3).map((card, index) => (
										<div
											key={index}
											className="flex justify-between items-center"
										>
											<span className="text-gray-600 dark:text-gray-400">
												{card.title}
											</span>
											<span
												className={`font-medium ${card.colorClass.replace("-400", "-600").replace("dark:text-", "dark:text-").replace("-400", "-500")}`}
											>
												{card.value}
											</span>
										</div>
									))}
									<div className="flex justify-between items-center">
										<span className="text-gray-600 dark:text-gray-400">
											Record ID
										</span>
										<span className="font-medium text-gray-800 dark:text-gray-200">
											#{data.id}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UniversalRecordPage;
