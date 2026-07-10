import type { MonthlyConfirmedQtyCapacityRow, MonthlyConfirmedQtyRow, MonthlyConfirmedQtySlotWiseRow } from "@/types/reports"

export const monthlyConfirmedQtyMonthOptions = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
] as const

export const monthlyConfirmedQtyCsvSections = [
  {
    key: "qty_intl",
    label: "QTY - INTL",
    description:
      "Primary monthly detail rows for style, buyer, GG, inspection, yarn, approvals, lead time, composition, and total minute values.",
  },
  {
    key: "order_summary",
    label: "Order Summary",
    description:
      "Derived slot-wise and capacity summary values computed from the same monthly detail dataset.",
  },
] as const

export const monthlyConfirmedQtyMainTableColumns = [
  {
    key: "sl",
    label: "SL",
    section: "qty_intl",
    csvHeaders: ["SL"],
    headerClassName:
      "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-violet-700 dark:text-violet-300",
  },
  {
    key: "buyerName",
    label: "BYR NAME",
    section: "qty_intl",
    csvHeaders: ["BYR NAME", "BUYER NAME"],
    headerClassName:
      "border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 font-medium text-slate-900 dark:text-slate-100",
  },
  {
    key: "styleArtOrder",
    label: "STY/ART/ORD#",
    section: "qty_intl",
    csvHeaders: ["STY/ART/ORD#", "STYLE/ART/ORDER#"],
    headerClassName:
      "border-b border-r border-border/80 bg-sky-50 px-2 py-2 text-center font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 font-medium text-slate-900 dark:text-slate-100",
  },
  {
    key: "gg",
    label: "GG",
    section: "qty_intl",
    csvHeaders: ["GG"],
    headerClassName:
      "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
  {
    key: "orderQty",
    label: "ORDER QTY",
    section: "qty_intl",
    csvHeaders: ["ORDER QTY"],
    headerClassName:
      "border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
  {
    key: "proposedInspectionDate",
    label: "PRPSED INSP DT",
    section: "qty_intl",
    csvHeaders: ["PRPSED INSP DT", "PROPOSED INSP DT", "INSPECTION DATE"],
    headerClassName:
      "border-b border-r border-border/80 bg-indigo-50 px-2 py-2 text-center font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "tenYarnInHouseQtyLoc",
    label: "TEN.YRN IN-HOUSE QTY LOC",
    section: "qty_intl",
    csvHeaders: ["TEN.YRN IN-HOUSE QTY LOC", "TEN YARN IN-HOUSE QTY LOC"],
    headerClassName:
      "border-b border-r border-border/80 bg-emerald-50 px-2 py-2 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "tenYarnInHouseDtMf",
    label: "TEN YRN IN-HOUSE DT/MF",
    section: "qty_intl",
    csvHeaders: ["TEN YRN IN-HOUSE DT/MF", "TEN YARN IN-HOUSE DT/MF"],
    headerClassName:
      "border-b border-r border-border/80 bg-emerald-50 px-2 py-2 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "trimsSwingPackingEta",
    label: "TEN. TRMS/SWN G+PCKING ETA",
    section: "qty_intl",
    csvHeaders: ["TEN. TRMS/SWN G+PCKING ETA", "TRIMS/SWING+PCKING ETA DT"],
    headerClassName:
      "border-b border-r border-border/80 bg-emerald-50 px-2 py-2 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "attachment",
    label: "ATTACHMENT",
    section: "qty_intl",
    csvHeaders: ["ATTACHMENT", "ATTACHMENT (ZIPPER/BUTTON/BADGE/FABRIC)"],
    headerClassName:
      "border-b border-r border-border/80 bg-violet-50 px-2 py-2 text-center font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "nylonSpanLurexElastic",
    label: "NYL-SPAN/LUREX/NYL/ELASTIC",
    section: "qty_intl",
    csvHeaders: ["NYL-SPAN/LUREX/NYL/ELASTIC", "NYL-SPAN/LUREX/NYL ELASTIC"],
    headerClassName:
      "border-b border-r border-border/80 bg-violet-50 px-2 py-2 text-center font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "prodApprovalStatus",
    label: "PROD APPROVAL STATUS",
    section: "qty_intl",
    csvHeaders: ["PROD APPROVAL STATUS"],
    headerClassName:
      "border-b border-r border-border/80 bg-lime-50 px-2 py-2 text-center font-semibold text-lime-700 dark:bg-lime-950/30 dark:text-lime-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
  {
    key: "prodStatus",
    label: "PROD STATUS",
    section: "qty_intl",
    csvHeaders: ["PROD STATUS"],
    headerClassName:
      "border-b border-r border-border/80 bg-lime-50 px-2 py-2 text-center font-semibold text-lime-700 dark:bg-lime-950/30 dark:text-lime-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
  {
    key: "projectedLocYarnProdStart",
    label: "PROJECTED LOC YRN PROD. STT APPX",
    section: "qty_intl",
    csvHeaders: ["PROJECTED LOC YRN PROD. STT APPX"],
    headerClassName:
      "border-b border-r border-border/80 bg-orange-50 px-2 py-2 text-center font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "projectedImpYarnProdStart",
    label: "PROJECTED IMP YRN PROD. STT APPX",
    section: "qty_intl",
    csvHeaders: ["PROJECTED IMP YRN PROD. STT APPX"],
    headerClassName:
      "border-b border-r border-border/80 bg-orange-50 px-2 py-2 text-center font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "ltForLocYarn",
    label: "LT FOR LOC YRN",
    section: "qty_intl",
    csvHeaders: ["LT FOR LOC YRN"],
    headerClassName:
      "border-b border-r border-border/80 bg-rose-50 px-2 py-2 text-center font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "ltForImpYarn",
    label: "LT FOR IMP YRN",
    section: "qty_intl",
    csvHeaders: ["LT FOR IMP YRN"],
    headerClassName:
      "border-b border-r border-border/80 bg-rose-50 px-2 py-2 text-center font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "yarnComposition",
    label: "YARN COMPOSITION",
    section: "qty_intl",
    csvHeaders: ["YARN COMPOSITION"],
    headerClassName:
      "border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "styleDetails",
    label: "STYLE DETAILS",
    section: "qty_intl",
    csvHeaders: ["STYLE DETAILS"],
    headerClassName:
      "border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "remarks",
    label: "REMARKS",
    section: "qty_intl",
    csvHeaders: ["REMARKS"],
    headerClassName:
      "border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "certificate",
    label: "CRTFCTE",
    section: "qty_intl",
    csvHeaders: ["CRTFCTE", "CERTIFICATE"],
    headerClassName:
      "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
  {
    key: "timingMin",
    label: "TIMING",
    section: "qty_intl",
    csvHeaders: ["SMPL/COSTING MIN", "TIMING", "MIN/PC"],
    headerClassName:
      "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
  {
    key: "locMonth",
    label: "LOC",
    section: "qty_intl",
    csvHeaders: ["LOC"],
    headerClassName:
      "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "impMonth",
    label: "IMP",
    section: "qty_intl",
    csvHeaders: ["IMP"],
    headerClassName:
      "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300",
  },
  {
    key: "totalMinPerOrdStyle",
    label: "TOTAL MIN PER ORD/STY",
    section: "qty_intl",
    csvHeaders: ["TOTAL MIN PER ORD/STY", "TOTAL MIN PER ORD/STYL"],
    headerClassName:
      "border-b border-r border-border/80 bg-fuchsia-50 px-2 py-2 text-center font-semibold text-fuchsia-700 dark:bg-fuchsia-950/30 dark:text-fuchsia-200",
    cellClassName:
      "border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100",
  },
  {
    key: "unit",
    label: "UNIT",
    section: "qty_intl",
    csvHeaders: ["DSIL ORD'S", "UNIT"],
    headerClassName:
      "border-b border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    cellClassName:
      "border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100",
  },
] as const

export const monthlyConfirmedQtySlotWiseColumns = [
  { key: "gg", label: "GG", section: "order_summary" },
  { key: "firstSlotCapacity", label: "FIRST SLOT CAPACITY 30%", section: "order_summary" },
  { key: "firstSlotConfirmedMinute", label: "1ST SLOT CONFIRMED MINUTE", section: "order_summary" },
  { key: "firstLotReceived", label: "FIRST LOT RECEIVED", section: "order_summary" },
  { key: "secondSlotCapacity", label: "SECOND SLOT CAPACITY 35%", section: "order_summary" },
  { key: "secondSlotConfirmedMinute", label: "2ND SLOT CONFIRMED MINUTE", section: "order_summary" },
  { key: "secondLotReceived", label: "SECOND LOT RECEIVED", section: "order_summary" },
  { key: "thirdSlotCapacity", label: "THIRD SLOT CAPACITY 35%", section: "order_summary" },
  { key: "thirdSlotConfirmedMinute", label: "3RD SLOT CONFIRMED MINUTE", section: "order_summary" },
  { key: "thirdLotReceived", label: "THIRD LOT RECEIVED", section: "order_summary" },
] as const

export const monthlyConfirmedQtyCapacityColumns = [
  { key: "gg", label: "GG", section: "order_summary" },
  { key: "qtyCapacity", label: "Qty Capacity", section: "order_summary" },
  { key: "gg", label: "GG", section: "order_summary" },
  { key: "orderReceivedQty", label: "Order Rcvd In Qty", section: "order_summary" },
  { key: "combinedOrderReceivedQty", label: "Combined Qty", section: "order_summary" },
  { key: "totalOrdersMinute", label: "Total Orders Min/GG", section: "order_summary" },
  { key: "monthlyCapacity", label: "Capacity In Min", section: "order_summary" },
  { key: "balanceCapacity", label: "Bal Capacity In Min", section: "order_summary" },
  { key: "groupLabel", label: "Group", section: "order_summary" },
] as const

export function getMonthlyConfirmedQtyCellValue(
  row: MonthlyConfirmedQtyRow,
  key: keyof MonthlyConfirmedQtyRow
) {
  return row[key] || "-"
}

export function getMonthlyConfirmedQtySlotValue(
  row: MonthlyConfirmedQtySlotWiseRow,
  key: keyof MonthlyConfirmedQtySlotWiseRow
) {
  return row[key] || "-"
}

export function getMonthlyConfirmedQtyCapacityValue(
  row: MonthlyConfirmedQtyCapacityRow,
  key: keyof MonthlyConfirmedQtyCapacityRow
) {
  const value = row[key]
  return typeof value === "string" && value ? value : "-"
}
