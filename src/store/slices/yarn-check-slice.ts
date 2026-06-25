import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  YarnCheckRequest,
  YarnSupplierOrder,
  YarnDeliveryBatch,
  YarnBatchInspectionStatus,
} from "@/types/modules"

// ── localStorage helpers ─────────────────────────────────────────────
const KEYS = {
  checkRequests: "linkin-yarn-check-requests",
  supplierOrders: "linkin-yarn-supplier-orders",
  deliveryBatches: "linkin-yarn-delivery-batches",
} as const

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    window.localStorage.removeItem(key)
    return []
  }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(data))
}

// ── State ────────────────────────────────────────────────────────────
type YarnCheckState = {
  checkRequests: YarnCheckRequest[]
  supplierOrders: YarnSupplierOrder[]
  deliveryBatches: YarnDeliveryBatch[]
}

const initialState: YarnCheckState = {
  checkRequests: load<YarnCheckRequest>(KEYS.checkRequests),
  supplierOrders: load<YarnSupplierOrder>(KEYS.supplierOrders),
  deliveryBatches: load<YarnDeliveryBatch>(KEYS.deliveryBatches),
}

// ── Slice ────────────────────────────────────────────────────────────
const yarnCheckSlice = createSlice({
  name: "yarnCheck",
  initialState,
  reducers: {
    // ── Yarn Check Requests ────────────────────────────────────────
    addCheckRequest: (state, action: PayloadAction<YarnCheckRequest>) => {
      state.checkRequests.unshift(action.payload)
      save(KEYS.checkRequests, state.checkRequests)
    },
    updateCheckRequestStatus: (
      state,
      action: PayloadAction<{
        id: string
        status: YarnCheckRequest["status"]
      }>
    ) => {
      state.checkRequests = state.checkRequests.map((req) =>
        req.id === action.payload.id
          ? { ...req, status: action.payload.status }
          : req
      )
      save(KEYS.checkRequests, state.checkRequests)
    },

    // ── Supplier Orders ────────────────────────────────────────────
    addSupplierOrder: (state, action: PayloadAction<YarnSupplierOrder>) => {
      state.supplierOrders.unshift(action.payload)
      save(KEYS.supplierOrders, state.supplierOrders)
    },
    updateSupplierOrderStatus: (
      state,
      action: PayloadAction<{
        id: string
        status: YarnSupplierOrder["status"]
      }>
    ) => {
      state.supplierOrders = state.supplierOrders.map((order) =>
        order.id === action.payload.id
          ? { ...order, status: action.payload.status }
          : order
      )
      save(KEYS.supplierOrders, state.supplierOrders)
    },

    // ── Delivery Batches ───────────────────────────────────────────
    addDeliveryBatch: (state, action: PayloadAction<YarnDeliveryBatch>) => {
      state.deliveryBatches.unshift(action.payload)
      save(KEYS.deliveryBatches, state.deliveryBatches)
    },
    updateBatchInspectionStatus: (
      state,
      action: PayloadAction<{
        id: string
        inspectionStatus: YarnBatchInspectionStatus
        inspectedBy?: string
        inspectedAt?: string
        testReportName?: string
        rejectionReason?: string
        remarks?: string
      }>
    ) => {
      state.deliveryBatches = state.deliveryBatches.map((batch) =>
        batch.id === action.payload.id
          ? {
              ...batch,
              inspectionStatus: action.payload.inspectionStatus,
              inspectedBy: action.payload.inspectedBy ?? batch.inspectedBy,
              inspectedAt: action.payload.inspectedAt ?? batch.inspectedAt,
              testReportName:
                action.payload.testReportName ?? batch.testReportName,
              rejectionReason:
                action.payload.rejectionReason ?? batch.rejectionReason,
              remarks: action.payload.remarks ?? batch.remarks,
            }
          : batch
      )
      save(KEYS.deliveryBatches, state.deliveryBatches)
    },
  },
})

export const {
  addCheckRequest,
  updateCheckRequestStatus,
  addSupplierOrder,
  updateSupplierOrderStatus,
  addDeliveryBatch,
  updateBatchInspectionStatus,
} = yarnCheckSlice.actions

export default yarnCheckSlice.reducer
