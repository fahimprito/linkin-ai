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
  },
})

export const { addPurchaseOrder } = merchandiseSlice.actions

export default merchandiseSlice.reducer
