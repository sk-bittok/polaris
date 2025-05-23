import { HeartPlus, Plus } from "lucide-react";

const HealthTab = ({ className }) => {
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${className}`}
		>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="flex items-center text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
						<HeartPlus
							size={32}
							className="text-gray-300 dark:text-gray-700 mr-2"
						/>
						Health Records
					</h3>
				</div>
				<div>
					<button
						type="button"
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
					>
						<Plus size={16} />
						Add health record
					</button>
				</div>
			</div>
		</div>
	);
};

export default HealthTab;
