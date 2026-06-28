import type {
  StoreAccessoryReceipt,
  StoreInventoryHistoryRecord,
  StoreInventoryRecord,
} from "@/types/modules"

const RECEIPTS_KEY = "linkin-store-accessory-receipts"
const INVENTORY_KEY = "linkin-store-inventory-records"
const INVENTORY_HISTORY_KEY = "linkin-store-inventory-history"

function canUseStorage() {
  return typeof window !== "undefined"
}

function load<T>(key: string) {
  if (!canUseStorage()) {
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
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function computeCurrentStock(
  record: Pick<StoreInventoryRecord, "availableQty" | "reservedQty" | "issuedQty">
) {
  return Math.max(0, record.availableQty - record.reservedQty - record.issuedQty)
}

export function getStoredAccessoryReceipts() {
  return load<StoreAccessoryReceipt>(RECEIPTS_KEY)
}

export function saveStoredAccessoryReceipts(records: StoreAccessoryReceipt[]) {
  save(RECEIPTS_KEY, records)
}

export function addAccessoryReceipt(receipt: StoreAccessoryReceipt) {
  const records = [receipt, ...getStoredAccessoryReceipts()]
  saveStoredAccessoryReceipts(records)
  return records
}

export function getStoredStoreInventoryRecords() {
  return load<StoreInventoryRecord>(INVENTORY_KEY)
}

export function saveStoredStoreInventoryRecords(records: StoreInventoryRecord[]) {
  const normalized = records.map((record) => ({
    ...record,
    currentStock: computeCurrentStock(record),
  }))
  save(INVENTORY_KEY, normalized)
}

export function getStoredStoreInventoryHistory() {
  return load<StoreInventoryHistoryRecord>(INVENTORY_HISTORY_KEY)
}

export function saveStoredStoreInventoryHistory(records: StoreInventoryHistoryRecord[]) {
  save(INVENTORY_HISTORY_KEY, records)
}

export function upsertStoreInventoryFromReceipt(input: {
  itemName: string
  itemCode?: string
  lotNo: string
  supplier: string
  quantity: number
  actionDate: string
  notes?: string
  poId?: string
  poNumber?: string
}) {
  const records = getStoredStoreInventoryRecords()
  const history = getStoredStoreInventoryHistory()
  const match = records.find(
    (record) =>
      record.lotNo === input.lotNo &&
      record.supplier === input.supplier &&
      record.itemName === input.itemName
  )

  let nextRecords: StoreInventoryRecord[]
  let inventoryId: string

  if (match) {
    inventoryId = match.id
    nextRecords = records.map((record) =>
      record.id === match.id
        ? {
            ...record,
            supplier: input.supplier,
            itemCode: input.itemCode ?? record.itemCode,
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
    inventoryId = `store-inventory-${Date.now()}`
    nextRecords = [
      {
        id: inventoryId,
        itemName: input.itemName,
        itemCode: input.itemCode,
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
      id: `store-inventory-history-${Date.now()}`,
      inventoryId,
      action: "Received Accessories",
      quantity: input.quantity,
      actionDate: input.actionDate,
      notes: input.notes,
    },
    ...history,
  ]

  saveStoredStoreInventoryRecords(nextRecords)
  saveStoredStoreInventoryHistory(nextHistory)

  return {
    records: nextRecords,
    history: nextHistory,
  }
}

export function adjustStoreInventoryAfterInspection(input: {
  itemName: string
  lotNo: string
  supplier: string
  quantityDelta: number
  actionDate: string
  notes?: string
  poId?: string
  poNumber?: string
  actionLabel: string
}) {
  if (!input.quantityDelta) {
    return {
      records: getStoredStoreInventoryRecords(),
      history: getStoredStoreInventoryHistory(),
    }
  }

  const records = getStoredStoreInventoryRecords()
  const history = getStoredStoreInventoryHistory()
  const match = records.find(
    (record) =>
      record.lotNo === input.lotNo &&
      record.supplier === input.supplier &&
      record.itemName === input.itemName
  )

  if (!match) {
    return {
      records,
      history,
    }
  }

  const nextAvailableQty = Math.max(0, match.availableQty + input.quantityDelta)
  const nextRecords = records.map((record) =>
    record.id === match.id
      ? {
          ...record,
          availableQty: nextAvailableQty,
          currentStock: computeCurrentStock({
            availableQty: nextAvailableQty,
            reservedQty: record.reservedQty,
            issuedQty: record.issuedQty,
          }),
          lastUpdated: input.actionDate,
          poId: input.poId ?? record.poId,
          poNumber: input.poNumber ?? record.poNumber,
        }
      : record
  )

  const nextHistory = [
    {
      id: `store-inventory-history-${Date.now()}`,
      inventoryId: match.id,
      action: input.actionLabel,
      quantity: Math.abs(input.quantityDelta),
      actionDate: input.actionDate,
      notes: input.notes,
    },
    ...history,
  ]

  saveStoredStoreInventoryRecords(nextRecords)
  saveStoredStoreInventoryHistory(nextHistory)

  return {
    records: nextRecords,
    history: nextHistory,
  }
}
