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

export type SupplierType = "Yarn" | "Accessories" | "Both"

export type SupplierStatus = "Active" | "Inactive"

export type StoreInspectionStatus =
  | "Pending"
  | "Received"
  | "Inspected"
  | "Approved"
  | "Rejected"

export type MerchandiseSupplier = {
  id: string
  supplierCode: string
  supplierName: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  supplierType: SupplierType
  leadTimeDays?: number
  notes?: string
  status: SupplierStatus
  createdAt: string
}

export type StoreControllerPoRecord = {
  poId: string
  supplier?: string
  eta?: string
  inspectionStatus?: StoreInspectionStatus
  inspectionDate?: string
  receivedQty?: number
  issuedQty?: number
  stockBalance?: number
  remarks?: string
  updatedAt: string
}

export type StoreAccessoryReceipt = {
  id: string
  poId: string
  poNumber: string
  supplier: string
  batchNumber: string
  quantity: number
  receiveDate: string
  remarks?: string
  createdAt: string
  createdBy: string
}

export type StoreInventoryRecord = {
  id: string
  itemName: string
  itemCode?: string
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

export type StoreInventoryHistoryRecord = {
  id: string
  inventoryId: string
  action: string
  quantity: number
  actionDate: string
  notes?: string
}

export type YarnSupplierOrder = {
  id: string
  orderNo?: string
  yarnCheckRequestId: string
  poId: string
  poNumber: string
  styleName?: string
  styleNo?: string
  supplierCode?: string
  supplierContactPerson?: string
  supplierPhone?: string
  supplierEmail?: string
  supplierAddress?: string
  supplierLeadTimeDays?: number
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

