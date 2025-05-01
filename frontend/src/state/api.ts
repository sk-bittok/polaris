import type { LoginForm, RegisterOrgAndUser } from "@/models/auth";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AuthResponse {
    message: string;
}

interface GenericResponse {
    message: string;
}

interface LoginResponse {
    pid: string;
    email: string;
    name: string;
    createdAt: string;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        credentials: 'include'
    }),
    reducerPath: "api",
    tagTypes: [],
    endpoints: (build) => ({
        registerAdmin: build.mutation<AuthResponse, RegisterOrgAndUser>({
            query: (params) => ({
                url: "/auth/register",
                method: "POST",
                body: params,
            }),
        }),
        loginUser: build.mutation<LoginResponse, LoginForm>({
            query: (params) => ({
                url: "/auth/login",
                method: "POST",
                body: params,
            }),
            transformResponse: (response: LoginResponse, meta) => {
                console.table(meta?.response?.headers);
                const cookies = meta?.response?.headers.getSetCookie();
                console.log(cookies);

                return response;
            },
        }),
    }),
});

export const { useRegisterAdminMutation, useLoginUserMutation } = api;
