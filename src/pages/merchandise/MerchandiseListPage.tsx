import { Pencil, Trash2 } from "lucide-react"
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
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  addPurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrder,
} from "@/store/slices/merchandise-slice"
import type { CreatePurchaseOrderPayload, PurchaseOrder } from "@/types/modules"

const productionStatuses: CreatePurchaseOrderPayload["status"][] = [
  "Knitting",
  "Linking",
  "Finishing",
]

const purchaseOrderFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number", placeholder: "LK-2099" },
  { name: "buyer", label: "Buyer", placeholder: "H&M" },
  { name: "style", label: "Style", placeholder: "Premium Knit Polo" },
  { name: "design", label: "Design", placeholder: "Striped Jacquard" },
  { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
  {
    name: "quantity",
    label: "Quantity",
    type: "number",
    placeholder: "12000",
  },
  {
    name: "status",
    label: "Production Status",
    type: "select",
    options: [...productionStatuses],
  },
  { name: "deliveryDate", label: "Delivery Date", type: "date" },
]

export function MerchandiseListPage() {
  const dispatch = useAppDispatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [orderPendingDelete, setOrderPendingDelete] = useState<PurchaseOrder | null>(null)
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const { register, handleSubmit, reset } = useForm<CreatePurchaseOrderPayload>({
    defaultValues: {
      poNumber: "",
      buyer: "",
      style: "",
      design: "",
      quantity: 0,
      status: "Knitting",
      supplier: "",
      deliveryDate: "",
    },
  })

  const defaultFormValues: CreatePurchaseOrderPayload = {
    poNumber: "",
    buyer: "",
    style: "",
    design: "",
    quantity: 0,
    status: "Knitting",
    supplier: "",
    deliveryDate: "",
  }

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
      status: order.status,
      supplier: order.supplier,
      deliveryDate: order.deliveryDate,
    })
    setEditingOrder(order)
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: CreatePurchaseOrderPayload) => {
    const normalizedValues = {
      ...values,
      quantity: Number(values.quantity),
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase order workflow"
        description="Manage PO details, buyer communication, design references, yarn requests, supplier order tracking, and production progress."
        actions={
          <Button
            type="button"
            className="rounded-2xl"
            onClick={openCreateModal}
          >
            Create PO Request
          </Button>
        }
      />
      <SearchFilterBar
        filters={[
          "PO List",
          "Buyer Information",
          "Design Information",
          "Yarn Consumption Request",
          "Supplier Order Tracking",
          "Production Tracking",
        ]}
      />
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "design", header: "Design" },
          { key: "supplier", header: "Supplier" },
          {
            key: "status",
            header: "Production Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
          {
            key: "action",
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link to={`/merchandise/${String(row.id)}`}>View PO</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-xl"
                  onClick={() => openEditModal(row as PurchaseOrder)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-xl text-destructive hover:text-destructive"
                  onClick={() => setOrderPendingDelete(row as PurchaseOrder)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={purchaseOrders}
      />
      <RecordFormModal
        open={isCreateModalOpen}
        title="Create PO Request"
        description="Add a new purchase order for the merchandise workflow. This request will be saved in local storage and added to the PO list."
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
              status: editingOrder.status,
              supplier: editingOrder.supplier,
              deliveryDate: editingOrder.deliveryDate,
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
      {orderPendingDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Delete purchase order?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This action will permanently remove PO `{orderPendingDelete.poNumber}` from the list.
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
