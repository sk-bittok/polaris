import { formatters } from "@/lib/utils";
import type { Livestock } from "@/models/livestock";
import { DollarSign } from "lucide-react";

export default function PurchaseInfo({ data }: { data: Livestock }) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
				<DollarSign size={18} className="text-gray-500 dark:text-gray-400" />
				Purchase Information
			</h2>

			<div className="space-y-3 text-sm">
				<div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
					<span className="text-gray-500 dark:text-gray-400">
						Purchase Date
					</span>
					<span className="text-gray-900 dark:text-white font-medium">
						{formatters.date(data.purchaseDate)}
					</span>
				</div>
				<div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
					<span className="text-gray-500 dark:text-gray-400">
						Purchase Price
					</span>
					<span className="text-gray-900 dark:text-white font-medium">
						{formatters.currency(data.purchasePrice)}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-500 dark:text-gray-400">Organisation</span>
					<span className="text-gray-900 dark:text-white font-medium capitalize">
						{data.organisationName || "N/A"}
					</span>
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
				<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Record Information
				</h3>
				<div className="grid grid-cols-2 gap-4 text-xs">
					<div>
						<p className="text-gray-500 dark:text-gray-400">Created By</p>
						<p className="text-gray-900 dark:text-white font-medium">
							{data.createdByName}
						</p>
					</div>
					<div>
						<p className="text-gray-500 dark:text-gray-400">Created On</p>
						<p className="text-gray-900 dark:text-white font-medium">
							{formatters.date(data.createdAt)}
						</p>
					</div>
					<div>
						<p className="text-gray-500 dark:text-gray-400">Updated On</p>
						<p className="text-gray-900 dark:text-white font-medium">
							{formatters.date(data.updatedAt)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
