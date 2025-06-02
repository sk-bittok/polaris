import type {
	LinkOffspring,
	RegisterBreedSchema,
	UpdateBreedSchema,
} from "@/lib/schemas/animal";
import type { LoginFormType, RegisterOrgAndUser } from "@/models/auth";
import type {
	Breed,
	Livestock,
	RegisterLivestock,
	UpdateLivestock,
} from "@/models/livestock";

import type {
	HealthRecordResponse,
	ProductionRecord,
	ProductionRecordResponse,
	HealthRecord,
	WeightRecord,
	WeightRecordResponse,
} from "@/lib/models/records";
import type {
	NewProductRecord,
	NewHealthRecord,
	NewWeightRecord,
} from "@/lib/schemas/records";
import type { RootStore } from "@/redux";
import {
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
	type FetchBaseQueryMeta,
	createApi,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { setCredentials, updateToken } from "./auth";

export interface AuthResponse {
	message: string;
}

export interface GenericResponse {
	message: string;
}

export interface LoginResponse {
	pid: string;
	email: string;
	name: string;
	createdAt: string;
}

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootStore).auth.token;

		if (token) {
			// if the token is expired it leads to a situation where the expired token is
			// still set in the local-storage and thus a user needs to refresh the page so
			// that he can again use the new token.
			// headers.set("Authorization", `Bearer ${token}`);
		}

		return headers;
	},
});

const baseQueryWithRefresh: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError,
	{},
	FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
	// Execute the baseQuery
	const result = await baseQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401) {
		console.log("Expired token, sending request without access token");
	}

	// Compare the access-token or cookie
	if (result.meta?.response) {
		const authHeader = result.meta.response.headers.get("Authorization");

		if (authHeader) {
			const newToken = authHeader.replace("Bearer ", "");
			const state = api.getState() as RootStore;

			if (newToken && newToken !== state.auth.token) {
				// Update the state with the new token
				api.dispatch(updateToken(newToken));
				console.log("Refreshed access token");
			}
		}
	}

	return result;
};

export const api = createApi({
	baseQuery: baseQueryWithRefresh,
	reducerPath: "api",
	tagTypes: [
		"GetBreeds",
		"GetLivestock",
		"GetProductionRecords",
		"GetHealthRecords",
		"GetWeightRecords",
		"GetLineageRecords",
	],
	endpoints: (build) => ({
		registerAdmin: build.mutation<AuthResponse, RegisterOrgAndUser>({
			query: (params) => ({
				url: "/auth/register",
				method: "POST",
				body: params,
			}),
		}),
		loginUser: build.mutation<LoginResponse, LoginFormType>({
			query: (params) => ({
				url: "/auth/login",
				method: "POST",
				body: params,
			}),
			transformResponse: (response: LoginResponse, meta) => {
				const authHeader = meta?.response?.headers.get("Authorization");
				const token = authHeader ? authHeader.replace("Bearer ", "") : null;

				// TODO:// Ideally we would reset the cookies, but the backend already does it for us.
				const cookies = meta?.response?.headers.getSetCookie();
				console.log(cookies);

				return response;
			},

			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				try {
					const { data, meta } = await queryFulfilled;
					const authHeader = meta?.response?.headers.get("Authorization");
					const token = authHeader ? authHeader.replace("Bearer ", "") : null;

					if (token && data) {
						// persist the authstate
						dispatch(setCredentials({ user: data, token }));
					}
				} catch (e) {
					console.log("Login failed ", e);
				}
			},
		}),
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
		updateBreed: build.mutation<Breed, { data: UpdateBreedSchema; id: number }>(
			{
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
				invalidatesTags: ["GetBreeds"],
			},
		),
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
		getLivestockProductionRecord: build.query<
			ProductionRecordResponse[],
			string | null
		>({
			query: (params) => ({
				url:
					params !== null
						? `/production-records?animal=${params}`
						: "/production-records",
			}),
			providesTags: (result, error, id) => [
				{ type: "GetProductionRecords", id },
			],
		}),
		newLivestockProductionRecord: build.mutation<
			ProductionRecord,
			NewProductRecord
		>({
			query: (data) => ({
				url: "/production-records",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["GetProductionRecords"],
		}),
		getLivestockHealthRecords: build.query<
			HealthRecordResponse[],
			string | null
		>({
			query: (params) => ({
				url:
					params !== null
						? `/health-records?animal=${params}`
						: "/health-records",
			}),
			providesTags: (result, error, id) => [{ type: "GetHealthRecords", id }],
		}),
		newLivestockHealthRecord: build.mutation<HealthRecord, NewHealthRecord>({
			query: (data) => ({
				method: "POST",
				url: "/health-records",
				body: data,
			}),
			invalidatesTags: ["GetHealthRecords"],
		}),
		newLivestockWeightRecord: build.mutation<WeightRecord, NewWeightRecord>({
			query: (data) => ({
				url: "/weight-records",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["GetWeightRecords"],
		}),
		getLivestockWeightRecords: build.query<
			WeightRecordResponse[],
			string | null
		>({
			query: (id) => ({
				url: id !== null ? `/weight-records?animal=${id}` : "/weight-records",
			}),
			providesTags: ["GetWeightRecords"],
		}),
		linkOffspring: build.mutation<Livestock, LinkOffspring>({
			query: (data) => ({
				url: "/animals/link-offspring",
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["GetLineageRecords"],
		}),
	}),
});

export const {
	useRegisterAdminMutation,
	useLoginUserMutation,
	useCreateBreedMutation,
	useGetBreedsQuery,
	useGetBreedByIdQuery,
	useDeleteBreedMutation,
	useUpdateBreedMutation,
	useGetLivestockQuery,
	useRegisterLivestockMutation,
	useGetLivestockByIdQuery,
	useGetLivestockDescendantsQuery,
	useDeleteLivestockByIdMutation,
	useUpdateLivestockByIdMutation,
	useGetLivestockByTagIdQuery,
	useGetLivestockProductionRecordQuery,
	useNewLivestockProductionRecordMutation,
	useGetLivestockHealthRecordsQuery,
	useNewLivestockHealthRecordMutation,
	useNewLivestockWeightRecordMutation,
	useGetLivestockWeightRecordsQuery,
	useLinkOffspringMutation,
} = api;
