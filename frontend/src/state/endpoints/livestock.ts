import type { LinkOffspring } from "@/lib/schemas/animal";
import type {
	Livestock,
	RegisterLivestock,
	UpdateLivestock,
} from "@/models/livestock";
import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export const livestockEndpoints = (build: EndpointBuilder<any, any, any>) => ({
	getLivestock: build.query<Livestock[], void>({
		query: () => ({ url: "/animals" }),
		providesTags: ["GetLivestock"],
	}),
	getLivestockDescendants: build.query<Livestock[], string>({
		query: (params) => ({ url: `/animals?${params}` }),
		providesTags: ["GetLineageRecords"],
	}),
	registerLivestock: build.mutation<Livestock, RegisterLivestock>({
		query: (json) => ({
			url: "/animals",
			method: "POST",
			body: json,
		}),
		invalidatesTags: ["GetLivestock"],
	}),
	getLivestockById: build.query<Livestock, string>({
		query: (id) => ({ url: `/animals/${id}` }),
		providesTags: (result, error, id) => [{ type: "GetLivestock", id }],
	}),
	getLivestockByTagId: build.query<Livestock, string>({
		query: (tagId) => ({ url: `animals/tag-id/${tagId}` }),
		providesTags: (result, error, id) => [{ type: "GetLivestock", id }],
	}),
	deleteLivestockById: build.mutation<void, string>({
		query: (id) => ({
			url: `/animals/${id}`,
			method: "DELETE",
		}),
		invalidatesTags: ["GetLivestock"],
	}),
	updateLivestockById: build.mutation<
		Livestock,
		{ data: UpdateLivestock; id: string }
	>({
		query: ({ data, id }) => ({
			url: `/animals/${id}`,
			method: "PATCH",
			body: data,
		}),
		invalidatesTags: ["GetBreeds"],
	}),
	linkOffspring: build.mutation<Livestock, LinkOffspring>({
		query: (data) => ({
			url: "/animals/link-offspring",
			method: "PATCH",
			body: data,
		}),
		invalidatesTags: ["GetLineageRecords"],
	}),
});
