import type {
	HealthRecordResponse,
	ProductionRecordResponse,
	RecordData,
	WeightRecordResponse,
} from "@/lib/models/records";
import { formatters } from "@/lib/utils";
import { Heart, Info, Package, Scale, type LucideIcon } from "lucide-react";

interface Props {
	emoji: string;
	gradient: string;
	title: string;
	subtitle: string;
	icon: LucideIcon;
}

export const getHeroConfig = (
	data: RecordData,
	recordType: "production" | "health" | "weight",
) => {
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
