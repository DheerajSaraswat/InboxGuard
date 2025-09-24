import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import draftReducer from "./slices/draftSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  draft: draftReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "theme", "draft"], // persist only these
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);