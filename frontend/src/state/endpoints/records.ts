import type {
	HealthRecord,
	HealthRecordResponse,
	ProductionRecord,
	ProductionRecordResponse,
	WeightRecord,
	WeightRecordResponse,
} from "@/lib/models/records";
import type {
	NewProductRecord,
	UpdateProductRecord,
	NewHealthRecord,
	UpdateHealthRecord,
	NewWeightRecord,
	UpdateWeightRecord,
} from "@/lib/schemas/records";
import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export const recordsEndpoints = (build: EndpointBuilder<any, any, any>) => ({
	getProductionRecords: build.query<ProductionRecordResponse[], string | null>({
		query: (params) => ({
			url:
				params !== null
					? `/production-records?animal=${params}`
					: "/production-records",
		}),
		providesTags: ["GetProductionRecords"],
	}),
	newProductionRecord: build.mutation<ProductionRecord, NewProductRecord>({
		query: (data) => ({
			url: "/production-records",
			method: "POST",
			body: data,
		}),
		invalidatesTags: ["GetProductionRecords"],
	}),
	getProductionRecordById: build.query<ProductionRecordResponse, number>({
		query: (param) => `/production-records/${param}`,
		providesTags: ["GetProductionRecords"],
	}),
	updateProductionRecordById: build.mutation<
		ProductionRecord,
		{ id: number; data: UpdateProductRecord }
	>({
		query: ({ id, data }) => ({
			url: `/production-records/${id}`,
			method: "PATCH",
			body: data,
		}),
		invalidatesTags: ["GetProductionRecords"],
	}),
	deleteProductionRecordById: build.mutation<void, number>({
		query: (id) => ({
			url: `/production-records/${id}`,
			method: "DELETE",
		}),
		invalidatesTags: ["GetProductionRecords"],
	}),
	getHealthRecords: build.query<HealthRecordResponse[], string | null>({
		query: (params) => ({
			url:
				params !== null
					? `/health-records?animal=${params}`
					: "/health-records",
		}),
		providesTags: ["GetHealthRecords"],
	}),
	newHealthRecord: build.mutation<HealthRecord, NewHealthRecord>({
		query: (data) => ({
			method: "POST",
			url: "/health-records",
			body: data,
		}),
		invalidatesTags: ["GetHealthRecords"],
	}),
	getHealthRecordById: build.query<HealthRecordResponse, number>({
		query: (param) => `/health-records/${param}`,
		providesTags: ["GetHealthRecords"],
	}),
	updateHealthRecordById: build.mutation<
		HealthRecord,
		{ id: number; data: UpdateHealthRecord }
	>({
		query: ({ id, data }) => ({
			url: `/health-records/${id}`,
			method: "PATCH",
			body: data,
		}),
		invalidatesTags: ["GetHealthRecords"],
	}),
	deleteHealthRecordById: build.mutation<void, number>({
		query: (id) => ({
			url: `/health-records/${id}`,
			method: "DELETE",
		}),
		invalidatesTags: ["GetHealthRecords"],
	}),
	newWeightRecord: build.mutation<WeightRecord, NewWeightRecord>({
		query: (data) => ({
			url: "/weight-records",
			method: "POST",
			body: data,
		}),
		invalidatesTags: ["GetWeightRecords"],
	}),
	getWeightRecords: build.query<WeightRecordResponse[], string | null>({
		query: (id) => ({
			url: id !== null ? `/weight-records?animal=${id}` : "/weight-records",
		}),
		providesTags: ["GetWeightRecords"],
	}),
	getWeightRecordById: build.query<WeightRecordResponse, number>({
		query: (param) => `/weight-records/${param}`,
		providesTags: ["GetWeightRecords"],
	}),
	updateWeightRecordById: build.mutation<
		WeightRecord,
		{ id: number; data: UpdateWeightRecord }
	>({
		query: ({ id, data }) => ({
			url: `/weight-records/${id}`,
			method: "PATCH",
			body: data,
		}),
		invalidatesTags: ["GetWeightRecords"],
	}),
	deleteWeightRecordById: build.mutation<void, number>({
		query: (id) => ({
			url: `/weight-records/${id}`,
			method: "DELETE",
		}),
		invalidatesTags: ["GetWeightRecords"],
	}),
});
