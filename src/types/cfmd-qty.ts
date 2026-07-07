export type CfmdMonthKey =
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

export type BuyerGgWiseCfmdQtyRowType = "normal" | "note"

export type BuyerGgWiseCfmdQtyNote = {
  from: CfmdMonthKey
  to: CfmdMonthKey
  text: string
}

export type BuyerGgWiseCfmdQtyRow = {
  gauge: string
  months: Partial<Record<CfmdMonthKey, number | null>>
  totalQty: number | null
  note?: BuyerGgWiseCfmdQtyNote
}

export type BuyerGgWiseCfmdQtyGroup = {
  id: string
  serial: string
  buyerName: string
  buyerClassName?: string
  rows: BuyerGgWiseCfmdQtyRow[]
}

export type BuyerGgWiseCfmdQtyRecord = {
  id: string
  serial: string
  buyerName: string
  gauge: string
  rowType: BuyerGgWiseCfmdQtyRowType
  noteText: string
  noteFrom: CfmdMonthKey | ""
  noteTo: CfmdMonthKey | ""
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
