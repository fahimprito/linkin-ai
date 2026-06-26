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
  design: [
    "form-design-request",
    "form-design-consumption",
    "form-design-reports",
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
  reports: [
    "form-report-yarn-information",
    "form-report-yarn-stock-calculation",
    "form-report-po-tracker",
  ],
}

export const allFormStorageKeys = Object.values(moduleFormStorageKeys).flat()
