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
import { useMemo } from "react"

import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getPurchaseOrderWorkflowColumns,
  purchaseOrderWorkflowHeaderRows,
} from "@/lib/purchase-order-table-columns"
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
    purchaseOrders.map((po) => po.style.trim()).filter(Boolean)
  ).size
  const yarnSupplyPendingCount = purchaseOrders.filter((po) =>
    ["Pending Yarn Check", "Yarn Ordered", "Yarn Receiving"].includes(po.status)
  ).length
  const accessoriesSupplyPendingCount = new Set(
    storeRequisitions
      .filter((requisition) => requisition.status !== "Issued")
      .map((requisition) => requisition.poId)
  ).size
  const productionPoCount = purchaseOrders.filter((po) =>
    [
      "Ready for Production",
      "Knitting",
      "Linking",
      "Finishing",
    ].includes(po.status)
  ).length
  const finishingPoCount = purchaseOrders.filter(
    (po) => po.status === "Finishing"
  ).length
  const shipmentPoCount = purchaseOrders.filter(
    (po) => isReadyToShipStatus(po.status)
  ).length
  const expectedDeliveryCurrentMonthCount = purchaseOrders.filter((po) => {
    const deliveryDate = new Date(po.deliveryDate)

    return (
      !Number.isNaN(deliveryDate.getTime()) &&
      deliveryDate.getFullYear() === today.getFullYear() &&
      deliveryDate.getMonth() === today.getMonth()
    )
  }).length
  const draftPoList = purchaseOrders.filter((po) => po.status === "Draft")
  const purchaseOrderWorkflowMetrics = useMemo(() => {
    const yarnReceivedQtyByPo: Record<string, number> = {}
    const yarnIssuedQtyByPo: Record<string, number> = {}
    const yarnInspectionStatusByPo: Record<string, string | undefined> = {}
    const yarnInspectionDateByPo: Record<string, string | undefined> = {}

    deliveryBatches.forEach((batch) => {
      yarnReceivedQtyByPo[batch.poId] =
        (yarnReceivedQtyByPo[batch.poId] ?? 0) + batch.quantity

      const currentInspectionDate = yarnInspectionDateByPo[batch.poId]
      const nextInspectionDate = batch.inspectedAt ?? batch.deliveryDate

      if (
        !currentInspectionDate ||
        new Date(nextInspectionDate).getTime() >=
          new Date(currentInspectionDate).getTime()
      ) {
        yarnInspectionDateByPo[batch.poId] = nextInspectionDate
        yarnInspectionStatusByPo[batch.poId] = batch.inspectionStatus
      }
    })

    stockMovements
      .filter((movement) => movement.movementType === "Issued to Knitting")
      .forEach((movement) => {
        yarnIssuedQtyByPo[movement.poId] =
          (yarnIssuedQtyByPo[movement.poId] ?? 0) + movement.quantity
      })

    return {
      yarnInspectionDateByPo,
      yarnInspectionStatusByPo,
      yarnIssuedQtyByPo,
      yarnReceivedQtyByPo,
      storeInspectionDateByPo: {},
      storeInspectionStatusByPo: {},
      storeReceivedQtyByPo: {},
      storeStockBalanceByPo: {},
      storeSupplierByPo: {},
    }
  }, [deliveryBatches, stockMovements])
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
  const totalRequiredYarn = purchaseOrders.reduce(
    (sum, po) => sum + (po.requiredYarnQty ?? 0),
    0
  )
  const coloredStyles = purchaseOrders.filter((po) => po.color?.trim()).length

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
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "style", header: "Style" },
          { key: "yarnComposition", header: "Yarn Type" },
          { key: "color", header: "Color" },
          {
            key: "requiredYarnQty",
            header: "Required Yarn (kg)",
            render: (row) => String(row.requiredYarnQty ?? "-"),
          },
          { key: "supplier", header: "Supplier" },
        ]}
        data={purchaseOrders}
      />
    </div>
  )
}

export function MerchandiseShipmentPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const sortedOrders = [...purchaseOrders].sort((left, right) =>
    left.deliveryDate.localeCompare(right.deliveryDate)
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
          { key: "style", header: "Style" },
          {
            key: "quantity",
            header: "Qty",
            render: (row) => Number(row.quantity).toLocaleString(),
          },
          {
            key: "deliveryDate",
            header: "Delivery Date",
            render: (row) => formatDate(String(row.deliveryDate)),
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
