import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import {
  getDesignRequestHeaderRows,
  getDesignSubmittedHeaderRows,
  getDesignRequestWorkflowColumns,
  getOrderDisplayNo,
  getOrderDisplayStyle,
} from "@/lib/purchase-order-table-columns"
import { getPurchaseOrderDisplayNo } from "@/lib/purchase-orders"
import { ModuleSettingsPage } from "@/pages/shared/ModuleSettingsPage"
import { ModuleFormPage } from "@/pages/shared/ModuleFormPage"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addNotification } from "@/store/slices/notification-slice"
import { submitConsumption } from "@/store/slices/merchandise-slice"
import type { PurchaseOrder } from "@/types/modules"

type ConsumptionFormValues = {
  totalYarnKg: number
  totalFabricKg: number
  totalAccessoriesQty: number
}

const consumptionFields: ModalFormField[] = [
  {
    name: "totalYarnKg",
    label: "Total Yarn (kg)",
    type: "number",
    placeholder: "1500",
  },
  {
    name: "totalFabricKg",
    label: "Total Fabric (kg)",
    type: "number",
    placeholder: "980",
  },
  {
    name: "totalAccessoriesQty",
    label: "Total Accessories Qty",
    type: "number",
    placeholder: "12000",
  },
]

function createWorkflowNotificationId() {
  return `notif-${Date.now()}`
}

function hasSubmittedConsumption(order: PurchaseOrder) {
  return (
    order.totalYarnKg !== undefined ||
    order.totalFabricKg !== undefined ||
    order.totalAccessoriesQty !== undefined
  )
}

function isDesignSubmittedOrder(order: PurchaseOrder) {
  if (!hasSubmittedConsumption(order)) {
    return false
  }

  if (
    order.workflowHistory?.some(
      (entry) =>
        entry.status === "Design Completed" || entry.status === "Sent to Yarn"
    )
  ) {
    return true
  }

  return order.status !== "Sent to Design" && order.status !== "Created"
}

export function DesignDashboardPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const requestedConsumptionOrders = purchaseOrders.filter(
    (po) => po.status === "Sent to Design" && !isDesignSubmittedOrder(po)
  )
  const pendingConsumptionOrders = requestedConsumptionOrders
  const completedConsumptionOrders = purchaseOrders
    .filter(isDesignSubmittedOrder)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const submittedColumns = getDesignRequestWorkflowColumns({
    yarnInspectionDateByPo: {},
    yarnInspectionStatusByPo: {},
    yarnIssuedQtyByPo: {},
    yarnReceivedQtyByPo: {},
    storeInspectionDateByPo: {},
    storeInspectionStatusByPo: {},
    storeReceivedQtyByPo: {},
    storeStockBalanceByPo: {},
    storeSupplierByPo: {},
  })
  const submittedHeaderRows = getDesignSubmittedHeaderRows()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Design Dashboard"
      />
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Consumption Request"
          value={String(requestedConsumptionOrders.length).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Pending Consumption Request"
          value={String(pendingConsumptionOrders.length).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Complete Consumption Request"
          value={String(completedConsumptionOrders.length).padStart(2, "0")}
          tone="success"
        />
      </section>
      <p className="text-lg font-semibold">Complete Request Table</p>
      {completedConsumptionOrders.length === 0 ? (
        <EmptyState
          title="No completed consumption requests yet"
          description="Completed Design consumption requests will appear here after totals are submitted."
        />
      ) : (
        <DataTable
          columns={submittedColumns}
          data={completedConsumptionOrders}
          headerRows={submittedHeaderRows}
          compact
        />
      )}
    </div>
  )
}

export function DesignRequestPage() {
  return (
    <ModuleFormPage
      title="Design Request"
      description="Capture incoming design requests against style and PO references for the design team."
      storageKey="form-design-request"
      fields={[
        { name: "requestNo", label: "Request No", placeholder: "DR-1001" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-2004" },
        { name: "buyer", label: "Buyer", placeholder: "Next" },
        { name: "style", label: "Style", placeholder: "Ribbed Beanie" },
        {
          name: "requestType",
          label: "Request Type",
          placeholder: "Artwork / Sampling / Spec revision",
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          placeholder: "Buyer sent a revised layout for urgent review.",
        },
      ]}
    />
  )
}

export function DesignConsumptionPage() {
  return (
    <ModuleFormPage
      title="Design Consumption"
      description="Track the Design Controller totals that feed the PO workflow and yarn-check handoff."
      storageKey="form-design-consumption"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-2005" },
        { name: "style", label: "Style", placeholder: "V-Neck Pullover" },
        { name: "design", label: "Design", placeholder: "Plain Jersey" },
        { name: "yarnType", label: "Yarn Type", placeholder: "60% Cotton / 40% Acrylic" },
        { name: "color", label: "Color", placeholder: "Olive Green" },
        {
          name: "totalYarnKg",
          label: "Total Yarn (kg)",
          type: "number",
          placeholder: "1200",
        },
        {
          name: "totalFabricKg",
          label: "Total Fabric (kg)",
          type: "number",
          placeholder: "980",
        },
        {
          name: "totalAccessoriesQty",
          label: "Total Accessories Qty",
          type: "number",
          placeholder: "10000",
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          placeholder: "Consumption aligned with current sample construction.",
        },
      ]}
    />
  )
}

export function DesignStylePoPage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [activePoId, setActivePoId] = useState<string | null>(null)
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const focusedPoId = searchParams.get("poId") ?? ""
  const visiblePurchaseOrders = purchaseOrders
    .filter((po) => po.status === "Sent to Design" && !isDesignSubmittedOrder(po))
    .sort((left, right) => {
      if (left.id === focusedPoId) return -1
      if (right.id === focusedPoId) return 1
      return left.createdAt.localeCompare(right.createdAt)
    })
  const activePo =
    visiblePurchaseOrders.find((po) => po.id === activePoId) ?? null
  const focusedPo =
    visiblePurchaseOrders.find((po) => po.id === focusedPoId) ?? null
  const { register, handleSubmit, reset } = useForm<ConsumptionFormValues>({
    defaultValues: {
      totalYarnKg: 0,
      totalFabricKg: 0,
      totalAccessoriesQty: 0,
    },
  })
  const designRequestColumns = getDesignRequestWorkflowColumns({
    yarnInspectionDateByPo: {},
    yarnInspectionStatusByPo: {},
    yarnIssuedQtyByPo: {},
    yarnReceivedQtyByPo: {},
    storeInspectionDateByPo: {},
    storeInspectionStatusByPo: {},
    storeReceivedQtyByPo: {},
    storeStockBalanceByPo: {},
    storeSupplierByPo: {},
  })
  const designRequestHeaderRows = getDesignRequestHeaderRows()

  const openConsumptionModal = (poId: string) => {
    const selectedPo =
      visiblePurchaseOrders.find((po) => po.id === poId) ?? null

    setActivePoId(poId)
    reset({
      totalYarnKg: selectedPo?.totalYarnKg ?? 0,
      totalFabricKg: selectedPo?.totalFabricKg ?? 0,
      totalAccessoriesQty: selectedPo?.totalAccessoriesQty ?? 0,
    })
  }

  const handleConsumptionSubmit = (values: ConsumptionFormValues) => {
    if (!activePo) {
      return
    }

    const orderNo = getOrderDisplayNo(activePo)
    const styleName = getOrderDisplayStyle(activePo)
    const totalYarnKg = Number(values.totalYarnKg)
    const totalFabricKg = Number(values.totalFabricKg)
    const totalAccessoriesQty = Number(values.totalAccessoriesQty)

    dispatch(
      submitConsumption({
        id: activePo.id,
        totalYarnKg,
        totalFabricKg,
        totalAccessoriesQty,
      })
    )
    dispatch(
      addNotification({
        id: createWorkflowNotificationId(),
        title: `Consumption submitted: ${orderNo}`,
        description: `${activePo.buyer} - ${styleName} is ready for Merchandise sourcing.`,
        time: "Just now",
        read: false,
        targetRoles: ["merchandising_user", "management_user", "super_admin"],
      })
    )
    toast.success(`Consumption submitted for ${orderNo}. Ready for sourcing.`)
    setActivePoId(null)
    reset({
      totalYarnKg: 0,
      totalFabricKg: 0,
      totalAccessoriesQty: 0,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request Consumption"
      />
      {focusedPo ? (
        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            Merchandise requested consumption for{" "}
            {getPurchaseOrderDisplayNo(focusedPo)}.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add total yarn, fabric, and accessories quantities to complete the
            Design-side handoff.
          </p>
        </section>
      ) : null}

      {visiblePurchaseOrders.length === 0 ? (
        <EmptyState
          title="No approved POs in the design queue"
          description="Requested POs from Merchandise will appear here for consumption submission."
        />
      ) : (
        <DataTable
          columns={[
            ...designRequestColumns,
            {
              key: "action",
              header: "Actions",
              className: "w-[7.5rem] min-w-[7.5rem]",
              stickyClassName:
                "sticky right-0 border-l-2 border-border bg-card shadow-[-6px_0_10px_-8px_rgba(15,23,42,0.35)]",
              render: (row) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg px-2 text-[11px]"
                  onClick={() => openConsumptionModal(String(row.id))}
                >
                  Add Consumption
                </Button>
              ),
            },
          ]}
          data={visiblePurchaseOrders}
          headerRows={designRequestHeaderRows}
          compact
        />
      )}

      <RecordFormModal
        open={Boolean(activePo)}
        title="Add Consumption"
        description="Submit the Design consumption values for this PO. Merchandise will see the totals automatically."
        fields={consumptionFields}
        register={register}
        onClose={() => {
          setActivePoId(null)
          reset({
            totalYarnKg: 0,
            totalFabricKg: 0,
            totalAccessoriesQty: 0,
          })
        }}
        onReset={() =>
          reset({
            totalYarnKg: 0,
            totalFabricKg: 0,
            totalAccessoriesQty: 0,
          })
        }
        onSubmit={handleSubmit(handleConsumptionSubmit)}
        submitLabel="Submit Consumption"
        maxWidthClassName="max-w-3xl"
      />
    </div>
  )
}

export function DesignSubmittedPoListPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const submittedPurchaseOrders = purchaseOrders
    .filter(isDesignSubmittedOrder)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const submittedColumns = getDesignRequestWorkflowColumns({
    yarnInspectionDateByPo: {},
    yarnInspectionStatusByPo: {},
    yarnIssuedQtyByPo: {},
    yarnReceivedQtyByPo: {},
    storeInspectionDateByPo: {},
    storeInspectionStatusByPo: {},
    storeReceivedQtyByPo: {},
    storeStockBalanceByPo: {},
    storeSupplierByPo: {},
  })
  const submittedHeaderRows = getDesignSubmittedHeaderRows()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submitted PO List"
      />

      {submittedPurchaseOrders.length === 0 ? (
        <EmptyState
          title="No submitted POs yet"
          description="Once Design submits consumption for a requested PO, it will appear here automatically."
        />
      ) : (
        <DataTable
          columns={submittedColumns}
          data={submittedPurchaseOrders}
          headerRows={submittedHeaderRows}
          compact
        />
      )}
    </div>
  )
}

export function DesignReportsPage() {
  return (
    <ModuleFormPage
      title="Design Reports"
      description="Prepare design-side reporting for style readiness, revisions, and consumption assumptions."
      storageKey="form-design-reports"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "openRequests", label: "Open Requests", placeholder: "08" },
        { name: "revisedStyles", label: "Revised Styles", placeholder: "03" },
        { name: "approvedLayouts", label: "Approved Layouts", placeholder: "05" },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          placeholder: "Weekly design summary for management review.",
        },
      ]}
    />
  )
}

export function DesignSettingsPage() {
  return (
    <ModuleSettingsPage
      title="Design Settings"
      description="Control how the design workspace groups requests, style references, and internal reporting."
      sections={[
        {
          title: "Request Flow",
          description:
            "Set how design requests are categorized and prioritized by buyer, style, and urgency.",
        },
        {
          title: "Consumption Rules",
          description:
            "Define the default assumptions used when the design team records yarn or sample consumption estimates.",
        },
        {
          title: "Report Output",
          description:
            "Choose the default fields shown in design summaries and style / PO review exports.",
        },
      ]}
    />
  )
}

