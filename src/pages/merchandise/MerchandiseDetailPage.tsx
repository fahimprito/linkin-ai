import { useParams } from "react-router"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  StageTracker,
  PO_LIFECYCLE_STAGES,
  poStatusToStage,
} from "@/components/shared/stage-tracker"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"

export function MerchandiseDetailPage() {
  const { poId = "" } = useParams()
  const po = useAppSelector((state) =>
    state.merchandise.purchaseOrders.find((order) => order.id === poId)
  )
  const yarnCheckRequest = useAppSelector((state) =>
    state.yarnCheck.checkRequests.find((r) => r.poId === poId)
  )
  const supplierOrders = useAppSelector((state) =>
    state.yarnCheck.supplierOrders.filter((o) => o.poId === poId)
  )
  const deliveryBatches = useAppSelector((state) =>
    state.yarnCheck.deliveryBatches.filter((b) => b.poId === poId)
  )

  if (!po) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="The requested PO detail could not be loaded."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${po.poNumber} • ${po.style}`}
        description="Full PO detail with yarn check status, delivery log, and production timeline."
      />

      {/* Stage Tracker */}
      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Current Stage
        </p>
        <StageTracker
          stages={PO_LIFECYCLE_STAGES}
          currentStage={poStatusToStage(po.status)}
        />
      </section>

      {/* PO Information Cards */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Buyer</p>
          <p className="mt-2 text-xl font-semibold">{po.buyer}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {po.design}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="mt-2">
            <StatusBadge value={po.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Delivery target: {po.deliveryDate}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Order Details</p>
          <p className="mt-2 text-xl font-semibold">
            {po.quantity.toLocaleString()} pcs
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            GG: {po.gg ?? "–"} · Yarn: {po.requiredYarnQty ?? "–"} kg
          </p>
        </div>
      </section>

      {/* Yarn Details */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Yarn Specification</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Composition</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {po.yarnComposition || "–"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Color</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {po.color || "–"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Supplier</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {po.supplier || "–"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Required Qty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {po.requiredYarnQty ? `${po.requiredYarnQty} kg` : "–"}
              </p>
            </div>
          </div>
        </div>

        {/* Yarn Check Request Status */}
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Yarn Check Request</h2>
          {yarnCheckRequest ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-[1.5rem] bg-secondary/60 p-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">
                    <StatusBadge value={yarnCheckRequest.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Requested</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(yarnCheckRequest.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-secondary/60 p-4">
                <p className="text-sm font-medium">Requested By</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {yarnCheckRequest.requestedBy}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No yarn check request yet. Send from the PO list to initiate.
            </p>
          )}
        </div>
      </section>

      {/* Supplier Orders */}
      {supplierOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Supplier Orders</h2>
          <DataTable
            columns={[
              { key: "supplier", header: "Supplier" },
              { key: "yarnType", header: "Yarn Type" },
              { key: "color", header: "Color" },
              {
                key: "orderedQty",
                header: "Ordered Qty (kg)",
                render: (row) => String(row.orderedQty),
              },
              { key: "expectedArrival", header: "Expected Arrival" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusBadge value={String(row.status)} />
                ),
              },
            ]}
            data={supplierOrders}
          />
        </section>
      )}

      {/* Yarn Delivery Log */}
      {deliveryBatches.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Yarn Delivery Log</h2>
          <DataTable
            columns={[
              { key: "batchNumber", header: "Batch No" },
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
                key: "testReportName",
                header: "Test Report",
                render: (row) =>
                  row.testReportName ? (
                    <span className="text-sm text-sky-600 dark:text-sky-400">
                      {String(row.testReportName)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  ),
              },
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "–"),
              },
            ]}
            data={deliveryBatches}
          />
        </section>
      )}
    </div>
  )
}
