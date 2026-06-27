import {
  AlertTriangle,
  Cable,
  ClipboardCheck,
  Package,
  Send,
  Truck,
} from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"
import type { YarnBatchInspectionStatus } from "@/types/modules"

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value))
}

function getLatestInspectionStatusByPo(
  poId: string,
  deliveryBatches: Array<{
    poId: string
    deliveryDate: string
    inspectedAt?: string
    inspectionStatus: YarnBatchInspectionStatus
  }>
): YarnBatchInspectionStatus | "Pending" {
  const latestBatch = deliveryBatches
    .filter((batch) => batch.poId === poId)
    .sort((left, right) => {
      const leftDate = left.inspectedAt ?? left.deliveryDate
      const rightDate = right.inspectedAt ?? right.deliveryDate
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]

  return latestBatch?.inspectionStatus ?? "Pending"
}

export function YarnControlPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const checkRequests = useAppSelector((state) => state.yarnCheck.checkRequests)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const yarnSupplierOrders = supplierOrders.filter(
    (order) => (order.itemCategory ?? "Yarn") === "Yarn"
  )
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const requisitions = useAppSelector((state) => state.knitting.requisitions)
  const pendingChecks = checkRequests.filter((request) => request.status === "Pending")
  const activeOrders = yarnSupplierOrders.filter(
    (order) => order.status !== "Fully Received"
  ).length

  const availableStock = stockMovements.reduce(
    (sum, movement) =>
      movement.movementType === "Issued to Knitting"
        ? sum - movement.quantity
        : sum + movement.quantity,
    0
  )
  const uniqueYarnTypes = new Set(
    purchaseOrders
      .map((po) => po.yarnComposition?.trim() ?? po.yarn?.trim() ?? "")
      .filter(Boolean)
  )
  const pendingRequisitionQty = requisitions
    .filter((requisition) => requisition.status !== "Issued")
    .reduce((sum, requisition) => sum + requisition.requiredQty, 0)
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const weeklyReceivedQty = deliveryBatches
    .filter((batch) => {
      const deliveryDate = new Date(batch.deliveryDate)
      return deliveryDate >= sevenDaysAgo && deliveryDate <= today
    })
    .reduce((sum, batch) => sum + batch.quantity, 0)
  const inspectedQty = deliveryBatches
    .filter((batch) =>
      ["Inspected", "Accepted"].includes(batch.inspectionStatus)
    )
    .reduce((sum, batch) => sum + batch.quantity, 0)
  const stockByYarnType = stockMovements.reduce<Record<string, number>>(
    (accumulator, movement) => {
      const yarnType = movement.yarnType?.trim() || "Unknown"
      const quantity =
        movement.movementType === "Issued to Knitting"
          ? -movement.quantity
          : movement.quantity

      accumulator[yarnType] = (accumulator[yarnType] ?? 0) + quantity
      return accumulator
    },
    {}
  )
  const lowStockTypes = Object.values(stockByYarnType).filter(
    (quantity) => quantity > 0 && quantity < 500
  ).length
  const topYarnTypes = Object.entries(stockByYarnType)
    .map(([yarnType, quantity]) => ({
      id: yarnType,
      yarnType,
      quantity,
    }))
    .filter((entry) => entry.quantity > 0)
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 10)
  const totalTopYarnQty = topYarnTypes.reduce(
    (sum, entry) => sum + entry.quantity,
    0
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Yarn Control Dashboard" />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            label="Yarn Types"
            value={String(uniqueYarnTypes.size).padStart(2, "0")}
            tone="default"
            icon={Cable}
          />
          <MetricCard
            label="Pending Requisition"
            value={`${formatNumber(pendingRequisitionQty)} kg`}
            tone="warning"
            icon={Package}
          />
          <MetricCard
            label="Low Stock Types"
            value={String(lowStockTypes).padStart(2, "0")}
            tone={lowStockTypes > 0 ? "danger" : "success"}
            icon={AlertTriangle}
          />
          <MetricCard
            label="Weekly Received"
            value={`${formatNumber(weeklyReceivedQty)} kg`}
            tone="success"
            icon={Truck}
          />
          <MetricCard
            label="Inspection Done"
            value={`${formatNumber(inspectedQty)} kg`}
            tone="default"
            icon={ClipboardCheck}
          />
          <MetricCard
            label="Pending Checks"
            value={String(pendingChecks.length).padStart(2, "0")}
            tone="warning"
            icon={ClipboardCheck}
          />
          <MetricCard
            label="Active Orders"
            value={String(activeOrders).padStart(2, "0")}
            tone="default"
            icon={Send}
          />
          <MetricCard
            label="Available Stock"
            value={`${formatNumber(availableStock)} kg`}
            tone="success"
            icon={Package}
          />
        </div>

        <div className="rounded-[1.75rem] border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Top 10 Qty with Yarn Types</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ranked by current available stock
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="text-sm font-semibold text-primary">
                {formatNumber(totalTopYarnQty)} kg
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-border/80">
            <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
              <thead className="bg-slate-100 text-muted-foreground dark:bg-slate-800/90">
                <tr>
                  <th className="border-b border-r border-border/80 px-3 py-2 font-semibold">
                    #
                  </th>
                  <th className="border-b border-r border-border/80 px-3 py-2 font-semibold">
                    Yarn Type
                  </th>
                  <th className="border-b border-border/80 px-3 py-2 text-right font-semibold">
                    Count (kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {topYarnTypes.length > 0 ? (
                  topYarnTypes.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={index % 2 === 0 ? "bg-background/80" : "bg-card"}
                    >
                      <td className="border-r border-b border-border/70 px-3 py-2">
                        {index + 1}
                      </td>
                      <td className="border-r border-b border-border/70 px-3 py-2">
                        {entry.yarnType}
                      </td>
                      <td className="border-b border-border/70 px-3 py-2 text-right font-medium">
                        {formatNumber(entry.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      No yarn stock data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {checkRequests.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Yarn Check Requests</h2>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/yarn/check-requests">View All</Link>
            </Button>
          </div>
          <DataTable
            columns={[
              { key: "poNumber", header: "PO Number" },
              { key: "buyer", header: "Buyer" },
              { key: "yarnComposition", header: "Yarn" },
              { key: "color", header: "Color" },
              {
                key: "requiredQty",
                header: "Qty (kg)",
                render: (row) => String(row.requiredQty),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={String(row.status)} />,
              },
            ]}
            data={checkRequests.slice(0, 5)}
          />
        </section>
      )}

      {deliveryBatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Delivery Batches</h2>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/yarn/delivery-log">View All</Link>
            </Button>
          </div>
          <DataTable
            columns={[
              { key: "batchNumber", header: "Batch No" },
              { key: "poNumber", header: "PO" },
              {
                key: "quantity",
                header: "Qty (kg)",
                render: (row) => String(row.quantity),
              },
              { key: "deliveryDate", header: "Delivery Date" },
              {
                key: "inspectionStatus",
                header: "Inspection",
                render: (row) => (
                  <StatusBadge value={String(row.inspectionStatus)} />
                ),
              },
              {
                key: "poStatus",
                header: "PO Status",
                render: (row) => {
                  const relatedPo = purchaseOrders.find((po) => po.id === row.poId)
                  return (
                    <StatusBadge
                      value={relatedPo?.status ?? getLatestInspectionStatusByPo(String(row.poId), deliveryBatches)}
                    />
                  )
                },
              },
            ]}
            data={deliveryBatches.slice(0, 5)}
          />
        </section>
      )}
    </div>
  )
}
