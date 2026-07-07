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

export type BwslDislProductionSummaryRow = {
  month: string
  knitting: string
  linking: string
  packing: string
  remarks?: string
}

export type BwslDislProductionSummaryTotal = {
  label: string
  knitting: string
  linking: string
  packing: string
  remarks?: string
  rowClassName?: string
}

export type BwslDislGaugeSectionSummaryRow = {
  month: string
  knitting141299: string
  knitting357: string
  knittingTotal: string
  linking141299: string
  linking357: string
  linkingTotal: string
  pack141299: string
  pack357: string
  packTotal: string
  remarks?: string
}

export type BwslDislGaugeSectionSummaryTotal = {
  label: string
  knitting141299: string
  knitting357: string
  knittingTotal: string
  linking141299: string
  linking357: string
  linkingTotal: string
  pack141299: string
  pack357: string
  packTotal: string
  remarks?: string
  rowClassName?: string
}

export type MonthlyConfirmedQtyRow = {
  sl: string
  buyerName: string
  styleArtOrder: string
  gg: string
  orderQty: string
  proposedInspectionDate: string
  tenYarnInHouseQtyLoc: string
  tenYarnInHouseDtMf: string
  trimsSwingPackingEta: string
  attachment: string
  nylonSpanLurexElastic: string
  prodApprovalStatus: string
  prodStatus: string
  projectedLocYarnProdStart: string
  projectedImpYarnProdStart: string
  ltForLocYarn: string
  ltForImpYarn: string
  yarnComposition: string
  styleDetails: string
  remarks: string
  certificate: string
  timingMin: string
  locMonth: string
  impMonth: string
  totalMinPerOrdStyle: string
  unit: string
}

export type MonthlyConfirmedQtyReport = {
  value: string
  label: string
  title: string
  updatedOn: string
  highlightNote: string
  rows: MonthlyConfirmedQtyRow[]
}
