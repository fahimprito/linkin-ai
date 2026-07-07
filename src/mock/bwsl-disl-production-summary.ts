import type {
  BwslDislProductionSummaryRow,
  BwslDislProductionSummaryTotal,
} from "@/types/reports"

export const bwslDislProductionSummaryUpdatedOn = "7-Jun-26"

export const bwslDislProductionSummaryRows: BwslDislProductionSummaryRow[] = [
  {
    month: "December'25",
    knitting: "598,961 Pcs",
    linking: "484,575 Pcs",
    packing: "242,275 Pcs",
    remarks: "2026 Order Qty. Only",
  },
  {
    month: "January",
    knitting: "1,317,221 Pcs",
    linking: "1,206,924 Pcs",
    packing: "1,045,273 Pcs",
  },
  {
    month: "February",
    knitting: "1,087,288 Pcs",
    linking: "1,104,953 Pcs",
    packing: "1,094,749 Pcs",
  },
  {
    month: "March",
    knitting: "1,446,029 Pcs",
    linking: "1,163,214 Pcs",
    packing: "1,072,942 Pcs",
  },
  {
    month: "April",
    knitting: "1,442,934 Pcs",
    linking: "1,682,919 Pcs",
    packing: "1,655,862 Pcs",
  },
  {
    month: "May",
    knitting: "1,350,154 Pcs",
    linking: "1,129,853 Pcs",
    packing: "1,265,739 Pcs",
  },
  {
    month: "June",
    knitting: "168,421 Pcs",
    linking: "149,805 Pcs",
    packing: "163,244 Pcs",
    remarks: "Upto 6 June",
  },
]

export const bwslDislProductionSummaryTotals: BwslDislProductionSummaryTotal[] = [
  {
    label: "Grand Total (2026)",
    knitting: "6,812,047 Pcs",
    linking: "6,437,668 Pcs",
    packing: "6,297,809 Pcs",
    rowClassName: "bg-amber-50/90 dark:bg-amber-950/20",
  },
  {
    label: "Grand Total (Dec'25+2026)",
    knitting: "7,411,008 Pcs",
    linking: "6,922,243 Pcs",
    packing: "6,540,084 Pcs",
    rowClassName: "bg-lime-100/80 dark:bg-lime-950/30",
  },
]
