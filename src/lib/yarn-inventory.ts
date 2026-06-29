import {
  demoYarnInventoryHistory,
  demoYarnInventoryRecords,
} from "@/mock/demo-data"

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

function load<T>(key: string, fallback: T[]) {
  if (typeof window === "undefined") {
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
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function computeCurrentStock(record: Pick<YarnInventoryRecord, "availableQty" | "reservedQty" | "issuedQty">) {
  return Math.max(0, record.availableQty - record.reservedQty - record.issuedQty)
}

export function getStoredYarnInventoryRecords() {
  return load<YarnInventoryRecord>(INVENTORY_KEY, demoYarnInventoryRecords)
}

export function saveStoredYarnInventoryRecords(records: YarnInventoryRecord[]) {
  const normalized = records.map((record) => ({
    ...record,
    currentStock: computeCurrentStock(record),
  }))
  save(INVENTORY_KEY, normalized)
}

export function getStoredYarnInventoryHistory() {
  return load<YarnInventoryHistoryRecord>(
    INVENTORY_HISTORY_KEY,
    demoYarnInventoryHistory
  )
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
    inventoryId = `inventory-${Date.now()}`
    nextRecords = [
      {
        id: inventoryId,
        yarnName: input.yarnName,
        quality: input.quality,
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
      id: `inventory-history-${Date.now()}`,
      inventoryId,
      action: "Received Yarn",
      quantity: input.quantity,
      actionDate: input.actionDate,
      notes: input.notes || "Pending inspection",
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

export function applyInspectionToInventory(input: {
  yarnName: string
  quality: string
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
  const records = getStoredYarnInventoryRecords()
  const history = getStoredYarnInventoryHistory()
  const match = records.find(
    (record) =>
      record.lotNo === input.lotNo &&
      record.supplier === input.supplier &&
      record.yarnName === input.yarnName
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
          quality: input.quality,
          supplier: input.supplier,
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
      id: `inventory-history-${Date.now()}`,
      inventoryId: match.id,
      action:
        input.approvedQty > 0 && input.rejectedQty > 0
          ? "Inspection Updated"
          : input.approvedQty > 0
            ? "Inspection Accepted"
            : "Inspection Rejected",
      quantity: input.checkedQty,
      actionDate: input.actionDate,
      notes:
        input.notes ||
        `Approved: ${input.approvedQty}, Rejected: ${input.rejectedQty}`,
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

