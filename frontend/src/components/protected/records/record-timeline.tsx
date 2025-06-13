import { Clock } from "lucide-react";
import ContentCard from "./content-card";
import { formatters } from "@/lib/utils";

// Timeline Item Component
interface TimelineItemProps {
  label: string;
  value: string | number;
  bulletColor?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  label,
  value,
  bulletColor = "bg-gray-500",
}) => (
  <div className="flex items-start space-x-3">
    <div className={`w-2 h-2 rounded-full mt-2 ${bulletColor}`} />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
        {label}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{value}</p>
    </div>
  </div>
);
interface Props {
  recordDate?: Date | string;
  createdAt: Date;
  updatedAt: Date;
  additionalTimestamps?: Array<{
    label: string;
    value: Date | string;
    bulletColor?: string;
  }>;
}

const RecordTimeline: React.FC<Props> = ({
  recordDate,
  createdAt,
  updatedAt,
  additionalTimestamps = [],
}) => (
  <ContentCard icon={Clock} title="Record Timeline" iconColor="text-orange-600">
    <div className="space-y-4">
      {recordDate && (
        <TimelineItem
          label="Record Date"
          value={formatters.date(recordDate)}
          bulletColor="bg-green-500 dark:bg-green-400"
        />
      )}
      {additionalTimestamps.map((timestamp, index) => (
        <TimelineItem
          key={`idx-${index}-${timestamp.label}`}
          label={timestamp.label}
          value={formatters.date(timestamp.value)}
          bulletColor={
            timestamp.bulletColor || "bg-purple-500 dark:bg-purple-400"
          }
        />
      ))}
      <TimelineItem
        label="Created"
        value={formatters.date(createdAt)}
        bulletColor="bg-blue-500 dark:bg-blue-400"
      />
      <TimelineItem
        label="Last Updated"
        value={formatters.date(updatedAt)}
        bulletColor="bg-gray-500 dark:bg-gray-400"
      />
    </div>
  </ContentCard>
);

export default RecordTimeline;
