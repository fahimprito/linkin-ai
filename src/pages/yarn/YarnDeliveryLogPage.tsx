import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
  getPurchaseOrderDisplayYarn,
  getResolvedPurchaseOrderBuyer,
} from "@/lib/purchase-orders"
import { upsertInventoryFromReceipt } from "@/lib/yarn-inventory"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePurchaseOrder } from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import {
  addDeliveryBatch,
  addStockMovement,
  updateCheckRequestStatus,
  updateSupplierOrderStatus,
} from "@/store/slices/yarn-check-slice"
import type { PurchaseOrder, YarnSupplierOrder } from "@/types/modules"

type DeliveryFormValues = {
  poNumber: string
  buyer: string
  supplier: string
  batchNumber: string
  quantity: string
  deliveryDate: string
  remarks: string
}

const deliveryFields: ModalFormField[] = [
  {
    name: "poNumber",
    label: "PO Number",
    placeholder: "LK-2006",
    readOnly: true,
  },
  {
    name: "buyer",
    label: "Buyer",
    placeholder: "H&M",
    readOnly: true,
  },
  {
    name: "supplier",
    label: "Supplier",
    placeholder: "Everest Fibers",
  },
  {
    name: "batchNumber",
    label: "Batch / Lot Number",
    placeholder: "LOT-003",
  },
  {
    name: "quantity",
    label: "Received Qty (kg)",
    type: "number",
    placeholder: "300",
  },
  { name: "deliveryDate", label: "Receive Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Delivery received at warehouse gate.",
  },
]

function createDeliveryBatchId() {
  return `ydb-${Date.now()}`
}

function createStockMovementId() {
  return `ysm-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

function getLinkedYarnSupplierOrder(
  poId: string,
  supplierOrders: YarnSupplierOrder[]
) {
  return supplierOrders
    .filter(
      (supplierOrder) =>
        (supplierOrder.itemCategory ?? "Yarn") === "Yarn" &&
        supplierOrder.poId === poId &&
        supplierOrder.status !== "Cancelled"
    )
    .sort((left, right) => {
      const leftDate = left.orderedAt || left.expectedArrival || ""
      const rightDate = right.orderedAt || right.expectedArrival || ""
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]
}

function getReceivablePurchaseOrders(
  purchaseOrders: PurchaseOrder[],
  supplierOrders: YarnSupplierOrder[]
) {
  const receivablePoIds = new Set(
    supplierOrders
      .filter(
        (supplierOrder) =>
          (supplierOrder.itemCategory ?? "Yarn") === "Yarn" &&
          !["Cancelled", "Fully Received"].includes(supplierOrder.status)
      )
      .map((supplierOrder) => supplierOrder.poId)
  )

  return purchaseOrders
    .filter((order) => receivablePoIds.has(order.id))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function YarnDeliveryLogPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const deliveryBatches = useAppSelector(
    (state) => state.yarnCheck.deliveryBatches
  )
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPoId, setSelectedPoId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { register, handleSubmit, reset } = useForm<DeliveryFormValues>({
    defaultValues: {
      poNumber: "",
      buyer: "",
      supplier: "",
      batchNumber: "",
      quantity: "",
      deliveryDate: "",
      remarks: "",
    },
  })

  const visiblePurchaseOrders = useMemo(
    () => getReceivablePurchaseOrders(purchaseOrders, supplierOrders),
    [purchaseOrders, supplierOrders]
  )

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) {
      return visiblePurchaseOrders
    }

    return visiblePurchaseOrders.filter((po) => {
      const linkedSupplierOrder = getLinkedYarnSupplierOrder(po.id, supplierOrders)

      return [
        getPurchaseOrderDisplayNo(po),
        getPurchaseOrderDisplayStyle(po),
        po.styleNo,
        po.color,
        po.supplier,
        linkedSupplierOrder?.supplier,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [searchQuery, supplierOrders, visiblePurchaseOrders])

  const openCreateForOrder = (poId: string) => {
    const order = visiblePurchaseOrders.find((po) => po.id === poId)
    if (!order) {
      return
    }

    const existingBatches = deliveryBatches.filter((batch) => batch.poId === poId)
    const nextBatchNum = existingBatches.length + 1
    const linkedSupplierOrder = getLinkedYarnSupplierOrder(poId, supplierOrders)

    setSelectedPoId(poId)
    reset({
      poNumber: getPurchaseOrderDisplayNo(order),
      buyer: getResolvedPurchaseOrderBuyer(order, purchaseOrders),
      supplier: linkedSupplierOrder?.supplier || order.supplier || "",
      batchNumber: `LOT-${String(nextBatchNum).padStart(3, "0")}`,
      quantity: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: DeliveryFormValues) => {
    const selectedPo = visiblePurchaseOrders.find((po) => po.id === selectedPoId)
    if (!selectedPo) {
      toast.error("Selected PO not found.")
      return
    }

    const linkedSupplierOrder = getLinkedYarnSupplierOrder(
      selectedPo.id,
      supplierOrders
    )

    if (!linkedSupplierOrder) {
      toast.error("No active yarn supplier order found for this PO.")
      return
    }

    const receivedQty = Number(values.quantity)
    if (!Number.isFinite(receivedQty) || receivedQty <= 0) {
      toast.error("Please enter a valid received quantity.")
      return
    }

    if (!values.supplier.trim()) {
      toast.error("Supplier is required.")
      return
    }

    const batchId = createDeliveryBatchId()
    const stockMovementId = createStockMovementId()

    dispatch(
      addDeliveryBatch({
        id: batchId,
        supplierOrderId: linkedSupplierOrder.id,
        poId: selectedPo.id,
        poNumber: values.poNumber,
        batchNumber: values.batchNumber,
        quantity: receivedQty,
        deliveryDate: values.deliveryDate,
        inspectionStatus: "Received",
        remarks: values.remarks,
        createdAt: new Date().toISOString(),
        createdBy: "Yarn Controller",
      })
    )

    dispatch(
      addStockMovement({
        id: stockMovementId,
        poId: selectedPo.id,
        poNumber: values.poNumber,
        yarnType: getPurchaseOrderDisplayYarn(selectedPo),
        color: selectedPo.color ?? "",
        quantity: receivedQty,
        movementType: "Accepted Receipt",
        movementDate: values.deliveryDate,
        referenceId: batchId,
        referenceLabel: values.batchNumber,
        createdBy: "Yarn Controller",
        remarks: values.remarks,
      })
    )

    upsertInventoryFromReceipt({
      yarnName: getPurchaseOrderDisplayYarn(selectedPo),
      quality: selectedPo.quality || getPurchaseOrderDisplayYarn(selectedPo),
      lotNo: values.batchNumber,
      supplier: values.supplier.trim(),
      quantity: receivedQty,
      actionDate: values.deliveryDate,
      notes: values.remarks,
      poId: selectedPo.id,
      poNumber: values.poNumber,
    })

    dispatch(
      updatePurchaseOrder({
        id: selectedPo.id,
        updates: {
          ...selectedPo,
          supplier: values.supplier.trim(),
          yarnEta: linkedSupplierOrder.expectedArrival || selectedPo.yarnEta,
          status: "Yarn Processing",
        },
      })
    )

    const totalReceivedForSupplierOrder =
      deliveryBatches
        .filter((batch) => batch.supplierOrderId === linkedSupplierOrder.id)
        .reduce((sum, batch) => sum + batch.quantity, 0) + receivedQty

    dispatch(
      updateSupplierOrderStatus({
        id: linkedSupplierOrder.id,
        status:
          totalReceivedForSupplierOrder >= linkedSupplierOrder.orderedQty
            ? "Fully Received"
            : "Partially Received",
      })
    )

    if (selectedPo.yarnCheckRequestId) {
      dispatch(
        updateCheckRequestStatus({
          id: selectedPo.yarnCheckRequestId,
          status: "Receiving",
        })
      )
    }

    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `Yarn received: ${values.poNumber}`,
        description: `${receivedQty} kg yarn has been received from ${values.supplier.trim()} and reserved for inspection.`,
        time: "Just now",
        read: false,
        targetRoles: ["merchandising_user", "management_user", "super_admin"],
      })
    )

    toast.success(
      `Yarn received for PO ${values.poNumber}. Inventory is now pending inspection.`
    )
    setIsCreateModalOpen(false)
    setSelectedPoId("")
  }

  const statusFlow = ["Assigned PO", "Received", "Pending Inspection"]

  return (
    <div className="space-y-6">
      <PageHeader title="Receive Yarn" />

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Receiving Flow
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {statusFlow.map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge value={status} />
              {index < statusFlow.length - 1 ? (
                <span className="text-muted-foreground">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <SearchFilterBar
        filters={["Assigned POs"]}
        activeFilter="Assigned POs"
        searchPlaceholder="Search PO, style, style number, color, supplier"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No assigned POs yet"
          description="POs appear here after Merchandise places a yarn sourcing order."
        />
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Assigned PO List</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => {
              const linkedSupplierOrder = getLinkedYarnSupplierOrder(
                order.id,
                supplierOrders
              )
              const orderBatches = deliveryBatches.filter(
                (batch) => batch.poId === order.id
              )
              const receivedQty = orderBatches.reduce(
                (sum, batch) => sum + batch.quantity,
                0
              )
              const issuedQty = stockMovements
                .filter(
                  (movement) =>
                    movement.poId === order.id &&
                    movement.movementType === "Issued to Knitting"
                )
                .reduce((sum, movement) => sum + movement.quantity, 0)
              const stockBalance = receivedQty - issuedQty
              const requiredQty =
                order.totalYarnKg ??
                order.requiredYarnQty ??
                getPurchaseOrderDisplayQty(order)

              return (
                <div
                  key={order.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {getPurchaseOrderDisplayNo(order)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getPurchaseOrderDisplayStyle(order)}
                      </p>
                    </div>
                    <StatusBadge value={linkedSupplierOrder?.status || order.status} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                      Supplier:{" "}
                      {linkedSupplierOrder?.supplier || order.supplier || "—"}
                    </p>
                    <p>Required: {requiredQty || 0} kg</p>
                    <p>Received: {receivedQty} kg</p>
                    <p>Stock Balance: {stockBalance} kg</p>
                    <p>
                      Expected Delivery: {linkedSupplierOrder?.expectedArrival || "—"}
                    </p>
                    <p>
                      Receive History: {orderBatches.length} deliver
                      {orderBatches.length === 1 ? "y" : "ies"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    onClick={() => openCreateForOrder(order.id)}
                  >
                    Receive Yarn
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Receiving History</h2>
        {deliveryBatches.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO Number" },
              { key: "batchNumber", header: "Batch / Lot" },
              {
                key: "supplier",
                header: "Supplier",
                render: (row) =>
                  getLinkedYarnSupplierOrder(String(row.poId), supplierOrders)
                    ?.supplier ??
                  purchaseOrders.find((po) => po.id === row.poId)?.supplier ??
                  "—",
              },
              { key: "deliveryDate", header: "Receive Date" },
              {
                key: "quantity",
                header: "Received Qty (kg)",
                render: (row) => String(row.quantity),
              },
              {
                key: "stockBalance",
                header: "Stock Balance (kg)",
                render: (row) =>
                  String(
                    deliveryBatches
                      .filter((batch) => batch.poId === row.poId)
                      .reduce((sum, batch) => sum + batch.quantity, 0) -
                      stockMovements
                        .filter(
                          (movement) =>
                            movement.poId === row.poId &&
                            movement.movementType === "Issued to Knitting"
                        )
                        .reduce((sum, movement) => sum + movement.quantity, 0)
                  ),
              },
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "—"),
              },
            ]}
            data={deliveryBatches}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No receiving history yet. Receive yarn from an assigned PO above.
            </p>
          </div>
        )}
      </section>

      <RecordFormModal
        open={isCreateModalOpen}
        title="Receive Yarn"
        description="Record an incoming yarn delivery. Inventory and stock balance update automatically after saving."
        fields={deliveryFields}
        register={register}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedPoId("")
        }}
        onReset={() => {
          const order = visiblePurchaseOrders.find((po) => po.id === selectedPoId)
          if (!order) {
            return
          }

          const linkedSupplierOrder = getLinkedYarnSupplierOrder(
            selectedPoId,
            supplierOrders
          )
          const existingBatches = deliveryBatches.filter(
            (batch) => batch.poId === selectedPoId
          )

          reset({
            poNumber: getPurchaseOrderDisplayNo(order),
            buyer: getResolvedPurchaseOrderBuyer(order, purchaseOrders),
            supplier: linkedSupplierOrder?.supplier || order.supplier || "",
            batchNumber: `LOT-${String(existingBatches.length + 1).padStart(3, "0")}`,
            quantity: "",
            deliveryDate: new Date().toISOString().split("T")[0],
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Save Receive"
      />
    </div>
  )
}
