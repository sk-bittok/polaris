import type { LucideIcon } from "lucide-react";

interface BadgeProps {
	children: React.ReactNode;
	variant?: "green" | "blue" | "yellow" | "gray";
	icon?: LucideIcon;
}

const Badge: React.FC<BadgeProps> = ({
	children,
	variant = "gray",
	icon: Icon,
}) => {
	const variantClasses = {
		green: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
		blue: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
		yellow:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
		gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100",
	};

	return (
		<div
			className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]}`}
		>
			{Icon && <Icon className="w-4 h-4 mr-2" />}
			{children}
		</div>
	);
};

export default Badge;
