import type { RootStore } from "@/redux";
import {
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
	type FetchBaseQueryMeta,
	createApi,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { logout, updateToken } from "./auth";
import { breedEndpoints } from "./endpoints/breeds";
import { authEndpoints } from "./endpoints/auth";
import { livestockEndpoints } from "./endpoints/livestock";
import { recordsEndpoints } from "./endpoints/records";
import { dashboardEndpoints } from "./endpoints/dashboard";
import { reportEndpoints } from "./endpoints/reports";

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootStore).auth.token;

		if (token) {
			// if the token is expired it leads to a situation where the expired token is
			// still set in the local-storage and thus a user needs to refresh the page so
			// that he can again use the new token.
			// A mistmatch between access-token in cookie object
			// and the token set in the local-storage so the HTTP request
			// constains an Authorization header with an expired token
			// whereas the access-cookie is current.
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
		api.dispatch(logout());
		if (typeof window !== "undefined") {
			window.location.href = "/login";
		}
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
		"GetDashboardMetrics",
		"GetLivestockSummary",
	],
	endpoints: (build) => ({
		...authEndpoints(build),
		...breedEndpoints(build),
		...livestockEndpoints(build),
		...recordsEndpoints(build),
		...dashboardEndpoints(build),
		...reportEndpoints(build),
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
	useGetProductionRecordsQuery,
	useNewProductionRecordMutation,
	useGetHealthRecordsQuery,
	useNewHealthRecordMutation,
	useNewWeightRecordMutation,
	useGetWeightRecordsQuery,
	useLinkOffspringMutation,
	useGetProductionRecordByIdQuery,
	useGetHealthRecordByIdQuery,
	useGetWeightRecordByIdQuery,
	useUpdateWeightRecordByIdMutation,
	useUpdateHealthRecordByIdMutation,
	useUpdateProductionRecordByIdMutation,
	useDeleteHealthRecordByIdMutation,
	useDeleteProductionRecordByIdMutation,
	useDeleteWeightRecordByIdMutation,
	useGetDashboardMetricsQuery,
	useGenerateLivestockSummaryMutation,
	useGetLivestockSummaryQuery,
} = api;
