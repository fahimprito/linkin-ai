import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getPurchaseOrderDisplayCcd,
  getPurchaseOrderDisplayGauge,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
} from "@/lib/purchase-orders"
import { useAppSelector } from "@/store/hooks"

export function MerchandiseMasterExcelPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const pendingYarnCount = purchaseOrders.filter((po) =>
    ["Sent to Yarn", "Yarn Processing"].includes(po.status)
  ).length
  const sentToKnittingCount = purchaseOrders.filter(
    (po) => po.status === "Sent to Knitting"
  ).length
  const yarnReadyCount = purchaseOrders.filter(
    (po) => po.status === "Yarn Ready"
  ).length

  return (
    <div className="space-y-6">
      <PageHeader title="Master Excel" />

      <SearchFilterBar
        filters={[
          "All POs",
          "Sent to Yarn",
          "Yarn Ready",
          "Sent to Knitting",
          "Yarn Processing",
        ]}
      />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Total POs"
          value={String(purchaseOrders.length).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Yarn Queue"
          value={String(pendingYarnCount).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Sent to Knitting"
          value={String(sentToKnittingCount).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Yarn Ready"
          value={String(yarnReadyCount).padStart(2, "0")}
          tone="success"
        />
      </section>

      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          {
            key: "style",
            header: "Style",
            render: (row) => getPurchaseOrderDisplayStyle(row),
          },
          {
            key: "quantity",
            header: "Order Qty",
            render: (row) =>
              Number(getPurchaseOrderDisplayQty(row)).toLocaleString(),
          },
          {
            key: "requiredYarnQty",
            header: "Required Yarn (kg)",
            render: (row) =>
              row.requiredYarnQty ? String(row.requiredYarnQty) : "-",
          },
          {
            key: "gauge",
            header: "Gauge",
            render: (row) => String(getPurchaseOrderDisplayGauge(row) || "-"),
          },
          {
            key: "color",
            header: "Color",
            render: (row) => String(row.color ?? "-"),
          },
          { key: "supplier", header: "Supplier" },
          {
            key: "deliveryDate",
            header: "Delivery Date",
            render: (row) => getPurchaseOrderDisplayCcd(row) || "-",
          },
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
