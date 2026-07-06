import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  buildPurchaseOrder,
  getPurchaseOrders,
  savePurchaseOrders,
} from "@/lib/purchase-orders"
import type {
  CreatePurchaseOrderPayload,
  POStatus,
  PurchaseOrder,
} from "@/types/modules"

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

type MerchandiseState = {
  purchaseOrders: PurchaseOrder[]
}

const initialState: MerchandiseState = {
  purchaseOrders: getPurchaseOrders(),
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
} = merchandiseSlice.actions

export default merchandiseSlice.reducer


