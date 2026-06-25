import type { UserRole } from "@/types/auth"
import { moduleFormStorageKeys } from "@/lib/form-registry"
import type { StoredFormRecord } from "@/lib/form-submissions"
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

function countForKeyToday(state: RootState, storageKey: string) {
  return countRecordsToday(getRecordsByKey(state, storageKey))
}

function countForKeys(state: RootState, storageKeys: string[]) {
  return getRecordsByKeys(state, storageKeys).length
}

function countForKeysToday(state: RootState, storageKeys: string[]) {
  return countRecordsToday(getRecordsByKeys(state, storageKeys))
}

function getStorageKeysForRole(role: UserRole) {
  switch (role) {
    case "merchandise_user":
      return moduleFormStorageKeys.merchandise
    case "yarn_control_user":
      return moduleFormStorageKeys.yarn
    case "store_control_user":
      return moduleFormStorageKeys.store
    case "knitting_user":
      return moduleFormStorageKeys.knitting
    case "linking_user":
      return moduleFormStorageKeys.linking
    case "finishing_user":
      return moduleFormStorageKeys.finishing
    case "management_user":
    case "super_admin":
      return Object.values(moduleFormStorageKeys).flat()
    default:
      return []
  }
}

function metric(
  id: string,
  label: string,
  value: number,
  delta: string,
  tone: DashboardMetric["tone"] = "default"
): DashboardMetric {
  return {
    id,
    label,
    value: formatCount(value),
    delta,
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
    state.storeService.requisitions.length +
    state.storeService.issueLogs.length +
    state.knitting.requisitions.length +
    state.knitting.issueLogs.length +
    state.knitting.productionPlans.length +
    state.knitting.dailyProgress.length
  const todayEntries = Object.values(state.formSubmissions.recordsByKey).reduce(
    (total, records) => total + countRecordsToday(records),
    0
  )
  const reportingEntries = countForKeys(state, moduleFormStorageKeys.reports)
  const activeModules = [
    state.merchandise.purchaseOrders.length > 0,
    ...Object.values(moduleFormStorageKeys).map(
      (storageKeys) => countForKeys(state, storageKeys) > 0
    ),
    state.storeService.requisitions.length > 0 ||
      state.storeService.issueLogs.length > 0,
  ].filter(Boolean).length

  return [
    metric(
      "exec-1",
      "Active POs",
      state.merchandise.purchaseOrders.length,
      `${formatCount(todayEntries)} new entries today`,
      "success"
    ),
    metric(
      "exec-2",
      "Workflow Entries",
      totalEntries,
      "All submitted forms",
      "default"
    ),
    metric(
      "exec-3",
      "Reporting Records",
      reportingEntries,
      `${formatCount(countForKeysToday(state, moduleFormStorageKeys.reports))} today`,
      "warning"
    ),
    metric("exec-4", "Active Modules", activeModules, "Live workspace activity", "success"),
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
      "Live total",
      "success"
    ),
    metric(
      "merch-2",
      "Yarn Requests",
      state.yarnCheck.checkRequests.length,
      `${formatCount(
        state.yarnCheck.checkRequests.filter((request) => request.status === "Pending").length
      )} pending`,
      "warning"
    ),
    metric(
      "merch-3",
      "Supplier Follow-ups",
      state.yarnCheck.supplierOrders.length,
      `${formatCount(
        state.yarnCheck.supplierOrders.filter((order) => order.status !== "Fully Received").length
      )} active`,
      "default"
    ),
    metric(
      "merch-4",
      "Ready for Production",
      state.merchandise.purchaseOrders.filter(
        (po) => po.status === "Ready for Production"
      ).length,
      "Released from Stage 1",
      "success"
    ),
  ]
}

export function selectYarnDashboardMetrics(state: RootState): DashboardMetric[] {
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
      `${formatCount(
        state.yarnCheck.checkRequests.filter((request) => request.status === "Pending").length
      )} pending`,
      "warning"
    ),
    metric(
      "yarn-2",
      "Supplier Orders",
      state.yarnCheck.supplierOrders.length,
      `${formatCount(
        state.yarnCheck.supplierOrders.filter((order) => order.status !== "Fully Received").length
      )} active`,
      "success"
    ),
    metric(
      "yarn-3",
      "Available Stock",
      Math.round(availableStock),
      `${formatCount(state.knitting.requisitions.length)} knitting requisitions`,
      "success"
    ),
  ]
}

export function selectStoreDashboardMetrics(state: RootState): DashboardMetric[] {
  const openRequisitions = state.storeService.requisitions.filter(
    (requisition) => requisition.status !== "Issued"
  ).length
  const todayIso = new Date().toISOString().split("T")[0]
  const issuesToday = state.storeService.issueLogs.filter(
    (log) => log.issueDate === todayIso
  ).length
  const activeSourceModules = new Set(
    state.storeService.requisitions.map((requisition) => requisition.sourceModule)
  ).size

  return [
    metric(
      "store-1",
      "Open Requisitions",
      openRequisitions,
      "Awaiting store issue",
      "warning"
    ),
    metric(
      "store-2",
      "Issue Logs",
      state.storeService.issueLogs.length,
      `${formatCount(issuesToday)} today`,
      "success"
    ),
    metric(
      "store-3",
      "Source Modules",
      activeSourceModules,
      activeSourceModules > 0 ? "Shared production service" : "Ready for Linking and Finishing",
      "default"
    ),
  ]
}

export function selectKnittingDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  const queueOrders = state.merchandise.purchaseOrders.filter(
    (po) => po.status === "Ready for Production" || po.status === "Knitting"
  )
  const todayIso = new Date().toISOString().split("T")[0]
  const todayOutput = state.knitting.dailyProgress
    .filter((entry) => entry.entryDate === todayIso)
    .reduce((sum, entry) => sum + entry.producedQty, 0)

  return [
    metric(
      "knit-1",
      "Queue POs",
      queueOrders.length,
      "Released from Yarn Control",
      "default"
    ),
    metric(
      "knit-2",
      "Requisitions",
      state.knitting.requisitions.length,
      `${formatCount(
        state.knitting.requisitions.filter((requisition) => requisition.status !== "Issued").length
      )} open`,
      "warning"
    ),
    metric(
      "knit-3",
      "Daily Output",
      todayOutput,
      `${formatCount(state.knitting.productionPlans.length)} active plans`,
      "success"
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
      "Received from Knitting",
      "default"
    ),
    metric(
      "link-2",
      "Store Requisitions",
      getRecordsByKey(state, "form-linking-store-requisition").length,
      `${formatCount(
        state.storeService.issueLogs.filter((log) => log.sourceModule === "Linking").length
      )} store issues`,
      "success"
    ),
    metric(
      "link-3",
      "Daily Reports",
      getRecordsByKey(state, "form-linking-daily-update").length,
      `${formatCount(countForKeyToday(state, "form-linking-daily-update"))} today`,
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
      "Received from Linking",
      "default"
    ),
    metric(
      "finish-2",
      "Store Requisitions",
      getRecordsByKey(state, "form-finishing-requisition").length,
      `${formatCount(
        state.storeService.issueLogs.filter((log) => log.sourceModule === "Finishing").length
      )} store issues`,
      "success"
    ),
    metric(
      "finish-3",
      "Daily Reports",
      getRecordsByKey(state, "form-finishing-daily-update").length,
      `${formatCount(countForKeyToday(state, "form-finishing-daily-update"))} today`,
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
      "Full Production Reports",
      getRecordsByKey(state, "form-report-full-system-production").length,
      `${formatCount(countForKeyToday(state, "form-report-full-system-production"))} today`,
      "default"
    ),
    metric(
      "report-2",
      "Yarn Registers",
      getRecordsByKey(state, "form-report-yarn-information").length,
      `${formatCount(countForKeyToday(state, "form-report-yarn-information"))} today`,
      "success"
    ),
    metric(
      "report-3",
      "PO Trackers",
      getRecordsByKey(state, "form-report-po-tracker").length,
      `${formatCount(countForKeyToday(state, "form-report-po-tracker"))} today`,
      "warning"
    ),
  ]
}

export function selectMetricsForRole(
  state: RootState,
  role: UserRole
): DashboardMetric[] {
  switch (role) {
    case "merchandise_user":
      return selectMerchandiseDashboardMetrics(state)
    case "yarn_control_user":
      return selectYarnDashboardMetrics(state)
    case "store_control_user":
      return selectStoreDashboardMetrics(state)
    case "knitting_user":
      return selectKnittingDashboardMetrics(state)
    case "linking_user":
      return selectLinkingDashboardMetrics(state)
    case "finishing_user":
      return selectFinishingDashboardMetrics(state)
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
      state.storeService.requisitions.length +
      state.storeService.issueLogs.length +
      state.knitting.requisitions.length +
      state.knitting.issueLogs.length +
      state.knitting.productionPlans.length +
      state.knitting.dailyProgress.length
    )
  }

  if (role === "merchandise_user") {
    return formSubmissionCount + state.merchandise.purchaseOrders.length
  }

  if (role === "yarn_control_user") {
    return (
      state.yarnCheck.checkRequests.length +
      state.yarnCheck.supplierOrders.length +
      state.yarnCheck.deliveryBatches.length +
      state.yarnCheck.stockMovements.length
    )
  }

  if (role === "knitting_user") {
    return (
      state.knitting.requisitions.length +
      state.knitting.issueLogs.length +
      state.knitting.productionPlans.length +
      state.knitting.dailyProgress.length
    )
  }

  if (role === "store_control_user") {
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

  if (role === "yarn_control_user") {
    return (
      state.yarnCheck.deliveryBatches.filter(
        (batch) => batch.deliveryDate === todayIso
      ).length +
      state.yarnCheck.stockMovements.filter(
        (movement) => movement.movementDate.split("T")[0] === todayIso
      ).length
    )
  }

  if (role === "knitting_user") {
    return state.knitting.dailyProgress.filter(
      (entry) => entry.entryDate === todayIso
    ).length
  }

  if (role === "store_control_user") {
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
