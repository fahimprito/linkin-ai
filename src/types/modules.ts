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
export type ConsumptionStatus =
  | "Not Requested"
  | "Requested"
  | "Submitted"

export type PurchaseOrderWorkflowHistoryEntry = {
  status: POStatus
  changedAt: string
  changedBy: string
}

export type PurchaseOrderCanonicalFields = {
  id: string
  poNumber: string
  status: POStatus
  supplier: string
  createdAt: string
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
  workflowHistory?: PurchaseOrderWorkflowHistoryEntry[]
}

export type PurchaseOrderLegacyFields = {
  buyer: string
  style: string
  design: string
  quantity: number
  deliveryDate: string
  sl?: string
  callNumber?: string
  orderNo?: string
  mainSizeHangTagBooking?: string
  careLabelBooking?: string
  priceStickerBooking?: string
  tissue?: string
  polyCartonBooking?: string
  buttonZip?: string
  doneInspection?: string
  sampleStatus?: string
  shipMode?: string
  excessQty?: number
  newCcd?: string
  inspectionStyle?: string
  stylePhoto?: string
  sizeRange?: string
  price?: number
  amount?: number
  factoryCosting?: string
  labTest?: string
  consumptionStatus?: ConsumptionStatus
  consumptionRequestedAt?: string
  gg?: string
  yarnComposition?: string
  techPack?: string
  designLayout?: string
  approval?: string
}

export type PurchaseOrder = PurchaseOrderCanonicalFields &
  PurchaseOrderLegacyFields

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

export type SupplierOrderItemCategory = "Yarn" | "Accessories"

export type YarnSupplierOrder = {
  id: string
  yarnCheckRequestId: string
  poId: string
  poNumber: string
  supplier: string
  yarnType: string
  itemName?: string
  itemCategory?: SupplierOrderItemCategory
  color: string
  orderedQty: number
  expectedArrival: string
  orderedAt: string
  deliveryDate?: string
  inspectionDate?: string
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
