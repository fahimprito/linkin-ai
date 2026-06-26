import { Pencil, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getOrderDisplayNo,
  getOrderDisplayStyle,
} from "@/lib/purchase-order-table-columns"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { updateCheckRequestStatus } from "@/store/slices/yarn-check-slice"
import {
  addSupplierOrder,
  updateSupplierOrder,
} from "@/store/slices/yarn-check-slice"
import type {
  PurchaseOrder,
  SupplierOrderItemCategory,
  YarnSupplierOrder,
  YarnSupplierOrderStatus,
} from "@/types/modules"

type CreateSourcingOrderFormValues = {
  poId: string
  supplier: string
  itemName: string
  color: string
  orderedQty: string
  expectedArrival: string
}

type EditSourcingOrderFormValues = {
  supplier: string
  itemName: string
  color: string
  orderedQty: string
  expectedArrival: string
  deliveryDate: string
  inspectionDate: string
  status: YarnSupplierOrderStatus
}

const supplierOrderStatusOptions: YarnSupplierOrderStatus[] = [
  "Placed",
  "In Transit",
  "Partially Received",
  "Fully Received",
]

function createSupplierOrderId() {
  return `sso-${Date.now()}`
}

function getSupplierOrderCategory(order: YarnSupplierOrder): SupplierOrderItemCategory {
  return order.itemCategory ?? "Yarn"
}

function getSupplierOrderItem(order: YarnSupplierOrder) {
  return order.itemName || order.yarnType || "-"
}

function getPoOptions(purchaseOrders: PurchaseOrder[]) {
  return purchaseOrders.map((po) => ({
    id: po.id,
    label: `${getOrderDisplayNo(po)} - ${getOrderDisplayStyle(po)}`,
  }))
}

export function MerchandiseSourcingPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [activeFilter, setActiveFilter] = useState("All Orders")
  const [createOrderType, setCreateOrderType] =
    useState<SupplierOrderItemCategory | null>(null)
  const [editingOrder, setEditingOrder] = useState<YarnSupplierOrder | null>(null)
  const poOptions = useMemo(() => getPoOptions(purchaseOrders), [purchaseOrders])

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    control: createControl,
    setValue: setCreateValue,
  } = useForm<CreateSourcingOrderFormValues>({
    defaultValues: {
      poId: "",
      supplier: "",
      itemName: "",
      color: "",
      orderedQty: "",
      expectedArrival: "",
    },
  })
  const selectedCreatePoId = useWatch({
    control: createControl,
    name: "poId",
  })

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<EditSourcingOrderFormValues>({
    defaultValues: {
      supplier: "",
      itemName: "",
      color: "",
      orderedQty: "",
      expectedArrival: "",
      deliveryDate: "",
      inspectionDate: "",
      status: "Placed",
    },
  })

  useEffect(() => {
    if (!createOrderType || !selectedCreatePoId) {
      return
    }

    const selectedPo = purchaseOrders.find((po) => po.id === selectedCreatePoId)
    if (!selectedPo) {
      return
    }

    setCreateValue("color", selectedPo.color ?? "")

    if (createOrderType === "Yarn") {
      setCreateValue(
        "itemName",
        selectedPo.yarn || selectedPo.yarnComposition || ""
      )
      setCreateValue(
        "orderedQty",
        String(selectedPo.totalYarnKg ?? selectedPo.requiredYarnQty ?? "")
      )
      return
    }

    setCreateValue("itemName", "Accessories")
    setCreateValue("orderedQty", String(selectedPo.totalAccessoriesQty ?? ""))
  }, [createOrderType, purchaseOrders, selectedCreatePoId, setCreateValue])

  const filteredOrders = supplierOrders.filter((order) => {
    if (activeFilter === "All Orders") {
      return true
    }

    return getSupplierOrderCategory(order) === activeFilter
  })

  const openCreateModal = (orderType: SupplierOrderItemCategory) => {
    setCreateOrderType(orderType)
    resetCreate({
      poId: "",
      supplier: "",
      itemName: orderType === "Accessories" ? "Accessories" : "",
      color: "",
      orderedQty: "",
      expectedArrival: "",
    })
  }

  const openEditModal = (order: YarnSupplierOrder) => {
    setEditingOrder(order)
    resetEdit({
      supplier: order.supplier,
      itemName: getSupplierOrderItem(order),
      color: order.color,
      orderedQty: String(order.orderedQty),
      expectedArrival: order.expectedArrival,
      deliveryDate: order.deliveryDate ?? "",
      inspectionDate: order.inspectionDate ?? "",
      status: order.status,
    })
  }

  const handleCreateOrder = (values: CreateSourcingOrderFormValues) => {
    if (!createOrderType) {
      return
    }

    const selectedPo = purchaseOrders.find((po) => po.id === values.poId)
    if (!selectedPo) {
      toast.error("Please select a PO first.")
      return
    }

    const itemName = values.itemName.trim()
    const orderedQty = Number(values.orderedQty)

    if (!itemName) {
      toast.error("Please enter the item name.")
      return
    }

    if (!Number.isFinite(orderedQty) || orderedQty <= 0) {
      toast.error("Please enter a valid order quantity.")
      return
    }

    dispatch(
      addSupplierOrder({
        id: createSupplierOrderId(),
        yarnCheckRequestId: selectedPo.yarnCheckRequestId ?? "",
        poId: selectedPo.id,
        poNumber: getOrderDisplayNo(selectedPo),
        supplier: values.supplier.trim(),
        yarnType: itemName,
        itemName,
        itemCategory: createOrderType,
        color: values.color.trim(),
        orderedQty,
        expectedArrival: values.expectedArrival,
        orderedAt: new Date().toISOString(),
        deliveryDate: "",
        inspectionDate: "",
        status: "Placed",
      })
    )

    if (createOrderType === "Yarn") {
      dispatch(updatePoStatus({ id: selectedPo.id, status: "Yarn Ordered" }))
      if (selectedPo.yarnCheckRequestId) {
        dispatch(
          updateCheckRequestStatus({
            id: selectedPo.yarnCheckRequestId,
            status: "Ordered",
          })
        )
      }
    }

    toast.success(
      `${createOrderType} supplier order placed for ${getOrderDisplayNo(selectedPo)}.`
    )
    setCreateOrderType(null)
  }

  const handleUpdateOrder = (values: EditSourcingOrderFormValues) => {
    if (!editingOrder) {
      return
    }

    const orderedQty = Number(values.orderedQty)
    if (!Number.isFinite(orderedQty) || orderedQty <= 0) {
      toast.error("Please enter a valid order quantity.")
      return
    }

    dispatch(
      updateSupplierOrder({
        id: editingOrder.id,
        updates: {
          supplier: values.supplier.trim(),
          yarnType: values.itemName.trim(),
          itemName: values.itemName.trim(),
          color: values.color.trim(),
          orderedQty,
          expectedArrival: values.expectedArrival,
          deliveryDate: values.deliveryDate,
          inspectionDate: values.inspectionDate,
          status: values.status,
        },
      })
    )

    toast.success(`Supplier order ${editingOrder.poNumber} updated.`)
    setEditingOrder(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sourcing"
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => openCreateModal("Yarn")}
            >
              <Plus className="mr-1.5 size-4" />
              Place Yarn Order
            </Button>
            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => openCreateModal("Accessories")}
            >
              <Plus className="mr-1.5 size-4" />
              Place Accessories Order
            </Button>
          </>
        }
      />

      <SearchFilterBar
        filters={["All Orders", "Yarn", "Accessories"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filteredOrders.length > 0 ? (
        <DataTable
          columns={[
            { key: "poNumber", header: "PO" },
            {
              key: "itemCategory",
              header: "Type",
              render: (row) => getSupplierOrderCategory(row),
            },
            { key: "supplier", header: "Supplier" },
            {
              key: "itemName",
              header: "Item",
              render: (row) => getSupplierOrderItem(row),
            },
            {
              key: "color",
              header: "Color / Ref",
              render: (row) => row.color || "-",
            },
            {
              key: "orderedQty",
              header: "Ordered Qty",
              render: (row) => Number(row.orderedQty).toLocaleString(),
            },
            {
              key: "orderedAt",
              header: "Ordered Date",
              render: (row) => new Date(String(row.orderedAt)).toLocaleDateString(),
            },
            { key: "expectedArrival", header: "Expected Delivery" },
            {
              key: "deliveryDate",
              header: "Delivery Date",
              render: (row) => row.deliveryDate || "-",
            },
            {
              key: "inspectionDate",
              header: "Inspection Date",
              render: (row) => row.inspectionDate || "-",
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge value={String(row.status)} />,
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => openEditModal(row)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              ),
            },
          ]}
          data={filteredOrders}
        />
      ) : (
        <EmptyState
          title="No supplier orders yet"
          description="Place a yarn or accessories order to start the sourcing list."
        />
      )}

      {createOrderType ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Place {createOrderType} Order
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create a new supplier order from the Merchandise sourcing desk.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setCreateOrderType(null)}
              >
                Close
              </Button>
            </div>

            <form
              onSubmit={handleCreateSubmit(handleCreateOrder)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <label htmlFor="sourcing-po" className="text-sm font-medium">
                  PO
                </label>
                <select
                  id="sourcing-po"
                  {...registerCreate("poId", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select PO
                  </option>
                  {poOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="sourcing-supplier" className="text-sm font-medium">
                  Supplier
                </label>
                <input
                  id="sourcing-supplier"
                  {...registerCreate("supplier", { required: true })}
                  placeholder="Supplier name"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sourcing-item" className="text-sm font-medium">
                  {createOrderType === "Yarn" ? "Yarn Type" : "Accessories Item"}
                </label>
                <input
                  id="sourcing-item"
                  {...registerCreate("itemName", { required: true })}
                  placeholder={
                    createOrderType === "Yarn" ? "Yarn composition" : "Buttons / zipper / poly"
                  }
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sourcing-color" className="text-sm font-medium">
                  Color / Reference
                </label>
                <input
                  id="sourcing-color"
                  {...registerCreate("color", { required: true })}
                  placeholder="Color or sourcing reference"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sourcing-qty" className="text-sm font-medium">
                  Ordered Quantity
                </label>
                <input
                  id="sourcing-qty"
                  type="number"
                  {...registerCreate("orderedQty", { required: true })}
                  placeholder={createOrderType === "Yarn" ? "850" : "12000"}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sourcing-eta" className="text-sm font-medium">
                  Expected Delivery
                </label>
                <input
                  id="sourcing-eta"
                  type="date"
                  {...registerCreate("expectedArrival", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setCreateOrderType(null)
                    resetCreate()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Place Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingOrder ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Edit Supplier Order
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Update delivery, inspection, and supplier follow-up details for{" "}
                  {editingOrder.poNumber}.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setEditingOrder(null)}
              >
                Close
              </Button>
            </div>

            <form
              onSubmit={handleEditSubmit(handleUpdateOrder)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <label htmlFor="edit-supplier" className="text-sm font-medium">
                  Supplier
                </label>
                <input
                  id="edit-supplier"
                  {...registerEdit("supplier", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-item" className="text-sm font-medium">
                  Item
                </label>
                <input
                  id="edit-item"
                  {...registerEdit("itemName", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-color" className="text-sm font-medium">
                  Color / Reference
                </label>
                <input
                  id="edit-color"
                  {...registerEdit("color", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-qty" className="text-sm font-medium">
                  Ordered Quantity
                </label>
                <input
                  id="edit-qty"
                  type="number"
                  {...registerEdit("orderedQty", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-eta" className="text-sm font-medium">
                  Expected Delivery
                </label>
                <input
                  id="edit-eta"
                  type="date"
                  {...registerEdit("expectedArrival", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-delivery" className="text-sm font-medium">
                  Delivery Date
                </label>
                <input
                  id="edit-delivery"
                  type="date"
                  {...registerEdit("deliveryDate", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-inspection" className="text-sm font-medium">
                  Inspection Date
                </label>
                <input
                  id="edit-inspection"
                  type="date"
                  {...registerEdit("inspectionDate", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="edit-status"
                  {...registerEdit("status", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                >
                  {supplierOrderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setEditingOrder(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
