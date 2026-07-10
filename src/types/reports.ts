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

export type MonthlyConfirmedQtySectionKey = "qty_intl" | "order_summary"

export type MonthlyConfirmedQtySectionDefinition = {
  key: MonthlyConfirmedQtySectionKey
  label: string
  description: string
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

export type MonthlyConfirmedQtyMainColumn = {
  key: keyof MonthlyConfirmedQtyRow
  label: string
  section: MonthlyConfirmedQtySectionKey
  csvHeaders: string[]
  headerClassName: string
  cellClassName: string
}

export type MonthlyConfirmedQtySlotWiseRow = {
  gg: string
  firstSlotCapacity: string
  firstSlotConfirmedMinute: string
  firstLotReceived: string
  secondSlotCapacity: string
  secondSlotConfirmedMinute: string
  secondLotReceived: string
  thirdSlotCapacity: string
  thirdSlotConfirmedMinute: string
  thirdLotReceived: string
}

export type MonthlyConfirmedQtySlotWiseColumn = {
  key: keyof MonthlyConfirmedQtySlotWiseRow
  label: string
  section: MonthlyConfirmedQtySectionKey
}

export type MonthlyConfirmedQtyCapacityRow = {
  gg: string
  qtyCapacity: string
  orderReceivedQty: string
  combinedOrderReceivedQty?: string
  totalOrdersMinute: string
  monthlyCapacity: string
  balanceCapacity: string
  groupLabel?: string
  rowSpan?: number
  hideCombinedOrderQty?: boolean
  hideGroupedSummaryCells?: boolean
}

export type MonthlyConfirmedQtyCapacityColumn = {
  key: keyof MonthlyConfirmedQtyCapacityRow
  label: string
  section: MonthlyConfirmedQtySectionKey
}

export type MonthlyConfirmedQtyPreBookingLeftRow = {
  label: string
  qty: string
}

export type MonthlyConfirmedQtyFooter = {
  slotWiseTitle?: string
  slotWiseRows: MonthlyConfirmedQtySlotWiseRow[]
  slotWiseTotals?: {
    totalQty?: string
    totalMin?: string
  }
  capacityRows: MonthlyConfirmedQtyCapacityRow[]
  preBookingLeftRows?: MonthlyConfirmedQtyPreBookingLeftRow[]
}

export type MonthlyConfirmedQtyReport = {
  value: string
  label: string
  title: string
  updatedOn: string
  highlightNote: string
  rows: MonthlyConfirmedQtyRow[]
  sourceSections?: MonthlyConfirmedQtySectionKey[]
  footer?: MonthlyConfirmedQtyFooter
}
