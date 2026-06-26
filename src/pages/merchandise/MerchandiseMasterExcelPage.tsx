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
  const yarnAvailableCount = purchaseOrders.filter((po) =>
    po.status === "Yarn Available"
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Excel"
      />

      <SearchFilterBar
        filters={[
          "All POs",
          "Pending Yarn Check",
          "Yarn Available",
          "Ready for Production",
          "Yarn Ordered",
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total POs"
          value={String(purchaseOrders.length).padStart(2, "0")}          tone="default"
        />
        <MetricCard
          label="Yarn Check"
          value={String(pendingYarnCheckCount).padStart(2, "0")}          tone="warning"
        />
        <MetricCard
          label="Ready for Production"
          value={String(readyForProductionCount).padStart(2, "0")}          tone="success"
        />
        <MetricCard
          label="Yarn Available"
          value={String(yarnAvailableCount).padStart(2, "0")}          tone="success"
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

