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
          ? { id: order.id, createdAt: order.createdAt, ...action.payload.updates }
          : order
      )
      savePurchaseOrders(state.purchaseOrders)
    },
    updatePoStatus: (
      state,
      action: PayloadAction<{ id: string; status: POStatus }>
    ) => {
      state.purchaseOrders = state.purchaseOrders.map((order) =>
        order.id === action.payload.id
          ? { ...order, status: action.payload.status }
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
              status: "Pending Yarn Check" as POStatus,
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
  },
})

export const {
  addPurchaseOrder,
  updatePurchaseOrder,
  updatePoStatus,
  linkYarnCheckRequest,
  deletePurchaseOrder,
} = merchandiseSlice.actions

export default merchandiseSlice.reducer
