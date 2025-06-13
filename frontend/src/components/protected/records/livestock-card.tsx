import { HealthRecordResponse, ProductionRecordResponse, RecordData, RecordType, WeightRecordResponse } from "@/lib/models/records";
import { Heart, LucideIcon, Package, Scale, User } from "lucide-react";
import React from "react";

interface LivestockProps {
  data: RecordData
}

const LivestockCard: React.FC<LivestockProps> = ({ data }) => (
  <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg">
    <div className="flex items-center mb-4">
      <User
        className="text-gray-600 dark:text-gray-400 mr-2"
        size={20}
      />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Animal Information
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Animal Name
        </p>
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {data.animalName}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tag ID
        </p>
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {data.animalTagId}
        </p>
      </div>
    </div>
  </div>
);

interface AdditionalDetailsProps {
  data: AdditionalDetails
}

const AdditionalDetailsCard: React.FC<AdditionalDetailsProps> = ({ data }) => (

  <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg">
    <div className="flex items-center mb-4">
      <data.icon
        className="text-gray-600 dark:text-gray-400 mr-2"
        size={20}
      />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        {data.title}
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.details.map((detail, index) => (
        <div key={index}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {detail.label}
          </p>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {detail.value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

type AdditionalDetails = {
  title: string;
  icon: LucideIcon;
  details: Array<{ label: string, value: string | number }>
}

const getAdditionalDetails = (
  data: RecordData,
  recordType: RecordType,
) => {
  switch (recordType) {
    case "production": {
      const prodData = data as ProductionRecordResponse;
      return {
        title: "Production Details",
        icon: Package,
        details: [
          { label: "Product Type", value: prodData.productType },
          { label: "Quantity", value: `${prodData.quantity} ${prodData.unit}` },
          ...(prodData.quality
            ? [{ label: "Quality", value: prodData.quality }]
            : []),
        ],
      };
    }

    case "health": {
      const healthData = data as HealthRecordResponse;
      return {
        title: "Health Details",
        icon: Heart,
        details: [
          { label: "Condition", value: healthData.condition },
          { label: 'Description', value: healthData.description },
          ...(healthData.treatment
            ? [{ label: "Treatment", value: healthData.treatment }]
            : []),
          ...(healthData.performedBy
            ? [{ label: "Veterinarian", value: healthData.performedBy }]
            : []),
          ...(healthData.severity
            ? [{ label: "Severity", value: healthData.severity }]
            : []),
          ...(healthData.status
            ? [{ label: "Status", value: healthData.status }]
            : []),
        ],
      };
    }

    case "weight": {
      const weightData = data as WeightRecordResponse;
      const weightChange = weightData.previousMass
        ? weightData.mass - weightData.previousMass
        : null;

      return {
        title: "Weight Details",
        icon: Scale,
        details: [
          {
            label: "Current Weight",
            value: `${weightData.mass} ${weightData.unit}`,
          },
          ...(weightData.previousMass
            ? [
              {
                label: "Previous Weight",
                value: `${weightData.previousMass} ${weightData.unit}`,
              },
            ]
            : []),
          ...(weightChange !== null
            ? [
              {
                label: "Weight Change",
                value: `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} ${weightData.unit}`,
              },
            ]
            : []),
          ...(weightData.status
            ? [{ label: "Category", value: weightData.status }]
            : []),
        ],
      };
    }

    default:
      return null;
  }
};

export { LivestockCard, getAdditionalDetails, AdditionalDetailsCard };
