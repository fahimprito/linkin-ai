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
  const totalEntries = Object.values(state.formSubmissions.recordsByKey).reduce(
    (total, records) => total + records.length,
    0
  )
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
      getRecordsByKey(state, "form-merchandise-yarn-request").length,
      `${formatCount(countForKeyToday(state, "form-merchandise-yarn-request"))} today`,
      "warning"
    ),
    metric(
      "merch-3",
      "Supplier Follow-ups",
      getRecordsByKey(state, "form-merchandise-supplier-follow-up").length,
      `${formatCount(countForKeyToday(state, "form-merchandise-supplier-follow-up"))} today`,
      "default"
    ),
    metric(
      "merch-4",
      "Production Updates",
      getRecordsByKey(state, "form-merchandise-production-updates").length,
      `${formatCount(countForKeyToday(state, "form-merchandise-production-updates"))} today`,
      "warning"
    ),
  ]
}

export function selectYarnDashboardMetrics(state: RootState): DashboardMetric[] {
  return [
    metric(
      "yarn-1",
      "Accepted Yarn POs",
      getRecordsByKey(state, "form-yarn-po-intake").length,
      "Yarn intake records",
      "default"
    ),
    metric(
      "yarn-2",
      "Supplier Receipts",
      getRecordsByKey(state, "form-yarn-supplier-receipt").length,
      `${formatCount(countForKeyToday(state, "form-yarn-supplier-receipt"))} today`,
      "success"
    ),
    metric(
      "yarn-3",
      "Inspections Logged",
      getRecordsByKey(state, "form-yarn-inspection").length,
      `${formatCount(countForKeyToday(state, "form-yarn-inspection"))} today`,
      "success"
    ),
  ]
}

export function selectStoreDashboardMetrics(state: RootState): DashboardMetric[] {
  return [
    metric(
      "store-1",
      "Accessory POs",
      getRecordsByKey(state, "form-store-accessories-po").length,
      "Accepted into store",
      "default"
    ),
    metric(
      "store-2",
      "Stock Receipts",
      getRecordsByKey(state, "form-store-stock-receipt").length,
      `${formatCount(countForKeyToday(state, "form-store-stock-receipt"))} today`,
      "success"
    ),
    metric(
      "store-3",
      "Floor Deliveries",
      getRecordsByKey(state, "form-store-floor-delivery").length,
      `${formatCount(countForKeyToday(state, "form-store-floor-delivery"))} today`,
      "warning"
    ),
  ]
}

export function selectKnittingDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  return [
    metric(
      "knit-1",
      "Accepted Orders",
      getRecordsByKey(state, "form-knitting-accept-po").length,
      "Registered for knitting",
      "default"
    ),
    metric(
      "knit-2",
      "Requisitions",
      getRecordsByKey(state, "form-knitting-requisition").length,
      `${formatCount(countForKeyToday(state, "form-knitting-requisition"))} today`,
      "warning"
    ),
    metric(
      "knit-3",
      "Daily Updates",
      getRecordsByKey(state, "form-knitting-daily-update").length,
      `${formatCount(countForKeyToday(state, "form-knitting-daily-update"))} today`,
      "success"
    ),
  ]
}

export function selectLinkingDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  return [
    metric(
      "link-1",
      "Accepted Orders",
      getRecordsByKey(state, "form-linking-accept-po").length,
      "Registered for linking",
      "default"
    ),
    metric(
      "link-2",
      "Planning Entries",
      getRecordsByKey(state, "form-linking-planning").length,
      `${formatCount(countForKeyToday(state, "form-linking-planning"))} today`,
      "success"
    ),
    metric(
      "link-3",
      "Daily Updates",
      getRecordsByKey(state, "form-linking-daily-update").length,
      `${formatCount(countForKeyToday(state, "form-linking-daily-update"))} today`,
      "warning"
    ),
  ]
}

export function selectFinishingDashboardMetrics(
  state: RootState
): DashboardMetric[] {
  return [
    metric(
      "finish-1",
      "Accepted Orders",
      getRecordsByKey(state, "form-finishing-accept-po").length,
      "Registered for finishing",
      "default"
    ),
    metric(
      "finish-2",
      "Planning Entries",
      getRecordsByKey(state, "form-finishing-planning").length,
      `${formatCount(countForKeyToday(state, "form-finishing-planning"))} today`,
      "success"
    ),
    metric(
      "finish-3",
      "Daily Updates",
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

  if (role === "merchandise_user" || role === "super_admin") {
    return formSubmissionCount + state.merchandise.purchaseOrders.length
  }

  return formSubmissionCount
}

export function selectTodaySubmissionCountForRole(
  state: RootState,
  role: UserRole
) {
  return countForKeysToday(state, getStorageKeysForRole(role))
}
