import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  demoYarnCheckRequests,
  demoYarnDeliveryBatches,
  demoYarnStockMovements,
  demoYarnSupplierOrders,
} from "@/mock/demo-data"
import type {
  YarnBatchInspectionStatus,
  YarnCheckRequest,
  YarnDeliveryBatch,
  YarnSupplierOrder,
} from "@/types/modules"
import type { YarnStockMovement } from "@/types/production"
import type {
  BatchInspectionUpdatePayload,
  YarnCheckState,
} from "@/types/state"

const KEYS = {
  checkRequests: "linkin-yarn-check-requests",
  supplierOrders: "linkin-yarn-supplier-orders",
  deliveryBatches: "linkin-yarn-delivery-batches",
  stockMovements: "linkin-yarn-stock-movements",
} as const

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }

    const parsed = JSON.parse(raw) as T[]
    return parsed.length > 0 ? parsed : fallback
  } catch {
    window.localStorage.removeItem(key)
    return fallback
  }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(data))
}

const initialState: YarnCheckState = {
  checkRequests: load<YarnCheckRequest>(KEYS.checkRequests, demoYarnCheckRequests),
  supplierOrders: load<YarnSupplierOrder>(KEYS.supplierOrders, demoYarnSupplierOrders),
  deliveryBatches: load<YarnDeliveryBatch>(KEYS.deliveryBatches, demoYarnDeliveryBatches),
  stockMovements: load<YarnStockMovement>(KEYS.stockMovements, demoYarnStockMovements),
}

const yarnCheckSlice = createSlice({
  name: "yarnCheck",
  initialState,
  reducers: {
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
    updateSupplierOrder: (
      state,
      action: PayloadAction<{
        id: string
        updates: Partial<YarnSupplierOrder>
      }>
    ) => {
      state.supplierOrders = state.supplierOrders.map((order) =>
        order.id === action.payload.id
          ? {
              ...order,
              ...action.payload.updates,
              id: order.id,
            }
          : order
      )
      save(KEYS.supplierOrders, state.supplierOrders)
    },
    addDeliveryBatch: (state, action: PayloadAction<YarnDeliveryBatch>) => {
      state.deliveryBatches.unshift(action.payload)
      save(KEYS.deliveryBatches, state.deliveryBatches)
    },
    addStockMovement: (state, action: PayloadAction<YarnStockMovement>) => {
      state.stockMovements.unshift(action.payload)
      save(KEYS.stockMovements, state.stockMovements)
    },
    updateBatchInspectionStatus: (
      state,
      action: PayloadAction<BatchInspectionUpdatePayload>
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
  updateSupplierOrder,
  updateSupplierOrderStatus,
  addDeliveryBatch,
  addStockMovement,
  updateBatchInspectionStatus,
} = yarnCheckSlice.actions

export default yarnCheckSlice.reducer

