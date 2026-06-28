import type { YarnStockMovement } from "@/types/production"
import { getStoredAccessoryReceipts } from "@/lib/store-accessories"
import {
  deriveStoreWorkflowStatus,
  getStoredStoreControllerRecords,
} from "@/lib/store-controller"
import type {
  PurchaseOrder,
  StoreAccessoryReceipt,
  StoreControllerPoRecord,
  YarnBatchInspectionStatus,
  YarnSupplierOrder,
} from "@/types/modules"

export type PurchaseOrderWorkflowMetrics = {
  yarnSupplierByPo: Record<string, string | undefined>
  yarnEtaByPo: Record<string, string | undefined>
  yarnInspectionDateByPo: Record<string, string | undefined>
  yarnInspectionStatusByPo: Record<string, string | undefined>
  yarnIssuedQtyByPo: Record<string, number>
  yarnReceivedQtyByPo: Record<string, number>
  yarnStockBalanceByPo: Record<string, number>
  inventoryStatusByPo: Record<string, string | undefined>
  storeInspectionDateByPo: Record<string, string | undefined>
  storeInspectionStatusByPo: Record<string, string | undefined>
  storeReceivedQtyByPo: Record<string, number>
  storeIssuedQtyByPo: Record<string, number>
  storeStockBalanceByPo: Record<string, number>
  storeSupplierByPo: Record<string, string | undefined>
  storeEtaByPo: Record<string, string | undefined>
}

type DeliveryBatchLike = {
  poId: string
  deliveryDate: string
  quantity: number
  inspectionStatus: YarnBatchInspectionStatus
  inspectedAt?: string
}

function getLatestYarnSupplierOrderByPo(
  poId: string,
  supplierOrders: YarnSupplierOrder[]
) {
  return supplierOrders
    .filter(
      (order) =>
        (order.itemCategory ?? "Yarn") === "Yarn" && order.poId === poId
    )
    .sort((left, right) => {
      const leftDate = left.orderedAt || left.expectedArrival || ""
      const rightDate = right.orderedAt || right.expectedArrival || ""
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]
}

function resolveInventoryStatus(input: {
  order: PurchaseOrder
  supplierOrderStatus?: YarnSupplierOrder["status"]
  inspectionStatus?: string
  receivedQty: number
  issuedQty: number
  stockBalance: number
}) {
  const {
    order,
    supplierOrderStatus,
    inspectionStatus,
    receivedQty,
    issuedQty,
    stockBalance,
  } = input
  const requiredQty = order.totalYarnKg ?? order.requiredYarnQty ?? 0

  if (inspectionStatus === "Rejected") {
    return "Rejected"
  }

  if (receivedQty <= 0) {
    return supplierOrderStatus === "Ordered" ||
      supplierOrderStatus === "In Transit" ||
      order.status === "Sent to Yarn" ||
      order.status === "Yarn Processing"
      ? "In Transit"
      : "Pending Receipt"
  }

  if (stockBalance <= 0 && issuedQty > 0) {
    return "Depleted"
  }

  if (stockBalance <= 0) {
    return "No Stock"
  }

  if (requiredQty > 0 && stockBalance < requiredQty) {
    return "Partial Stock"
  }

  if (inspectionStatus === "Accepted" || inspectionStatus === "Inspected") {
    return "Available"
  }

  if (inspectionStatus === "Received" || inspectionStatus === "Pending") {
    return "Under Inspection"
  }

  return "Available"
}

function resolveStoreInventoryStatus(input: {
  order: PurchaseOrder
  inspectionStatus?: string
  receivedQty: number
  issuedQty: number
  stockBalance: number
}) {
  const { order, inspectionStatus, receivedQty, issuedQty, stockBalance } = input
  const requiredQty = order.totalAccessoriesQty ?? 0

  if (inspectionStatus === "Rejected") {
    return "Rejected"
  }

  if (receivedQty <= 0) {
    return "Pending Receipt"
  }

  if (issuedQty > 0 && stockBalance <= 0) {
    return "Issued to Production"
  }

  if (stockBalance <= 0) {
    return "No Stock"
  }

  if (requiredQty > 0 && stockBalance < requiredQty) {
    return "Partial Stock"
  }

  if (inspectionStatus === "Approved") {
    return "Available"
  }

  if (
    inspectionStatus === "Received" ||
    inspectionStatus === "Inspected" ||
    inspectionStatus === "Pending"
  ) {
    return "Under Inspection"
  }

  return "Available"
}

export function getLatestInspectionStatusByPo(
  poId: string,
  deliveryBatches: DeliveryBatchLike[]
): YarnBatchInspectionStatus | "Pending" {
  const latestBatch = deliveryBatches
    .filter((batch) => batch.poId === poId)
    .sort((left, right) => {
      const leftDate = left.inspectedAt ?? left.deliveryDate
      const rightDate = right.inspectedAt ?? right.deliveryDate
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]

  return latestBatch?.inspectionStatus ?? "Pending"
}

export function createPurchaseOrderWorkflowMetrics(input: {
  purchaseOrders: PurchaseOrder[]
  deliveryBatches: DeliveryBatchLike[]
  stockMovements: YarnStockMovement[]
  supplierOrders?: YarnSupplierOrder[]
  storeControllerRecords?: StoreControllerPoRecord[]
  storeReceipts?: StoreAccessoryReceipt[]
}): PurchaseOrderWorkflowMetrics {
  const {
    purchaseOrders,
    deliveryBatches,
    stockMovements,
    supplierOrders = [],
    storeControllerRecords = getStoredStoreControllerRecords(),
    storeReceipts = getStoredAccessoryReceipts(),
  } = input

  const yarnSupplierByPo: Record<string, string | undefined> = {}
  const yarnEtaByPo: Record<string, string | undefined> = {}
  const yarnReceivedQtyByPo: Record<string, number> = {}
  const yarnIssuedQtyByPo: Record<string, number> = {}
  const yarnInspectionStatusByPo: Record<string, string | undefined> = {}
  const yarnInspectionDateByPo: Record<string, string | undefined> = {}

  deliveryBatches.forEach((batch) => {
    yarnReceivedQtyByPo[batch.poId] =
      (yarnReceivedQtyByPo[batch.poId] ?? 0) + batch.quantity

    const currentInspectionDate = yarnInspectionDateByPo[batch.poId]
    const nextInspectionDate = batch.inspectedAt ?? batch.deliveryDate

    if (
      !currentInspectionDate ||
      new Date(nextInspectionDate).getTime() >=
        new Date(currentInspectionDate).getTime()
    ) {
      yarnInspectionDateByPo[batch.poId] = nextInspectionDate
      yarnInspectionStatusByPo[batch.poId] = batch.inspectionStatus
    }
  })

  stockMovements
    .filter((movement) => movement.movementType === "Issued to Knitting")
    .forEach((movement) => {
      yarnIssuedQtyByPo[movement.poId] =
        (yarnIssuedQtyByPo[movement.poId] ?? 0) + movement.quantity
    })

  const yarnStockBalanceByPo: Record<string, number> = {}
  const inventoryStatusByPo: Record<string, string | undefined> = {}
  const storeInspectionDateByPo: Record<string, string | undefined> = {}
  const storeInspectionStatusByPo: Record<string, string | undefined> = {}
  const storeReceivedQtyByPo: Record<string, number> = {}
  const storeIssuedQtyByPo: Record<string, number> = {}
  const storeStockBalanceByPo: Record<string, number> = {}
  const storeSupplierByPo: Record<string, string | undefined> = {}
  const storeEtaByPo: Record<string, string | undefined> = {}

  storeReceipts.forEach((receipt) => {
    storeReceivedQtyByPo[receipt.poId] =
      (storeReceivedQtyByPo[receipt.poId] ?? 0) + receipt.quantity
  })

  purchaseOrders.forEach((order) => {
    const latestSupplierOrder = getLatestYarnSupplierOrderByPo(
      order.id,
      supplierOrders
    )
    const receivedQty = yarnReceivedQtyByPo[order.id] ?? 0
    const issuedQty = yarnIssuedQtyByPo[order.id] ?? 0
    const stockBalance = receivedQty - issuedQty

    yarnSupplierByPo[order.id] =
      latestSupplierOrder?.supplier || order.supplier || undefined
    yarnEtaByPo[order.id] =
      latestSupplierOrder?.expectedArrival || order.yarnEta || undefined
    yarnStockBalanceByPo[order.id] = stockBalance
    inventoryStatusByPo[order.id] = resolveInventoryStatus({
      order,
      supplierOrderStatus: latestSupplierOrder?.status,
      inspectionStatus: yarnInspectionStatusByPo[order.id],
      receivedQty,
      issuedQty,
      stockBalance,
    })

    const storeRecord = storeControllerRecords.find(
      (record) => record.poId === order.id
    )
    storeInspectionDateByPo[order.id] = storeRecord?.inspectionDate
    storeInspectionStatusByPo[order.id] = storeRecord?.inspectionStatus
    storeSupplierByPo[order.id] = storeRecord?.supplier
    storeEtaByPo[order.id] = storeRecord?.eta
    storeIssuedQtyByPo[order.id] = storeRecord?.issuedQty ?? 0
    storeStockBalanceByPo[order.id] =
      storeRecord?.stockBalance ??
      Math.max(
        0,
        (storeRecord?.receivedQty ?? storeReceivedQtyByPo[order.id] ?? 0) -
          (storeRecord?.issuedQty ?? 0)
      )

    const derivedStoreStatus = deriveStoreWorkflowStatus(order, storeRecord)
    const isStoreStageActive = [
      "Store Processing",
      "Store Ready",
      "Sent to Knitting",
      "Knitting In Progress",
      "Knitting Completed",
      "Sent to Linking",
      "Linking In Progress",
      "Linking Completed",
      "Sent to Finishing",
      "Finishing In Progress",
      "Ready to Ship",
      "Completed",
    ].includes(derivedStoreStatus)

    if (isStoreStageActive) {
      inventoryStatusByPo[order.id] = resolveStoreInventoryStatus({
        order,
        inspectionStatus: storeRecord?.inspectionStatus,
        receivedQty: storeRecord?.receivedQty ?? storeReceivedQtyByPo[order.id] ?? 0,
        issuedQty: storeRecord?.issuedQty ?? 0,
        stockBalance: storeStockBalanceByPo[order.id],
      })
    }
  })

  return {
    yarnSupplierByPo,
    yarnEtaByPo,
    yarnInspectionDateByPo,
    yarnInspectionStatusByPo,
    yarnIssuedQtyByPo,
    yarnReceivedQtyByPo,
    yarnStockBalanceByPo,
    inventoryStatusByPo,
    storeInspectionDateByPo,
    storeInspectionStatusByPo,
    storeReceivedQtyByPo,
    storeIssuedQtyByPo,
    storeStockBalanceByPo,
    storeSupplierByPo,
    storeEtaByPo,
  }
}
