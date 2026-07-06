import type {
  YarnBatchInspectionStatus,
  YarnCheckRequest,
  YarnDeliveryBatch,
  YarnSupplierOrder,
} from "@/types/modules"
import type {
  KnittingDailyProgress,
  KnittingProductionPlan,
  KnittingYarnIssueLog,
  KnittingYarnRequisition,
  StoreIssueLog,
  StoreMaterialRequisition,
  YarnStockMovement,
} from "@/types/production"
import type { StoredFormRecord } from "@/lib/form-submissions"

export type YarnCheckState = {
  checkRequests: YarnCheckRequest[]
  supplierOrders: YarnSupplierOrder[]
  deliveryBatches: YarnDeliveryBatch[]
  stockMovements: YarnStockMovement[]
}

export type StoreServiceState = {
  requisitions: StoreMaterialRequisition[]
  issueLogs: StoreIssueLog[]
}

export type KnittingState = {
  requisitions: KnittingYarnRequisition[]
  issueLogs: KnittingYarnIssueLog[]
  productionPlans: KnittingProductionPlan[]
  dailyProgress: KnittingDailyProgress[]
}

export type UiState = {
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  confirmationDialog: {
    open: boolean
    title: string
    description: string
  }
}

export type FormSubmissionsState = {
  recordsByKey: Record<string, StoredFormRecord[]>
}

export type BatchInspectionUpdatePayload = {
  id: string
  inspectionStatus: YarnBatchInspectionStatus
  inspectedBy?: string
  inspectedAt?: string
  testReportName?: string
  rejectionReason?: string
  remarks?: string
}


