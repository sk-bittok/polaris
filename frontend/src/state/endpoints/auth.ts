import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { AuthResponse, LoginResponse } from "../types";
import type { LoginFormType, RegisterOrgAndUser } from "@/models/auth";
import { setCredentials } from "../auth";

export const authEndpoints = (build: EndpointBuilder<any, any, any>) => ({
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
					// persist the auth-state
					dispatch(setCredentials({ user: data, token }));
				}
			} catch (e) {
				console.log("Login failed ", e);
			}
		},
	}),
});
