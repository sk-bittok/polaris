import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
	href: string;
	children: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ href, children }) => (
	<Link
		href={href}
		className="flex items-center mb-4 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
	>
		<ArrowLeft className="w-4 h-4 mr-2" />
		{children}
	</Link>
);

export default BackButton;
