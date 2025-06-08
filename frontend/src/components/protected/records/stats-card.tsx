import { Scale } from "lucide-react";
import ContentCard from "./content-card";

interface KeyValuePairProps {
	label: string;
	value: string | number;
	valueClassName?: string;
}

const KeyValuePair: React.FC<KeyValuePairProps> = ({
	label,
	value,
	valueClassName = "font-medium",
}) => (
	<div className="flex justify-between items-center">
		<span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
		<span className={`text-sm ${valueClassName}`}>{value}</span>
	</div>
);

interface StatsCardProps {
	recordId: number;
	stats: Array<{
		label: string;
		value: string | number;
		valueClassName?: string;
	}>;
	title?: string;
	iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
	recordId,
	stats,
	title = "Quick Stats",
	iconColor = "text-emerald-600 dark:text-emerald-500",
}) => (
	<ContentCard icon={Scale} title={title} iconColor={iconColor}>
		<div className="space-y-6">
			<KeyValuePair
				label="Record ID"
				value={`#${recordId}`}
				valueClassName="font-mono text-sm font-medium"
			/>
			{stats.map((stat, index) => (
				<KeyValuePair
					key={`idx-${index}-label-${recordId}`}
					label={stat.label}
					value={stat.value}
					valueClassName={stat.valueClassName || "font-medium"}
				/>
			))}
		</div>
	</ContentCard>
);

export default StatsCard;
