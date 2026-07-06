export type PreBookingMonthKey =
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

export type BuyerGgWisePreBookingRowType = "normal" | "note"

export type BuyerGgWisePreBookingNote = {
  from: PreBookingMonthKey
  to: PreBookingMonthKey
  text: string
}

export type BuyerGgWisePreBookingRow = {
  gauge: string
  months: Partial<Record<PreBookingMonthKey, string>>
  totalQty: string
  note?: BuyerGgWisePreBookingNote
}

export type BuyerGgWisePreBookingGroup = {
  id: string
  serial: string
  buyerName: string
  buyerClassName?: string
  rows: BuyerGgWisePreBookingRow[]
}

export type BuyerGgWisePreBookingRecord = {
  id: string
  serial: string
  buyerName: string
  gauge: string
  rowType: BuyerGgWisePreBookingRowType
  noteText: string
  noteFrom: PreBookingMonthKey | ""
  noteTo: PreBookingMonthKey | ""
  jan: string
  feb: string
  mar: string
  apr: string
  may: string
  jun: string
  jul: string
  aug: string
  sep: string
  oct: string
  nov: string
  dec: string
  totalQty: string
}
