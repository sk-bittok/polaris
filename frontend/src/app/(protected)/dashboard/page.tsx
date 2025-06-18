"use client";

import {
	Activity,
	Beef,
	DollarSign,
	Droplets,
	Heart,
	type LucideIcon,
	Package2,
	Scale,
	TrendingDown,
	TrendingUp,
	Plus,
} from "lucide-react";
import {
	ResponsiveContainer,
	LineChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Line,
	PieChart,
	Cell,
	Pie,
} from "recharts";
import {
	useGetDashboardMetricsQuery,
	useGenerateLivestockSummaryMutation,
} from "@/state/api";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockProductionRecords = [
	{
		id: 1,
		animalName: "Bessie",
		animalTagId: "GVF001",
		productType: "Milk",
		quantity: 25.5,
		unit: "Liters",
		recordDate: "2024-06-10",
		quality: "Grade A",
	},
	{
		id: 2,
		animalName: "Daisy",
		animalTagId: "GVF003",
		productType: "Milk",
		quantity: 18.2,
		unit: "Liters",
		recordDate: "2024-06-10",
		quality: "Grade A",
	},
];

const mockWeightData = [
	{ date: "2024-01", weight: 420 },
	{ date: "2024-02", weight: 430 },
	{ date: "2024-03", weight: 440 },
	{ date: "2024-04", weight: 445 },
	{ date: "2024-05", weight: 450 },
	{ date: "2024-06", weight: 450.5 },
];

// New data for the third column - Recent Health Activities
const recentHealthActivities = [
	{
		id: 1,
		animal: "Bessie",
		activity: "Vaccination",
		status: "active",
		date: "2024-06-12",
		severity: "low",
	},
	{
		id: 2,
		animal: "Monkey Blue",
		activity: "Health Check",
		status: "worsened",
		date: "2024-06-14",
		severity: "high",
	},
	{
		id: 3,
		animal: "Daisy",
		activity: "Weight Check",
		status: "active",
		date: "2024-06-11",
		severity: "low",
	},
	{
		id: 4,
		animal: "Jennifer",
		activity: "Treatment",
		status: "recovering",
		date: "2024-06-10",
		severity: "high",
	},
	{
		id: 5,
		animal: "Geoff",
		activity: "Blood Test",
		status: "worsened",
		date: "2024-06-15",
		severity: "high",
	},
	{
		id: 6,
		animal: "Charlotte",
		activity: "Deworming",
		status: "recovered",
		date: "2024-06-09",
		severity: "medium",
	},
	{
		id: 7,
		animal: "Josephine",
		activity: "Hoof Trim",
		status: "recovering",
		date: "2024-06-16",
		severity: "medium",
	},
	{
		id: 8,
		animal: "Winnie",
		activity: "Pregnancy Check",
		status: "active",
		date: "2024-06-08",
		severity: "low",
	},
];

const productionTrendData = [
	{ date: "2024-01", milk: 500, eggs: 1200 },
	{ date: "2024-02", milk: 520, eggs: 1300 },
	{ date: "2024-03", milk: 550, eggs: 1250 },
	{ date: "2024-04", milk: 580, eggs: 1400 },
	{ date: "2024-05", milk: 600, eggs: 1450 },
	{ date: "2024-06", milk: 640, eggs: 1500 },
];

const healthStatusData = [
	{ name: "Healthy", value: 85, color: "#10B981" },
	{ name: "Treatment", value: 10, color: "#F59E0B" },
	{ name: "Monitoring", value: 5, color: "#EF4444" },
];

const mostProductiveLivestock = [
	{ name: "June", value: 1200, unit: "L" },
	{ name: "Josephine", value: 1180, unit: "L" },
	{ name: "Jennifer", value: 1160, unit: "L" },
	{ name: "Daisy", value: 1150, unit: "L" },
	{ name: "Chloe", value: 1145, unit: "L" },
	{ name: "Janice", value: 1140, unit: "L" },
	{ name: "Doreen", value: 1135, unit: "L" },
	{ name: "Charlotte", value: 1130, unit: "L" },
	{ name: "Shanice", value: 1125, unit: "L" },
	{ name: "Winnie", value: 1125, unit: "L" },
];

const mostValuableLivestock = [
	{ name: "Monkey Blue", value: 4650, currency: "$" },
	{ name: "Geoff", value: 4250, currency: "$" },
	{ name: "June", value: 3650, currency: "$" },
	{ name: "Josephine", value: 3605, currency: "$" },
	{ name: "Jennifer", value: 3600, currency: "$" },
	{ name: "Daisy", value: 3550, currency: "$" },
	{ name: "Chloe", value: 3540, currency: "$" },
	{ name: "Janice", value: 3535, currency: "$" },
	{ name: "Doreen", value: 3530, currency: "$" },
	{ name: "Charlotte", value: 3530, currency: "$" },
	{ name: "Shanice", value: 3520, currency: "$" },
	{ name: "Winnie", value: 3515, currency: "$" },
];

// Helper function to get status color and icon for health activities
const getActivityStatus = (status: string, severity: string) => {
	const statusConfig = {
		active: {
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900",
			text: "Healthy",
		},
		recovering: {
			color: "text-cyan-600 dark:text-cyan-400",
			bgColor: "bg-cyan-100 dark:bg-cyan-900",
			text: "Recovering",
		},
		recovered: {
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900",
			text: "Recovered",
		},
		worsened: {
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900",
			text: "Worsened",
		},
		deceased: {
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-100 dark:bg-red-900",
			text: "Deceased",
		},
	};

	const severityIndicator =
		severity === "high" ? "🔴" : severity === "medium" ? "🟡" : "🟢";

	return {
		...(statusConfig[status] || statusConfig.recovering),
		severity: severityIndicator,
	};
};

const StatCard = ({
	title,
	value,
	subtitle,
	icon: Icon,
	colour,
	trend,
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	colour: string;
	trend?: string;
}) => {
	const colourClasses = {
		blue: "bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-900 dark:border-violet-700 dark:text-violet-300",
		green:
			"bg-green-50 border-green-200 text-green-600 dark:bg-green-900 dark:border-green-700 dark:text-green-300",
		orange:
			"bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300",
		purple:
			"bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-300",
	};

	return (
		<div
			className={`border-2 p-6 rounded-lg shadow-md ${colourClasses[colour]}`}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
						{title}
					</p>
					<p className="text-lg font-bold text-gray-900 dark:text-gray-50">
						{value}
					</p>
					{subtitle && (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{subtitle}
						</p>
					)}
				</div>
				<Icon className="h-8 w-8" />
			</div>
			{trend && (
				<div className="mt-4 flex items-center text-sm">
					{trend.includes("-") ? (
						<TrendingDown className="mr-1 h-4 w-4" />
					) : (
						<TrendingUp className="mr-1 h-4 w-4" />
					)}
					<span>{trend}</span>
				</div>
			)}
		</div>
	);
};

export default function Dashboard() {
	const { isLoading, isSuccess, isError, error, data } =
		useGetDashboardMetricsQuery();

	const [generateLivestockReport] = useGenerateLivestockSummaryMutation();

	return (
		<ScrollArea className="h-full bg-white dark:bg-black rounded-lg p-2">
			{/* Header */}
			<div className="flex items-center mb-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
			</div>
			<main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Charts and summaries */}
				<div className="space-y-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all">
						{data && data.livestockSummary.length > 1 ? (
							<StatCard
								title="Total Livestock"
								value={data.livestockSummary[0].total}
								subtitle={`Total purchased value £${data.livestockSummary[0].totalPurchasedValue}`}
								icon={Beef}
								colour="orange"
								trend="+6.5% from last month"
							/>
						) : (
							<div className="bg-gray-50 dark:bg-gray-800 flex flex-col space-y-2 items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700">
								<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									No summary found
								</h2>
								<button
									type="button"
									onClick={() => generateLivestockReport()}
									className="bg-blue-500 dark:bg-blue-600 hover:opacity-85 flex items-center px-4 py-2 rounded-md"
								>
									<Plus className="mr-1" />
									Generate one
								</button>
							</div>
						)}
						<StatCard
							title="Health Alerts"
							value="4"
							subtitle="Require attention"
							icon={Heart}
							colour="orange"
							trend="-2 from last month"
						/>
						<StatCard
							title="Weight Change"
							value="1.4KG"
							subtitle="Per animal this month"
							icon={Scale}
							colour="orange"
							trend="+0.25KG vs last month"
						/>
						<StatCard
							title="Production Today"
							value="680L"
							subtitle="Milk produced"
							icon={Droplets}
							colour="orange"
							trend="+3.5% vs yesterday"
						/>
					</div>
					{/* Charts */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Production Trend */}
						<div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-50">
								Production Trends
							</h3>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={productionTrendData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey={"date"} />
									<YAxis />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="milk"
										stroke="#3B82F6"
										strokeWidth={2}
										name="Milk (L)"
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>

						{/* Health Status Distribution */}
						<div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
								Health Status
							</h3>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={healthStatusData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={120}
										paddingAngle={5}
										dataKey="value"
									>
										{healthStatusData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
							<div className="flex justify-center mt-4 space-x-6">
								{healthStatusData.map((item, index) => (
									<div key={index} className="flex items-center">
										<div
											className="w-3 h-3 rounded-full mr-2"
											style={{ backgroundColor: item.color }}
										/>
										<span className="text-sm text-gray-600 dark:text-gray-300">
											{item.name}: {item.value}%
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
					{/* Lists */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Most productive animals */}
						<div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
							{/* Header */}
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Package2 className="mr-2 h-5 w-5" />
								Best Producers
							</h3>
							<div className="w-full border-2 border-gray-300 dark:border-gray-600 mb-2" />
							<ScrollArea className="h-128">
								{mostProductiveLivestock.map((record, idx) => (
									<div
										key={`idx-${idx}-${record.name}`}
										className="px-3 py-2 rounded-lg border text-sm border-gray-200 dark:border-gray-700 my-2"
									>
										<div className="flex items-center justify-between p-2">
											<p className="text-gray-900 dark:text-gray-50 font-medium">
												{record.name}
											</p>
											<p className="text-gray-700 dark:text-gray-200 font-mono">
												{record.value}&nbsp;{record.unit}
											</p>
										</div>
									</div>
								))}
							</ScrollArea>
						</div>
						{/* Most valuable animals */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
							{/* Header */}
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<DollarSign className="mr-2 h-5 w-5" />
								Most Valuable
							</h3>
							<div className="w-full border-2 border-gray-300 dark:border-gray-600 mb-2" />
							<ScrollArea className="max-h-128">
								{isSuccess &&
									data !== undefined &&
									data.livestock.map((record, idx) => (
										<div
											key={`idx-${idx}-${record.name}`}
											className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 my-2"
										>
											<div className="flex items-center justify-between p-2">
												<p className="text-sm text-gray-900 dark:text-gray-50 font-medium">
													{record.name}
												</p>
												<p className="text-sm text-gray-700 dark:text-gray-200 font-mono">
													${record.purchasePrice}
												</p>
											</div>
										</div>
									))}
							</ScrollArea>
						</div>
						{/* Column 3: Recent Health Activities - This is the new third column */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:col-span-2 lg:col-span-1">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Activity className="mr-2 h-5 w-5" />
								Recent Activities
							</h3>
							<div className="w-full border-2 border-gray-300 dark:border-gray-600 mb-2" />
							<ScrollArea className="max-h-128">
								{isSuccess &&
									data !== undefined &&
									data.health.map((activity) => {
										const statusInfo = getActivityStatus(
											activity.status,
											activity.severity,
										);
										return (
											<div
												key={activity.id}
												className="px-3 py-2 my-2 rounded-lg border border-gray-200 dark:border-gray-600"
											>
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-medium text-gray-900 dark:text-gray-50">
														{activity.animalName}
													</p>
													<span className="text-xs">{statusInfo.severity}</span>
												</div>
												<p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
													{activity.condition}
												</p>
												<div className="flex items-center justify-between">
													<span
														className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
													>
														{statusInfo.text}
													</span>
													<span className="text-xs text-gray-500 dark:text-gray-400">
														{activity.recordDate}
													</span>
												</div>
											</div>
										);
									})}
							</ScrollArea>
						</div>
					</div>
				</div>
			</main>
		</ScrollArea>
	);
}
