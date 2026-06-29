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
  getPurchaseOrderDisplayAccessories,
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
import { getStoredStoreInventoryRecords } from "@/lib/store-accessories"
import { getStoredStoreControllerRecords } from "@/lib/store-controller"
import { ModuleSettingsPage } from "@/pages/shared/ModuleSettingsPage"
import { useAppSelector } from "@/store/hooks"
import type { PurchaseOrder, StoreInspectionStatus } from "@/types/modules"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function getValidDate(value: string) {
  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function isOperationalCcdDate(date: Date, today: Date) {
  const year = date.getFullYear()
  return year >= today.getFullYear() - 1 && year <= today.getFullYear() + 5
}

function isReadyToShipStatus(status: string) {
  return status.toLowerCase().includes("ready to ship")
}

function ensureMinimumRows(
  primaryRows: PurchaseOrder[],
  fallbackRows: PurchaseOrder[],
  minimumRows = 3
) {
  if (primaryRows.length >= minimumRows) {
    return primaryRows
  }

  const primaryIds = new Set(primaryRows.map((row) => row.id))
  const additionalRows = fallbackRows.filter((row) => !primaryIds.has(row.id))

  return [...primaryRows, ...additionalRows].slice(0, minimumRows)
}

type MerchandiseStoreInventoryRow = {
  id: string
  poNumber: string
  styleName: string
  styleNo: string
  accessories: string
  totalRequiredQty: number
  inHouseAccessories: number
  balanceAccessories: number
  supplier: string
  eta: string
  inspectionStatus: string
  inventoryStatus: string
  remarks: string
}

function getStoreInventoryStatus(params: {
  inspectionStatus?: StoreInspectionStatus
  currentStock: number
  receivedQty: number
}) {
  if (params.inspectionStatus === "Rejected") {
    return "Rejected"
  }

  if (params.currentStock > 0) {
    return "In Stock"
  }

  if (params.inspectionStatus === "Approved" && params.receivedQty > 0) {
    return "Out of Stock"
  }

  if (params.receivedQty > 0) {
    return "Pending Inspection"
  }

  return "Not Received"
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
    const deliveryDate = getValidDate(getPurchaseOrderDisplayCcd(po))

    return (
      deliveryDate !== null &&
      isOperationalCcdDate(deliveryDate, today) &&
      deliveryDate.getFullYear() === today.getFullYear() &&
      deliveryDate.getMonth() === today.getMonth()
    )
  }).length
  const draftPoList = useMemo(() => {
    const createdOrders = purchaseOrders.filter((po) => po.status === "Created")
    const recentOrders = [...purchaseOrders].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    )

    return ensureMinimumRows(createdOrders, recentOrders)
  }, [purchaseOrders])
  const currentMonthPoList = useMemo(() => {
    const currentMonthOrders = purchaseOrders.filter((po) => {
      const ccdDate = getValidDate(getPurchaseOrderDisplayCcd(po))

      return (
        ccdDate !== null &&
        isOperationalCcdDate(ccdDate, today) &&
        ccdDate.getFullYear() === today.getFullYear() &&
        ccdDate.getMonth() === today.getMonth()
      )
    })

    const nearestUpcomingOrders = [...purchaseOrders]
      .filter((po) => {
        const ccdDate = getValidDate(getPurchaseOrderDisplayCcd(po))

        return (
          ccdDate !== null &&
          isOperationalCcdDate(ccdDate, today) &&
          ccdDate.getTime() >= today.getTime()
        )
      })
      .sort((left, right) => {
        const leftDate = getValidDate(getPurchaseOrderDisplayCcd(left))
        const rightDate = getValidDate(getPurchaseOrderDisplayCcd(right))

        return (leftDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
          (rightDate?.getTime() ?? Number.MAX_SAFE_INTEGER)
      })
    const recentOrders = [...purchaseOrders].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    )

    return ensureMinimumRows(
      currentMonthOrders,
      [...nearestUpcomingOrders, ...recentOrders],
      3
    )
  }, [purchaseOrders, today])
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
      <p className="text-lg font-semibold">PO Current Month</p>
      <DataTable
        columns={workflowColumns}
        data={currentMonthPoList}
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
            key: "styleName",
            header: "Style Name",
            render: (row) => getPurchaseOrderDisplayStyle(row),
          },
          { key: "styleNo", header: "Style Number" },
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

export function MerchandiseStoreInventoryPage() {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Stock")

  const storeControllerRecords = useMemo(() => getStoredStoreControllerRecords(), [])
  const storeInventoryRecords = useMemo(() => getStoredStoreInventoryRecords(), [])

  const rows = useMemo<MerchandiseStoreInventoryRow[]>(() => {
    return purchaseOrders
      .filter((po) => {
        const requiredQty = po.totalAccessoriesQty ?? 0
        const hasStoreRecord = storeControllerRecords.some((record) => record.poId === po.id)
        const hasStoreInventory = storeInventoryRecords.some(
          (record) => record.poId === po.id || record.poNumber === po.poNumber
        )
        const hasAccessoriesOrder = supplierOrders.some(
          (order) =>
            (order.itemCategory ?? "Yarn") === "Accessories" && order.poId === po.id
        )

        return requiredQty > 0 || hasStoreRecord || hasStoreInventory || hasAccessoriesOrder
      })
      .map((po) => {
        const storeRecord = storeControllerRecords.find((record) => record.poId === po.id)
        const accessoriesOrder = supplierOrders
          .filter(
            (order) =>
              (order.itemCategory ?? "Yarn") === "Accessories" && order.poId === po.id
          )
          .sort((left, right) => right.orderedAt.localeCompare(left.orderedAt))[0]
        const relatedInventoryRecords = storeInventoryRecords.filter(
          (record) => record.poId === po.id || record.poNumber === po.poNumber
        )
        const totalRequiredQty = po.totalAccessoriesQty ?? 0
        const inHouseAccessories = storeRecord?.receivedQty ?? 0
        const balanceAccessories = Math.max(0, totalRequiredQty - inHouseAccessories)
        const currentStock = relatedInventoryRecords.reduce(
          (sum, record) => sum + record.currentStock,
          0
        )
        const inspectionStatus = storeRecord?.inspectionStatus ?? "Pending"
        const inventoryStatus = getStoreInventoryStatus({
          inspectionStatus: storeRecord?.inspectionStatus,
          currentStock,
          receivedQty: inHouseAccessories,
        })

        return {
          id: po.id,
          poNumber: po.poNumber,
          styleName: getPurchaseOrderDisplayStyle(po),
          styleNo: po.styleNo ?? "",
          accessories: getPurchaseOrderDisplayAccessories(po),
          totalRequiredQty,
          inHouseAccessories,
          balanceAccessories,
          supplier:
            storeRecord?.supplier ||
            accessoriesOrder?.supplier ||
            relatedInventoryRecords[0]?.supplier ||
            "—",
          eta: storeRecord?.eta || accessoriesOrder?.expectedArrival || "—",
          inspectionStatus,
          inventoryStatus,
          remarks: storeRecord?.remarks || "—",
        }
      })
  }, [purchaseOrders, storeControllerRecords, storeInventoryRecords, supplierOrders])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredRows = rows.filter((row) => {
    const matchesFilter =
      activeFilter === "All Stock" ||
      (activeFilter === "In Stock" && row.inventoryStatus === "In Stock") ||
      (activeFilter === "Shortage" && row.balanceAccessories > 0) ||
      (activeFilter === "Approved" && row.inspectionStatus === "Approved") ||
      (activeFilter === "Pending Inspection" &&
        row.inventoryStatus === "Pending Inspection") ||
      (activeFilter === "Rejected" && row.inspectionStatus === "Rejected")

    if (!matchesFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return [
      row.poNumber,
      row.styleName,
      row.styleNo,
      row.accessories,
      row.supplier,
      row.remarks,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearch)
    )
  })

  const totalRequiredAccessories = rows.reduce(
    (sum, row) => sum + row.totalRequiredQty,
    0
  )
  const totalInHouseAccessories = rows.reduce(
    (sum, row) => sum + row.inHouseAccessories,
    0
  )
  const approvedRows = rows.filter((row) => row.inspectionStatus === "Approved").length
  const shortageRows = rows.filter((row) => row.balanceAccessories > 0).length

  return (
    <div className="space-y-6">
      <PageHeader title="Merchandise Inventory View - Store" />
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Required Accessories"
          value={String(totalRequiredAccessories)}
          tone="default"
        />
        <MetricCard
          label="In-House Accessories"
          value={String(totalInHouseAccessories)}
          tone="success"
        />
        <MetricCard
          label="Approved Rows"
          value={String(approvedRows).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Shortage Rows"
          value={String(shortageRows).padStart(2, "0")}
          tone="warning"
        />
      </section>

      <SearchFilterBar
        compact
        filters={[
          "All Stock",
          "In Stock",
          "Shortage",
          "Approved",
          "Pending Inspection",
          "Rejected",
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, style, style no, accessories, supplier"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <DataTable
        compact
        columns={[
          { key: "poNumber", header: "PO Number", className: "min-w-[5.75rem]" },
          { key: "styleName", header: "Style Name", className: "min-w-[7rem]" },
          { key: "styleNo", header: "Style Number", className: "min-w-[5.75rem]" },
          { key: "accessories", header: "Accessories", className: "min-w-[7rem]" },
          {
            key: "totalRequiredQty",
            header: "Total Required Qty",
            className: "min-w-[6rem]",
            render: (row) => String(row.totalRequiredQty),
          },
          {
            key: "inHouseAccessories",
            header: "In-House Accessories",
            className: "min-w-[6rem]",
            render: (row) => String(row.inHouseAccessories),
          },
          {
            key: "balanceAccessories",
            header: "Balance Accessories",
            className: "min-w-[6rem]",
            render: (row) => String(row.balanceAccessories),
          },
          { key: "supplier", header: "Supplier", className: "min-w-[6rem]" },
          { key: "eta", header: "ETA", className: "min-w-[5.75rem]" },
          {
            key: "inspectionStatus",
            header: "Inspection Status",
            className: "min-w-[6rem]",
            render: (row) => <StatusBadge value={row.inspectionStatus} />,
          },
          {
            key: "inventoryStatus",
            header: "Inventory Status",
            className: "min-w-[6rem]",
            render: (row) => <StatusBadge value={row.inventoryStatus} />,
          },
          { key: "remarks", header: "Remarks", className: "min-w-[7rem]" },
        ]}
        data={filteredRows}
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
