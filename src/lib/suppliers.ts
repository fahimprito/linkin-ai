import type {
  MerchandiseSupplier,
  SupplierStatus,
  SupplierType,
} from "@/types/modules"
import { demoMerchandiseSuppliers } from "@/mock/demo-data"

const SUPPLIERS_STORAGE_KEY = "linkin-ai-merchandise-suppliers"
const defaultSuppliers: MerchandiseSupplier[] = demoMerchandiseSuppliers

function canUseStorage() {
  return typeof window !== "undefined"
}

function normalizeSupplierStatus(status?: string): SupplierStatus {
  return status === "Inactive" ? "Inactive" : "Active"
}

function normalizeSupplierType(type?: string): SupplierType {
  if (type === "Yarn" || type === "Accessories" || type === "Both") {
    return type
  }

  return "Both"
}

function normalizeSupplier(
  supplier: Partial<MerchandiseSupplier>,
  index: number
): MerchandiseSupplier {
  return {
    id: supplier.id || `supplier-${String(index + 1).padStart(3, "0")}`,
    supplierCode: String(supplier.supplierCode ?? "").trim(),
    supplierName: String(supplier.supplierName ?? "").trim(),
    contactPerson: String(supplier.contactPerson ?? "").trim(),
    phone: String(supplier.phone ?? "").trim(),
    email: String(supplier.email ?? "").trim() || undefined,
    address: String(supplier.address ?? "").trim() || undefined,
    supplierType: normalizeSupplierType(supplier.supplierType),
    leadTimeDays:
      typeof supplier.leadTimeDays === "number" &&
      Number.isFinite(supplier.leadTimeDays)
        ? supplier.leadTimeDays
        : undefined,
    notes: String(supplier.notes ?? "").trim() || undefined,
    status: normalizeSupplierStatus(supplier.status),
    createdAt: supplier.createdAt || new Date().toISOString(),
  }
}

export function getStoredSuppliers() {
  if (!canUseStorage()) {
    return defaultSuppliers.map(normalizeSupplier)
  }

  const raw = window.localStorage.getItem(SUPPLIERS_STORAGE_KEY)
  if (!raw) {
    return defaultSuppliers.map(normalizeSupplier)
  }

  try {
    const parsed = JSON.parse(raw) as Array<Partial<MerchandiseSupplier>>
    const normalized = parsed.map(normalizeSupplier)
    saveStoredSuppliers(normalized)
    return normalized
  } catch {
    window.localStorage.removeItem(SUPPLIERS_STORAGE_KEY)
    return defaultSuppliers.map(normalizeSupplier)
  }
}

export function saveStoredSuppliers(suppliers: MerchandiseSupplier[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    SUPPLIERS_STORAGE_KEY,
    JSON.stringify(suppliers.map(normalizeSupplier))
  )
}

export function buildSupplier(payload: Omit<MerchandiseSupplier, "id" | "createdAt">) {
  return normalizeSupplier(
    {
      ...payload,
      id: `supplier-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    0
  )
}
