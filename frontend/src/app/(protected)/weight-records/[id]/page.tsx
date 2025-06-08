"use client";

import { UniversalRecordPage } from "@/components/protected/records";
import { useRecordPage } from "@/lib/hooks";
import { useGetWeightRecordByIdQuery } from "@/state/api";
import { use } from "react";

export default function WeightRecordPage({
	params,
}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const { renderView } = useRecordPage({
		recordId: resolvedParams.id,
		queryHook: useGetWeightRecordByIdQuery,
	});

	return renderView("Weight record loading...", (data) => (
		<UniversalRecordPage
			data={data}
			recordType="weight"
			backHref="/weight-records"
			backLabel="Back to Weight Records"
		/>
	));
}
