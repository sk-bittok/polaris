import type { LoginFormType, RegisterOrgAndUser } from "@/models/auth";
import type { Breed } from "@/models/livestock";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthState, setCredentials } from "./auth";

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

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: AuthState }).auth.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include'
  }),

  reducerPath: "api",
  tagTypes: ["GetBreeds"],
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
        const authHeader = meta?.response?.headers.get('Authorization');
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;

        // TODO:// Ideally we would reset the cookies
        const cookies = meta?.response?.headers.getSetCookie();
        console.log(cookies);

        return response;
      },

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          const authHeader = meta?.response?.headers.get('Authorization');
          const token = authHeader ? authHeader.replace('Bearer ', '') : null;


          if (token && data) {
            // persist the authstate
            dispatch(setCredentials({ user: data, token }));
          }

        } catch (e) {
          console.log("Login failed ", e);
        }
      }
    }),
    getBreeds: build.query<Breed[], void>({
      query: () => "/breeds",
      providesTags: ["GetBreeds"],
    })
  }),
});

export const { useRegisterAdminMutation, useLoginUserMutation, useGetBreedsQuery } = api;
