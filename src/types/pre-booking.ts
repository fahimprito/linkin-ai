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
  months: Partial<Record<PreBookingMonthKey, number | null>>
  totalQty: number | null
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
  jan: number | null
  feb: number | null
  mar: number | null
  apr: number | null
  may: number | null
  jun: number | null
  jul: number | null
  aug: number | null
  sep: number | null
  oct: number | null
  nov: number | null
  dec: number | null
  totalQty: number | null
}
