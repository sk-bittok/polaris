import type { RecordData, RecordType } from "@/lib/models/records";
import type React from "react";
import { LoadingStateView } from "../utilities";
import { getHeroConfig } from "./hero-section";
import { getAdditionalDetails, getMetricCards } from "./metric-card";
import { Calendar, Clock, Info, User, Clipboard } from "lucide-react";
import { formatters } from "@/lib/utils";
import BackButton from "./back-button";

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
	const HeroIcon = heroConfig.icon;

	return (
		<div className="max-w-8xl mx-auto p-6">
			{/* Back Button */}
			<BackButton href={backHref}>{backLabel}</BackButton>
			<div className="bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden">
				{/* Hero section */}
				<div
					className={`relative h-64 bg-gradient-to-r ${heroConfig.gradient}`}
				>
					<div className="absolute inset-0 text-9xl flex items-center justify-center opacity-20">
						{heroConfig.emoji}
					</div>
					<div className="absolute inset-0 flex items-end">
						<div className="p-6 text-white">
							<div className="flex items-center mb-2">
								<HeroIcon className="mr-2" size={24} />
								<span className="text-lg font-medium opacity-90">
									{heroConfig.subtitle}
								</span>
							</div>
							<h1 className="text-3xl font-bold mb-2">{heroConfig.title}</h1>
							<div className="flex items-center space-x-4 text-lg">
								<span className="flex items-center">
									<User className="mr-1" size={16} />
									{data.animalName}
								</span>
								<span className="flex items-center">
									<Calendar className="mr-1" size={16} />
									{formatters.date(data.recordDate)}
								</span>
							</div>
						</div>
					</div>
				</div>
				{/* Key metrics card */}
				<div className="p-6">
					<div
						className={`grid grid-cols-1 md:grid-cols-${Math.min(metricCards.length, 3)} gap-4 mb-6`}
					>
						{metricCards.map((card, index) => {
							const CardIcon = card.icon;
							return (
								<div key={index} className={`${card.bgClass} p-4 rounded-lg`}>
									<div className="flex items-center mb-2">
										<CardIcon className={`${card.colorClass} mr-2`} size={20} />
										<h3
											className={`font-semibold ${card.colorClass.replace("text-", "text-").replace("dark:text-", "dark:text-").replace("-400", "-800").replace("dark:text-", "dark:text-").replace("-400", "-200")}`}
										>
											{card.title}
										</h3>
									</div>
									<div className="pl-7">
										<p
											className={`font-medium ${card.colorClass.replace("-400", "-700").replace("dark:text-", "dark:text-").replace("-400", "-300")}`}
										>
											{card.value}
										</p>
									</div>
								</div>
							);
						})}
					</div>
					{/* Additional details */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Animal Information */}
							<div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg">
								<div className="flex items-center mb-4">
									<User
										className="text-gray-600 dark:text-gray-400 mr-2"
										size={20}
									/>
									<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
										Animal Information
									</h2>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Animal Name
										</p>
										<p className="text-lg font-medium text-gray-800 dark:text-gray-200">
											{data.animalName}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Tag ID
										</p>
										<p className="text-lg font-medium text-gray-800 dark:text-gray-200">
											{data.animalTagId}
										</p>
									</div>
								</div>
							</div>
							{/* Record Details */}
							{additionalDetails && (
								<div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg">
									<div className="flex items-center mb-4">
										<additionalDetails.icon
											className="text-gray-600 dark:text-gray-400 mr-2"
											size={20}
										/>
										<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
											{additionalDetails.title}
										</h2>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{additionalDetails.details.map((detail, index) => (
											<div key={index}>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{detail.label}
												</p>
												<p className="text-lg font-medium text-gray-800 dark:text-gray-200">
													{detail.value}
												</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Notes Section */}
							<div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg md:min-w-[640px] md:max-w-[720px]">
								<div className="flex items-center mb-3">
									<Info
										className="text-gray-600 dark:text-gray-400 mr-2"
										size={20}
									/>
									<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
										Notes
									</h2>
								</div>
								{data.notes ? (
									<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
										{data.notes}
									</p>
								) : (
									<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
										<Clipboard
											size={24}
											className="text-gray-400 dark:text-gray-500 mb-2"
										/>
										<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
											No notes have been added yet
										</p>
										<button
											type="button"
											onClick={() => console.log(`/livestock/${data.id}/edit`)}
											className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md mt-2"
										>
											Add notes
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Timeline */}
							<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
								<div className="flex items-center mb-4">
									<Clock
										className="text-gray-600 dark:text-gray-400 mr-2"
										size={20}
									/>
									<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
										Timeline
									</h3>
								</div>
								<div className="space-y-3">
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Record Date
										</p>
										<p className="font-medium text-gray-800 dark:text-gray-200">
											{formatters.date(data.recordDate)}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Created
										</p>
										<p className="font-medium text-gray-800 dark:text-gray-200">
											{formatters.date(data.createdAt)}
										</p>
									</div>
									{data.updatedAt !== data.createdAt && (
										<div>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Last Updated
											</p>
											<p className="font-medium text-gray-800 dark:text-gray-200">
												{formatters.date(data.updatedAt)}
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Creator Info */}
							<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
								<div className="flex items-center mb-4">
									<User
										className="text-gray-600 dark:text-gray-400 mr-2"
										size={20}
									/>
									<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
										Created By
									</h3>
								</div>
								<p className="font-medium text-gray-800 dark:text-gray-200">
									{data.createdByName}
								</p>
							</div>

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
