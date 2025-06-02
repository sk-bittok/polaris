import { formatters } from "@/lib/utils";
import type { Livestock } from "@/models/livestock";
import { ChevronRight, Mars, Users, Venus } from "lucide-react";
import Link from "next/link";

export default function ParentageInfo({ data }: { data: Livestock }) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
				<Users size={18} className="text-gray-500 dark:text-gray-400" />
				Parentage
			</h2>

			<div className="space-y-4">
				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center gap-3">
					<div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
						<Mars className="text-blue-600 dark:text-blue-300" size={20} />
					</div>
					<div>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{formatters.getFatherTerm(data.specieName)}
						</p>
						{data.parentMaleName ? (
							<Link
								href={`/livestock/${data.parentMaleId}`}
								className="text-blue-600 hover:underline font-medium dark:text-blue-300 flex items-center gap-1"
							>
								{data.parentMaleName}
								<ChevronRight size={14} />
							</Link>
						) : (
							<div className="text-blue-600 font-medium dark:text-blue-300 ">
								Unkown
							</div>
						)}
					</div>
				</div>

				<div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 flex items-center gap-3">
					<div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-full">
						<Venus className="text-pink-600 dark:text-pink-300" size={20} />
					</div>
					<div>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{formatters.getMotherTerm(data.specieName)}
						</p>
						{data.parentFemaleName ? (
							<Link
								href={`/livestock/${data.parentFemaleId}`}
								className="text-pink-600 hover:underline font-medium dark:text-pink-300 flex items-center gap-1"
							>
								{data.parentFemaleName || "Unknown"}
								<ChevronRight size={14} />
							</Link>
						) : (
							<div className="text-pink-600 font-medium dark:text-pink-300">
								Unkown
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="mt-4 text-center">
				<button
					type="button"
					className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full flex items-center gap-1 mx-auto"
				>
					<Users size={12} />
					View full lineage
				</button>
			</div>
		</div>
	);
}
