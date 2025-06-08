"use client";

import {
	Badge,
	RecordPageHeader,
	LivestockInfoCard,
	RecordTimeline,
	CreatorInfo,
	NotesCard,
	RecordLayout,
	StatsCard,
	ContentCard,
	UniversalRecordPage,
} from "@/components/protected/records";
import {
	GridInfoLayout,
	InfoCard,
	InfoCardLabel,
} from "@/components/protected/records/content-card";
import type { ProductionRecordResponse } from "@/lib/models/records";
import { formatters } from "@/lib/utils";
import { useGetProductionRecordByIdQuery } from "@/state/api";
import { Package, Star } from "lucide-react";
import { use } from "react";
import { useRecordPage } from "@/lib/hooks";

function ProductionDetailsCard({ data }: { data: ProductionRecordResponse }) {
	return (
		<ContentCard
			icon={Package}
			title="Production Details"
			iconColor="text-green-600"
		>
			<GridInfoLayout columns={3}>
				<InfoCard label="Product Type" value={data.productType} />

				<div>
					<InfoCardLabel label="Quantity" />
					<QuantityDisplay quantity={data.quantity} unit={data.unit} />
				</div>
				{data.quality && (
					<Badge variant="green" icon={Star}>
						{data.quality}
					</Badge>
				)}
			</GridInfoLayout>
		</ContentCard>
	);
}

interface QuantityDisplayProps {
	quantity: string | number;
	unit: string;
	color?: string;
}

const QuantityDisplay: React.FC<QuantityDisplayProps> = ({
	quantity,
	unit,
	color = "text-green-600",
}) => (
	<div className="flex items-baseline mt-1">
		<p className={`text-3xl font-bold ${color}`}>{quantity}</p>
		<p className="text-lg text-gray-600 ml-2 dark:text-gray-400">{unit}</p>
	</div>
);

export default function ProductionPage({
	params,
}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const { renderView } = useRecordPage({
		recordId: resolvedParams.id,
		queryHook: useGetProductionRecordByIdQuery,
	});

	return renderView("Production record loading...", (data) => (
		<UniversalRecordPage
			data={data}
			recordType="production"
			backHref="/production-records"
			backLabel="Back to Production Records"
		/>
	));
}
