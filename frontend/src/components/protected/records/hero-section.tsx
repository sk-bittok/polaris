import type {
  HealthRecordResponse,
  ProductionRecordResponse,
  RecordData,
  WeightRecordResponse,
} from "@/lib/models/records";
import { formatters } from "@/lib/utils";
import { Calendar, Heart, Info, Package, Scale, User, type LucideIcon } from "lucide-react";

interface HeroConfig {
  emoji: string;
  gradient: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export const getHeroConfig = (
  data: RecordData,
  recordType: "production" | "health" | "weight",
): HeroConfig => {
  switch (recordType) {
    case "production": {
      const prodData = data as ProductionRecordResponse;
      return {
        gradient:
          "from-green-400 to-emerald-600 dark:from-green-600 dark:to-emerald-700",
        emoji: formatters.getProductEmoji(prodData.productType),
        title: `${prodData.productType} Production`,
        subtitle: "Production Record",
        icon: Package,
      };
    }
    case "health": {
      const healthData = data as HealthRecordResponse;
      return {
        gradient: "from-red-400 to-pink-600 dark:from-red-600 dark:to-pink-700",
        emoji: formatters.getHealthEmoji(healthData.condition),
        title: `${healthData.condition} condition`,
        subtitle: "Health Record",
        icon: Heart,
      };
    }
    case "weight": {
      const weightData = data as WeightRecordResponse;
      return {
        gradient:
          "from-blue-400 to-indigo-600 dark:from-blue-600 dark:to-indigo-700",
        emoji: formatters.getWeightEmoji(),
        title: "Weight Record",
        subtitle: `${weightData.mass} kg`,
        icon: Scale,
      };
    }
    default:
      return {
        gradient: "from-gray-400 to-gray-600",
        emoji: "📋",
        title: "Record",
        subtitle: "Record",
        icon: Info,
      };
  }
};

interface Props {
  heroConfig: HeroConfig,
  data: RecordData
}

export default function HeroCard({ data, heroConfig }: Props) {
  const HeroIcon = heroConfig.icon;
  return (
    <div
      className={`relative h-64 bg-gradient-to-r ${heroConfig.gradient}`}
    >
      <div className="absolute inset-0 text-9xl flex items-center justify-center opacity-20">
        {heroConfig.emoji}
      </div>
      <div className="absolute inset-0 flex items-end">
        <div className="p-6 text-white">
          <div className="flex items-center mb-2">
            <HeroIcon className="mr-2" size={24} />
            <span className="text-lg font-medium opacity-90">
              {heroConfig.subtitle}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{heroConfig.title}</h1>
          <div className="flex items-center space-x-4 text-lg">
            <span className="flex items-center">
              <User className="mr-1" size={16} />
              {data.animalName}
            </span>
            <span className="flex items-center">
              <Calendar className="mr-1" size={16} />
              {formatters.date(data.recordDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
