import type {
	RegisterBreedSchema,
	UpdateBreedSchema,
} from "@/lib/schemas/animal";
import type { Breed } from "@/models/livestock";
import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export const breedEndpoints = (build: EndpointBuilder<any, any, any>) => ({
	getBreeds: build.query<Breed[], void>({
		query: () => "/breeds",
		providesTags: ["GetBreeds"],
	}),
	getBreedById: build.query<Breed, number>({
		query: (id) => ({ url: `/breeds/${id}` }),
		providesTags: (result, error, id) => [{ type: "GetBreeds", id }],
	}),
	createBreed: build.mutation<Breed, RegisterBreedSchema>({
		query: (params) => ({
			url: "/breeds",
			method: "POST",
			body: {
				specie: params.specie,
				name: params.name,
				description: params.description,
				typicalMaleWeightRange: params.maleWeightRange,
				typicalFemaleWeightRange: params.femaleWeightRange,
				typicalGestationPeriod: params.gestationPeriod,
			},
		}),
		invalidatesTags: ["GetBreeds"],
	}),
	deleteBreed: build.mutation<void, number>({
		query: (id) => ({
			url: `/breeds/${id}`,
			method: "DELETE",
		}),
		invalidatesTags: ["GetBreeds"],
	}),
	updateBreed: build.mutation<Breed, { data: UpdateBreedSchema; id: number }>({
		query: ({ data, id }) => ({
			url: `/breeds/${id}`,
			method: "PATCH",
			body: {
				specie: data.specie,
				name: data.name,
				description: data.description,
				typicalMaleWeightRange: data.maleWeightRange,
				typicalFemaleWeightRange: data.femaleWeightRange,
				typicalGestationPeriod: data.gestationPeriod,
			},
		}),
		invalidatesTags: (result, error, id) => [{ type: "GetBreeds", id }],
	}),
});
