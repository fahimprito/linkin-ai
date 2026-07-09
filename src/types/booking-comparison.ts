export type BookingComparisonMonthKey =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec"

export type BookingComparisonCategory =
  | "cfmd_qty"
  | "initial_pre_booked_qty"
  | "qty_balance_to_utilize"

export type BookingComparisonMonths = Record<BookingComparisonMonthKey, number | null>

export type BookingComparisonRow = {
  serial: string
  buyerName: string
  label: string
  category: BookingComparisonCategory
  gauge: string
  totalQty: number | null
  remarks: string
  months: BookingComparisonMonths
}

export type BookingComparisonSummaryRow = {
  label: string
  totalQty: number | null
  months: BookingComparisonMonths
}

export type BookingComparisonSummarySection = {
  title: string
  rows: BookingComparisonSummaryRow[]
}

export type BookingComparisonReport = {
  title: string
  subtitle: string
  dateRange: string
  updatedAt: string
  rows: BookingComparisonRow[]
  summarySections: BookingComparisonSummarySection[]
}
