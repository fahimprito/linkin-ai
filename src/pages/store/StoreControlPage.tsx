import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getPurchaseOrderDisplayItemNameCode,
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
} from "@/lib/purchase-orders"
import { getStoredStoreControllerRecords } from "@/lib/store-controller"
import { useAppSelector } from "@/store/hooks"

export function StoreControlPage() {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const storeRecords = getStoredStoreControllerRecords()

  const accessoryOrders = supplierOrders.filter(
    (order) =>
      (order.itemCategory ?? "Yarn") === "Accessories" &&
      order.status !== "Cancelled"
  )
  const accessoryPoIds = new Set(accessoryOrders.map((order) => order.poId))
  const visiblePurchaseOrders = purchaseOrders.filter((order) =>
    accessoryPoIds.has(order.id)
  )
  const pendingInspection = storeRecords.filter(
    (record) =>
      !record.inspectionStatus ||
      ["Pending", "Received"].includes(record.inspectionStatus)
  ).length
  const totalReceivedQty = storeRecords.reduce(
    (sum, record) => sum + (record.receivedQty ?? 0),
    0
  )
  const totalStockBalance = storeRecords.reduce(
    (sum, record) => sum + (record.stockBalance ?? 0),
    0
  )
  const approvedOrders = visiblePurchaseOrders
    .map((order) => ({
      ...order,
      storeRecord: storeRecords.find((record) => record.poId === order.id),
    }))
    .filter((order) => order.storeRecord?.inspectionStatus === "Approved")

  return (
    <div className="space-y-6">
      <PageHeader title="Store Controller Dashboard" />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Accessories POs"
          value={String(visiblePurchaseOrders.length).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Pending Inspection"
          value={String(pendingInspection).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Received Qty"
          value={String(totalReceivedQty)}
          tone="success"
        />
        <MetricCard
          label="Stock Balance"
          value={String(totalStockBalance)}
          tone="success"
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Approved PO List</h2>
          <p className="text-sm text-muted-foreground">
            Store Controller POs with approved inspection status.
          </p>
        </div>

        {approvedOrders.length === 0 ? (
          <EmptyState
            title="No approved Store POs yet"
            description="Approved Store Controller purchase orders will appear here automatically."
          />
        ) : (
          <DataTable
            compact
            columns={[
              {
                key: "poNumber",
                header: "PO Number",
                className: "min-w-[6rem]",
                render: (row) => getPurchaseOrderDisplayNo(row),
              },
              {
                key: "styleName",
                header: "Style Name",
                className: "min-w-[7rem]",
                render: (row) => getPurchaseOrderDisplayStyle(row),
              },
              {
                key: "itemNameCode",
                header: "Item Name & Code",
                className: "min-w-[7rem]",
                render: (row) => getPurchaseOrderDisplayItemNameCode(row) || "—",
              },
              {
                key: "quantity",
                header: "Quantity",
                className: "min-w-[5rem]",
                render: (row) => getPurchaseOrderDisplayQty(row).toLocaleString(),
              },
              {
                key: "supplier",
                header: "Supplier",
                className: "min-w-[7rem]",
                render: (row) => row.storeRecord?.supplier || "—",
              },
              {
                key: "inspectionDate",
                header: "Inspection Date",
                className: "min-w-[6rem]",
                render: (row) => row.storeRecord?.inspectionDate || "—",
              },
              {
                key: "receivedQty",
                header: "Received Qty",
                className: "min-w-[5rem]",
                render: (row) => String(row.storeRecord?.receivedQty ?? "—"),
              },
              {
                key: "stockBalance",
                header: "Stock Balance",
                className: "min-w-[5rem]",
                render: (row) => String(row.storeRecord?.stockBalance ?? "—"),
              },
              {
                key: "status",
                header: "Status",
                className: "min-w-[6rem]",
                render: (row) => (
                  <StatusBadge value={row.storeRecord?.inspectionStatus ?? "Pending"} />
                ),
              },
            ]}
            data={approvedOrders}
          />
        )}
      </section>

    </div>
  )
}
