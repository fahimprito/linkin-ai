// ── PO Status Lifecycle ──────────────────────────────────────────────
export type POStatus =
  | "Draft"
  | "Created"
  | "Sent to Design"
  | "Design Completed"
  | "Sent to Yarn"
  | "Yarn Processing"
  | "Yarn Ready"
  | "Sent to Store"
  | "Store Processing"
  | "Store Ready"
  | "Sent to Knitting"
  | "Knitting In Progress"
  | "Knitting Completed"
  | "Sent to Linking"
  | "Linking In Progress"
  | "Linking Completed"
  | "Sent to Finishing"
  | "Finishing In Progress"
  | "Ready to Ship"
  | "Completed"

// ── Purchase Order ───────────────────────────────────────────────────
export type PurchaseOrderWorkflowHistoryEntry = {
  status: POStatus
  changedAt: string
  changedBy: string
}

export type PurchaseOrderCanonicalFields = {
  id: string
  poNumber: string
  buyer: string
  style: string
  design: string
  quantity: number
  status: POStatus
  supplier: string
  createdAt: string
  deliveryDate: string
  styleName?: string
  styleNo?: string
  productionUnit?: string
  ccd?: string
  quality?: string
  itemNameCode?: string
  accessories?: string
  ppStatus?: string
  shipmentSample?: string
  remarks?: string
  poQty?: number
  yarn?: string
  gauge?: string
  yarnEta?: string
  totalYarnKg?: number
  totalFabricKg?: number
  totalAccessoriesQty?: number
  color?: string
  yarnCheckRequestId?: string
  requiredYarnQty?: number
  consumptionRequestedAt?: string
  workflowHistory?: PurchaseOrderWorkflowHistoryEntry[]
}

export type PurchaseOrder = PurchaseOrderCanonicalFields

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
  | "Ordered"
  | "In Transit"
  | "Partially Received"
  | "Fully Received"
  | "Cancelled"

export type SupplierOrderItemCategory = "Yarn" | "Accessories"

export type YarnSupplierOrder = {
  id: string
  orderNo?: string
  yarnCheckRequestId: string
  poId: string
  poNumber: string
  styleName?: string
  styleNo?: string
  supplier: string
  yarnType: string
  itemName?: string
  itemCategory?: SupplierOrderItemCategory
  color: string
  orderedQty: number
  unitPrice?: number
  expectedArrival: string
  orderedAt: string
  deliveryDate?: string
  inspectionDate?: string
  remarks?: string
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
