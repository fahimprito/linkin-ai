import { demoPurchaseOrders as defaultPurchaseOrders } from "@/mock/demo-data"
import { normalizeLegacyPoStatus } from "@/lib/workflow-status"
import type {
  CreatePurchaseOrderPayload,
  POStatus,
  PurchaseOrder,
  PurchaseOrderWorkflowHistoryEntry,
} from "@/types/modules"

const PURCHASE_ORDERS_STORAGE_KEY = "linkin-ai-admin-purchase-orders"

function canUseStorage() {
  return typeof window !== "undefined"
}

type LegacyPurchaseOrderInput = Omit<
  Partial<PurchaseOrder>,
  "status" | "workflowHistory"
> & {
  status?: string
  workflowHistory?: Array<
    Omit<PurchaseOrderWorkflowHistoryEntry, "status"> & {
      status: string
    }
  >
  consumptionStatus?: "Not Requested" | "Requested" | "Submitted"
  sl?: string
  callNumber?: string
  orderNo?: string
  polyCartonBooking?: string
  buttonZip?: string
  sampleStatus?: string
  shipMode?: string
  gg?: string
  yarnComposition?: string
  newCcd?: string
  price?: number
  amount?: number
}

function getStringValue(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() || ""
}

function getNumberValue(...values: Array<number | undefined>) {
  return values.find((value) => typeof value === "number" && Number.isFinite(value))
}

export function getPurchaseOrderDisplayNo(order: PurchaseOrder) {
  return order.poNumber
}

export function getPurchaseOrderDisplayStyle(order: PurchaseOrder) {
  return order.styleName || order.style
}

export function getPurchaseOrderDisplayGauge(order: PurchaseOrder) {
  return order.gauge || ""
}

export function getPurchaseOrderDisplayYarn(order: PurchaseOrder) {
  return order.yarn || order.quality || ""
}

export function getPurchaseOrderDisplayQty(order: PurchaseOrder) {
  return order.poQty ?? order.quantity
}

export function getPurchaseOrderDisplayCcd(order: PurchaseOrder) {
  return order.ccd || order.deliveryDate
}

export function getPurchaseOrderDisplayItemNameCode(order: PurchaseOrder) {
  return order.itemNameCode || ""
}

export function getPurchaseOrderDisplayItemName(order: PurchaseOrder) {
  const itemNameCode = getPurchaseOrderDisplayItemNameCode(order)
  if (!itemNameCode) {
    return ""
  }

  const [itemName] = itemNameCode.split("/").map((value) => value.trim())
  return itemName || itemNameCode
}

export function getPurchaseOrderDisplayItemCode(order: PurchaseOrder) {
  const itemNameCode = getPurchaseOrderDisplayItemNameCode(order)
  if (!itemNameCode || !itemNameCode.includes("/")) {
    return ""
  }

  const segments = itemNameCode.split("/").map((value) => value.trim()).filter(Boolean)
  return segments.at(-1) || ""
}

export function getPurchaseOrderDisplayAccessories(order: PurchaseOrder) {
  return order.accessories || ""
}

export function getPurchaseOrderDisplayProductionUnit(order: PurchaseOrder) {
  return order.productionUnit || ""
}

export function getPurchaseOrderDisplayPpStatus(order: PurchaseOrder) {
  return order.ppStatus || ""
}

export function getPurchaseOrderDisplayShipmentSample(order: PurchaseOrder) {
  return order.shipmentSample || ""
}

export function getResolvedPurchaseOrderBuyer(
  order: PurchaseOrder | null | undefined,
  purchaseOrders: PurchaseOrder[]
) {
  if (order?.buyer?.trim()) {
    return order.buyer.trim()
  }

  const styleNo = order?.styleNo?.trim().toLowerCase()
  if (styleNo) {
    const styleNoMatch = purchaseOrders.find(
      (candidate) =>
        candidate.id !== order?.id &&
        candidate.styleNo?.trim().toLowerCase() === styleNo &&
        candidate.buyer?.trim()
    )

    if (styleNoMatch?.buyer?.trim()) {
      return styleNoMatch.buyer.trim()
    }
  }

  const styleName = order ? getPurchaseOrderDisplayStyle(order).trim().toLowerCase() : ""
  if (styleName) {
    const styleMatch = purchaseOrders.find(
      (candidate) =>
        candidate.id !== order?.id &&
        getPurchaseOrderDisplayStyle(candidate).trim().toLowerCase() === styleName &&
        candidate.buyer?.trim()
    )

    if (styleMatch?.buyer?.trim()) {
      return styleMatch.buyer.trim()
    }
  }

  return ""
}

function backfillMissingBuyers(purchaseOrders: PurchaseOrder[]) {
  return purchaseOrders.map((order) => {
    const resolvedBuyer = getResolvedPurchaseOrderBuyer(order, purchaseOrders)

    if (!resolvedBuyer || order.buyer === resolvedBuyer) {
      return order
    }

    return {
      ...order,
      buyer: resolvedBuyer,
    }
  })
}

function normalizePurchaseOrder(
  order: LegacyPurchaseOrderInput,
  index: number
): PurchaseOrder {
  const createdAt = getStringValue(order.createdAt) || new Date().toISOString()
  const poNumber = getStringValue(order.poNumber, order.orderNo)
  const styleName = getStringValue(order.styleName, order.style)
  const gauge = getStringValue(order.gauge, order.gg)
  const yarn = getStringValue(order.yarn, order.yarnComposition, order.quality)
  const poQty = getNumberValue(order.poQty, order.quantity) ?? 0
  const ccd = getStringValue(order.ccd, order.deliveryDate, order.newCcd)
  const itemNameCode = getStringValue(order.itemNameCode, order.callNumber)
  const accessories = getStringValue(order.accessories, order.buttonZip)
  const productionUnit = getStringValue(
    order.productionUnit,
    order.polyCartonBooking
  )
  const ppStatus = getStringValue(order.ppStatus, order.sampleStatus)
  const shipmentSample = getStringValue(
    order.shipmentSample,
    order.shipMode
  )
  const requiredYarnQty = getNumberValue(
    order.requiredYarnQty,
    order.totalYarnKg
  )
  const normalizedStatus = normalizeLegacyPoStatus(
    order.status === "Draft" && order.consumptionStatus === "Requested"
      ? "Consumption Requested"
      : order.status === "Draft" && order.consumptionStatus === "Submitted"
        ? "Pending Yarn Check"
        : order.status || "Created"
  )

  return {
    id: getStringValue(order.id) || `po-${String(index + 1).padStart(3, "0")}`,
    poNumber,
    buyer: getStringValue(order.buyer),
    style: getStringValue(order.style, styleName),
    design: getStringValue(order.design),
    quantity: getNumberValue(order.quantity, poQty) ?? 0,
    status: normalizedStatus,
    supplier: getStringValue(order.supplier),
    deliveryDate: getStringValue(order.deliveryDate, ccd),
    createdAt,
    ...(styleName ? { styleName } : {}),
    ...(order.styleNo ? { styleNo: order.styleNo } : {}),
    ...(productionUnit ? { productionUnit } : {}),
    ...(ccd ? { ccd } : {}),
    poQty,
    ...(yarn ? { quality: getStringValue(order.quality, yarn) } : {}),
    ...(gauge ? { gauge } : {}),
    ...(yarn ? { yarn } : {}),
    ...(itemNameCode ? { itemNameCode } : {}),
    ...(accessories ? { accessories } : {}),
    ...(ppStatus ? { ppStatus } : {}),
    ...(shipmentSample ? { shipmentSample } : {}),
    ...(order.remarks ? { remarks: order.remarks } : {}),
    ...(order.yarnEta ? { yarnEta: order.yarnEta } : {}),
    ...(typeof order.totalYarnKg === "number"
      ? { totalYarnKg: order.totalYarnKg }
      : {}),
    ...(typeof order.totalFabricKg === "number"
      ? { totalFabricKg: order.totalFabricKg }
      : {}),
    ...(typeof order.totalAccessoriesQty === "number"
      ? { totalAccessoriesQty: order.totalAccessoriesQty }
      : {}),
    ...(order.consumptionRequestedAt
      ? { consumptionRequestedAt: order.consumptionRequestedAt }
      : {}),
    ...(order.color ? { color: order.color } : {}),
    ...(requiredYarnQty !== undefined ? { requiredYarnQty } : {}),
    ...(order.yarnCheckRequestId
      ? { yarnCheckRequestId: order.yarnCheckRequestId }
      : {}),
    workflowHistory:
      order.workflowHistory && order.workflowHistory.length > 0
        ? order.workflowHistory.map((entry) => ({
            ...entry,
            status: normalizeLegacyPoStatus(entry.status),
          }))
        : [
            {
              status: normalizedStatus,
              changedAt: createdAt,
              changedBy: "System",
            },
          ],
  }
}

export function getPurchaseOrders() {
  if (!canUseStorage()) {
    return backfillMissingBuyers(defaultPurchaseOrders.map(normalizePurchaseOrder))
  }

  const storedOrders = window.localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY)

  if (!storedOrders) {
    return backfillMissingBuyers(defaultPurchaseOrders.map(normalizePurchaseOrder))
  }

  try {
    const parsedOrders = JSON.parse(storedOrders) as LegacyPurchaseOrderInput[]
    const normalizedOrders = backfillMissingBuyers(
      parsedOrders.map(normalizePurchaseOrder)
    )

    if (normalizedOrders.length === 0) {
      return backfillMissingBuyers(defaultPurchaseOrders.map(normalizePurchaseOrder))
    }

    savePurchaseOrders(normalizedOrders)

    return normalizedOrders
  } catch {
    window.localStorage.removeItem(PURCHASE_ORDERS_STORAGE_KEY)
    return backfillMissingBuyers(defaultPurchaseOrders.map(normalizePurchaseOrder))
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


