import { Pencil, Send, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  StageTracker,
  PO_LIFECYCLE_STAGES,
} from "@/components/shared/stage-tracker"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  addPurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrder,
  linkYarnCheckRequest,
} from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import { addCheckRequest } from "@/store/slices/yarn-check-slice"
import type { CreatePurchaseOrderPayload, PurchaseOrder } from "@/types/modules"

const purchaseOrderFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number", placeholder: "LK-2099" },
  { name: "buyer", label: "Buyer", placeholder: "H&M" },
  { name: "style", label: "Style", placeholder: "Premium Knit Polo" },
  { name: "design", label: "Design", placeholder: "Striped Jacquard" },
  { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
  { name: "gg", label: "GG (Gauge)", placeholder: "12" },
  { name: "color", label: "Color", placeholder: "Navy" },
  {
    name: "yarnComposition",
    label: "Yarn Composition",
    placeholder: "100% Combed Cotton",
  },
  {
    name: "quantity",
    label: "Order Quantity (pcs)",
    type: "number",
    placeholder: "12000",
  },
  {
    name: "requiredYarnQty",
    label: "Required Yarn (kg)",
    type: "number",
    placeholder: "1500",
  },
  { name: "deliveryDate", label: "Delivery Date", type: "date" },
]

function createYarnCheckNotificationId() {
  return `notif-${Date.now()}`
}

export function MerchandiseListPage() {
  const dispatch = useAppDispatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [orderPendingDelete, setOrderPendingDelete] =
    useState<PurchaseOrder | null>(null)
  const [yarnCheckPo, setYarnCheckPo] = useState<PurchaseOrder | null>(null)
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const [activeFilter, setActiveFilter] = useState("All POs")
  const { register, handleSubmit, reset } = useForm<CreatePurchaseOrderPayload>(
    {
      defaultValues: {
        poNumber: "",
        buyer: "",
        style: "",
        design: "",
        quantity: 0,
        status: "Draft",
        supplier: "",
        deliveryDate: "",
        gg: "",
        color: "",
        yarnComposition: "",
        requiredYarnQty: 0,
      },
    }
  )

  const defaultFormValues: CreatePurchaseOrderPayload = {
    poNumber: "",
    buyer: "",
    style: "",
    design: "",
    quantity: 0,
    status: "Draft",
    supplier: "",
    deliveryDate: "",
    gg: "",
    color: "",
    yarnComposition: "",
    requiredYarnQty: 0,
  }

  // Filter POs based on active filter
  const filteredOrders = purchaseOrders.filter((po) => {
    if (activeFilter === "All POs") return true
    if (activeFilter === "Draft") return po.status === "Draft"
    if (activeFilter === "Yarn Check")
      return ["Pending Yarn Check", "Yarn Available", "Yarn Ordered", "Yarn Receiving"].includes(po.status)
    if (activeFilter === "In Production")
      return ["Ready for Production", "Knitting", "Linking", "Finishing"].includes(po.status)
    if (activeFilter === "Completed")
      return po.status === "Finished – Ready to Ship"
    return true
  })

  const openCreateModal = () => {
    setEditingOrder(null)
    reset(defaultFormValues)
    setIsCreateModalOpen(true)
  }

  const openEditModal = (order: PurchaseOrder) => {
    reset({
      poNumber: order.poNumber,
      buyer: order.buyer,
      style: order.style,
      design: order.design,
      quantity: order.quantity,
      supplier: order.supplier,
      deliveryDate: order.deliveryDate,
      gg: order.gg ?? "",
      color: order.color ?? "",
      yarnComposition: order.yarnComposition ?? "",
      requiredYarnQty: order.requiredYarnQty ?? 0,
    })
    setEditingOrder(order)
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: CreatePurchaseOrderPayload) => {
    const normalizedValues = {
      ...values,
      quantity: Number(values.quantity),
      requiredYarnQty: Number(values.requiredYarnQty),
      status: editingOrder?.status ?? "Draft",
    }

    if (editingOrder) {
      dispatch(
        updatePurchaseOrder({
          id: editingOrder.id,
          updates: normalizedValues,
        })
      )
      toast.success(`Purchase order ${values.poNumber} updated successfully.`)
    } else {
      dispatch(addPurchaseOrder(normalizedValues))
      toast.success(`Purchase order ${values.poNumber} created successfully.`)
    }

    reset(defaultFormValues)
    setEditingOrder(null)
    setIsCreateModalOpen(false)
  }

  const handleSendYarnCheck = (po: PurchaseOrder) => {
    const yarnCheckId = `ycr-${Date.now()}`
    dispatch(
      addCheckRequest({
        id: yarnCheckId,
        poId: po.id,
        poNumber: po.poNumber,
        buyer: po.buyer,
        style: po.style,
        yarnComposition: po.yarnComposition ?? "",
        color: po.color ?? "",
        requiredQty: po.requiredYarnQty ?? 0,
        requestedBy: "Merchandise Team",
        requestedAt: new Date().toISOString(),
        status: "Pending",
      })
    )
    dispatch(linkYarnCheckRequest({ poId: po.id, yarnCheckRequestId: yarnCheckId }))
    dispatch(
      addNotification({
        id: createYarnCheckNotificationId(),
        title: `New yarn check request: ${po.poNumber}`,
        description: `${po.buyer} - ${po.style} has been sent from Merchandise to Yarn Control for availability review.`,
        time: "Just now",
        read: false,
      })
    )
    toast.success(
      `Yarn check request sent for ${po.poNumber}. Yarn Controller will review.`
    )
    setYarnCheckPo(null)
  }

  // Derive quick metric counts
  const draftCount = purchaseOrders.filter((p) => p.status === "Draft").length
  const yarnCheckCount = purchaseOrders.filter((p) =>
    ["Pending Yarn Check", "Yarn Ordered", "Yarn Receiving"].includes(p.status)
  ).length
  const productionCount = purchaseOrders.filter((p) =>
    ["Ready for Production", "Knitting", "Linking", "Finishing"].includes(
      p.status
    )
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Order Workflow"
        description="Manage PO lifecycle from buyer intake through yarn check to production routing."
        actions={
          <Button
            type="button"
            className="rounded-2xl"
            onClick={openCreateModal}
          >
            Create PO
          </Button>
        }
      />

      {/* Quick Metric Strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total POs</p>
          <p className="mt-1 text-2xl font-bold">{purchaseOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Draft</p>
          <p className="mt-1 text-2xl font-bold text-slate-600 dark:text-slate-300">
            {draftCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Yarn Check</p>
          <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-300">
            {yarnCheckCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">In Production</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {productionCount}
          </p>
        </div>
      </section>

      {/* Stage Tracker — shows the overall pipeline for context */}
      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Production Pipeline
        </p>
        <StageTracker stages={PO_LIFECYCLE_STAGES} currentStage="Draft" />
      </section>

      <SearchFilterBar
        filters={[
          "All POs",
          "Draft",
          "Yarn Check",
          "In Production",
          "Completed",
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "style", header: "Style" },
          { key: "color", header: "Color" },
          {
            key: "quantity",
            header: "Qty",
            render: (row) => Number(row.quantity).toLocaleString(),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
          {
            key: "action",
            header: "Actions",
            render: (row) => {
              const po = row as PurchaseOrder
              return (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Link to={`/merchandise/${String(po.id)}`}>View</Link>
                  </Button>
                  {po.status === "Draft" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer rounded-xl text-violet-600 hover:text-violet-700 dark:text-violet-400"
                      onClick={() => setYarnCheckPo(po)}
                    >
                      <Send className="size-3.5" />
                      Yarn Check
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-xl"
                    onClick={() => openEditModal(po)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-xl text-destructive hover:text-destructive"
                    onClick={() => setOrderPendingDelete(po)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              )
            },
          },
        ]}
        data={filteredOrders}
      />

      {/* Create / Edit Modal */}
      <RecordFormModal
        open={isCreateModalOpen}
        title={editingOrder ? "Edit Purchase Order" : "Create PO Request"}
        description="Fill in PO details. The order will start in Draft status. Use 'Yarn Check' to send it for availability verification."
        fields={purchaseOrderFields}
        register={register}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingOrder(null)
          reset(defaultFormValues)
        }}
        onReset={() => {
          if (editingOrder) {
            reset({
              poNumber: editingOrder.poNumber,
              buyer: editingOrder.buyer,
              style: editingOrder.style,
              design: editingOrder.design,
              quantity: editingOrder.quantity,
              supplier: editingOrder.supplier,
              deliveryDate: editingOrder.deliveryDate,
              gg: editingOrder.gg ?? "",
              color: editingOrder.color ?? "",
              yarnComposition: editingOrder.yarnComposition ?? "",
              requiredYarnQty: editingOrder.requiredYarnQty ?? 0,
            })
            return
          }
          reset(defaultFormValues)
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={
          editingOrder ? "Update Purchase Order" : "Submit Purchase Order"
        }
        maxWidthClassName="max-w-3xl"
      />

      {/* Yarn Check Confirmation Dialog */}
      {yarnCheckPo ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Send Yarn Check Request?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will send PO <strong>{yarnCheckPo.poNumber}</strong> to the
              Yarn Controller for availability verification.
            </p>
            <div className="mt-3 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Yarn: </span>
                {yarnCheckPo.yarnComposition || "Not specified"}
              </p>
              <p>
                <span className="text-muted-foreground">Color: </span>
                {yarnCheckPo.color || "Not specified"}
              </p>
              <p>
                <span className="text-muted-foreground">Required Qty: </span>
                {yarnCheckPo.requiredYarnQty
                  ? `${yarnCheckPo.requiredYarnQty} kg`
                  : "Not specified"}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setYarnCheckPo(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() => handleSendYarnCheck(yarnCheckPo)}
              >
                <Send className="mr-1.5 size-4" />
                Send to Yarn Control
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      {orderPendingDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Delete purchase order?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This action will permanently remove PO `
              {orderPendingDelete.poNumber}` from the list.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setOrderPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() => {
                  dispatch(deletePurchaseOrder(orderPendingDelete.id))
                  toast.success(
                    `Purchase order ${orderPendingDelete.poNumber} deleted successfully.`
                  )
                  setOrderPendingDelete(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
