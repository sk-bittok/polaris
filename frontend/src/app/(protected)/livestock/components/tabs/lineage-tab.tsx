import { formatters } from "@/lib/utils";
import type { Livestock } from "@/models/livestock";
import { ChevronRight, Mars, Users, Venus } from "lucide-react";
import Link from "next/link";

type Props = {
	className?: string;
	data: Livestock;
};

export default function LineageTab({ className: tabsClassNames, data }: Props) {
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${tabsClassNames} `}
		>
			<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
				Family Tree
			</h2>

			<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
				<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
					Parents
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center gap-3">
						<div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
							<Mars className="text-blue-600 dark:text-blue-300" size={20} />
						</div>
						<div className="flex-1">
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{formatters.getFatherTerm(data.specieName)}
							</p>
							{data.parentMaleName ? (
								<Link
									href={`/livestock/${data.parentMaleId}`}
									className="text-blue-600 hover:underline font-medium dark:text-blue-300 flex items-center gap-1"
								>
									{data.parentMaleName || "Unknown"}
									{data.parentMaleName && <ChevronRight size={14} />}
								</Link>
							) : (
								<div className="text-blue-600 dark:text-blue-300">
									<p className="font-medium">Unkown</p>
								</div>
							)}
							{data.parentMaleTagId && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Tag: {data.parentMaleTagId}
								</p>
							)}
						</div>
					</div>

					<div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 flex items-center gap-3">
						<div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-full">
							<Venus className="text-pink-600 dark:text-pink-300" size={20} />
						</div>
						<div className="flex-1">
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{formatters.getMotherTerm(data.specieName)}
							</p>
							{data.parentFemaleName ? (
								<Link
									href={`/livestock/${data.parentFemaleId}`}
									className="text-pink-600 hover:underline font-medium dark:text-pink-300 flex items-center gap-1"
								>
									{data.parentFemaleName || "Unknown"}
									{data.parentFemaleName && <ChevronRight size={14} />}
								</Link>
							) : (
								<div className="text-blue-600 dark:text-blue-300">
									<p className="font-medium">Unkown</p>
								</div>
							)}
							{data.parentFemaleTagId && (
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Tag: {data.parentFemaleTagId}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
						Offspring
					</h3>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						0 records
					</span>
				</div>

				<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
					<Users size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
					<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
						No offspring records found
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
						When this animal has offspring, they will appear here
					</p>
					<button
						type="button"
						className="text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 px-3 py-1 rounded-md"
					>
						Link offspring
					</button>
				</div>
			</div>
		</div>
	);
}
