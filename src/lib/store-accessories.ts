import type {
  StoreAccessoryReceipt,
  StoreInventoryHistoryRecord,
  StoreInventoryRecord,
} from "@/types/modules"
import {
  demoStoreAccessoryReceipts,
  demoStoreInventoryHistory,
  demoStoreInventoryRecords,
} from "@/mock/demo-data"

const RECEIPTS_KEY = "linkin-store-accessory-receipts"
const INVENTORY_KEY = "linkin-store-inventory-records"
const INVENTORY_HISTORY_KEY = "linkin-store-inventory-history"

function canUseStorage() {
  return typeof window !== "undefined"
}

function load<T>(key: string, fallback: T[]) {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }

    const parsed = JSON.parse(raw) as T[]
    return parsed.length > 0 ? parsed : fallback
  } catch {
    window.localStorage.removeItem(key)
    return fallback
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
  return load<StoreAccessoryReceipt>(RECEIPTS_KEY, demoStoreAccessoryReceipts)
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
  return load<StoreInventoryRecord>(INVENTORY_KEY, demoStoreInventoryRecords)
}

export function saveStoredStoreInventoryRecords(records: StoreInventoryRecord[]) {
  const normalized = records.map((record) => ({
    ...record,
    currentStock: computeCurrentStock(record),
  }))
  save(INVENTORY_KEY, normalized)
}

export function getStoredStoreInventoryHistory() {
  return load<StoreInventoryHistoryRecord>(
    INVENTORY_HISTORY_KEY,
    demoStoreInventoryHistory
  )
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
            reservedQty: record.reservedQty + input.quantity,
            currentStock: computeCurrentStock({
              availableQty: record.availableQty,
              reservedQty: record.reservedQty + input.quantity,
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
        availableQty: 0,
        reservedQty: input.quantity,
        issuedQty: 0,
        currentStock: computeCurrentStock({
          availableQty: 0,
          reservedQty: input.quantity,
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
      notes: input.notes || "Pending inspection",
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

export function applyStoreInspectionToInventory(input: {
  itemName: string
  lotNo: string
  supplier: string
  checkedQty: number
  approvedQty: number
  rejectedQty: number
  actionDate: string
  notes?: string
  poId?: string
  poNumber?: string
  previousCheckedQty?: number
  previousApprovedQty?: number
  previousRejectedQty?: number
}) {
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

  const previousCheckedQty = input.previousCheckedQty ?? 0
  const previousApprovedQty = input.previousApprovedQty ?? 0
  const previousRejectedQty = input.previousRejectedQty ?? 0
  const nextReservedQty = Math.max(
    0,
    match.reservedQty + previousCheckedQty - input.checkedQty
  )
  const nextAvailableQty = Math.max(
    0,
    match.availableQty - previousApprovedQty + input.approvedQty
  )

  const nextRecords = records.map((record) =>
    record.id === match.id
      ? {
          ...record,
          availableQty: nextAvailableQty,
          reservedQty: nextReservedQty,
          currentStock: computeCurrentStock({
            availableQty: nextAvailableQty,
            reservedQty: nextReservedQty,
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
      action:
        input.approvedQty > 0 && input.rejectedQty > 0
          ? "Inspection Updated"
          : input.approvedQty > 0
            ? "Inspection Approved"
            : "Inspection Rejected",
      quantity: input.checkedQty,
      actionDate: input.actionDate,
      notes:
        input.notes ||
        `Approved: ${input.approvedQty}, Rejected: ${input.rejectedQty}, Previous Rejected: ${previousRejectedQty}`,
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


