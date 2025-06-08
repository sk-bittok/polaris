import { Tag } from "lucide-react";
import ContentCard, { GridInfoLayout, InfoCard } from "./content-card";

interface Props {
	animalName: string;
	animalPid?: string;
	animalTagId: string;
	additionalFields?: Array<{
		label: string;
		value: string | number;
		className?: string;
	}>;
}

const LivestockInfoCard: React.FC<Props> = ({
	animalName,
	animalPid,
	animalTagId,
	additionalFields = [],
}) => (
	<ContentCard
		icon={Tag}
		title="Livestock Information"
		iconColor="text-blue-600 dark:text-blue-500"
	>
		<GridInfoLayout columns={2}>
			<InfoCard label="Name" value={animalName} />
			<InfoCard
				label="Tag ID"
				value={animalTagId}
				className="font-mono text-gray-600 dark:text-gray-300"
			/>
			{animalPid && (
				<InfoCard
					label="PID"
					value={animalPid}
					className="font-mono text-gray-900 dark:text-gray-100"
				/>
			)}
			{additionalFields.map((field, index) => (
				<InfoCard
					label={field.label}
					value={field.value}
					className={field.className}
					key={`idx-${index}-label-${field.label}`}
				/>
			))}
		</GridInfoLayout>
	</ContentCard>
);

export default LivestockInfoCard;
