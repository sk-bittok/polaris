interface AvatarProps {
	name: string;
	size?: "sm" | "md" | "lg";
	color?: "indigo" | "blue" | "green" | "purple";
}

const Avatar: React.FC<AvatarProps> = ({
	name,
	size = "md",
	color = "indigo",
}) => {
	const sizeClasses = {
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
	};

	const colorClasses = {
		indigo:
			"bg-indigo-100 border-indigo-200 dark:border-indigo-700 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300",
		blue: "bg-blue-100 border-blue-200 dark:border-blue-700 dark:bg-blue-800 text-blue-600 dark:text-blue-300",
		green:
			"bg-green-100 border-green-200 dark:border-green-700 dark:bg-green-800 text-green-600 dark:text-green-300",
		purple:
			"bg-purple-100 border-purple-200 dark:border-purple-700 dark:bg-purple-800 text-purple-600 dark:text-purple-300",
	};

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("");

	return (
		<div
			className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full flex items-center justify-center border font-semibold`}
		>
			{initials}
		</div>
	);
};

export default Avatar;
