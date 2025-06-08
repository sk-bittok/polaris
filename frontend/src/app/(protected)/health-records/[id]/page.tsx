"use client";

import { UniversalRecordPage } from "@/components/protected/records";
import { useRecordPage } from "@/lib/hooks";
import { useGetHealthRecordByIdQuery } from "@/state/api";
import { use } from "react";

export default function HealthRecordPage({
	params,
}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const { renderView } = useRecordPage({
		recordId: resolvedParams.id,
		queryHook: useGetHealthRecordByIdQuery,
	});

	return renderView("Health record loading...", (data) => (
		<UniversalRecordPage
			data={data}
			recordType="health"
			backHref="/health-records"
			backLabel="Back to Health Records"
		/>
	));
}
