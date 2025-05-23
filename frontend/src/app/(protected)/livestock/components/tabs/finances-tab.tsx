import { formatters } from "@/lib/utils";
import { Livestock } from "@/models/livestock";
import { DollarSign, Plus } from "lucide-react";

type Props = {
	className?: string;
	data: Livestock;
};

const FinanceTab = ({ className: tabsClassNames, data }: Props) => {
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${tabsClassNames}`}
		>
			<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
				Financial Summary
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Initial Investment
					</p>
					<p className="text-2xl font-bold text-green-600 dark:text-green-400">
						{formatters.currency(data.purchasePrice)}
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Purchased on {formatters.date(data.purchaseDate)}
					</p>
				</div>

				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Total Expenses
					</p>
					<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
						{formatters.currency(0)}
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Feed, healthcare, etc.
					</p>
				</div>

				<div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Current Value
					</p>
					<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
						{formatters.currency(data.purchasePrice)}
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Estimated market value
					</p>
				</div>
			</div>

			<div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
				<div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
					<h3 className="font-medium text-gray-700 dark:text-gray-300">
						Transaction History
					</h3>
				</div>

				<div className="p-6 flex flex-col items-center justify-center text-center min-h-52">
					<DollarSign
						size={24}
						className="text-gray-400 dark:text-gray-500 mb-2"
					/>
					<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
						No transactions recorded
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
						Add expenses and income related to this animal
					</p>
					<button
						type="button"
						className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
					>
						<Plus size={14} />
						Add Transaction
					</button>
				</div>
			</div>
		</div>
	);
};

export default FinanceTab;
