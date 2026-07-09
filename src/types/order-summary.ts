export const reportMonths = [
  "Jan",
  "Feb",
  "Mar",
  "April",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export type ReportMonth = (typeof reportMonths)[number]

export type OrderSummaryMetricRow = {
  label: string
  type: "qty" | "min" | "avg"
  months: Partial<Record<ReportMonth, string>>
  yearlyTotal?: string
  yearlyAverage?: string
  highlightMonths?: ReportMonth[]
}

export type BuyerWiseOrderSummaryMonth = {
  qty?: string
  min?: string
}

export type BuyerWiseOrderSummaryRow = {
  serial: string
  buyerName: string
  buyerCellClassName?: string
  months: Partial<Record<ReportMonth, BuyerWiseOrderSummaryMonth>>
  yearlyQty: string
  yearlyMin: string
  yearlyAverage: string
}

export type BuyerWiseOrderSummaryFooterRow = {
  label: string
  months: Partial<Record<ReportMonth, string>>
  yearlyTotal?: string
  yearlyAverage?: string
  highlightMonths?: ReportMonth[]
}

export type OrderSummaryMonthlyStatusCapacityRow = {
  label: string
  monthlyCapacity: string
  qtyCapacity: string
}

export type OrderSummaryMonthlyStatusRow = {
  serial: string
  month: string
  totalQty: string
  totalMin: string
  leftOverMin: string
  highlight?: boolean
}
