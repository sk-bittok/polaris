import ActionButton from "./action-button";
import BackButton from "./back-button";

interface Props {
	recordId: number;
	recordType: string; // 'product', 'weight' or 'health'
	primaryInfo: string; // Animal info
	secondaryInfo: string; // Formatted date
	backHref: string;
	backLabel: string;
	onEdit?: () => void;
	onExport?: () => void;
	showActions?: boolean;
}

const RecordPageHeader: React.FC<Props> = ({
	recordType,
	recordId,
	primaryInfo,
	secondaryInfo,
	backHref,
	backLabel,
	onEdit,
	onExport,
	showActions = true,
}) => (
	<div className="mb-8">
		<BackButton href={backHref}>{backLabel}</BackButton>
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
					{recordType} Record #{recordId}
				</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-300">
					{primaryInfo} • {secondaryInfo}
				</p>
			</div>
			{showActions && (
				<div className="flex space-x-3">
					<ActionButton onClick={onEdit} variant="primary">
						Edit Record
					</ActionButton>
					<ActionButton onClick={onExport} variant="secondary">
						Export
					</ActionButton>
				</div>
			)}
		</div>
	</div>
);

export default RecordPageHeader;
