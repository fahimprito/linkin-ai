import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  buildPurchaseOrder,
  getPurchaseOrders,
  savePurchaseOrders,
} from "@/lib/purchase-orders"
import type {
  CreatePurchaseOrderPayload,
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
          ? { id: order.id, ...action.payload.updates }
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
  deletePurchaseOrder,
} = merchandiseSlice.actions

export default merchandiseSlice.reducer
