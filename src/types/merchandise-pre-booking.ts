export type MerchandisePreBookingRecord = {
  id: string
  buyerName: string
  gg: string
  orderQty: number
  inspectionDate: string
  remarks: string
  createdAt: string
}

export type UpsertMerchandisePreBookingPayload = {
  id?: string
  buyerName: string
  gg: string
  orderQty: number
  inspectionDate: string
  remarks: string
}
