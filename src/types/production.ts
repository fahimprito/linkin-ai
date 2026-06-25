export type YarnStockMovementType =
  | "Allocated Stock"
  | "Accepted Receipt"
  | "Issued to Knitting"

export type YarnStockMovement = {
  id: string
  poId: string
  poNumber: string
  yarnType: string
  color: string
  quantity: number
  movementType: YarnStockMovementType
  movementDate: string
  referenceId: string
  referenceLabel: string
  createdBy: string
  remarks?: string
}

export type KnittingRequisitionStatus =
  | "Pending"
  | "Partially Issued"
  | "Issued"

export type KnittingYarnRequisition = {
  id: string
  poId: string
  poNumber: string
  buyer: string
  style: string
  requiredQty: number
  requestedDate: string
  requestedBy: string
  remarks?: string
  status: KnittingRequisitionStatus
  createdAt: string
}

export type KnittingYarnIssueLog = {
  id: string
  requisitionId: string
  poId: string
  poNumber: string
  issuedQty: number
  issueDate: string
  issuedBy: string
  remarks?: string
  createdAt: string
}

export type KnittingProductionPlan = {
  id: string
  poId: string
  poNumber: string
  lineName: string
  startDate: string
  endDate: string
  totalDays: number
  dailyTarget: number
  remarks?: string
  createdAt: string
  createdBy: string
}

export type KnittingDailyProgress = {
  id: string
  poId: string
  poNumber: string
  entryDate: string
  plannedQty: number
  producedQty: number
  finishedOutputWeight: number
  remarks?: string
  createdAt: string
  createdBy: string
}

export type StoreRequisitionStatus =
  | "Pending"
  | "Partially Issued"
  | "Issued"

export type StoreMaterialRequisition = {
  id: string
  sourceModule: "Linking" | "Finishing"
  poId: string
  poNumber: string
  buyer: string
  style: string
  itemName: string
  requiredQty: number
  requestedDate: string
  requestedBy: string
  remarks?: string
  status: StoreRequisitionStatus
  createdAt: string
}

export type StoreIssueLog = {
  id: string
  requisitionId: string
  sourceModule: "Linking" | "Finishing"
  poId: string
  poNumber: string
  itemName: string
  issuedQty: number
  issueDate: string
  issuedBy: string
  remarks?: string
  createdAt: string
}
