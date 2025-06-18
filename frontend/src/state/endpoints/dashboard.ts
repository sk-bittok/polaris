import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { Livestock } from "@/models/livestock";
import type { HealthRecordResponse } from "@/lib/models/records";
import type { LivestockSummary } from "@/lib/models/reports";

export interface DashboardResponse {
	livestock: Livestock[];
	health: HealthRecordResponse[];
	livestockSummary: LivestockSummary[];
}

export const dashboardEndpoints = (build: EndpointBuilder<any, any, any>) => ({
	getDashboardMetrics: build.query<DashboardResponse, void>({
		query: () => ({ url: "/dashboard", method: "GET" }),
		providesTags: ["GetDashboardMetrics"],
	}),
});
