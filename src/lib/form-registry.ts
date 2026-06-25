import type { AppModuleKey } from "@/types/auth"

export const moduleFormStorageKeys: Record<
  Exclude<AppModuleKey, "dashboard">,
  string[]
> = {
  merchandise: [
    "form-merchandise-fetch-po",
    "form-merchandise-yarn-request",
    "form-merchandise-supplier-follow-up",
    "form-merchandise-production-updates",
    "form-merchandise-management-report",
  ],
  yarn: [
    "form-yarn-po-intake",
    "form-yarn-supplier-receipt",
    "form-yarn-inspection",
    "form-yarn-floor-delivery",
    "form-yarn-management-report",
  ],
  store: [
    "form-store-accessories-po",
    "form-store-stock-receipt",
    "form-store-inspection",
    "form-store-floor-delivery",
    "form-store-status-report",
  ],
  knitting: [
    "form-knitting-accept-po",
    "form-knitting-requisition",
    "form-knitting-planning",
    "form-knitting-daily-update",
    "form-knitting-status-report",
  ],
  linking: [
    "form-linking-store-requisition",
    "form-linking-planning",
    "form-linking-daily-update",
  ],
  finishing: [
    "form-finishing-requisition",
    "form-finishing-planning",
    "form-finishing-daily-update",
  ],
  reports: [
    "form-report-full-system-production",
    "form-report-yarn-information",
    "form-report-yarn-stock-calculation",
    "form-report-packing-section",
    "form-report-linking-production",
    "form-report-po-tracker",
  ],
}

export const allFormStorageKeys = Object.values(moduleFormStorageKeys).flat()
