import { formatters } from "@/lib/utils";
import type { Livestock } from "@/models/livestock";
import {
	Calendar,
	Camera,
	DollarSign,
	Mars,
	Tag,
	Venus,
	Weight,
} from "lucide-react";

type Props = {
	data: Livestock;
};

export default function ProfileCard({ data }: Props) {
	return (
		<div className="md:flex">
			{/* Left side - photo/avatar */}
			<div className="relative bg-gradient-to-br from-blue-400 to-purple-500 md:w-1/3 h-48 md:h-auto flex items-center justify-center">
				<div className="text-9xl">
					{formatters.getAnimalEmoji(data.specieName)}
				</div>
				<button
					type="button"
					className="absolute bottom-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md dark:bg-gray-800/80 dark:hover:bg-gray-800"
				>
					<Camera size={16} className="text-gray-700 dark:text-gray-300" />
				</button>
			</div>

			{/* Right side - key info */}
			<div className="p-6 md:flex-1">
				<div className="flex justify-between items-start">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Tag size={16} className="text-gray-500 dark:text-gray-400" />
							<span className="uppercase font-mono tracking-wider text-gray-500 dark:text-gray-400 text-sm">
								{data.tagId}
							</span>
							<span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full uppercase font-medium">
								{data.status}
							</span>
						</div>

						<h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
							{data.name}
							{data.gender === "male" ? (
								<Mars size={18} className="text-blue-500" />
							) : (
								<Venus size={18} className="text-pink-500" />
							)}
						</h1>

						<p className="text-gray-600 dark:text-gray-300 capitalize">
							{data.breedName} {data.specieName}
						</p>
					</div>

					<div className="hidden md:block">
						<span className="inline-block bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
							Healthy
						</span>
					</div>
				</div>

				{/* Key stats */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
					<div className="flex items-center gap-2">
						<div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
							<Calendar
								size={16}
								className="text-blue-600 dark:text-blue-400"
							/>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Born</p>
							<p className="text-sm font-medium text-gray-900 dark:text-white">
								{formatters.date(data.dateOfBirth)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
							<Weight
								size={16}
								className="text-purple-600 dark:text-purple-400"
							/>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
							<p className="text-sm font-medium text-gray-900 dark:text-white">
								{formatters.weight(data.currentWeight)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
							<DollarSign
								size={16}
								className="text-green-600 dark:text-green-400"
							/>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Value</p>
							<p className="text-sm font-medium text-gray-900 dark:text-white">
								{formatters.currency(data.purchasePrice)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
