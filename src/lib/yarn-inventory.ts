export type YarnInventoryRecord = {
  id: string
  yarnName: string
  quality: string
  lotNo: string
  supplier: string
  availableQty: number
  reservedQty: number
  issuedQty: number
  currentStock: number
  lastUpdated: string
  poId?: string
  poNumber?: string
  source: "received" | "manual"
}

export type YarnInventoryHistoryRecord = {
  id: string
  inventoryId: string
  action: string
  quantity: number
  actionDate: string
  notes?: string
}

const INVENTORY_KEY = "linkin-yarn-inventory-records"
const INVENTORY_HISTORY_KEY = "linkin-yarn-inventory-history"

function load<T>(key: string) {
  if (typeof window === "undefined") {
    return [] as T[]
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    window.localStorage.removeItem(key)
    return [] as T[]
  }
}

function save<T>(key: string, value: T[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function computeCurrentStock(record: Pick<YarnInventoryRecord, "availableQty" | "reservedQty" | "issuedQty">) {
  return Math.max(0, record.availableQty - record.reservedQty - record.issuedQty)
}

export function getStoredYarnInventoryRecords() {
  return load<YarnInventoryRecord>(INVENTORY_KEY)
}

export function saveStoredYarnInventoryRecords(records: YarnInventoryRecord[]) {
  const normalized = records.map((record) => ({
    ...record,
    currentStock: computeCurrentStock(record),
  }))
  save(INVENTORY_KEY, normalized)
}

export function getStoredYarnInventoryHistory() {
  return load<YarnInventoryHistoryRecord>(INVENTORY_HISTORY_KEY)
}

export function saveStoredYarnInventoryHistory(records: YarnInventoryHistoryRecord[]) {
  save(INVENTORY_HISTORY_KEY, records)
}

export function upsertInventoryFromReceipt(input: {
  yarnName: string
  quality: string
  lotNo: string
  supplier: string
  quantity: number
  actionDate: string
  notes?: string
  poId?: string
  poNumber?: string
}) {
  const records = getStoredYarnInventoryRecords()
  const history = getStoredYarnInventoryHistory()
  const match = records.find(
    (record) =>
      record.lotNo === input.lotNo &&
      record.supplier === input.supplier &&
      record.yarnName === input.yarnName
  )

  let nextRecords: YarnInventoryRecord[]
  let inventoryId: string

  if (match) {
    inventoryId = match.id
    nextRecords = records.map((record) =>
      record.id === match.id
        ? {
            ...record,
            quality: input.quality,
            supplier: input.supplier,
            availableQty: record.availableQty + input.quantity,
            currentStock: computeCurrentStock({
              availableQty: record.availableQty + input.quantity,
              reservedQty: record.reservedQty,
              issuedQty: record.issuedQty,
            }),
            lastUpdated: input.actionDate,
            poId: input.poId ?? record.poId,
            poNumber: input.poNumber ?? record.poNumber,
          }
        : record
    )
  } else {
    inventoryId = `inventory-${Date.now()}`
    nextRecords = [
      {
        id: inventoryId,
        yarnName: input.yarnName,
        quality: input.quality,
        lotNo: input.lotNo,
        supplier: input.supplier,
        availableQty: input.quantity,
        reservedQty: 0,
        issuedQty: 0,
        currentStock: computeCurrentStock({
          availableQty: input.quantity,
          reservedQty: 0,
          issuedQty: 0,
        }),
        lastUpdated: input.actionDate,
        poId: input.poId,
        poNumber: input.poNumber,
        source: "received",
      },
      ...records,
    ]
  }

  const nextHistory = [
    {
      id: `inventory-history-${Date.now()}`,
      inventoryId,
      action: "Received Yarn",
      quantity: input.quantity,
      actionDate: input.actionDate,
      notes: input.notes,
    },
    ...history,
  ]

  saveStoredYarnInventoryRecords(nextRecords)
  saveStoredYarnInventoryHistory(nextHistory)

  return {
    records: nextRecords,
    history: nextHistory,
  }
}

