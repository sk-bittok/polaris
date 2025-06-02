import type { Livestock } from "@/models/livestock";
import { Clipboard, Edit3 } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function NotesCard({
	data,
	id,
	router,
}: { data: Livestock; id: string; router: AppRouterInstance }) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:col-span-2 xl:col-span-3">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
					<Clipboard size={18} className="text-gray-500 dark:text-gray-400" />
					Notes
				</h2>
				<button
					type="button"
					onClick={() => router.push(`/livestock/${id}/edit`)}
					className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md flex items-center gap-1"
				>
					<Edit3 size={12} />
					Edit notes
				</button>
			</div>

			{data.notes ? (
				<div className="prose max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 text-sm">
					<p className="leading-relaxed whitespace-pre-wrap">{data.notes}</p>
				</div>
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
						onClick={() => router.push(`/livestock/${id}/edit`)}
						className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md mt-2"
					>
						Add notes
					</button>
				</div>
			)}
		</div>
	);
}
