import { useMemo, useState } from "react"
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
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getPurchaseOrderDisplayItemCode,
  getPurchaseOrderDisplayItemName,
  getPurchaseOrderDisplayItemNameCode,
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
  getResolvedPurchaseOrderBuyer,
} from "@/lib/purchase-orders"
import {
  addAccessoryReceipt,
  getStoredAccessoryReceipts,
  upsertStoreInventoryFromReceipt,
} from "@/lib/store-accessories"
import {
  deriveStoreWorkflowStatus,
  getStoredStoreControllerRecords,
  isStoreStageReadOnly,
  saveStoredStoreControllerRecords,
  upsertStoreControllerRecord,
} from "@/lib/store-controller"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import { updateSupplierOrderStatus } from "@/store/slices/yarn-check-slice"
import type {
  PurchaseOrder,
  StoreAccessoryReceipt,
  StoreControllerPoRecord,
  YarnSupplierOrder,
} from "@/types/modules"

type ReceiveAccessoriesFormValues = {
  poNumber: string
  buyer: string
  supplier: string
  batchNumber: string
  quantity: string
  receiveDate: string
  remarks: string
}

const receiveFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number", readOnly: true },
  { name: "buyer", label: "Buyer", readOnly: true },
  { name: "supplier", label: "Supplier" },
  { name: "batchNumber", label: "Batch / Lot Number", placeholder: "LOT-001" },
  { name: "quantity", label: "Received Qty", type: "number", placeholder: "12000" },
  { name: "receiveDate", label: "Receive Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Accessories received and stored.",
  },
]

function createStoreReceiptId() {
  return `sar-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

function getLatestAccessoriesOrderByPo(
  poId: string,
  supplierOrders: YarnSupplierOrder[],
  receipts: StoreAccessoryReceipt[]
) {
  return supplierOrders
    .filter(
      (order) => {
        if ((order.itemCategory ?? "Yarn") !== "Accessories" || order.poId !== poId) {
          return false
        }

        if (order.status === "Cancelled") {
          return false
        }

        const receivedQty = receipts
          .filter((receipt) => receipt.poId === poId)
          .reduce((sum, receipt) => sum + receipt.quantity, 0)

        return receivedQty < order.orderedQty
      }
    )
    .sort((left, right) => {
      const leftDate = left.orderedAt || left.expectedArrival || ""
      const rightDate = right.orderedAt || right.expectedArrival || ""
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]
}

function getReceivablePurchaseOrders(
  purchaseOrders: PurchaseOrder[],
  supplierOrders: YarnSupplierOrder[],
  records: StoreControllerPoRecord[],
  receipts: StoreAccessoryReceipt[]
) {
  const receivablePoIds = new Set(
    supplierOrders
      .filter(
        (order) => {
          if ((order.itemCategory ?? "Yarn") !== "Accessories") {
            return false
          }

          if (order.status === "Cancelled") {
            return false
          }

          const receivedQty = receipts
            .filter((receipt) => receipt.poId === order.poId)
            .reduce((sum, receipt) => sum + receipt.quantity, 0)

          return receivedQty < order.orderedQty
        }
      )
      .map((order) => order.poId)
  )

  return purchaseOrders
    .filter((order) => receivablePoIds.has(order.id) && !isStoreStageReadOnly(order.status))
    .map((order) => ({
      ...order,
      storeRecord: records.find((record) => record.poId === order.id),
      accessoriesSupplierOrder: getLatestAccessoriesOrderByPo(
        order.id,
        supplierOrders,
        receipts
      ),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function StoreReceiveAccessoriesPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [records, setRecords] = useState<StoreControllerPoRecord[]>(() =>
    getStoredStoreControllerRecords()
  )
  const [receipts, setReceipts] = useState<StoreAccessoryReceipt[]>(() =>
    getStoredAccessoryReceipts()
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPoId, setSelectedPoId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { register, handleSubmit, reset } = useForm<ReceiveAccessoriesFormValues>({
    defaultValues: {
      poNumber: "",
      buyer: "",
      supplier: "",
      batchNumber: "",
      quantity: "",
      receiveDate: "",
      remarks: "",
    },
  })

  const visiblePurchaseOrders = useMemo(
    () => getReceivablePurchaseOrders(purchaseOrders, supplierOrders, records, receipts),
    [purchaseOrders, supplierOrders, records, receipts]
  )

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) {
      return visiblePurchaseOrders
    }

    return visiblePurchaseOrders.filter((po) => {
      const linkedSupplierOrder = getLatestAccessoriesOrderByPo(
        po.id,
        supplierOrders,
        receipts
      )

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
  }, [receipts, searchQuery, supplierOrders, visiblePurchaseOrders])

  const openCreateForOrder = (poId: string) => {
    const order = visiblePurchaseOrders.find((po) => po.id === poId)
    if (!order) {
      return
    }

    if (isStoreStageReadOnly(order.status)) {
      toast.error("This PO is already moved beyond Store. Store receiving is read-only.")
      return
    }

    const poReceipts = receipts.filter((receipt) => receipt.poId === poId)
    const linkedSupplierOrder = getLatestAccessoriesOrderByPo(
      poId,
      supplierOrders,
      receipts
    )

    if (!linkedSupplierOrder) {
      toast.error("This accessories order is already fully received.")
      return
    }

    setSelectedPoId(poId)
    reset({
      poNumber: getPurchaseOrderDisplayNo(order),
      buyer: getResolvedPurchaseOrderBuyer(order, purchaseOrders),
      supplier:
        order.storeRecord?.supplier ||
        linkedSupplierOrder?.supplier ||
        order.supplier ||
        "",
      batchNumber: `LOT-${String(poReceipts.length + 1).padStart(3, "0")}`,
      quantity: "",
      receiveDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: ReceiveAccessoriesFormValues) => {
    const selectedPo = visiblePurchaseOrders.find((po) => po.id === selectedPoId)
    if (!selectedPo) {
      toast.error("Selected PO not found.")
      return
    }

    const linkedSupplierOrder = getLatestAccessoriesOrderByPo(
      selectedPo.id,
      supplierOrders,
      receipts
    )

    if (!linkedSupplierOrder) {
      toast.error("No active accessories supplier order found for this PO.")
      return
    }

    const quantity = Number(values.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Received quantity must be greater than zero.")
      return
    }

    if (!values.supplier.trim()) {
      toast.error("Supplier is required.")
      return
    }

    const currentReceivedQty = receipts
      .filter((receipt) => receipt.poId === selectedPo.id)
      .reduce((sum, receipt) => sum + receipt.quantity, 0)
    const remainingQty = Math.max(0, linkedSupplierOrder.orderedQty - currentReceivedQty)

    if (remainingQty <= 0) {
      dispatch(
        updateSupplierOrderStatus({
          id: linkedSupplierOrder.id,
          status: "Fully Received",
        })
      )
      toast.error("This accessories order is already fully received.")
      return
    }

    if (quantity > remainingQty) {
      toast.error(`Received quantity cannot exceed remaining qty (${remainingQty}).`)
      return
    }

    const nextReceipts = addAccessoryReceipt({
      id: createStoreReceiptId(),
      poId: selectedPo.id,
      poNumber: getPurchaseOrderDisplayNo(selectedPo),
      supplier: values.supplier.trim(),
      batchNumber: values.batchNumber.trim(),
      quantity,
      receiveDate: values.receiveDate,
      remarks: values.remarks.trim() || undefined,
      createdAt: new Date().toISOString(),
      createdBy: "Store Controller",
    })
    setReceipts(nextReceipts)

    upsertStoreInventoryFromReceipt({
      itemName:
        getPurchaseOrderDisplayItemName(selectedPo) ||
        getPurchaseOrderDisplayItemNameCode(selectedPo) ||
        selectedPo.accessories ||
        "Accessories",
      itemCode: getPurchaseOrderDisplayItemCode(selectedPo) || undefined,
      lotNo: values.batchNumber.trim(),
      supplier: values.supplier.trim(),
      quantity,
      actionDate: values.receiveDate,
      notes: values.remarks.trim() || undefined,
      poId: selectedPo.id,
      poNumber: getPurchaseOrderDisplayNo(selectedPo),
    })

    const totalReceivedQty = nextReceipts
      .filter((receipt) => receipt.poId === selectedPo.id)
      .reduce((sum, receipt) => sum + receipt.quantity, 0)
    const issuedQty = selectedPo.storeRecord?.issuedQty ?? 0

    const nextRecords = upsertStoreControllerRecord({
      poId: selectedPo.id,
      supplier: values.supplier.trim(),
      eta:
        selectedPo.storeRecord?.eta ||
        selectedPo.accessoriesSupplierOrder?.expectedArrival,
      inspectionStatus: selectedPo.storeRecord?.inspectionStatus ?? "Received",
      inspectionDate: selectedPo.storeRecord?.inspectionDate,
      receivedQty: totalReceivedQty,
      issuedQty,
      stockBalance: Math.max(0, totalReceivedQty - issuedQty),
      remarks: values.remarks.trim() || selectedPo.storeRecord?.remarks || undefined,
    })

    setRecords(nextRecords)
    saveStoredStoreControllerRecords(nextRecords)
    const nextStatus = deriveStoreWorkflowStatus(selectedPo, {
      supplier: values.supplier.trim(),
      eta:
        selectedPo.storeRecord?.eta ||
        selectedPo.accessoriesSupplierOrder?.expectedArrival,
      inspectionStatus: selectedPo.storeRecord?.inspectionStatus ?? "Received",
      inspectionDate: selectedPo.storeRecord?.inspectionDate,
      receivedQty: totalReceivedQty,
      issuedQty,
      stockBalance: Math.max(0, totalReceivedQty - issuedQty),
      remarks: values.remarks.trim() || selectedPo.storeRecord?.remarks || undefined,
    })

    dispatch(
      updateSupplierOrderStatus({
        id: linkedSupplierOrder.id,
        status:
          totalReceivedQty >= linkedSupplierOrder.orderedQty
            ? "Fully Received"
            : "Partially Received",
      })
    )
    if (nextStatus !== selectedPo.status) {
      dispatch(
        updatePoStatus({
          id: selectedPo.id,
          status: nextStatus,
          changedBy: "Store Controller",
        })
      )
    }
    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `Accessories received: ${values.poNumber}`,
        description: `${quantity} accessories units have been received from ${values.supplier.trim()} and inventory was updated.`,
        description: `${quantity} accessories units have been received from ${values.supplier.trim()} and reserved for inspection.`,
        time: "Just now",
        read: false,
        targetRoles: ["merchandising_user", "management_user", "super_admin"],
      })
    )
    setIsCreateModalOpen(false)
    setSelectedPoId("")
    toast.success(
      `Accessories received for ${values.poNumber}. Inventory is now pending inspection.`
    )
  }

  const statusFlow = ["Assigned PO", "Received", "Pending Inspection"]

  return (
    <div className="space-y-6">
      <PageHeader title="Receive Accessories" />

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
          description="POs appear here after Merchandise places an accessories sourcing order."
        />
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Assigned PO List</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => {
              const linkedSupplierOrder = getLatestAccessoriesOrderByPo(
                order.id,
                supplierOrders,
                receipts
              )
              const orderReceipts = receipts.filter((receipt) => receipt.poId === order.id)
              const receivedQty = orderReceipts.reduce(
                (sum, receipt) => sum + receipt.quantity,
                0
              )
              const issuedQty = order.storeRecord?.issuedQty ?? 0
              const stockBalance = receivedQty - issuedQty
              const requiredQty =
                linkedSupplierOrder?.orderedQty ??
                order.totalAccessoriesQty ??
                getPurchaseOrderDisplayQty(order)
              const remainingQty = Math.max(0, requiredQty - receivedQty)

              return (
                <div
                  key={order.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{getPurchaseOrderDisplayNo(order)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPurchaseOrderDisplayStyle(order)}
                      </p>
                    </div>
                    <StatusBadge
                      value={linkedSupplierOrder?.status || order.storeRecord?.inspectionStatus || "Pending"}
                    />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                      Supplier:{" "}
                      {linkedSupplierOrder?.supplier ||
                        order.storeRecord?.supplier ||
                        order.supplier ||
                        "—"}
                    </p>
                    <p>Required: {requiredQty || 0}</p>
                    <p>Received: {receivedQty}</p>
                    <p>Remaining: {remainingQty}</p>
                    <p>Stock Balance: {stockBalance}</p>
                    <p>
                      Expected Delivery: {linkedSupplierOrder?.expectedArrival || "—"}
                    </p>
                    <p>
                      Receive History: {orderReceipts.length} deliver
                      {orderReceipts.length === 1 ? "y" : "ies"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    onClick={() => openCreateForOrder(order.id)}
                  >
                    Receive Accessories
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Receiving History</h2>
        {receipts.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO Number" },
              { key: "batchNumber", header: "Batch / Lot" },
              { key: "supplier", header: "Supplier" },
              { key: "receiveDate", header: "Receive Date" },
              {
                key: "quantity",
                header: "Received Qty",
                render: (row) => String(row.quantity),
              },
              {
                key: "stockBalance",
                header: "Stock Balance",
                render: (row) => {
                  const totalReceived = receipts
                    .filter((receipt) => receipt.poId === row.poId)
                    .reduce((sum, receipt) => sum + receipt.quantity, 0)
                  const issuedQty =
                    records.find((record) => record.poId === row.poId)?.issuedQty ?? 0

                  return String(totalReceived - issuedQty)
                },
              },
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "—"),
              },
            ]}
            data={receipts}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No receiving history yet. Receive accessories from an assigned PO above.
            </p>
          </div>
        )}
      </section>

      <RecordFormModal
        open={isCreateModalOpen}
        title="Receive Accessories"
        description="Record an incoming accessories delivery. Inventory and stock balance update automatically after saving."
        fields={receiveFields}
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

          const linkedSupplierOrder = getLatestAccessoriesOrderByPo(
            selectedPoId,
            supplierOrders,
            receipts
          )
          const poReceipts = receipts.filter((receipt) => receipt.poId === selectedPoId)

          reset({
            poNumber: getPurchaseOrderDisplayNo(order),
            buyer: getResolvedPurchaseOrderBuyer(order, purchaseOrders),
            supplier:
              order.storeRecord?.supplier ||
              linkedSupplierOrder?.supplier ||
              order.supplier ||
              "",
            batchNumber: `LOT-${String(poReceipts.length + 1).padStart(3, "0")}`,
            quantity: "",
            receiveDate: new Date().toISOString().split("T")[0],
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Save Receive"
      />
    </div>
  )
}


