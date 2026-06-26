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
  getOrderDisplayNo,
  getOrderDisplayStyle,
  getOrderDisplayYarn,
  purchaseOrderTableColumns,
} from "@/lib/purchase-order-table-columns"
import { ModuleSettingsPage } from "@/pages/shared/ModuleSettingsPage"
import { ModuleFormPage } from "@/pages/shared/ModuleFormPage"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addNotification } from "@/store/slices/notification-slice"
import {
  linkYarnCheckRequest,
  submitConsumption,
} from "@/store/slices/merchandise-slice"
import { addCheckRequest } from "@/store/slices/yarn-check-slice"
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

function createYarnCheckNotificationId() {
  return `notif-${Date.now()}`
}

function createYarnCheckRequestId() {
  return `ycr-${Date.now()}`
}

function hasSubmittedConsumption(order: PurchaseOrder) {
  return (
    order.totalYarnKg !== undefined ||
    order.totalFabricKg !== undefined ||
    order.totalAccessoriesQty !== undefined
  )
}

export function DesignDashboardPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const styleCount = purchaseOrders.length
  const uniqueDesigns = new Set(
    purchaseOrders.map((po) => po.design.trim()).filter(Boolean)
  ).size
  const missingSpecs = purchaseOrders.filter(
    (po) => !po.design || !po.gg || !po.color
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Design Dashboard"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Style / PO"
          value={String(styleCount).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Design Variants"
          value={String(uniqueDesigns).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Missing Specs"
          value={String(missingSpecs).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Ready Records"
          value={String(styleCount - missingSpecs).padStart(2, "0")}
          tone="success"
        />
      </section>
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "style", header: "Style" },
          { key: "design", header: "Design" },
          { key: "gg", header: "GG" },
          { key: "color", header: "Color" },
        ]}
        data={purchaseOrders}
      />
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
      description="Track design-side consumption assumptions for yarn, color, and sample requirement planning."
      storageKey="form-design-consumption"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-2005" },
        { name: "style", label: "Style", placeholder: "V-Neck Pullover" },
        { name: "design", label: "Design", placeholder: "Plain Jersey" },
        { name: "yarnType", label: "Yarn Type", placeholder: "60% Cotton / 40% Acrylic" },
        { name: "color", label: "Color", placeholder: "Olive Green" },
        { name: "estimatedConsumption", label: "Estimated Consumption", placeholder: "1.20 kg / doz" },
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
    .filter((po) => po.status === "Consumption Requested")
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

  const openConsumptionModal = (poId: string) => {
    setActivePoId(poId)
    reset({
      totalYarnKg: 0,
      totalFabricKg: 0,
      totalAccessoriesQty: 0,
    })
  }

  const handleConsumptionSubmit = (values: ConsumptionFormValues) => {
    if (!activePo) {
      return
    }

    const yarnCheckId = createYarnCheckRequestId()
    const orderNo = getOrderDisplayNo(activePo)
    const styleName = getOrderDisplayStyle(activePo)
    const yarn = getOrderDisplayYarn(activePo)
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
      addCheckRequest({
        id: yarnCheckId,
        poId: activePo.id,
        poNumber: orderNo,
        buyer: activePo.buyer,
        style: styleName,
        yarnComposition: yarn,
        color: activePo.color ?? "",
        requiredQty: totalYarnKg,
        requestedBy: "Design Controller",
        requestedAt: new Date().toISOString(),
        status: "Pending",
      })
    )
    dispatch(
      linkYarnCheckRequest({
        poId: activePo.id,
        yarnCheckRequestId: yarnCheckId,
      })
    )
    dispatch(
      addNotification({
        id: createYarnCheckNotificationId(),
        title: `New yarn check request: ${orderNo}`,
        description: `${activePo.buyer} - ${styleName} is ready from Design and has entered the yarn workflow.`,
        time: "Just now",
        read: false,
      })
    )
    toast.success(
      `Consumption submitted for ${orderNo}. Yarn check has started.`
    )
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
            {focusedPo.orderNo || focusedPo.poNumber}.
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
            ...purchaseOrderTableColumns,
            {
              key: "action",
              header: "Actions",
              render: (row) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => openConsumptionModal(String(row.id))}
                >
                  Add Consumption
                </Button>
              ),
            },
          ]}
          data={visiblePurchaseOrders}
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
    .filter(hasSubmittedConsumption)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

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
          columns={purchaseOrderTableColumns}
          data={submittedPurchaseOrders}
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

