import { purchaseOrders as defaultPurchaseOrders } from "@/mock/modules"
import type {
  CreatePurchaseOrderPayload,
  PurchaseOrder,
} from "@/types/modules"

const PURCHASE_ORDERS_STORAGE_KEY = "linkin-ai-admin-purchase-orders"

function canUseStorage() {
  return typeof window !== "undefined"
}

function normalizePurchaseOrder(
  order: PurchaseOrder,
  index: number
): PurchaseOrder {
  const orderNo = order.orderNo || order.poNumber
  const styleName = order.styleName || order.style
  const gauge = order.gauge || order.gg || ""
  const yarn = order.yarn || order.yarnComposition || ""
  const poQty = order.poQty ?? order.quantity
  const price = order.price ?? 0
  const normalizedStatus =
    order.status === "Draft" && order.consumptionStatus === "Requested"
      ? "Consumption Requested"
      : order.status === "Draft" && order.consumptionStatus === "Submitted"
        ? "Pending Yarn Check"
        : order.status

  return {
    ...order,
    sl: order.sl || String(index + 1).padStart(2, "0"),
    styleName,
    orderNo,
    poNumber: order.poNumber || orderNo,
    style: order.style || styleName,
    quantity: order.quantity ?? poQty,
    status: normalizedStatus,
    deliveryDate: order.deliveryDate || order.newCcd || order.ccd || "",
    ccd: order.ccd || order.deliveryDate,
    poQty,
    gauge,
    gg: order.gg || gauge,
    yarn,
    yarnComposition: order.yarnComposition || yarn,
    amount: order.amount ?? (poQty && price ? poQty * price : 0),
    totalYarnKg: order.totalYarnKg,
    totalFabricKg: order.totalFabricKg,
    totalAccessoriesQty: order.totalAccessoriesQty,
    consumptionStatus: undefined,
    consumptionRequestedAt: order.consumptionRequestedAt,
    requiredYarnQty: order.requiredYarnQty ?? order.totalYarnKg,
  }
}

export function getPurchaseOrders() {
  if (!canUseStorage()) {
    return defaultPurchaseOrders.map(normalizePurchaseOrder)
  }

  const storedOrders = window.localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY)

  if (!storedOrders) {
    return defaultPurchaseOrders.map(normalizePurchaseOrder)
  }

  try {
    const parsedOrders = JSON.parse(storedOrders) as PurchaseOrder[]
    const normalizedOrders = parsedOrders.map(normalizePurchaseOrder)

    savePurchaseOrders(normalizedOrders)

    return normalizedOrders
  } catch {
    window.localStorage.removeItem(PURCHASE_ORDERS_STORAGE_KEY)
    return defaultPurchaseOrders.map(normalizePurchaseOrder)
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
  return normalizePurchaseOrder({
    id: `po-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  } satisfies PurchaseOrder, 0)
}

export function createPurchaseOrder(payload: CreatePurchaseOrderPayload) {
  const nextOrder = buildPurchaseOrder(payload)

  const nextOrders = [nextOrder, ...getPurchaseOrders()]

  savePurchaseOrders(nextOrders)

  return nextOrder
}
