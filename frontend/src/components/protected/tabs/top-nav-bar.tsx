import { ChevronRight, Edit3 } from "lucide-react";
import Link from "next/link";
import { formatters } from "@/lib/utils";
import { DeleteDialogue } from "../modals/";
import { Button } from "@/components/ui/button";
import type { Livestock } from "@/models/livestock";

type Props = {
	data: Livestock;
	id: string;
	setActiveTab: (id: string) => void;
	activeTab: string;
	handleDelete: () => void;
	confirmDelete: () => void;
};

const TopNavigationBar = ({
	data,
	id,
	setActiveTab,
	activeTab,
	handleDelete,
	confirmDelete,
}: Props) => {
	return (
		<div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 shadow-sm dark:border-gray-700">
			<div className="flex items-center justify-between px-4 py-3 max-w-8xl mx-auto">
				<div className="flex items-center gap-2">
					<Link
						href="/livestock"
						className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
					>
						<ChevronRight className="mr-1" size={18} />
						<span>All livestock</span>
					</Link>
					<span className="text-gray-400 dark:text-gray-500" />
					<span className="text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1">
						<span className="text-lg">
							{formatters.getAnimalEmoji(data.specieName)}
						</span>
						{data.name}
					</span>
				</div>

				{/* Delete and Edit buttons */}
				<div className="flex items-center gap-2">
					<Link
						href={`/livestock/${id}/edit`}
						className="text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
					>
						<Edit3 size={14} />
						<span>Edit</span>
					</Link>
					<DeleteDialogue
						confirmDelete={confirmDelete}
						title="Remove record"
						description="This action cannot be undone. Are you sure you want to permanently delete this record from our servers?"
					>
						<Button
							onClick={handleDelete}
							type="button"
							className="text-sm bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md flex items-center gap-1 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50"
						>
							<span>Delete</span>
						</Button>
					</DeleteDialogue>
				</div>
			</div>

			{/* Tabs section */}
			<div className="px-4 max-w-8xl mx-auto">
				<div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
					{[
						{ id: "overview", label: "Overview" },
						{ id: "production", label: "Production" },
						{ id: "health", label: "Health" },
						{ id: "weight", label: "Weight" },
						{ id: "lineage", label: "Lineage" },
						{ id: "finances", label: "Finances" },
						{ id: "photos", label: "Photos" },
					].map((tab) => (
						<button
							type="button"
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 ${
								activeTab === tab.id
									? "border-blue-600 text-blue-500 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-500"
							} `}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default TopNavigationBar;
