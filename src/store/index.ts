import { configureStore } from "@reduxjs/toolkit"

import authReducer from "@/features/auth/auth-slice"
import { baseApi } from "@/services/base-api"
import formSubmissionsReducer from "@/store/slices/form-submissions-slice"
import merchandiseReducer from "@/store/slices/merchandise-slice"
import notificationReducer from "@/store/slices/notification-slice"
import uiReducer from "@/store/slices/ui-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    formSubmissions: formSubmissionsReducer,
    merchandise: merchandiseReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
