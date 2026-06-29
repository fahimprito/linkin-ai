import type {
  POStatus,
  PurchaseOrder,
  StoreControllerPoRecord,
  StoreInspectionStatus,
} from "@/types/modules"
import { demoStoreControllerRecords } from "@/mock/demo-data"

const STORE_CONTROLLER_PO_KEY = "linkin-store-controller-po-records"

function canUseStorage() {
  return typeof window !== "undefined"
}

function normalizeInspectionStatus(
  status?: string
): StoreInspectionStatus | undefined {
  if (
    status === "Pending" ||
    status === "Received" ||
    status === "Inspected" ||
    status === "Approved" ||
    status === "Rejected"
  ) {
    return status
  }

  return undefined
}

function normalizeRecord(
  record: Partial<StoreControllerPoRecord>
): StoreControllerPoRecord {
  return {
    poId: String(record.poId ?? "").trim(),
    supplier: String(record.supplier ?? "").trim() || undefined,
    eta: String(record.eta ?? "").trim() || undefined,
    inspectionStatus: normalizeInspectionStatus(record.inspectionStatus),
    inspectionDate: String(record.inspectionDate ?? "").trim() || undefined,
    receivedQty:
      typeof record.receivedQty === "number" && Number.isFinite(record.receivedQty)
        ? record.receivedQty
        : undefined,
    issuedQty:
      typeof record.issuedQty === "number" && Number.isFinite(record.issuedQty)
        ? record.issuedQty
        : undefined,
    stockBalance:
      typeof record.stockBalance === "number" && Number.isFinite(record.stockBalance)
        ? record.stockBalance
        : undefined,
    remarks: String(record.remarks ?? "").trim() || undefined,
    updatedAt: record.updatedAt || new Date().toISOString(),
  }
}

export function isStoreStageReadOnly(status: string) {
  return [
    "Sent to Knitting",
    "Knitting In Progress",
    "Knitting Completed",
    "Sent to Linking",
    "Linking In Progress",
    "Linking Completed",
    "Sent to Finishing",
    "Finishing In Progress",
    "Ready to Ship",
    "Completed",
  ].includes(status)
}

export function hasStoreControllerActivity(
  record?: Partial<StoreControllerPoRecord> | null
) {
  if (!record) {
    return false
  }

  return Boolean(
    record.supplier ||
      record.eta ||
      record.inspectionStatus ||
      record.inspectionDate ||
      typeof record.receivedQty === "number" ||
      typeof record.issuedQty === "number" ||
      typeof record.stockBalance === "number" ||
      record.remarks
  )
}

export function deriveStoreWorkflowStatus(
  order: Pick<PurchaseOrder, "status" | "totalAccessoriesQty">,
  record?: Partial<StoreControllerPoRecord> | null
): POStatus {
  if (isStoreStageReadOnly(order.status)) {
    return order.status as POStatus
  }

  const currentStatus = order.status as POStatus
  const requiredQty = order.totalAccessoriesQty ?? 0
  const receivedQty = record?.receivedQty ?? 0
  const issuedQty = record?.issuedQty ?? 0
  const stockBalance = record?.stockBalance ?? Math.max(0, receivedQty - issuedQty)
  const inspectionStatus = record?.inspectionStatus
  const canEnterStoreStage = [
    "Yarn Ready",
    "Sent to Store",
    "Store Processing",
    "Store Ready",
  ].includes(currentStatus)

  if (!canEnterStoreStage) {
    return currentStatus
  }

  if (issuedQty > 0) {
    return "Sent to Knitting"
  }

  if (
    inspectionStatus === "Approved" &&
    stockBalance > 0 &&
    (requiredQty <= 0 || stockBalance >= requiredQty)
  ) {
    return "Store Ready"
  }

  if (hasStoreControllerActivity(record)) {
    return "Store Processing"
  }

  return currentStatus
}

export function getStoredStoreControllerRecords() {
  if (!canUseStorage()) {
    return demoStoreControllerRecords
  }

  const raw = window.localStorage.getItem(STORE_CONTROLLER_PO_KEY)
  if (!raw) {
    return demoStoreControllerRecords
  }

  try {
    const parsed = JSON.parse(raw) as Array<Partial<StoreControllerPoRecord>>
    const normalized = parsed.map(normalizeRecord).filter((record) => record.poId)
    if (normalized.length === 0) {
      return demoStoreControllerRecords
    }
    saveStoredStoreControllerRecords(normalized)
    return normalized
  } catch {
    window.localStorage.removeItem(STORE_CONTROLLER_PO_KEY)
    return demoStoreControllerRecords
  }
}

export function saveStoredStoreControllerRecords(
  records: StoreControllerPoRecord[]
) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    STORE_CONTROLLER_PO_KEY,
    JSON.stringify(records.map(normalizeRecord))
  )
}

export function upsertStoreControllerRecord(
  input: Partial<StoreControllerPoRecord> & { poId: string }
) {
  const records = getStoredStoreControllerRecords()
  const normalizedInput = normalizeRecord(input)
  const existingRecord = records.find((record) => record.poId === input.poId)

  const nextRecords = existingRecord
    ? records.map((record) =>
        record.poId === input.poId
          ? {
              ...record,
              ...normalizedInput,
              poId: record.poId,
              updatedAt: new Date().toISOString(),
            }
          : record
      )
    : [{ ...normalizedInput, updatedAt: new Date().toISOString() }, ...records]

  saveStoredStoreControllerRecords(nextRecords)
  return nextRecords
}
