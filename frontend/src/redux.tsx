'use client';

import type React from "react";
import { useMemo } from "react";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook, Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import createWebStorage from "redux-persist/es/storage/createWebStorage";

import globalReducer from "@/state";
import { authReducer } from "@/state/auth";
import { api } from "@/state/api";

// REDUX PERSISTENCE
const createNoopStorage = () => {
  return {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};


const storage = typeof window === 'undefined' ? createNoopStorage() : createWebStorage('local');

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['global', 'auth'],
  blacklist: [api.reducerPath]
};

const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// REDUX STORE
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(api.middleware)
  })
};

// REDUX TYPES
export type AppStore = ReturnType<typeof makeStore>;
export type RootStore = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootStore> = useSelector;

const PersistLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading ...</p>
    </div>
  );
};

// PROVIDER
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => makeStore(), []);
  const persistor = useMemo(() => persistStore(store), [store]);

  setupListeners(store.dispatch);
  
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
