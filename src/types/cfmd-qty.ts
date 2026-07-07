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
  months: Partial<Record<CfmdMonthKey, string>>
  totalQty: string
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
