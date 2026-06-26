import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import {
  addSupplierOrder,
  updateCheckRequestStatus,
} from "@/store/slices/yarn-check-slice"

type SupplierOrderFormValues = {
  poId: string
  poNumber: string
  yarnCheckRequestId: string
  supplier: string
  yarnType: string
  color: string
  orderedQty: string
  expectedArrival: string
}

function createSupplierOrderId() {
  return `yso-${Date.now()}`
}

function createEtaNotificationId() {
  return `notif-${Date.now()}`
}

const supplierOrderFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number (read-only)", placeholder: "LK-2006" },
  { name: "supplier", label: "Supplier", placeholder: "Everest Fibers" },
  {
    name: "yarnType",
    label: "Yarn Type",
    placeholder: "100% Merino Wool",
  },
  { name: "color", label: "Color", placeholder: "Cream" },
  {
    name: "orderedQty",
    label: "Ordered Quantity (kg)",
    type: "number",
    placeholder: "850",
  },
  {
    name: "expectedArrival",
    label: "Expected Arrival Date",
    type: "date",
  },
]

export function YarnSupplierOrderPage() {
  const dispatch = useAppDispatch()
  const supplierOrders = useAppSelector(
    (state) => state.yarnCheck.supplierOrders
  )
  const yarnSupplierOrders = supplierOrders.filter(
    (order) => (order.itemCategory ?? "Yarn") === "Yarn"
  )
  const checkRequests = useAppSelector(
    (state) => state.yarnCheck.checkRequests
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCheckRequest, setSelectedCheckRequest] = useState<string>("")
  const { register, handleSubmit, reset } = useForm<SupplierOrderFormValues>({
      defaultValues: {
        poId: "",
        poNumber: "",
        yarnCheckRequestId: "",
        supplier: "",
        yarnType: "",
        color: "",
        orderedQty: "",
        expectedArrival: "",
      },
    })

  // Only show check requests that are "Not Available" and not yet ordered
  const orderableRequests = checkRequests.filter(
    (r) =>
      r.status === "Not Available" ||
      r.status === "Ordered" ||
      r.status === "Receiving"
  )

  const openCreateForRequest = (requestId: string) => {
    const request = checkRequests.find((r) => r.id === requestId)
    if (!request) return

    setSelectedCheckRequest(requestId)
    reset({
      poId: request.poId,
      poNumber: request.poNumber,
      yarnCheckRequestId: request.id,
      supplier: "",
      yarnType: request.yarnComposition,
      color: request.color,
      orderedQty: String(request.requiredQty),
      expectedArrival: "",
    })
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: SupplierOrderFormValues) => {
    const orderId = createSupplierOrderId()
    dispatch(
      addSupplierOrder({
        id: orderId,
        yarnCheckRequestId: values.yarnCheckRequestId,
        poId: values.poId,
        poNumber: values.poNumber,
        supplier: values.supplier,
        yarnType: values.yarnType,
        itemName: values.yarnType,
        itemCategory: "Yarn",
        color: values.color,
        orderedQty: Number(values.orderedQty),
        expectedArrival: values.expectedArrival,
        orderedAt: new Date().toISOString(),
        deliveryDate: "",
        inspectionDate: "",
        status: "Placed",
      })
    )

    // Update check request status to Ordered
    dispatch(
      updateCheckRequestStatus({
        id: values.yarnCheckRequestId,
        status: "Ordered",
      })
    )

    // Update PO status
    dispatch(updatePoStatus({ id: values.poId, status: "Yarn Ordered" }))
    dispatch(
      addNotification({
        id: createEtaNotificationId(),
        title: `ETA logged for ${values.poNumber}`,
        description: `Yarn order placed with ${values.supplier}. Expected arrival: ${values.expectedArrival}.`,
        time: "Just now",
        read: false,
      })
    )

    toast.success(
      `Supplier order placed for PO ${values.poNumber}. ETA: ${values.expectedArrival}`
    )
    setIsCreateModalOpen(false)
    setSelectedCheckRequest("")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarn Supplier Orders"
      />

      {/* Orderable Requests */}
      {orderableRequests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            POs Needing Supplier Orders
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orderableRequests.map((req) => {
              const hasOrder = yarnSupplierOrders.some(
                (o) => o.yarnCheckRequestId === req.id
              )
              return (
                <div
                  key={req.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{req.poNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {req.buyer} Â· {req.style}
                      </p>
                    </div>
                    <StatusBadge value={req.status} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>Yarn: {req.yarnComposition}</p>
                    <p>Color: {req.color}</p>
                    <p>Required: {req.requiredQty} kg</p>
                  </div>
                  {!hasOrder && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-4 w-full rounded-xl"
                      onClick={() => openCreateForRequest(req.id)}
                    >
                      Place Supplier Order
                    </Button>
                  )}
                  {hasOrder && (
                    <p className="mt-4 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      âœ“ Order placed
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* All Supplier Orders Table */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All Supplier Orders</h2>
        {yarnSupplierOrders.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              { key: "supplier", header: "Supplier" },
              { key: "yarnType", header: "Yarn Type" },
              { key: "color", header: "Color" },
              {
                key: "orderedQty",
                header: "Qty (kg)",
                render: (row) => String(row.orderedQty),
              },
              { key: "expectedArrival", header: "Expected Arrival" },
              {
                key: "orderedAt",
                header: "Ordered",
                render: (row) =>
                  new Date(String(row.orderedAt)).toLocaleDateString(),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <StatusBadge value={String(row.status)} />
                ),
              },
            ]}
            data={yarnSupplierOrders}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No supplier orders yet. Orders appear here when yarn is not
              available for a PO.
            </p>
          </div>
        )}
      </section>

      <RecordFormModal
        open={isCreateModalOpen}
        title="Place Supplier Order"
        description="Order yarn from a supplier. The merchandiser will be notified of the expected arrival date."
        fields={supplierOrderFields}
        register={register}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedCheckRequest("")
        }}
        onReset={() => {
          const req = checkRequests.find(
            (r) => r.id === selectedCheckRequest
          )
          if (req) {
            reset({
              poId: req.poId,
              poNumber: req.poNumber,
              yarnCheckRequestId: req.id,
              supplier: "",
              yarnType: req.yarnComposition,
              color: req.color,
              orderedQty: String(req.requiredQty),
              expectedArrival: "",
            })
          }
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Place Order"
      />
    </div>
  )
}

