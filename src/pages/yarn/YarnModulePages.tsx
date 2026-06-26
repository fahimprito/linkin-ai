import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export function YarnTypePage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const uniqueYarnTypes = new Set(
    purchaseOrders
      .map((po) => po.yarnComposition?.trim() ?? "")
      .filter((value) => value.length > 0)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarn Type"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Yarn Types"
          value={String(uniqueYarnTypes.size).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Colored Lines"
          value={String(
            purchaseOrders.filter((po) => po.color?.trim()).length
          ).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Supplier Linked"
          value={String(
            purchaseOrders.filter((po) => po.supplier.trim().length > 0).length
          ).padStart(2, "0")}
          tone="warning"
        />
      </section>
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "style", header: "Style" },
          { key: "yarnComposition", header: "Yarn Type" },
          { key: "color", header: "Color" },
          { key: "supplier", header: "Supplier" },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
        ]}
        data={purchaseOrders}
      />
    </div>
  )
}

export function YarnInventoryPage() {
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const availableStock = stockMovements.reduce(
    (sum, movement) =>
      movement.movementType === "Issued to Knitting"
        ? sum - movement.quantity
        : sum + movement.quantity,
    0
  )
  const receivedMovements = stockMovements.filter(
    (movement) => movement.movementType === "Accepted Receipt"
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarn Inventory"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Available Stock"
          value={`${Math.round(availableStock)} kg`}
          tone="success"
        />
        <MetricCard
          label="Stock Movements"
          value={String(stockMovements.length).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Accepted Receipts"
          value={String(receivedMovements).padStart(2, "0")}
          tone="warning"
        />
      </section>
      <DataTable
        columns={[
          {
            key: "movementDate",
            header: "Date",
            render: (row) => formatDate(String(row.movementDate)),
          },
          { key: "poNumber", header: "PO Number" },
          { key: "yarnType", header: "Yarn Type" },
          { key: "color", header: "Color" },
          {
            key: "quantity",
            header: "Qty",
            render: (row) => String(row.quantity),
          },
          { key: "movementType", header: "Movement Type" },
          { key: "referenceLabel", header: "Reference" },
          { key: "createdBy", header: "Created By" },
        ]}
        data={stockMovements}
      />
    </div>
  )
}

