interface ActionButtonProps {
	variant: "primary" | "secondary";
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
	variant,
	children,
	onClick,
	className = "",
}) => {
	const baseClasses = "px-4 py-2 rounded-lg transition-colors";
	const variantClasses = {
		primary: "bg-blue-500 dark:bg-blue-600 hover:opacity-85 text-white",
		secondary:
			"border-2 border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:opacity-85",
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
		>
			{children}
		</button>
	);
};

export default ActionButton;
