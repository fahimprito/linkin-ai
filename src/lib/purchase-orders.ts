import { purchaseOrders as defaultPurchaseOrders } from "@/mock/modules"
import { normalizeLegacyPoStatus } from "@/lib/workflow-status"
import type {
  CreatePurchaseOrderPayload,
  POStatus,
  PurchaseOrder,
} from "@/types/modules"

const PURCHASE_ORDERS_STORAGE_KEY = "linkin-ai-admin-purchase-orders"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getPurchaseOrderDisplayNo(order: PurchaseOrder) {
  return order.poNumber || order.orderNo || ""
}

export function getPurchaseOrderDisplayStyle(order: PurchaseOrder) {
  return order.styleName || order.style || ""
}

export function getPurchaseOrderDisplayGauge(order: PurchaseOrder) {
  return order.gauge || order.gg || ""
}

export function getPurchaseOrderDisplayYarn(order: PurchaseOrder) {
  return order.yarn || order.yarnComposition || order.quality || ""
}

export function getPurchaseOrderDisplayQty(order: PurchaseOrder) {
  return order.poQty ?? order.quantity ?? 0
}

export function getPurchaseOrderDisplayCcd(order: PurchaseOrder) {
  return order.ccd || order.deliveryDate || order.newCcd || ""
}

export function getPurchaseOrderDisplayItemNameCode(order: PurchaseOrder) {
  return order.itemNameCode || order.callNumber || ""
}

export function getPurchaseOrderDisplayAccessories(order: PurchaseOrder) {
  return order.accessories || order.buttonZip || ""
}

export function getPurchaseOrderDisplayProductionUnit(order: PurchaseOrder) {
  return order.productionUnit || order.polyCartonBooking || ""
}

export function getPurchaseOrderDisplayPpStatus(order: PurchaseOrder) {
  return order.ppStatus || order.sampleStatus || ""
}

export function getPurchaseOrderDisplayShipmentSample(order: PurchaseOrder) {
  return order.shipmentSample || order.shipMode || ""
}

function normalizePurchaseOrder(
  order: PurchaseOrder,
  index: number
): PurchaseOrder {
  const orderNo = getPurchaseOrderDisplayNo(order)
  const styleName = getPurchaseOrderDisplayStyle(order)
  const gauge = getPurchaseOrderDisplayGauge(order)
  const yarn = getPurchaseOrderDisplayYarn(order)
  const poQty = getPurchaseOrderDisplayQty(order)
  const price = order.price ?? 0
  const normalizedStatus = normalizeLegacyPoStatus(
    order.status === "Draft" && order.consumptionStatus === "Requested"
      ? "Consumption Requested"
      : order.status === "Draft" && order.consumptionStatus === "Submitted"
        ? "Pending Yarn Check"
        : order.status
  )

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
    ccd: getPurchaseOrderDisplayCcd(order),
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
    workflowHistory:
      order.workflowHistory && order.workflowHistory.length > 0
        ? order.workflowHistory.map((entry) => ({
            ...entry,
            status: normalizeLegacyPoStatus(entry.status),
          }))
        : [
            {
              status: normalizedStatus,
              changedAt: order.createdAt ?? new Date().toISOString(),
              changedBy: "System",
            },
          ],
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
  const initialStatus = (payload.status || "Created") as POStatus

  return normalizePurchaseOrder({
    id: `po-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
    status: initialStatus,
    workflowHistory: [
      {
        status: initialStatus,
        changedAt: new Date().toISOString(),
        changedBy: "Merchandiser",
      },
    ],
  } satisfies PurchaseOrder, 0)
}

export function createPurchaseOrder(payload: CreatePurchaseOrderPayload) {
  const nextOrder = buildPurchaseOrder(payload)

  const nextOrders = [nextOrder, ...getPurchaseOrders()]

  savePurchaseOrders(nextOrders)

  return nextOrder
}
