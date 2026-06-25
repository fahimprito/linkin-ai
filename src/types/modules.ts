// ── PO Status Lifecycle ──────────────────────────────────────────────
export type POStatus =
  | "Draft"
  | "Pending Yarn Check"
  | "Yarn Available"
  | "Yarn Ordered"
  | "Yarn Receiving"
  | "Ready for Production"
  | "Knitting"
  | "Linking"
  | "Finishing"
  | "Finished – Ready to Ship"

// ── Purchase Order ───────────────────────────────────────────────────
export type PurchaseOrder = {
  id: string
  poNumber: string
  buyer: string
  style: string
  design: string
  quantity: number
  status: POStatus
  supplier: string
  deliveryDate: string
  // Stage 1 additions
  gg?: string
  yarnComposition?: string
  color?: string
  techPack?: string
  designLayout?: string
  approval?: string
  createdAt: string
  yarnCheckRequestId?: string
  requiredYarnQty?: number
}

export type CreatePurchaseOrderPayload = Omit<PurchaseOrder, "id" | "createdAt">

// ── Yarn Check Request ───────────────────────────────────────────────
export type YarnCheckRequestStatus =
  | "Pending"
  | "Checking"
  | "Available"
  | "Not Available"
  | "Ordered"
  | "Receiving"
  | "Fulfilled"

export type YarnCheckRequest = {
  id: string
  poId: string
  poNumber: string
  buyer: string
  style: string
  yarnComposition: string
  color: string
  requiredQty: number
  requestedBy: string
  requestedAt: string
  status: YarnCheckRequestStatus
}

// ── Yarn Supplier Order ──────────────────────────────────────────────
export type YarnSupplierOrderStatus =
  | "Placed"
  | "In Transit"
  | "Partially Received"
  | "Fully Received"

export type YarnSupplierOrder = {
  id: string
  yarnCheckRequestId: string
  poId: string
  poNumber: string
  supplier: string
  yarnType: string
  color: string
  orderedQty: number
  expectedArrival: string
  orderedAt: string
  status: YarnSupplierOrderStatus
}

// ── Yarn Delivery Batch ──────────────────────────────────────────────
export type YarnBatchInspectionStatus =
  | "Pending"
  | "Received"
  | "Inspected"
  | "Accepted"
  | "Rejected"

export type YarnDeliveryBatch = {
  id: string
  supplierOrderId: string
  poId: string
  poNumber: string
  batchNumber: string
  quantity: number
  deliveryDate: string
  inspectionStatus: YarnBatchInspectionStatus
  testReportName?: string
  rejectionReason?: string
  inspectedBy?: string
  inspectedAt?: string
  remarks?: string
  // Audit trail fields (immutable after submission)
  createdAt: string
  createdBy: string
}

// ── Dashboard / Shared Types ─────────────────────────────────────────
export type DashboardMetric = {
  id: string
  label: string
  value: string
  delta: string
  tone: "default" | "success" | "warning" | "danger"
}

export type ActivityItem = {
  id: string
  title: string
  description: string
  timestamp: string
  status: "info" | "success" | "warning"
}

export type InventoryRecord = {
  id: string
  item: string
  category: string
  quantity: string
  status: "Healthy" | "Low" | "Critical"
}

export type InspectionRecord = {
  id: string
  quality: string
  elasticity: string
  moisture: string
  quantity: string
  inspector: string
}

export type GenericModuleSummary = {
  title: string
  description: string
  metrics: DashboardMetric[]
  records: Array<Record<string, string>>
}
