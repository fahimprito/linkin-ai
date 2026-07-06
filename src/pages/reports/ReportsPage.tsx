import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { mockUsers } from "@/mock/auth"
import { poStatusToStage } from "@/components/shared/stage-tracker"
import {
  getPurchaseOrderDisplayCcd,
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
} from "@/lib/purchase-orders"
import { createPurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
import { workflowProgressByStatus } from "@/lib/workflow-status"
import { useAppSelector } from "@/store/hooks"
import type { PurchaseOrder } from "@/types/modules"

const quickLinks = [
  {
    title: "PO Detail Tracker",
    description: "Track management-facing PO progress in one place.",
    to: "/management/po-tracker",
  },
  {
    title: "Pre-Booking Bal to Utilize",
    description: "Review month-wise 2026 pre-booking balance by buyer and GG.",
    to: "/management/buyer-gg-wise-pre-booking",
  },
  {
    title: "Order Summary",
    description: "Review grouped order booking quantities for 2026.",
    to: "/management/order-booking-summary",
  },
  {
    title: "Buyer.GG Wise CFMD Qty",
    description: "Review confirmed quantity summary by buyer and gauge.",
    to: "/management/buyer-gg-wise-cfmd-qty",
  },
  {
    title: "BWSL&DISL Prod Summery",
    description: "Review 2026 production summary for management monitoring.",
    to: "/management/bwsl-disl-prod-summery",
  },
]

export function ReportsPage() {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const defaultMerchandiseName =
    mockUsers.find((user) => user.role === "merchandising_user")?.name ??
    "Merchandising Team"
  const workflowMetrics = createPurchaseOrderWorkflowMetrics({
    purchaseOrders,
    deliveryBatches,
    stockMovements,
    supplierOrders,
  })
  const sentToKnittingCount = purchaseOrders.filter(
    (order) => order.status === "Sent to Knitting"
  ).length
  const inProgress = purchaseOrders.filter((order) =>
    [
      "Knitting In Progress",
      "Linking In Progress",
      "Finishing In Progress",
    ].includes(order.status)
  ).length
  const pendingReview = purchaseOrders.filter((order) =>
    [
      "Created",
      "Sent to Design",
      "Design Completed",
      "Sent to Yarn",
      "Yarn Processing",
      "Sent to Store",
      "Store Processing",
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
          <p className="text-xs text-muted-foreground">Sent to Knitting</p>
          <p className="mt-1 text-2xl font-semibold">{sentToKnittingCount}</p>
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
              render: (_row: PurchaseOrder, rowIndex: number) =>
                String(rowIndex + 1).padStart(2, "0"),
            },
            {
              key: "poNumber",
              header: "PO Number",
              className: "min-w-[5.75rem]",
              render: (row) => String(getPurchaseOrderDisplayNo(row) || "-"),
            },
            {
              key: "merchandiseName",
              header: "Merchandise Name",
              className: "min-w-[7rem]",
              render: () => String(defaultMerchandiseName),
            },
            {
              key: "buyerName",
              header: "Buyer",
              className: "min-w-[5.5rem]",
              render: (row) => String(row.buyer || "-"),
            },
            {
              key: "styleName",
              header: "Style Name",
              className: "min-w-[7rem]",
              render: (row) => String(getPurchaseOrderDisplayStyle(row) || "-"),
            },
            {
              key: "styleNo",
              header: "Style Number",
              className: "min-w-[5.75rem]",
              render: (row) => String(row.styleNo || "-"),
            },
            {
              key: "quantity",
              header: "Quantity",
              className: "min-w-[5rem]",
              render: (row) =>
                Number(getPurchaseOrderDisplayQty(row)).toLocaleString("en-US"),
            },
            {
              key: "color",
              header: "Colors",
              className: "min-w-[5.5rem]",
              render: (row) => String(row.color || "-"),
            },
            {
              key: "deliveryDate",
              header: "CCD",
              className: "min-w-[5.75rem]",
              render: (row) => String(getPurchaseOrderDisplayCcd(row) || "-"),
            },
            {
              key: "materialSummary",
              header: "Material Summary",
              className: "min-w-[8rem]",
              render: (row) => (
                <div className="space-y-0.5 text-[10px] leading-4">
                  <p>Yarn: {(row.totalYarnKg ?? 0).toLocaleString()} kg</p>
                  <p>Fabric: {(row.totalFabricKg ?? 0).toLocaleString()} kg</p>
                  <p>
                    Accessories: {(row.totalAccessoriesQty ?? 0).toLocaleString()} pcs
                  </p>
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
                    "-"
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
                    "-"
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
              key: "progress",
              header: "Progress (%)",
              className: "min-w-[6.5rem]",
              render: (row) => {
                const progress =
                  workflowProgressByStatus[
                    String(row.status) as keyof typeof workflowProgressByStatus
                  ] ?? 0

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









