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
import {
  addDeliveryBatch,
  updateCheckRequestStatus,
  updateSupplierOrderStatus,
} from "@/store/slices/yarn-check-slice"

type DeliveryFormValues = {
  supplierOrderId: string
  poId: string
  poNumber: string
  batchNumber: string
  quantity: string
  deliveryDate: string
  remarks: string
}

function createDeliveryBatchId() {
  return `ydb-${Date.now()}`
}

const deliveryFields: ModalFormField[] = [
  {
    name: "poNumber",
    label: "PO Number (read-only)",
    placeholder: "LK-2006",
  },
  {
    name: "batchNumber",
    label: "Batch Number",
    placeholder: "BATCH-003",
  },
  {
    name: "quantity",
    label: "Quantity (kg)",
    type: "number",
    placeholder: "300",
  },
  { name: "deliveryDate", label: "Delivery Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Delivery received at warehouse gate.",
  },
]

export function YarnDeliveryLogPage() {
  const dispatch = useAppDispatch()
  const deliveryBatches = useAppSelector(
    (state) => state.yarnCheck.deliveryBatches
  )
  const supplierOrders = useAppSelector(
    (state) => state.yarnCheck.supplierOrders
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const { register, handleSubmit, reset } = useForm<DeliveryFormValues>({
    defaultValues: {
      supplierOrderId: "",
      poId: "",
      poNumber: "",
      batchNumber: "",
      quantity: "",
      deliveryDate: "",
      remarks: "",
    },
  })

  // Only active supplier orders
  const activeOrders = supplierOrders.filter(
    (o) => o.status !== "Fully Received"
  )

  const openCreateForOrder = (orderId: string) => {
    const order = supplierOrders.find((o) => o.id === orderId)
    if (!order) return

    // Calculate next batch number
    const existingBatches = deliveryBatches.filter(
      (b) => b.supplierOrderId === orderId
    )
    const nextBatchNum = existingBatches.length + 1

    setSelectedOrderId(orderId)
    reset({
      supplierOrderId: orderId,
      poId: order.poId,
      poNumber: order.poNumber,
      batchNumber: `BATCH-${String(nextBatchNum).padStart(3, "0")}`,
      quantity: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: DeliveryFormValues) => {
    const batchId = createDeliveryBatchId()
    dispatch(
      addDeliveryBatch({
        id: batchId,
        supplierOrderId: values.supplierOrderId,
        poId: values.poId,
        poNumber: values.poNumber,
        batchNumber: values.batchNumber,
        quantity: Number(values.quantity),
        deliveryDate: values.deliveryDate,
        inspectionStatus: "Received",
        remarks: values.remarks,
        createdAt: new Date().toISOString(),
        createdBy: "Yarn Controller",
      })
    )

    // Update supplier order status
    dispatch(
      updateSupplierOrderStatus({
        id: values.supplierOrderId,
        status: "Partially Received",
      })
    )

    // Update PO status to Yarn Receiving
    dispatch(updatePoStatus({ id: values.poId, status: "Yarn Receiving" }))

    // Update check request status
    const order = supplierOrders.find(
      (o) => o.id === values.supplierOrderId
    )
    if (order) {
      dispatch(
        updateCheckRequestStatus({
          id: order.yarnCheckRequestId,
          status: "Receiving",
        })
      )
    }

    toast.success(
      `Batch ${values.batchNumber} logged for PO ${values.poNumber}. Ready for inspection.`
    )
    setIsCreateModalOpen(false)
    setSelectedOrderId("")
  }

  // Status flow description
  const statusFlow = ["Pending", "Received", "Inspected", "Accepted / Rejected"]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarn Delivery Log"
        description="Log incoming yarn deliveries from suppliers. Multiple batches can be received per supplier order."
      />

      {/* Status Flow Reference */}
      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Batch Status Flow
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {statusFlow.map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge value={status} />
              {index < statusFlow.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Log delivery per active order */}
      {activeOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Active Supplier Orders (Receive Delivery)
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => {
              const orderBatches = deliveryBatches.filter(
                (b) => b.supplierOrderId === order.id
              )
              const receivedQty = orderBatches.reduce(
                (sum, b) => sum + b.quantity,
                0
              )
              return (
                <div
                  key={order.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{order.poNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.supplier}
                      </p>
                    </div>
                    <StatusBadge value={order.status} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Ordered: {order.orderedQty} kg
                    </p>
                    <p className="text-muted-foreground">
                      Received: {receivedQty} kg
                    </p>
                    <p className="text-muted-foreground">
                      Remaining: {order.orderedQty - receivedQty} kg
                    </p>
                    <p className="text-muted-foreground">
                      Batches: {orderBatches.length}
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.min(100, (receivedQty / order.orderedQty) * 100)}%`,
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    onClick={() => openCreateForOrder(order.id)}
                  >
                    Log Delivery Batch
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* All Delivery Batches Table */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All Delivery Batches</h2>
        {deliveryBatches.length > 0 ? (
          <DataTable
            columns={[
              { key: "batchNumber", header: "Batch No" },
              { key: "poNumber", header: "PO" },
              {
                key: "quantity",
                header: "Qty (kg)",
                render: (row) => String(row.quantity),
              },
              { key: "deliveryDate", header: "Delivery Date" },
              {
                key: "inspectionStatus",
                header: "Inspection",
                render: (row) => (
                  <StatusBadge value={String(row.inspectionStatus)} />
                ),
              },
              {
                key: "testReportName",
                header: "Test Report",
                render: (row) =>
                  row.testReportName ? (
                    <span className="text-sm text-sky-600 dark:text-sky-400">
                      {String(row.testReportName)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  ),
              },
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "–"),
              },
            ]}
            data={deliveryBatches}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No deliveries logged yet. Log a delivery from an active supplier
              order above.
            </p>
          </div>
        )}
      </section>

      <RecordFormModal
        open={isCreateModalOpen}
        title="Log Delivery Batch"
        description="Record an incoming yarn delivery batch. The batch will be queued for inspection after logging."
        fields={deliveryFields}
        register={register}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedOrderId("")
        }}
        onReset={() => {
          const order = supplierOrders.find((o) => o.id === selectedOrderId)
          if (order) {
            const existingBatches = deliveryBatches.filter(
              (b) => b.supplierOrderId === selectedOrderId
            )
            reset({
              supplierOrderId: selectedOrderId,
              poId: order.poId,
              poNumber: order.poNumber,
              batchNumber: `BATCH-${String(existingBatches.length + 1).padStart(3, "0")}`,
              quantity: "",
              deliveryDate: new Date().toISOString().split("T")[0],
              remarks: "",
            })
          }
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Log Batch"
      />
    </div>
  )
}
