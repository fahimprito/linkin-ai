import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { poStatusToStage } from "@/components/shared/stage-tracker"
import { createPurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
import { useAppSelector } from "@/store/hooks"

const quickLinks = [
  {
    title: "PO Detail Tracker",
    description: "Track management-facing PO progress in one place.",
    to: "/management/po-tracker",
  },
  {
    title: "Yarn Information",
    description: "Review yarn register and supplier-level details.",
    to: "/management/yarn-information",
  },
  {
    title: "Yarn Stock Calculation",
    description: "Check current yarn stock movement and balance.",
    to: "/management/yarn-stock-calculation",
  },
]

const progressByStatus: Record<string, number> = {
  Draft: 10,
  "Consumption Requested": 20,
  "Pending Yarn Check": 35,
  "Yarn Ordered": 50,
  "Yarn Receiving": 65,
  "Yarn Available": 75,
  "Ready for Production": 85,
  Knitting: 90,
  Linking: 94,
  Finishing: 97,
  "Finished â€“ Ready to Ship": 100,
}

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("en-US").format(value ?? 0)
}

export function ReportsPage() {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const workflowMetrics = createPurchaseOrderWorkflowMetrics({
    purchaseOrders,
    deliveryBatches,
    stockMovements,
    supplierOrders,
  })
  const readyForProduction = purchaseOrders.filter(
    (order) => order.status === "Ready for Production"
  ).length
  const inProgress = purchaseOrders.filter((order) =>
    ["Knitting", "Linking", "Finishing"].includes(order.status)
  ).length
  const pendingReview = purchaseOrders.filter((order) =>
    [
      "Draft",
      "Consumption Requested",
      "Pending Yarn Check",
      "Yarn Ordered",
      "Yarn Receiving",
    ].includes(order.status)
  ).length
  const recentOrders = [...purchaseOrders]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <PageHeader title="Management Dashboard" />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total POs</p>
          <p className="mt-1 text-2xl font-semibold">{purchaseOrders.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Ready for Production</p>
          <p className="mt-1 text-2xl font-semibold">{readyForProduction}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="mt-1 text-2xl font-semibold">{inProgress}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Yarn Deliveries</p>
          <p className="mt-1 text-2xl font-semibold">{deliveryBatches.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Pending Review</p>
          <p className="mt-1 text-2xl font-semibold">{pendingReview}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-sm transition hover:border-primary/30 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ArrowRight className="mt-0.5 size-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-lg font-semibold">Recent PO Overview</p>
        <DataTable
          compact
          columns={[
            {
              key: "sl",
              header: "SL",
              className: "min-w-[3rem]",
              render: (row) => String(row.sl || "—"),
            },
            {
              key: "poNumber",
              header: "PO Number",
              className: "min-w-[5.75rem]",
              render: (row) => String(row.poNumber || row.orderNo || "—"),
            },
            {
              key: "styleName",
              header: "Style Name",
              className: "min-w-[7rem]",
              render: (row) => String(row.styleName || row.style || "—"),
            },
            {
              key: "styleNo",
              header: "Style Number",
              className: "min-w-[5.75rem]",
              render: (row) => String(row.styleNo || "—"),
            },
            {
              key: "quantity",
              header: "Quantity",
              className: "min-w-[5rem]",
              render: (row) =>
                Number(row.poQty ?? row.quantity ?? 0).toLocaleString("en-US"),
            },
            {
              key: "color",
              header: "Colors",
              className: "min-w-[5.5rem]",
              render: (row) => String(row.color || "—"),
            },
            {
              key: "deliveryDate",
              header: "CCD",
              className: "min-w-[5.75rem]",
              render: (row) => String(row.ccd || row.deliveryDate || "—"),
            },
            {
              key: "materialSummary",
              header: "Material Summary",
              className: "min-w-[8rem]",
              render: (row) => (
                <div className="space-y-0.5 text-[10px] leading-4">
                  <p>Yarn: {formatNumber(row.totalYarnKg)} kg</p>
                  <p>Fabric: {formatNumber(row.totalFabricKg)} kg</p>
                  <p>Accessories: {formatNumber(row.totalAccessoriesQty)} pcs</p>
                </div>
              ),
            },
            {
              key: "supplier",
              header: "Supplier",
              className: "min-w-[6rem]",
              render: (row) =>
                String(
                  workflowMetrics.yarnSupplierByPo[String(row.id)] ||
                    row.supplier ||
                    "—"
                ),
            },
            {
              key: "yarnEta",
              header: "ETA",
              className: "min-w-[5.75rem]",
              render: (row) =>
                String(
                  workflowMetrics.yarnEtaByPo[String(row.id)] ||
                    row.yarnEta ||
                    "—"
                ),
            },
            {
              key: "inspectionStatus",
              header: "Inspection Status",
              className: "min-w-[6.25rem]",
              render: (row) => (
                <StatusBadge
                  value={
                    workflowMetrics.yarnInspectionStatusByPo[String(row.id)] ||
                    "Pending"
                  }
                />
              ),
            },
            {
              key: "ppStatus",
              header: "PP Status",
              className: "min-w-[5.75rem]",
              render: (row) => String(row.ppStatus || row.sampleStatus || "—"),
            },
            {
              key: "shipmentSample",
              header: "Shipment Sample",
              className: "min-w-[6.25rem]",
              render: (row) =>
                String(row.shipmentSample || row.shipMode || "—"),
            },
            {
              key: "progress",
              header: "Progress (%)",
              className: "min-w-[6.5rem]",
              render: (row) => {
                const progress = progressByStatus[String(row.status)] ?? 0

                return (
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium">{progress}%</div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              },
            },
            {
              key: "currentStage",
              header: "Current Stage",
              className: "min-w-[6.5rem]",
              render: (row) => String(poStatusToStage(String(row.status))),
            },
            {
              key: "status",
              header: "Status",
              className: "min-w-[6.25rem]",
              render: (row) => <StatusBadge value={String(row.status)} />,
            },
          ]}
          data={recentOrders}
        />
      </section>
    </div>
  )
}
