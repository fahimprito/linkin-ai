import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "Auth",
    "Dashboard",
    "Merchandise",
    "Yarn",
    "Store",
    "Knitting",
    "Linking",
    "Finishing",
    "Reports",
  ],
  endpoints: () => ({}),
})
