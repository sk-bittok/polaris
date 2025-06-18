import type { LivestockSummary } from "@/lib/models/reports";
import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export const reportEndpoints = (build: EndpointBuilder<any, any, any>) => ({
	getLivestockSummary: build.query<LivestockSummary[], void>({
		query: () => ({
			url: "/reports/livestock",
			method: "GET",
		}),
		providesTags: ["GetLivestockSummary"],
	}),
	generateLivestockSummary: build.mutation<LivestockSummary, void>({
		query: () => ({
			url: "/reports/livestock",
			method: "POST",
		}),
		invalidatesTags: ["GetLivestockSummary", "GetDashboardMetrics"],
	}),
});
