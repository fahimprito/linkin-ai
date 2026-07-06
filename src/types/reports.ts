import type { PurchaseOrder } from "@/types/modules"

export type ReportPageProps = {
  title: string
  includeDemoRows?: boolean
}

export type ManagementReportRow = PurchaseOrder & {
  merchandiseName: string
  materialSummary: {
    yarnKg: number
    fabricKg: number
    accessoriesQty: number
  }
  eta: string
  inventoryStatus: string
  inspectionStatus: string
  progress: number
  currentStage: string
}



