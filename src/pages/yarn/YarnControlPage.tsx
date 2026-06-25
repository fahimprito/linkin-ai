import { Cable, ClipboardCheck, Package, Truck } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { useAppSelector } from "@/store/hooks"

export function YarnControlPage() {
  const checkRequests = useAppSelector((state) => state.yarnCheck.checkRequests)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)

  const pendingChecks = checkRequests.filter((r) => r.status === "Pending").length
  const activeOrders = supplierOrders.filter(
    (o) => o.status !== "Fully Received"
  ).length
  const pendingInspections = deliveryBatches.filter(
    (b) =>
      b.inspectionStatus === "Pending" || b.inspectionStatus === "Received"
  ).length
  const acceptedBatches = deliveryBatches.filter(
    (b) => b.inspectionStatus === "Accepted"
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarn Control Dashboard"
        description="Manage yarn check requests from merchandisers, supplier orders, delivery receipts, and batch inspections."
      />

      {/* Metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pending Checks"
          value={String(pendingChecks).padStart(2, "0")}
          delta="From Merchandise"
          tone="warning"
        />
        <MetricCard
          label="Active Orders"
          value={String(activeOrders).padStart(2, "0")}
          delta="Supplier POs"
          tone="default"
        />
        <MetricCard
          label="Awaiting Inspection"
          value={String(pendingInspections).padStart(2, "0")}
          delta="Delivery batches"
          tone="warning"
        />
        <MetricCard
          label="Accepted Batches"
          value={String(acceptedBatches).padStart(2, "0")}
          delta="Stock updated"
          tone="success"
        />
      </section>

      {/* Quick Links */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            to: "/yarn/check-requests",
            icon: Cable,
            label: "Check Requests",
            desc: "Review yarn availability",
          },
          {
            to: "/yarn/supplier-orders",
            icon: Package,
            label: "Supplier Orders",
            desc: "Manage yarn orders",
          },
          {
            to: "/yarn/delivery-log",
            icon: Truck,
            label: "Delivery Log",
            desc: "Track batch deliveries",
          },
          {
            to: "/yarn/batch-inspection",
            icon: ClipboardCheck,
            label: "Batch Inspection",
            desc: "Inspect & accept/reject",
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-start gap-4 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="rounded-xl bg-primary/10 p-2.5">
              <item.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold group-hover:text-primary">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent Yarn Check Requests */}
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

      {/* Recent Delivery Batches */}
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
            ]}
            data={deliveryBatches.slice(0, 5)}
          />
        </section>
      )}
    </div>
  )
}
