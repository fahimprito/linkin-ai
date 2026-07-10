import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  buildPurchaseOrder,
  getPurchaseOrders,
  savePurchaseOrders,
} from "@/lib/purchase-orders"
import { merchandisePreBookingMockData } from "@/mock/merchandise-pre-booking"
import type {
  CreatePurchaseOrderPayload,
  POStatus,
  PurchaseOrder,
} from "@/types/modules"
import type {
  MerchandisePreBookingRecord,
  UpsertMerchandisePreBookingPayload,
} from "@/types/merchandise-pre-booking"

const PRE_BOOKING_STORAGE_KEY = "linkin-ai-admin:merchandise-pre-booking"

function appendWorkflowHistory(
  order: PurchaseOrder,
  status: POStatus,
  changedBy = "System"
) {
  const previousStatus = order.workflowHistory?.[order.workflowHistory.length - 1]?.status

  if (previousStatus === status) {
    return order.workflowHistory ?? []
  }

  return [
    ...(order.workflowHistory ?? []),
    {
      status,
      changedAt: new Date().toISOString(),
      changedBy,
    },
  ]
}

function createPreBookingId() {
  return `merch-pre-booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizePreBookingText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function buildPreBookingMatchKey(record: {
  buyerName: string
  gg: string
  inspectionDate: string
}) {
  return [
    normalizePreBookingText(record.buyerName),
    normalizePreBookingText(record.gg),
    normalizePreBookingText(record.inspectionDate),
  ].join("::")
}

function getStoredPreBookings() {
  if (typeof window === "undefined") {
    return merchandisePreBookingMockData
  }

  const stored = window.localStorage.getItem(PRE_BOOKING_STORAGE_KEY)
  if (!stored) {
    return merchandisePreBookingMockData
  }

  try {
    const parsed = JSON.parse(stored) as MerchandisePreBookingRecord[]
    return Array.isArray(parsed) ? parsed : merchandisePreBookingMockData
  } catch {
    return merchandisePreBookingMockData
  }
}

function savePreBookings(records: MerchandisePreBookingRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(PRE_BOOKING_STORAGE_KEY, JSON.stringify(records))
}

function buildPreBookingRecord(
  payload: UpsertMerchandisePreBookingPayload,
  existingRecord?: MerchandisePreBookingRecord
): MerchandisePreBookingRecord {
  return {
    id: existingRecord?.id ?? payload.id ?? createPreBookingId(),
    buyerName: payload.buyerName.trim(),
    gg: String(payload.gg).trim(),
    orderQty: Number(payload.orderQty) || 0,
    inspectionDate: payload.inspectionDate.trim(),
    remarks: payload.remarks.trim(),
    createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
  }
}

type MerchandiseState = {
  purchaseOrders: PurchaseOrder[]
  preBookings: MerchandisePreBookingRecord[]
}

const initialState: MerchandiseState = {
  purchaseOrders: getPurchaseOrders(),
  preBookings: getStoredPreBookings(),
}

const merchandiseSlice = createSlice({
  name: "merchandise",
  initialState,
  reducers: {
    addPurchaseOrder: (
      state,
      action: PayloadAction<CreatePurchaseOrderPayload>
    ) => {
      const nextOrder = buildPurchaseOrder(action.payload)
      state.purchaseOrders.unshift(nextOrder)
      savePurchaseOrders(state.purchaseOrders)
    },
    updatePurchaseOrder: (
      state,
      action: PayloadAction<{
        id: string
        updates: CreatePurchaseOrderPayload
      }>
    ) => {
      state.purchaseOrders = state.purchaseOrders.map((order) =>
        order.id === action.payload.id
          ? {
              ...order,
              ...action.payload.updates,
              id: order.id,
              createdAt: order.createdAt,
              workflowHistory: appendWorkflowHistory(
                order,
                (action.payload.updates.status ?? order.status) as POStatus
              ),
            }
          : order
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    updatePoStatus: (
      state,
      action: PayloadAction<{ id: string; status: POStatus; changedBy?: string }>
    ) => {
      state.purchaseOrders = state.purchaseOrders.map((order) =>
        order.id === action.payload.id
          ? {
              ...order,
              status: action.payload.status,
              workflowHistory: appendWorkflowHistory(
                order,
                action.payload.status,
                action.payload.changedBy
              ),
            }
          : order
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    linkYarnCheckRequest: (
      state,
      action: PayloadAction<{ poId: string; yarnCheckRequestId: string }>
    ) => {
      state.purchaseOrders = state.purchaseOrders.map((order) =>
        order.id === action.payload.poId
          ? {
              ...order,
              yarnCheckRequestId: action.payload.yarnCheckRequestId,
              status: "Sent to Yarn" as POStatus,
              workflowHistory: appendWorkflowHistory(
                order,
                "Sent to Yarn",
                "Design Controller"
              ),
            }
          : order
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    deletePurchaseOrder: (state, action: PayloadAction<string>) => {
      state.purchaseOrders = state.purchaseOrders.filter(
        (order) => order.id !== action.payload
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    requestConsumption: (state, action: PayloadAction<{ id: string }>) => {
      state.purchaseOrders = state.purchaseOrders.map((order) =>
        order.id === action.payload.id
          ? {
              ...order,
              status: "Sent to Design" as POStatus,
              consumptionRequestedAt:
                order.consumptionRequestedAt ?? new Date().toISOString(),
              workflowHistory: appendWorkflowHistory(
                order,
                "Sent to Design",
                "Merchandiser"
              ),
            }
          : order
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    submitConsumption: (
      state,
      action: PayloadAction<{
        id: string
        totalYarnKg: number
        totalFabricKg: number
        totalAccessoriesQty: number
      }>
    ) => {
      state.purchaseOrders = state.purchaseOrders.map((order) =>
        order.id === action.payload.id
          ? {
              ...order,
              totalYarnKg: action.payload.totalYarnKg,
              totalFabricKg: action.payload.totalFabricKg,
              totalAccessoriesQty: action.payload.totalAccessoriesQty,
              requiredYarnQty: action.payload.totalYarnKg,
              consumptionRequestedAt:
                order.consumptionRequestedAt ?? new Date().toISOString(),
              status: "Design Completed" as POStatus,
              workflowHistory: appendWorkflowHistory(
                order,
                "Design Completed",
                "Design Controller"
              ),
            }
          : order
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    addOrUpdatePreBooking: (
      state,
      action: PayloadAction<UpsertMerchandisePreBookingPayload>
    ) => {
      const payload = action.payload
      const explicitIndex = payload.id
        ? state.preBookings.findIndex((record) => record.id === payload.id)
        : -1

      if (explicitIndex >= 0) {
        const existingRecord = state.preBookings[explicitIndex]
        state.preBookings[explicitIndex] = buildPreBookingRecord(payload, existingRecord)
        savePreBookings(state.preBookings)
        return
      }

      const nextMatchKey = buildPreBookingMatchKey(payload)
      const duplicateIndex = state.preBookings.findIndex(
        (record) => buildPreBookingMatchKey(record) === nextMatchKey
      )

      if (duplicateIndex >= 0) {
        const existingRecord = state.preBookings[duplicateIndex]
        state.preBookings[duplicateIndex] = buildPreBookingRecord(payload, existingRecord)
        savePreBookings(state.preBookings)
        return
      }

      state.preBookings.unshift(buildPreBookingRecord(payload))
      savePreBookings(state.preBookings)
    },
    deletePreBooking: (state, action: PayloadAction<string>) => {
      state.preBookings = state.preBookings.filter(
        (record) => record.id !== action.payload
      )
      savePreBookings(state.preBookings)
    },
  },
})

export const {
  addPurchaseOrder,
  updatePurchaseOrder,
  updatePoStatus,
  linkYarnCheckRequest,
  deletePurchaseOrder,
  requestConsumption,
  submitConsumption,
  addOrUpdatePreBooking,
  deletePreBooking,
} = merchandiseSlice.actions

export default merchandiseSlice.reducer
