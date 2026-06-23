import type {
  ActivityItem,
  DashboardMetric,
  GenericModuleSummary,
  InspectionRecord,
  InventoryRecord,
  PurchaseOrder,
} from "@/types/modules"

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: "m1",
    label: "Active POs",
    value: "128",
    delta: "+14%",
    tone: "success",
  },
  {
    id: "m2",
    label: "Production Efficiency",
    value: "92.4%",
    delta: "+3.1%",
    tone: "success",
  },
  {
    id: "m3",
    label: "Inventory Alerts",
    value: "07",
    delta: "-2",
    tone: "warning",
  },
  {
    id: "m4",
    label: "Shipment Readiness",
    value: "81%",
    delta: "+6%",
    tone: "default",
  },
]

export const recentActivities: ActivityItem[] = [
  {
    id: "a1",
    title: "Yarn receipt approved",
    description: "PO LK-2001 received 1,200kg combed cotton from Delta Yarn.",
    timestamp: "10 minutes ago",
    status: "success",
  },
  {
    id: "a2",
    title: "Finishing alert raised",
    description:
      "Packing line 03 is below target output for the current shift.",
    timestamp: "25 minutes ago",
    status: "warning",
  },
  {
    id: "a3",
    title: "Merchandise updated buyer comment",
    description: "PO LK-2007 technical pack revision uploaded for review.",
    timestamp: "1 hour ago",
    status: "info",
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "LK-2001",
    buyer: "H&M",
    style: "Premium Knit Polo",
    design: "Striped Jacquard",
    quantity: 12000,
    status: "Knitting",
    supplier: "Delta Yarn",
    deliveryDate: "2026-07-04",
  },
  {
    id: "po-002",
    poNumber: "LK-2002",
    buyer: "Zara",
    style: "Fine Gauge Cardigan",
    design: "Cable Texture",
    quantity: 8500,
    status: "Linking",
    supplier: "Everest Fibers",
    deliveryDate: "2026-07-09",
  },
  {
    id: "po-003",
    poNumber: "LK-2003",
    buyer: "Uniqlo",
    style: "Crew Neck Sweater",
    design: "Solid Milano",
    quantity: 15000,
    status: "Finishing",
    supplier: "TexSource",
    deliveryDate: "2026-07-15",
  },
]

export const inventoryAlerts: InventoryRecord[] = [
  {
    id: "inv-1",
    item: "Cotton 30/1",
    category: "Yarn",
    quantity: "620 kg",
    status: "Low",
  },
  {
    id: "inv-2",
    item: "Metal Zipper 18cm",
    category: "Accessories",
    quantity: "220 pcs",
    status: "Critical",
  },
  {
    id: "inv-3",
    item: "Poly Bag Large",
    category: "Packing",
    quantity: "5,300 pcs",
    status: "Healthy",
  },
]

export const yarnInspectionRecords: InspectionRecord[] = [
  {
    id: "ins-1",
    quality: "A",
    elasticity: "Stable",
    moisture: "6.2%",
    quantity: "800 kg",
    inspector: "Nusrat",
  },
  {
    id: "ins-2",
    quality: "A-",
    elasticity: "Acceptable",
    moisture: "6.8%",
    quantity: "650 kg",
    inspector: "Rehan",
  },
]

export const moduleSummaries: Record<string, GenericModuleSummary> = {
  yarn: {
    title: "Yarn Control",
    description:
      "Track purchase orders, receipts, stock levels, inspections, and floor delivery records.",
    metrics: [
      {
        id: "y1",
        label: "Open Yarn POs",
        value: "18",
        delta: "+2",
        tone: "default",
      },
      {
        id: "y2",
        label: "Receipts Today",
        value: "06",
        delta: "+1",
        tone: "success",
      },
      {
        id: "y3",
        label: "Inspection Pass Rate",
        value: "96%",
        delta: "+4%",
        tone: "success",
      },
    ],
    records: [
      {
        po: "YP-1044",
        supplier: "Delta Yarn",
        stock: "1,250 kg",
        status: "In Inspection",
      },
      {
        po: "YP-1046",
        supplier: "Everest Fibers",
        stock: "900 kg",
        status: "Released",
      },
    ],
  },
  store: {
    title: "Store Control",
    description:
      "Manage accessories receipts, inventory inspection, deliveries, and stock reporting.",
    metrics: [
      {
        id: "s1",
        label: "Accessory POs",
        value: "24",
        delta: "+5",
        tone: "default",
      },
      {
        id: "s2",
        label: "Inspection Queue",
        value: "09",
        delta: "-1",
        tone: "warning",
      },
      {
        id: "s3",
        label: "Stock Accuracy",
        value: "98.1%",
        delta: "+0.7%",
        tone: "success",
      },
    ],
    records: [
      {
        item: "Hang Tag",
        supplier: "Label House",
        quantity: "15,000",
        status: "Received",
      },
      {
        item: "Elastic Tape",
        supplier: "Trim Hub",
        quantity: "4,200",
        status: "Pending QC",
      },
    ],
  },
  knitting: {
    title: "Knitting Production",
    description:
      "Coordinate production orders, planning boards, requisitions, tracking, and progress updates.",
    metrics: [
      {
        id: "k1",
        label: "Running Orders",
        value: "11",
        delta: "+2",
        tone: "default",
      },
      {
        id: "k2",
        label: "Machine Utilization",
        value: "88%",
        delta: "+3%",
        tone: "success",
      },
      {
        id: "k3",
        label: "Late Requisitions",
        value: "02",
        delta: "-1",
        tone: "warning",
      },
    ],
    records: [
      {
        order: "KP-5501",
        line: "Knitting 05",
        progress: "72%",
        status: "On Track",
      },
      {
        order: "KP-5502",
        line: "Knitting 07",
        progress: "54%",
        status: "Needs Yarn",
      },
    ],
  },
  linking: {
    title: "Linking Production",
    description:
      "Handle linking orders, planning, live tracking, status updates, and reporting.",
    metrics: [
      {
        id: "l1",
        label: "Linking Orders",
        value: "09",
        delta: "+1",
        tone: "default",
      },
      {
        id: "l2",
        label: "Daily Output",
        value: "4,600",
        delta: "+8%",
        tone: "success",
      },
      {
        id: "l3",
        label: "Blocked Lots",
        value: "01",
        delta: "-2",
        tone: "warning",
      },
    ],
    records: [
      {
        order: "LP-781",
        operator: "Line A",
        progress: "64%",
        status: "Running",
      },
      {
        order: "LP-782",
        operator: "Line C",
        progress: "28%",
        status: "Planning",
      },
    ],
  },
  finishing: {
    title: "Finishing",
    description:
      "Track washing, ironing, packing, requisitions, planning, and output management reports.",
    metrics: [
      {
        id: "f1",
        label: "Packing Ready",
        value: "7,850",
        delta: "+6%",
        tone: "success",
      },
      {
        id: "f2",
        label: "Wash Queue",
        value: "13",
        delta: "+3",
        tone: "warning",
      },
      {
        id: "f3",
        label: "Ironing Capacity",
        value: "91%",
        delta: "+2%",
        tone: "success",
      },
    ],
    records: [
      {
        batch: "FN-231",
        section: "Washing",
        progress: "80%",
        status: "Running",
      },
      {
        batch: "FN-245",
        section: "Packing",
        progress: "35%",
        status: "Awaiting Labels",
      },
    ],
  },
  reports: {
    title: "Reporting & Dashboard",
    description:
      "Executive metrics, production views, yarn and store health, shipment overview, and analytics.",
    metrics: [
      {
        id: "r1",
        label: "Executive KPIs",
        value: "14",
        delta: "+2",
        tone: "default",
      },
      {
        id: "r2",
        label: "Delayed POs",
        value: "03",
        delta: "-1",
        tone: "warning",
      },
      {
        id: "r3",
        label: "Shipment Forecast",
        value: "94%",
        delta: "+5%",
        tone: "success",
      },
    ],
    records: [
      { buyer: "H&M", shipment: "Jul 04", readiness: "86%", status: "Watch" },
      {
        buyer: "Uniqlo",
        shipment: "Jul 12",
        readiness: "95%",
        status: "Healthy",
      },
    ],
  },
}
