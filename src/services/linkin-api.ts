import { baseApi } from "@/services/base-api"
import {
  createPurchaseOrder,
  getPurchaseOrders,
} from "@/lib/purchase-orders"
import { buildMockSession, mockUsers } from "@/mock/auth"
import {
  dashboardMetrics,
  inventoryAlerts,
  moduleSummaries,
  recentActivities,
  yarnInspectionRecords,
} from "@/mock/modules"
import type {
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  Session,
} from "@/types/auth"
import type { CreatePurchaseOrderPayload } from "@/types/modules"

const wait = (duration = 350) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })

export const linkinApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<Session, LoginPayload>({
      async queryFn(credentials) {
        await wait()

        const matchedUser = mockUsers.find(
          (user) =>
            user.email.toLowerCase() === credentials.email.toLowerCase() &&
            user.password === credentials.password
        )

        if (!matchedUser) {
          return {
            error: {
              status: 401,
              data: { message: "Invalid email or password." },
            },
          }
        }

        const { password: _password, ...user } = matchedUser
        return { data: buildMockSession(user) }
      },
    }),
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordPayload>({
      async queryFn(payload) {
        await wait()

        return {
          data: {
            message: `Password reset instructions sent to ${payload.email}.`,
          },
        }
      },
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordPayload>({
      async queryFn(payload) {
        await wait()

        if (payload.password !== payload.confirmPassword) {
          return {
            error: {
              status: 400,
              data: { message: "Passwords do not match." },
            },
          }
        }

        return {
          data: {
            message: "Password reset successful. You can log in now.",
          },
        }
      },
    }),
    getExecutiveDashboard: builder.query({
      queryFn: async () => {
        await wait()
        return {
          data: {
            metrics: dashboardMetrics,
            activities: recentActivities,
            inventory: inventoryAlerts,
            orders: getPurchaseOrders(),
          },
        }
      },
      providesTags: ["Dashboard"],
    }),
    getMerchandiseOrders: builder.query({
      queryFn: async () => {
        await wait()
        return { data: getPurchaseOrders() }
      },
      providesTags: ["Merchandise"],
    }),
    createMerchandiseOrder: builder.mutation({
      async queryFn(payload: CreatePurchaseOrderPayload) {
        await wait()
        return {
          data: createPurchaseOrder(payload),
        }
      },
      invalidatesTags: ["Dashboard", "Merchandise"],
    }),
    getPurchaseOrderById: builder.query({
      queryFn: async (poId: string) => {
        await wait()
        const matchedOrder = getPurchaseOrders().find((order) => order.id === poId)

        if (!matchedOrder) {
          return {
            error: {
              status: 404,
              data: { message: "Purchase order not found." },
            },
          }
        }

        return {
          data: {
            ...matchedOrder,
            buyerInfo: "Global sourcing team aligned with revised shipment window.",
            designLayout: "Striped knit layout with chest branding and contrast rib cuff.",
            approvalInfo: "Color lab dip approved. Artwork revision 03 completed.",
            technicalPack: "Gauge 12, combed cotton, ribbed cuff, anti-pilling finish.",
            productionTimeline: [
              "PO created",
              "Yarn request issued",
              "Knitting in progress",
              "Linking planned",
              "Finishing scheduled",
            ],
            relatedDocuments: [
              "Tech Pack v3.pdf",
              "Artwork Approval.png",
              "Shipment Checklist.xlsx",
            ],
          },
        }
      },
      providesTags: ["Merchandise"],
    }),
    getYarnModule: builder.query({
      queryFn: async () => {
        await wait()
        return {
          data: {
            ...moduleSummaries.yarn,
            inspections: yarnInspectionRecords,
          },
        }
      },
      providesTags: ["Yarn"],
    }),
    getStoreModule: builder.query({
      queryFn: async () => {
        await wait()
        return { data: moduleSummaries.store }
      },
      providesTags: ["Store"],
    }),
    getKnittingModule: builder.query({
      queryFn: async () => {
        await wait()
        return { data: moduleSummaries.knitting }
      },
      providesTags: ["Knitting"],
    }),
    getLinkingModule: builder.query({
      queryFn: async () => {
        await wait()
        return { data: moduleSummaries.linking }
      },
      providesTags: ["Linking"],
    }),
    getFinishingModule: builder.query({
      queryFn: async () => {
        await wait()
        return { data: moduleSummaries.finishing }
      },
      providesTags: ["Finishing"],
    }),
    getReportsModule: builder.query({
      queryFn: async () => {
        await wait()
        return { data: moduleSummaries.reports }
      },
      providesTags: ["Reports"],
    }),
  }),
})

export const {
  useCreateMerchandiseOrderMutation,
  useForgotPasswordMutation,
  useGetExecutiveDashboardQuery,
  useGetFinishingModuleQuery,
  useGetKnittingModuleQuery,
  useGetLinkingModuleQuery,
  useGetMerchandiseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useGetReportsModuleQuery,
  useGetStoreModuleQuery,
  useGetYarnModuleQuery,
  useLoginMutation,
  useResetPasswordMutation,
} = linkinApi
