import type { LucideIcon } from "lucide-react";

function SectionCard({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
			{children}
		</div>
	);
}

function SectionCardTitle({
	icon: Icon,
	title,
	iconClassName,
}: { icon: LucideIcon; title: string; iconClassName: string }) {
	return (
		<h2 className="flex items-center text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
			<Icon className={`mr-2 w-5 h-5 ${iconClassName}`} />
			{title}
		</h2>
	);
}

//  GridInfoLayout Component - For consistent grid layouts
interface GridInfoLayoutProps {
	children: React.ReactNode;
	columns?: 1 | 2 | 3;
}

const GridInfoLayout: React.FC<GridInfoLayoutProps> = ({
	children,
	columns = 2,
}) => {
	const columnClasses = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-3",
	};

	return (
		<div className={`grid ${columnClasses[columns]} gap-4`}>{children}</div>
	);
};

interface ContentCardProps {
	icon: LucideIcon;
	title: string;
	iconColor: string;
	children: React.ReactNode;
	className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
	icon: Icon,
	title,
	iconColor,
	children,
	className = "",
}) => (
	<SectionCard>
		<SectionCardTitle icon={Icon} title={title} iconClassName={iconColor} />
		<div className={className}>{children}</div>
	</SectionCard>
);

const InfoCardLabel: React.FC<{ label: string }> = ({ label }) => (
	<h6 className="text-sm font-medium text-gray-500 dark:text-gray-400">
		{label}
	</h6>
);

const InfoCardValue: React.FC<{
	value: string | number;
	className?: string;
}> = ({ value, className }) => (
	<p className={`${className} text-lg mt-1`}>{value}</p>
);

const InfoCard: React.FC<{
	label: string;
	value: string | number;
	className?: string;
}> = ({
	label,
	value,
	className = "font-semibold text-gray-900 dark:text-gray-100",
}) => (
	<div>
		<InfoCardLabel label={label} />
		<InfoCardValue value={value} className={className} />
	</div>
);

export {
	InfoCard,
	SectionCardTitle,
	SectionCard,
	GridInfoLayout,
	InfoCardLabel,
	InfoCardValue,
};
export default ContentCard;
