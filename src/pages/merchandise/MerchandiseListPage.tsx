import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addPurchaseOrder } from "@/store/slices/merchandise-slice"
import type { CreatePurchaseOrderPayload } from "@/types/modules"

const productionStatuses: CreatePurchaseOrderPayload["status"][] = [
  "Knitting",
  "Linking",
  "Finishing",
]

export function MerchandiseListPage() {
  const dispatch = useAppDispatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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

  const onSubmit = (values: CreatePurchaseOrderPayload) => {
    dispatch(
      addPurchaseOrder({
      ...values,
      quantity: Number(values.quantity),
      })
    )

    toast.success(`Purchase order ${values.poNumber} created successfully.`)
    reset()
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
            onClick={() => setIsCreateModalOpen(true)}
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
            header: "Detail",
            render: (row) => (
              <Button asChild variant="outline" size="sm">
                <Link to={`/merchandise/${String(row.id)}`}>View PO</Link>
              </Button>
            ),
          },
        ]}
        data={purchaseOrders}
      />
      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Create PO Request</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Add a new purchase order for the merchandise workflow. This
                  request will be saved in local storage and added to the PO list.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Close
              </Button>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <label htmlFor="poNumber" className="text-sm font-medium">
                  PO Number
                </label>
                <input
                  id="poNumber"
                  {...register("poNumber", { required: true })}
                  placeholder="LK-2099"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="buyer" className="text-sm font-medium">
                  Buyer
                </label>
                <input
                  id="buyer"
                  {...register("buyer", { required: true })}
                  placeholder="H&M"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="style" className="text-sm font-medium">
                  Style
                </label>
                <input
                  id="style"
                  {...register("style", { required: true })}
                  placeholder="Premium Knit Polo"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="design" className="text-sm font-medium">
                  Design
                </label>
                <input
                  id="design"
                  {...register("design", { required: true })}
                  placeholder="Striped Jacquard"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="supplier" className="text-sm font-medium">
                  Supplier
                </label>
                <input
                  id="supplier"
                  {...register("supplier", { required: true })}
                  placeholder="Delta Yarn"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  {...register("quantity", { required: true, min: 1, valueAsNumber: true })}
                  placeholder="12000"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Production Status
                </label>
                <select
                  id="status"
                  {...register("status", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                >
                  {productionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="deliveryDate" className="text-sm font-medium">
                  Delivery Date
                </label>
                <input
                  id="deliveryDate"
                  type="date"
                  {...register("deliveryDate", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>
              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-2xl"
                >
                  Submit Purchase Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
