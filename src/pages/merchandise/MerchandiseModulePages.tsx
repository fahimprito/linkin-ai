import {
  CalendarCheck2,
  ClipboardList,
  Factory,
  PackageCheck,
  Scissors,
  Shirt,
  Truck,
  Warehouse,
} from "lucide-react"
import { useMemo, useState } from "react"

import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getPurchaseOrderDisplayCcd,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
  getPurchaseOrderDisplayYarn,
} from "@/lib/purchase-orders"
import {
  getPurchaseOrderWorkflowColumns,
  purchaseOrderWorkflowHeaderRows,
} from "@/lib/purchase-order-table-columns"
import { createPurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
import { ModuleSettingsPage } from "@/pages/shared/ModuleSettingsPage"
import { useAppSelector } from "@/store/hooks"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function isReadyToShipStatus(status: string) {
  return status.toLowerCase().includes("ready to ship")
}

export function MerchandiseDashboardPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const storeRequisitions = useAppSelector(
    (state) => state.storeService.requisitions
  )
  const today = new Date()
  const openPoCount = purchaseOrders.filter(
    (po) => !isReadyToShipStatus(po.status)
  ).length
  const totalStyleCount = new Set(
    purchaseOrders.map((po) => getPurchaseOrderDisplayStyle(po).trim()).filter(Boolean)
  ).size
  const yarnSupplyPendingCount = purchaseOrders.filter((po) =>
    ["Sent to Yarn", "Yarn Processing"].includes(po.status)
  ).length
  const accessoriesSupplyPendingCount = new Set(
    storeRequisitions
      .filter((requisition) => requisition.status !== "Issued")
      .map((requisition) => requisition.poId)
  ).size
  const productionPoCount = purchaseOrders.filter((po) =>
    [
      "Sent to Knitting",
      "Knitting In Progress",
      "Sent to Linking",
      "Linking In Progress",
      "Sent to Finishing",
      "Finishing In Progress",
    ].includes(po.status)
  ).length
  const finishingPoCount = purchaseOrders.filter(
    (po) => po.status === "Finishing In Progress"
  ).length
  const shipmentPoCount = purchaseOrders.filter(
    (po) => isReadyToShipStatus(po.status)
  ).length
  const expectedDeliveryCurrentMonthCount = purchaseOrders.filter((po) => {
    const deliveryDate = new Date(getPurchaseOrderDisplayCcd(po))

    return (
      !Number.isNaN(deliveryDate.getTime()) &&
      deliveryDate.getFullYear() === today.getFullYear() &&
      deliveryDate.getMonth() === today.getMonth()
    )
  }).length
  const draftPoList = purchaseOrders.filter((po) => po.status === "Created")
  const purchaseOrderWorkflowMetrics = useMemo(() => {
    return createPurchaseOrderWorkflowMetrics({
      purchaseOrders,
      deliveryBatches,
      stockMovements,
      supplierOrders: [],
    })
  }, [deliveryBatches, purchaseOrders, stockMovements])
  const workflowColumns = useMemo(
    () => getPurchaseOrderWorkflowColumns(purchaseOrderWorkflowMetrics),
    [purchaseOrderWorkflowMetrics]
  )
  const dashboardHeaderRows = useMemo(
    () => [
      {
        ...purchaseOrderWorkflowHeaderRows[0],
        cells: purchaseOrderWorkflowHeaderRows[0].cells.filter(
          (cell) => cell.key !== "action"
        ),
      },
      purchaseOrderWorkflowHeaderRows[1],
    ],
    []
  )
  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchandise Dashboard"
      />
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Open POs"
          value={String(openPoCount)}
          tone="default"
          icon={ClipboardList}
        />
        <MetricCard
          label="Total Styles"
          value={String(totalStyleCount)}
          tone="success"
          icon={Shirt}
        />
        <MetricCard
          label="Yarn Supply Pending"
          value={String(yarnSupplyPendingCount)}
          tone="warning"
          icon={Warehouse}
        />
        <MetricCard
          label="Accessories Supply Pending"
          value={String(accessoriesSupplyPendingCount)}
          tone="danger"
          icon={PackageCheck}
        />
        <MetricCard
          label="Production POs"
          value={String(productionPoCount)}
          tone="default"
          icon={Factory}
        />
        <MetricCard
          label="Finishing POs"
          value={String(finishingPoCount)}
          tone="warning"
          icon={Scissors}
        />
        <MetricCard
          label="Shipment POs"
          value={String(shipmentPoCount)}
          tone="success"
          icon={Truck}
        />
        <MetricCard
          label="Expected Delivery Current Month"
          value={String(expectedDeliveryCurrentMonthCount)}
          tone="success"
          icon={CalendarCheck2}
        />
      </section>
      <p className="text-lg font-semibold">New PO List</p>
      <DataTable
        columns={workflowColumns}
        data={draftPoList}
        headerRows={dashboardHeaderRows}
        compact
      />
    </div>
  )
}

export function MerchandiseInventoryPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const totalRequiredYarn = purchaseOrders.reduce(
    (sum, po) => sum + (po.requiredYarnQty ?? 0),
    0
  )
  const coloredStyles = purchaseOrders.filter((po) => po.color?.trim()).length
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredOrders = purchaseOrders.filter((po) => {
    const hasSupplier = po.supplier.trim().length > 0
    const hasColor = Boolean(po.color?.trim())
    const hasRequiredYarn = Number(po.requiredYarnQty ?? 0) > 0

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Supplier Assigned" && hasSupplier) ||
      (activeFilter === "No Supplier" && !hasSupplier) ||
      (activeFilter === "With Color" && hasColor) ||
      (activeFilter === "Required Yarn" && hasRequiredYarn)

    if (!matchesFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return [
      po.poNumber,
      getPurchaseOrderDisplayStyle(po),
      getPurchaseOrderDisplayYarn(po),
      po.color,
      po.supplier,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearch)
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchandise Inventory View"
      />
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Required Yarn"
          value={`${Math.round(totalRequiredYarn)} kg`}
          tone="success"
        />
        <MetricCard
          label="Supplier Assigned"
          value={String(
            purchaseOrders.filter((po) => po.supplier.trim().length > 0).length
          ).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Colored Styles"
          value={String(coloredStyles).padStart(2, "0")}
          tone="warning"
        />
      </section>
      <SearchFilterBar
        compact
        filters={[
          "All",
          "Supplier Assigned",
          "No Supplier",
          "With Color",
          "Required Yarn",
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, style, yarn type, color, supplier"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          {
            key: "style",
            header: "Style",
            render: (row) => getPurchaseOrderDisplayStyle(row),
          },
          {
            key: "yarnComposition",
            header: "Yarn Type",
            render: (row) => getPurchaseOrderDisplayYarn(row),
          },
          { key: "color", header: "Color" },
          {
            key: "availableYarn",
            header: "Available Yarn (kg)",
            render: (row) => {
              const availableYarn = stockMovements
                .filter((movement) => movement.poId === row.id)
                .reduce((sum, movement) => {
                  if (movement.movementType === "Issued to Knitting") {
                    return sum - movement.quantity
                  }

                  return sum + movement.quantity
                }, 0)

              return String(availableYarn > 0 ? availableYarn : 0)
            },
          },
          {
            key: "expiryDate",
            header: "Expiry Date",
            render: (row) => String(row.yarnEta ?? "-"),
          },
        ]}
        data={filteredOrders}
      />
    </div>
  )
}

export function MerchandiseShipmentPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const sortedOrders = [...purchaseOrders].sort((left, right) =>
    getPurchaseOrderDisplayCcd(left).localeCompare(getPurchaseOrderDisplayCcd(right))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchandise Shipment View"
      />
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
            header: "Qty",
            render: (row) =>
              Number(getPurchaseOrderDisplayQty(row)).toLocaleString(),
          },
          {
            key: "deliveryDate",
            header: "Delivery Date",
            render: (row) => formatDate(getPurchaseOrderDisplayCcd(row)),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
        ]}
        data={sortedOrders}
      />
    </div>
  )
}

export function MerchandiseSettingsPage() {
  return (
    <ModuleSettingsPage
      title="Merchandise Settings"
      description="Configure the merchandising workspace structure, notifications, and reporting preferences when this module expands."
      sections={[
        {
          title: "Workflow Alerts",
          description:
            "Keep intake, yarn-check, and release notifications grouped by PO priority and buyer commitment.",
        },
        {
          title: "PO Data Rules",
          description:
            "Define which merchandising fields are mandatory before a PO can move into supplier and production follow-up.",
        },
        {
          title: "Report Preferences",
          description:
            "Set the default report views for production follow-up, shipment visibility, and management sharing.",
        },
      ]}
    />
  )
}
