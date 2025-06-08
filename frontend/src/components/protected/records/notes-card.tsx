import { FileText } from "lucide-react";
import ContentCard from "./content-card";

interface NotesCardProps {
	notes: string;
	title?: string;
	iconColor?: string;
}

const NotesCard: React.FC<NotesCardProps> = ({
	notes,
	title = "Notes",
	iconColor = "text-purple-600 dark:text-purple-400",
}) => (
	<ContentCard icon={FileText} title={title} iconColor={iconColor}>
		<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
			<p className="text-gray-700 dark:text-gray-200 leading-relaxed">
				{notes}
			</p>
		</div>
	</ContentCard>
);

export default NotesCard;
