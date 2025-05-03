import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginResponse } from "./api";

export interface AuthState {
  token: string | null;
  user: LoginResponse | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: LoginResponse, token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem("token", token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
