import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

const ErrorStateView: React.FC<{
	message: string;
	title: string;
	actionLabel?: string;
	actionHref?: string;
}> = ({ title, message, actionHref, actionLabel }) => (
	<div className="flex flex-col items-center justify-center overflow-y-hidden h-screen">
		<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
		<h3 className="text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">
			{title}
		</h3>
		<p className="text-center text-gray-500 dark:text-gray-400 mb-4">
			{message}
		</p>
		{actionLabel && actionHref ? (
			<Link
				href={actionHref}
				className="mt-4 bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-85 transition-colors"
			>
				{actionLabel}
			</Link>
		) : (
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="flex items-center gap-2 bg-blue-500 hover:opacity-85 dark:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
			>
				<RefreshCw />
				Refresh
			</button>
		)}
	</div>
);

export default ErrorStateView;
