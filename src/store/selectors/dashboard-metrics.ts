import type { UserRole } from "@/types/auth"
import { moduleFormStorageKeys } from "@/lib/form-registry"
import type { StoredFormRecord } from "@/lib/form-submissions"
import {
  getPurchaseOrderDisplayGauge,
  getPurchaseOrderDisplayYarn,
} from "@/lib/purchase-orders"
import type { RootState } from "@/store"
import type { DashboardMetric } from "@/types/modules"

function formatCount(value: number) {
  if (value >= 1000) {
    return value.toLocaleString()
  }

  return String(value).padStart(2, "0")
}

function getRecordsByKey(state: RootState, storageKey: string) {
  return state.formSubmissions.recordsByKey[storageKey] ?? []
}

function getRecordsByKeys(state: RootState, storageKeys: string[]) {
  return storageKeys.flatMap((storageKey) => getRecordsByKey(state, storageKey))
}

function getRecordDate(record: StoredFormRecord) {
  const rawDate = record.submittedAtIso ?? record.submittedAt
  const parsedDate = new Date(rawDate)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function countRecordsToday(records: StoredFormRecord[]) {
  const today = new Date()

  return records.filter((record) => {
    const recordDate = getRecordDate(record)

    if (!recordDate) {
      return false
    }

    return (
      recordDate.getFullYear() === today.getFullYear() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getDate() === today.getDate()
    )
  }).length
}

function countForKeys(state: RootState, storageKeys: string[]) {
  return getRecordsByKeys(state, storageKeys).length
}

function countForKeysToday(state: RootState, storageKeys: string[]) {
  return countRecordsToday(getRecordsByKeys(state, storageKeys))
}

function getStorageKeysForRole(role: UserRole) {
  switch (role) {
    case "merchandising_user":
      return moduleFormStorageKeys.merchandise
    case "design_user":
      return moduleFormStorageKeys.design
    case "yarn_user":
      return moduleFormStorageKeys.yarn
    case "store_user":
      return moduleFormStorageKeys.store
    case "management_user":
    case "super_admin":
      return Object.values(moduleFormStorageKeys).flat()
    default:
      return []
  }
}

function getYarnSupplierOrders(state: RootState) {
  return state.yarnCheck.supplierOrders.filter(
    (order) => (order.itemCategory ?? "Yarn") === "Yarn"
  )
}

function metric(
  id: string,
  label: string,
  value: number,
  tone: DashboardMetric["tone"] = "default"
): DashboardMetric {
  return {
    id,
    label,
    value: formatCount(value),
    tone,
  }
}

export function selectExecutiveDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  const totalFormEntries = Object.values(state.formSubmissions.recordsByKey).reduce(
    (total, records) => total + records.length,
    0
  )
  const totalEntries =
    totalFormEntries +
    state.merchandise.purchaseOrders.length +
    state.yarnCheck.checkRequests.length +
    state.yarnCheck.supplierOrders.length +
    state.yarnCheck.deliveryBatches.length +
    state.yarnCheck.stockMovements.length +
    state.storeService.requisitions.length +
    state.storeService.issueLogs.length
  const reportingEntries = countForKeys(state, moduleFormStorageKeys.reports)
  const activeModules = [
    state.merchandise.purchaseOrders.length > 0,
    state.merchandise.purchaseOrders.some(
      (po) =>
        Boolean(
          po.design || getPurchaseOrderDisplayGauge(po) || po.color || getPurchaseOrderDisplayYarn(po)
        )
    ),
    state.yarnCheck.checkRequests.length > 0 ||
      state.yarnCheck.supplierOrders.length > 0 ||
      state.yarnCheck.deliveryBatches.length > 0,
    state.storeService.requisitions.length > 0 ||
      state.storeService.issueLogs.length > 0,
    reportingEntries > 0,
  ].filter(Boolean).length

  return [
    metric(
      "exec-1",
      "Active POs",
      state.merchandise.purchaseOrders.length,
      "success"
    ),
    metric(
      "exec-2",
      "Workflow Entries",
      totalEntries,
      "default"
    ),
    metric(
      "exec-3",
      "Reporting Records",
      reportingEntries,
      "warning"
    ),
    metric("exec-4", "Live Workspaces", activeModules, "success"),
  ]
}

export function selectMerchandiseDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  return [
    metric(
      "merch-1",
      "Buyer POs",
      state.merchandise.purchaseOrders.length,
      "success"
    ),
    metric(
      "merch-2",
      "Yarn Requests",
      state.yarnCheck.checkRequests.length,
      "warning"
    ),
    metric(
      "merch-3",
      "Supplier Follow-ups",
      state.yarnCheck.supplierOrders.length,
      "default"
    ),
    metric(
      "merch-4",
      "Ready for Production",
      state.merchandise.purchaseOrders.filter(
        (po) => po.status === "Ready for Production"
      ).length,
      "success"
    ),
  ]
}

export function selectDesignDashboardMetrics(state: RootState): DashboardMetric[] {
  const uniqueDesigns = new Set(
    state.merchandise.purchaseOrders
      .map((po) => po.design.trim())
      .filter((design) => design.length > 0)
  ).size
  const specReadyCount = state.merchandise.purchaseOrders.filter(
    (po) =>
      Boolean(
        getPurchaseOrderDisplayGauge(po) &&
        po.color &&
        getPurchaseOrderDisplayYarn(po)
      )
  ).length
  const pendingFollowUp = state.merchandise.purchaseOrders.filter(
    (po) =>
      !po.design ||
      !getPurchaseOrderDisplayGauge(po) ||
      !po.color ||
      !getPurchaseOrderDisplayYarn(po)
  ).length

  return [
    metric(
      "design-1",
      "PO Styles",
      state.merchandise.purchaseOrders.length,
      "default"
    ),
    metric(
      "design-2",
      "Design Variants",
      uniqueDesigns,
      "success"
    ),
    metric(
      "design-3",
      "Specs Ready",
      specReadyCount,
      "success"
    ),
    metric(
      "design-4",
      "Needs Follow-up",
      pendingFollowUp,
      "warning"
    ),
  ]
}

export function selectYarnDashboardMetrics(state: RootState): DashboardMetric[] {
  const yarnSupplierOrders = getYarnSupplierOrders(state)
  const availableStock = state.yarnCheck.stockMovements.reduce(
    (sum, movement) =>
      movement.movementType === "Issued to Knitting"
        ? sum - movement.quantity
        : sum + movement.quantity,
    0
  )

  return [
    metric(
      "yarn-1",
      "Check Requests",
      state.yarnCheck.checkRequests.length,
      "warning"
    ),
    metric(
      "yarn-2",
      "Supplier Orders",
      yarnSupplierOrders.length,
      "success"
    ),
    metric(
      "yarn-3",
      "Available Stock",
      Math.round(availableStock),
      "success"
    ),
  ]
}

export function selectStoreDashboardMetrics(state: RootState): DashboardMetric[] {
  const openRequisitions = state.storeService.requisitions.filter(
    (requisition) => requisition.status !== "Issued"
  ).length
  const activeSourceModules = new Set(
    state.storeService.requisitions.map((requisition) => requisition.sourceModule)
  ).size

  return [
    metric(
      "store-1",
      "Open Requisitions",
      openRequisitions,
      "warning"
    ),
    metric(
      "store-2",
      "Issue Logs",
      state.storeService.issueLogs.length,
      "success"
    ),
    metric(
      "store-3",
      "Source Modules",
      activeSourceModules,
      "default"
    ),
  ]
}

export function selectLinkingDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  const queueOrders = state.merchandise.purchaseOrders.filter(
    (po) => po.status === "Linking" || po.status === "Finishing"
  ).length

  return [
    metric(
      "link-1",
      "Queue POs",
      queueOrders,
      "default"
    ),
    metric(
      "link-2",
      "Store Requisitions",
      getRecordsByKey(state, "form-linking-store-requisition").length,
      "success"
    ),
    metric(
      "link-3",
      "Daily Reports",
      getRecordsByKey(state, "form-linking-daily-update").length,
      "warning"
    ),
  ]
}

export function selectFinishingDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  const queueOrders = state.merchandise.purchaseOrders.filter(
    (po) => po.status === "Finishing"
  ).length

  return [
    metric(
      "finish-1",
      "Queue POs",
      queueOrders,
      "default"
    ),
    metric(
      "finish-2",
      "Store Requisitions",
      getRecordsByKey(state, "form-finishing-requisition").length,
      "success"
    ),
    metric(
      "finish-3",
      "Daily Reports",
      getRecordsByKey(state, "form-finishing-daily-update").length,
      "warning"
    ),
  ]
}

export function selectReportsDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  return [
    metric(
      "report-1",
      "PO Trackers",
      getRecordsByKey(state, "form-report-po-tracker").length,
      "warning"
    ),
  ]
}

export function selectMetricsForRole(
  state: RootState,
  role: UserRole
): DashboardMetric[] {
  switch (role) {
    case "merchandising_user":
      return selectMerchandiseDashboardMetrics(state)
    case "design_user":
      return selectDesignDashboardMetrics(state)
    case "yarn_user":
      return selectYarnDashboardMetrics(state)
    case "store_user":
      return selectStoreDashboardMetrics(state)
    case "management_user":
    case "super_admin":
      return selectExecutiveDashboardMetrics(state)
    default:
      return []
  }
}

export function selectSubmissionCountForRole(
  state: RootState,
  role: UserRole
) {
  const storageKeys = getStorageKeysForRole(role)
  const formSubmissionCount = countForKeys(state, storageKeys)

  if (role === "super_admin") {
    return (
      formSubmissionCount +
      state.merchandise.purchaseOrders.length +
      state.yarnCheck.checkRequests.length +
      state.yarnCheck.supplierOrders.length +
      state.yarnCheck.deliveryBatches.length +
      state.yarnCheck.stockMovements.length +
      state.storeService.requisitions.length +
      state.storeService.issueLogs.length
    )
  }

  if (role === "merchandising_user") {
    return formSubmissionCount + state.merchandise.purchaseOrders.length
  }

  if (role === "design_user") {
    return state.merchandise.purchaseOrders.length
  }

  if (role === "yarn_user") {
    return (
      state.yarnCheck.checkRequests.length +
      getYarnSupplierOrders(state).length +
      state.yarnCheck.deliveryBatches.length +
      state.yarnCheck.stockMovements.length
    )
  }

  if (role === "store_user") {
    return (
      state.storeService.requisitions.length +
      state.storeService.issueLogs.length
    )
  }

  return formSubmissionCount
}

export function selectTodaySubmissionCountForRole(
  state: RootState,
  role: UserRole
) {
  const todayIso = new Date().toISOString().split("T")[0]

  if (role === "merchandising_user" || role === "design_user") {
    return state.merchandise.purchaseOrders.filter(
      (po) => po.createdAt.split("T")[0] === todayIso
    ).length
  }

  if (role === "yarn_user") {
    return (
      state.yarnCheck.deliveryBatches.filter(
        (batch) => batch.deliveryDate === todayIso
      ).length +
      state.yarnCheck.stockMovements.filter(
        (movement) => movement.movementDate.split("T")[0] === todayIso
      ).length
    )
  }

  if (role === "store_user") {
    return (
      state.storeService.requisitions.filter(
        (requisition) => requisition.requestedDate === todayIso
      ).length +
      state.storeService.issueLogs.filter((log) => log.issueDate === todayIso)
        .length
    )
  }

  return countForKeysToday(state, getStorageKeysForRole(role))
}
