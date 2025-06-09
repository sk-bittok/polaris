"use client";

import { UniversalRecordPage } from "@/components/protected/records";
import { useGetProductionRecordByIdQuery } from "@/state/api";
import { use } from "react";
import { useRecordPage } from "@/lib/hooks";

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
