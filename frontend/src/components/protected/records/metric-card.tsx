import type {
  HealthRecordResponse,
  ProductionRecordResponse,
  RecordData,
  WeightRecordResponse,
} from "@/lib/models/records";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle,
  type LucideIcon,
  Scale,
  Stethoscope,
  Tag,
  TrendingUp,
  Trophy,
  Weight,
  Zap,
} from "lucide-react";
import React from "react";

interface MetricCardConfig {
  title: string;
  value: string;
  icon: LucideIcon;
  bgClass: string;
  colorClass: string;
}

export const getMetricCards = (
  data: RecordData,
  recordType: "production" | "health" | "weight",
): MetricCardConfig[] => {
  const baseCards: MetricCardConfig[] = [
    {
      title: "Animal Tag",
      value: data.animalTagId,
      icon: Tag,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Organisation",
      value: data.organisationName,
      icon: Building2,
      colorClass: "text-purple-600 dark:text-purple-400",
      bgClass: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  switch (recordType) {
    case "production": {
      const prodData = data as ProductionRecordResponse;
      return [
        {
          title: "Quantity",
          value: `${prodData.quantity} ${prodData.unit}`,
          icon: Scale,
          colorClass: "text-green-600 dark:text-green-400",
          bgClass: "bg-green-50 dark:bg-green-950",
        },
        ...(prodData.quality
          ? [
            {
              title: "Quality",
              value: prodData.quality,
              icon: Trophy,
              colorClass: "text-amber-600 dark:text-amber-400",
              bgClass: "bg-amber-50 dark:bg-amber-950",
            },
          ]
          : []),
        ...baseCards,
      ];
    }

    case "health": {
      const healthData = data as HealthRecordResponse;
      return [
        {
          title: "Condition",
          value: healthData.condition,
          icon: Stethoscope,
          colorClass: "text-red-600 dark:text-red-400",
          bgClass: "bg-red-50 dark:bg-red-950",
        },
        ...(healthData.severity
          ? [
            {
              title: "Severity",
              value: healthData.severity,
              icon: AlertCircle,
              colorClass:
                healthData.severity === "high"
                  ? "text-red-600 dark:text-red-400"
                  : healthData.severity === "medium"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-green-600 dark:text-green-400",
              bgClass:
                healthData.severity === "high"
                  ? "bg-red-50 dark:bg-red-950"
                  : healthData.severity === "medium"
                    ? "bg-yellow-50 dark:bg-yellow-950"
                    : "bg-green-50 dark:bg-green-950",
            },
          ]
          : []),
        ...(healthData.status
          ? [
            {
              title: "Status",
              value: healthData.status,
              icon:
                healthData.status === "recovered"
                  ? CheckCircle
                  : healthData.status === "active"
                    ? AlertCircle
                    : Activity,
              colorClass:
                healthData.status === "recovered"
                  ? "text-green-600 dark:text-green-400"
                  : healthData.status === "active"
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400",
              bgClass:
                healthData.status === "recovered"
                  ? "bg-green-50 dark:bg-green-950"
                  : healthData.status === "active"
                    ? "bg-red-50 dark:bg-red-950"
                    : "bg-blue-50 dark:bg-blue-950",
            },
          ]
          : []),
        ...baseCards,
      ];
    }

    case "weight": {
      const weightData = data as WeightRecordResponse;
      const weightChange = weightData.mass
        ? weightData.mass - weightData.previousMass
        : null;

      return [
        {
          title: "Current Weight",
          value: `${weightData.mass} ${weightData.unit}`,
          icon: Weight,
          colorClass: "text-blue-600 dark:text-blue-400",
          bgClass: "bg-blue-50 dark:bg-blue-950",
        },
        ...(weightData.mass
          ? [
            {
              title: "Status",
              value: weightData.status,
              icon: TrendingUp,
              colorClass:
                weightData.status === "normal"
                  ? "text-green-600 dark:text-green-400"
                  : weightData.status === "underweight"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400",
              bgClass:
                weightData.status === "normal"
                  ? "bg-green-50 dark:bg-green-950"
                  : weightData.status === "underweight"
                    ? "bg-red-50 dark:bg-red-950"
                    : "bg-yellow-50 dark:bg-yellow-950",
            },
          ]
          : []),
        ...(weightChange !== null
          ? [
            {
              title: "Weight Change",
              value: `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} ${weightData.unit}`,
              icon:
                weightChange > 0
                  ? TrendingUp
                  : weightChange < 0
                    ? TrendingUp
                    : Zap,
              colorClass:
                weightChange > 0
                  ? "text-green-600 dark:text-green-400"
                  : weightChange < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400",
              bgClass:
                weightChange > 0
                  ? "bg-green-50 dark:bg-green-950"
                  : weightChange < 0
                    ? "bg-red-50 dark:bg-red-950"
                    : "bg-gray-50 dark:bg-gray-950",
            },
          ]
          : []),
        ...baseCards,
      ];
    }

    default:
      return baseCards;
  }
};

interface Props {
  cards: MetricCardConfig[]
}

const MetricCard: React.FC<Props> = ({ cards }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cards.length, 3)} gap-4 mb-6`}>
      {cards.map((card, idx) => {
        const CardIcon = card.icon;
        return (
          <div key={idx} className={`${card.bgClass} p-4 rounded-lg`}>
            <div className="flex items-center mb-2">
              <CardIcon className={`${card.colorClass} mr-2`} size={20} />
              <h3 className={`font-semibold ${card.colorClass.replace("text-", "text-").replace("dark:text-", "dark:text-").replace("-400", "-800").replace("dark:text-", "dark:text-").replace("-400", "-200")} `}>
                {card.title}
              </h3>
            </div>
            <div className="pl-7">
              <p
                className={`font-medium ${card.colorClass.replace("-400", "-700").replace("dark:text-", "dark:text-").replace("-400", "-300")}`}
              >
                {card.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
};

export default MetricCard;

