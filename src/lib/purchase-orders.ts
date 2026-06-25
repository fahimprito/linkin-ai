import { purchaseOrders as defaultPurchaseOrders } from "@/mock/modules"
import type {
  CreatePurchaseOrderPayload,
  PurchaseOrder,
} from "@/types/modules"

const PURCHASE_ORDERS_STORAGE_KEY = "linkin-ai-admin-purchase-orders"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getPurchaseOrders() {
  if (!canUseStorage()) {
    return defaultPurchaseOrders
  }

  const storedOrders = window.localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY)

  if (!storedOrders) {
    return defaultPurchaseOrders
  }

  try {
    return JSON.parse(storedOrders) as PurchaseOrder[]
  } catch {
    window.localStorage.removeItem(PURCHASE_ORDERS_STORAGE_KEY)
    return defaultPurchaseOrders
  }
}

export function savePurchaseOrders(orders: PurchaseOrder[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    PURCHASE_ORDERS_STORAGE_KEY,
    JSON.stringify(orders)
  )
}

export function buildPurchaseOrder(payload: CreatePurchaseOrderPayload) {
  return {
    id: `po-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  } satisfies PurchaseOrder
}

export function createPurchaseOrder(payload: CreatePurchaseOrderPayload) {
  const nextOrder = buildPurchaseOrder(payload)

  const nextOrders = [nextOrder, ...getPurchaseOrders()]

  savePurchaseOrders(nextOrders)

  return nextOrder
}
