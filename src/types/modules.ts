export type PurchaseOrder = {
  id: string
  poNumber: string
  buyer: string
  style: string
  design: string
  quantity: number
  status: "Knitting" | "Linking" | "Finishing"
  supplier: string
  deliveryDate: string
}

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
