import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addRequisition } from "@/store/slices/knitting-slice"
import { addNotification } from "@/store/slices/notification-slice"
import type { PurchaseOrder } from "@/types/modules"

type RequisitionFormValues = {
  poId: string
  poNumber: string
  requiredQty: string
  requestedDate: string
  remarks: string
}

const requisitionFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number (read-only)", placeholder: "LK-2099" },
  {
    name: "requiredQty",
    label: "Required Quantity (kg)",
    type: "number",
    placeholder: "1250",
  },
  { name: "requestedDate", label: "Requested Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Initial yarn issue request for knitting floor startup.",
  },
]

function createRequisitionId() {
  return `krq-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

export function KnittingRequisitionPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const requisitions = useAppSelector((state) => state.knitting.requisitions)
  const authUser = useAppSelector((state) => state.auth.user)
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<RequisitionFormValues>({
    defaultValues: {
      poId: "",
      poNumber: "",
      requiredQty: "",
      requestedDate: new Date().toISOString().split("T")[0],
      remarks: "",
    },
  })

  const queueOrders = purchaseOrders.filter(
    (po) =>
      po.status === "Sent to Knitting" ||
      po.status === "Knitting In Progress" ||
      po.status === "Knitting Completed"
  )

  const openCreateModal = (po: PurchaseOrder) => {
    setSelectedPo(po)
    reset({
      poId: po.id,
      poNumber: po.poNumber,
      requiredQty: String(po.requiredYarnQty ?? 0),
      requestedDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (values: RequisitionFormValues) => {
    const requiredQty = Number(values.requiredQty)

    if (requiredQty <= 0) {
      toast.error("Required quantity must be greater than zero.")
      return
    }

    const existingRequisition = requisitions.find(
      (requisition) => requisition.poId === values.poId
    )

    if (existingRequisition) {
      toast.error(`A requisition already exists for ${values.poNumber}.`)
      return
    }

    dispatch(
      addRequisition({
        id: createRequisitionId(),
        poId: values.poId,
        poNumber: values.poNumber,
        buyer: selectedPo?.buyer ?? "",
        style: selectedPo?.style ?? "",
        requiredQty,
        requestedDate: values.requestedDate,
        requestedBy: authUser?.name ?? "Knitting Team",
        remarks: values.remarks,
        status: "Pending",
        createdAt: new Date().toISOString(),
      })
    )
    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `Knitting requisition created: ${values.poNumber}`,
        description: `Knitting requested ${requiredQty} kg yarn for PO ${values.poNumber}. Yarn Control can now issue stock against this requisition.`,
        time: "Just now",
        read: false,
        targetRoles: ["yarn_user", "super_admin"],
      })
    )

    toast.success(`Yarn requisition created for PO ${values.poNumber}.`)
    setIsModalOpen(false)
    setSelectedPo(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knitting Yarn Requisitions"
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Knitting Queue</h2>
        {queueOrders.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {queueOrders.map((po) => {
              const existingRequisition = requisitions.find(
                (requisition) => requisition.poId === po.id
              )

              return (
                <div
                  key={po.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{po.poNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {po.buyer} · {po.style}
                      </p>
                    </div>
                    <StatusBadge value={po.status} />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>Order Qty: {po.quantity.toLocaleString()} pcs</p>
                    <p>Required Yarn: {po.requiredYarnQty ?? 0} kg</p>
                    <p>Delivery Date: {po.deliveryDate}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    disabled={Boolean(existingRequisition)}
                    onClick={() => openCreateModal(po)}
                  >
                    {existingRequisition
                      ? "Requisition Created"
                      : "Create Requisition"}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No POs ready for knitting"
            description="Once Yarn Control releases a PO to production, it will appear here for requisition and planning."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requisition Records</h2>
        {requisitions.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              { key: "buyer", header: "Buyer" },
              { key: "style", header: "Style" },
              {
                key: "requiredQty",
                header: "Required Qty (kg)",
                render: (row) => String(row.requiredQty),
              },
              { key: "requestedDate", header: "Requested Date" },
              { key: "requestedBy", header: "Requested By" },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={String(row.status)} />,
              },
            ]}
            data={requisitions}
          />
        ) : (
          <EmptyState
            title="No requisitions raised yet"
            description="Create a requisition from the knitting queue to begin yarn issuance."
          />
        )}
      </section>

      <RecordFormModal
        open={isModalOpen}
        title="Create Yarn Requisition"
        description="Raise the knitting requisition for this PO. Yarn Control will pick it up from the issue-to-knitting queue."
        fields={requisitionFields}
        register={register}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPo(null)
        }}
        onReset={() => {
          if (!selectedPo) {
            return
          }

          reset({
            poId: selectedPo.id,
            poNumber: selectedPo.poNumber,
            requiredQty: String(selectedPo.requiredYarnQty ?? 0),
            requestedDate: new Date().toISOString().split("T")[0],
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Create Requisition"
      />
    </div>
  )
}



