import { User } from "lucide-react";
import ContentCard from "./content-card";
import Avatar from "./avatar";

interface UserInfoProps {
	name: string;
	avatarColor?: "indigo" | "blue" | "green" | "purple";
	subtitle?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
	name,
	avatarColor = "indigo",
	subtitle,
}) => (
	<div className="flex items-center space-x-3">
		<Avatar name={name} color={avatarColor} />
		<div>
			<p className="font-medium text-gray-900 dark:text-gray-50">{name}</p>
			{subtitle && (
				<p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
			)}
		</div>
	</div>
);

interface CreatorInfoProps {
	createdByName: string;
	createdBy?: string;
	avatarColor?: "indigo" | "blue" | "green" | "purple";
}

const CreatorInfo: React.FC<CreatorInfoProps> = ({
	createdByName,
	createdBy,
	avatarColor = "indigo",
}) => (
	<ContentCard icon={User} title="Created By" iconColor="text-indigo-600">
		<UserInfo
			name={createdByName}
			subtitle={createdBy}
			avatarColor={avatarColor}
		/>
	</ContentCard>
);

export default CreatorInfo;
