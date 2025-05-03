import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AppState {
  isSidebarCollapsed: boolean,
  isDarkMode: boolean
};

const initialState: AppState = {
  isSidebarCollapsed: false,
  isDarkMode: false
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    }
  }
});

export const { setIsSidebarCollapsed, setIsDarkMode } = globalSlice.actions;

export default globalSlice.reducer;
