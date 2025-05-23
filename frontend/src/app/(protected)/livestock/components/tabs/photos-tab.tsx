import { Camera, Plus } from "lucide-react";

type Props = {
	className?: string;
};

const PhotoTab = ({ className }: Props) => {
	return (
		<div
			className={`${className} bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96`}
		>
			<div className="flex justify-between items-center mb-6">
				<h2 className="font-xl font-semibold text-gray-900 dark:text-gray-50">
					Photo Gallery
				</h2>
				<button
					type="button"
					className=" bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
				>
					<Plus size={14} />
					Add Photos
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Empty state */}
				<div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center h-52">
					<Camera size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
					<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
						No photos yet
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
						Add photos to track visual changes over time
					</p>
				</div>
			</div>
		</div>
	);
};

export default PhotoTab;
