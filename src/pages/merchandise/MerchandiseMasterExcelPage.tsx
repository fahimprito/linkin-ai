import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"

export function MerchandiseMasterExcelPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const pendingYarnCheckCount = purchaseOrders.filter((po) =>
    ["Pending Yarn Check", "Yarn Ordered", "Yarn Receiving"].includes(po.status)
  ).length
  const readyForProductionCount = purchaseOrders.filter(
    (po) => po.status === "Ready for Production"
  ).length
  const inProductionCount = purchaseOrders.filter((po) =>
    ["Knitting", "Linking", "Finishing"].includes(po.status)
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Excel"
        description="Live merchandising master sheet generated directly from PO List data. No separate submission is required here."
      />

      <SearchFilterBar
        filters={[
          "All POs",
          "Pending Yarn Check",
          "Ready for Production",
          "In Production",
          "Finished",
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total POs"
          value={String(purchaseOrders.length).padStart(2, "0")}
          delta="Live from PO List"
          tone="default"
        />
        <MetricCard
          label="Yarn Check"
          value={String(pendingYarnCheckCount).padStart(2, "0")}
          delta="Awaiting Stage 1 closure"
          tone="warning"
        />
        <MetricCard
          label="Ready for Production"
          value={String(readyForProductionCount).padStart(2, "0")}
          delta="Released from Yarn"
          tone="success"
        />
        <MetricCard
          label="In Production"
          value={String(inProductionCount).padStart(2, "0")}
          delta="Knitting to Finishing"
          tone="success"
        />
      </section>

      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "style", header: "Style" },
          {
            key: "quantity",
            header: "Order Qty",
            render: (row) => Number(row.quantity).toLocaleString(),
          },
          {
            key: "requiredYarnQty",
            header: "Required Yarn (kg)",
            render: (row) =>
              row.requiredYarnQty ? String(row.requiredYarnQty) : "-",
          },
          {
            key: "gg",
            header: "GG",
            render: (row) => String(row.gg ?? "-"),
          },
          {
            key: "color",
            header: "Color",
            render: (row) => String(row.color ?? "-"),
          },
          { key: "supplier", header: "Supplier" },
          { key: "deliveryDate", header: "Delivery Date" },
          {
            key: "status",
            header: "Current Stage",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
        ]}
        data={purchaseOrders}
      />
    </div>
  )
}
