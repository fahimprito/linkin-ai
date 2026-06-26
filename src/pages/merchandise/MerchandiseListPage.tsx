import { FileUp, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { FileUploadField } from "@/components/shared/file-upload-field"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { useAuth } from "@/hooks/use-auth"
import {
  getOrderDisplayNo,
  purchaseOrderTableColumns,
} from "@/lib/purchase-order-table-columns"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  addPurchaseOrder,
  deletePurchaseOrder,
  requestConsumption,
  updatePurchaseOrder,
} from "@/store/slices/merchandise-slice"
import type { CreatePurchaseOrderPayload, PurchaseOrder } from "@/types/modules"

const purchaseOrderFields: ModalFormField[] = [
  { name: "sl", label: "SL", placeholder: "01" },
  { name: "styleName", label: "Style Name", placeholder: "Premium Knit Polo" },
  { name: "styleNo", label: "Style No", placeholder: "ST-2201" },
  { name: "callNumber", label: "CALL#", placeholder: "CALL-1208" },
  { name: "orderNo", label: "Order No", placeholder: "LK-2099" },
  {
    name: "productionUnit",
    label: "Production Unit",
    placeholder: "Unit 3",
  },
  {
    name: "mainSizeHangTagBooking",
    label: "Main + Size + Hang Tag Booking",
    placeholder: "Done",
  },
  {
    name: "careLabelBooking",
    label: "Care Label Booking",
    placeholder: "Done",
  },
  {
    name: "priceStickerBooking",
    label: "Price Sticker Booking",
    placeholder: "Pending",
  },
  { name: "tissue", label: "TISSUE", placeholder: "Booked" },
  {
    name: "polyCartonBooking",
    label: "Poly + Carton Booking",
    placeholder: "Booked",
  },
  { name: "buttonZip", label: "But/Zip", placeholder: "Button" },
  {
    name: "doneInspection",
    label: "Done Inspection",
    placeholder: "Passed",
  },
  { name: "color", label: "Color", placeholder: "Navy" },
  {
    name: "sampleStatus",
    label: "Sample Status",
    placeholder: "Approved",
  },
  { name: "shipMode", label: "SHP MODE", placeholder: "Sea" },
  { name: "ccd", label: "CCD", type: "date" },
  {
    name: "excessQty",
    label: "EXCESS QTY",
    type: "number",
    placeholder: "300",
  },
  { name: "newCcd", label: "NEW CCD", type: "date" },
  {
    name: "inspectionStyle",
    label: "Inspection Style",
    placeholder: "Inline",
  },
  { name: "stylePhoto", label: "Photo", placeholder: "style-photo-01.jpg" },
  { name: "sizeRange", label: "Size Range", placeholder: "S-XXL" },
  { name: "poQty", label: "PO Qty", type: "number", placeholder: "12000" },
  { name: "yarn", label: "Yarn", placeholder: "100% Combed Cotton" },
  { name: "gauge", label: "Gauge", placeholder: "12" },
  { name: "price", label: "Price", type: "number", placeholder: "9.5" },
  { name: "amount", label: "Amount", type: "number", placeholder: "114000" },
  {
    name: "factoryCosting",
    label: "Factory Costing",
    placeholder: "8.15 / pcs",
  },
  { name: "labTest", label: "Lab Test", placeholder: "Approved" },
  { name: "yarnEta", label: "Yarn ETA", type: "date" },
  { name: "buyer", label: "Buyer", placeholder: "H&M" },
  { name: "design", label: "Design", placeholder: "Striped Jacquard" },
  { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
  {
    name: "requiredYarnQty",
    label: "Required Yarn (kg)",
    type: "number",
    placeholder: "1500",
  },
]

function toNumber(value: unknown) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

function getOrderFormValues(
  order?: PurchaseOrder
): CreatePurchaseOrderPayload {
  return {
    poNumber: order?.poNumber ?? "",
    buyer: order?.buyer ?? "",
    style: order?.style ?? "",
    design: order?.design ?? "",
    quantity: order?.quantity ?? 0,
    status: order?.status ?? "Draft",
    supplier: order?.supplier ?? "",
    deliveryDate: order?.deliveryDate ?? "",
    gg: order?.gg ?? "",
    color: order?.color ?? "",
    yarnComposition: order?.yarnComposition ?? "",
    requiredYarnQty: order?.requiredYarnQty ?? 0,
    sl: order?.sl ?? "",
    styleName: order?.styleName ?? order?.style ?? "",
    styleNo: order?.styleNo ?? "",
    callNumber: order?.callNumber ?? "",
    orderNo: order?.orderNo ?? order?.poNumber ?? "",
    productionUnit: order?.productionUnit ?? "",
    mainSizeHangTagBooking: order?.mainSizeHangTagBooking ?? "",
    careLabelBooking: order?.careLabelBooking ?? "",
    priceStickerBooking: order?.priceStickerBooking ?? "",
    tissue: order?.tissue ?? "",
    polyCartonBooking: order?.polyCartonBooking ?? "",
    buttonZip: order?.buttonZip ?? "",
    doneInspection: order?.doneInspection ?? "",
    sampleStatus: order?.sampleStatus ?? "",
    shipMode: order?.shipMode ?? "",
    ccd: order?.ccd ?? order?.deliveryDate ?? "",
    excessQty: order?.excessQty ?? 0,
    newCcd: order?.newCcd ?? "",
    inspectionStyle: order?.inspectionStyle ?? "",
    stylePhoto: order?.stylePhoto ?? "",
    sizeRange: order?.sizeRange ?? "",
    poQty: order?.poQty ?? order?.quantity ?? 0,
    yarn: order?.yarn ?? order?.yarnComposition ?? "",
    gauge: order?.gauge ?? order?.gg ?? "",
    price: order?.price ?? 0,
    amount: order?.amount ?? 0,
    factoryCosting: order?.factoryCosting ?? "",
    labTest: order?.labTest ?? "",
    yarnEta: order?.yarnEta ?? "",
  }
}

export function MerchandiseListPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [orderPendingDelete, setOrderPendingDelete] =
    useState<PurchaseOrder | null>(null)
  const [uploadedPoFileName, setUploadedPoFileName] = useState("")
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const [activeFilter, setActiveFilter] = useState("All POs")
  const { register, handleSubmit, reset } = useForm<CreatePurchaseOrderPayload>(
    {
      defaultValues: getOrderFormValues(),
    }
  )

  const defaultFormValues = getOrderFormValues()

  // Filter POs based on active filter
  const filteredOrders = purchaseOrders.filter((po) => {
    if (activeFilter === "All POs") return true
    if (activeFilter === "Draft") return po.status === "Draft"
    if (activeFilter === "Consumption Requested")
      return po.status === "Consumption Requested"
    if (activeFilter === "Yarn Check")
      return ["Pending Yarn Check", "Yarn Available", "Yarn Ordered", "Yarn Receiving"].includes(po.status)
    if (activeFilter === "Ready for Production")
      return po.status === "Ready for Production"
    if (activeFilter === "Yarn Ordered")
      return po.status === "Yarn Ordered"
    if (activeFilter === "__hidden_completed__")
      return po.status === "Finished – Ready to Ship"
    return true
  })

  const openCreateModal = () => {
    setEditingOrder(null)
    reset(defaultFormValues)
    setIsCreateModalOpen(true)
  }

  const handleUploadPo = () => {
    if (!uploadedPoFileName) {
      toast.error("Please select a file first.")
      return
    }

    toast.success(`PO file ${uploadedPoFileName} uploaded successfully.`)
    setIsUploadModalOpen(false)
    setUploadedPoFileName("")
  }

  const openEditModal = (order: PurchaseOrder) => {
    reset(getOrderFormValues(order))
    setEditingOrder(order)
    setIsCreateModalOpen(true)
  }

  const onSubmit = (values: CreatePurchaseOrderPayload) => {
    const poQty = toNumber(values.poQty ?? values.quantity)
    const price = toNumber(values.price)
    const rawAmount = values.amount as unknown
    const amountInput =
      rawAmount === undefined || rawAmount === null || rawAmount === ""
        ? poQty * price
        : toNumber(rawAmount)
    const orderNo = values.orderNo?.trim() || values.poNumber?.trim() || ""
    const styleName = values.styleName?.trim() || values.style?.trim() || ""
    const gauge = values.gauge?.trim() || values.gg?.trim() || ""
    const yarn = values.yarn?.trim() || values.yarnComposition?.trim() || ""
    const ccd = values.ccd?.trim() || values.deliveryDate?.trim() || ""
    const newCcd = values.newCcd?.trim() || ""
    const normalizedValues = {
      ...values,
      sl:
        values.sl?.trim() ||
        editingOrder?.sl ||
        String(purchaseOrders.length + (editingOrder ? 0 : 1)).padStart(2, "0"),
      poNumber: orderNo,
      style: styleName,
      quantity: poQty,
      deliveryDate: newCcd || ccd,
      gg: gauge,
      yarnComposition: yarn,
      excessQty: toNumber(values.excessQty),
      poQty,
      yarn,
      gauge,
      price,
      amount: amountInput,
      requiredYarnQty: toNumber(values.requiredYarnQty),
      status: editingOrder?.status ?? "Draft",
    }

    if (editingOrder) {
      dispatch(
        updatePurchaseOrder({
          id: editingOrder.id,
          updates: normalizedValues,
        })
      )
      toast.success(`Purchase order ${orderNo} updated successfully.`)
    } else {
      dispatch(addPurchaseOrder(normalizedValues))
      toast.success(`Purchase order ${orderNo} created successfully.`)
    }

    reset(defaultFormValues)
    setEditingOrder(null)
    setIsCreateModalOpen(false)
  }

  const handleRequestConsumption = (po: PurchaseOrder) => {
    const currentStatus = po.status

    if (currentStatus === "Draft") {
      dispatch(requestConsumption({ id: po.id }))
      if (user?.role === "super_admin") {
        toast.success(
          `Consumption request sent for ${getOrderDisplayNo(po)}.`
        )
        navigate(`/design/request-consumption?poId=${po.id}`)
        return
      }

      toast.success(
        `${getOrderDisplayNo(po)} is now available in the Design module PO list.`
      )
      return
    }

    if (currentStatus === "Consumption Requested" && user?.role === "super_admin") {
      navigate(`/design/request-consumption?poId=${po.id}`)
      return
    }

    toast.success(
      currentStatus === "Consumption Requested"
        ? `${getOrderDisplayNo(po)} is already waiting in the Design module PO list.`
        : `${getOrderDisplayNo(po)} is already in the yarn workflow.`
    )
  }

  // Derive quick metric counts
  const draftCount = purchaseOrders.filter((p) => p.status === "Draft").length
  const yarnCheckCount = purchaseOrders.filter((p) =>
    ["Pending Yarn Check", "Yarn Ordered", "Yarn Receiving"].includes(p.status)
  ).length
  const productionCount = purchaseOrders.filter(
    (p) => p.status === "Ready for Production"
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Order Workflow"
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <FileUp className="mr-1.5 size-4" />
              Upload PO
            </Button>
            <Button
              type="button"
              className="rounded-2xl"
              onClick={openCreateModal}
            >
              Create PO
            </Button>
          </>
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
          <p className="text-xs text-muted-foreground">Ready for Production</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {productionCount}
          </p>
        </div>
      </section>

      {/* Stage Tracker — shows the overall pipeline for context */}
      <SearchFilterBar
        filters={[
          "All POs",
          "Draft",
          "Consumption Requested",
          "Yarn Check",
          "Ready for Production",
          "Yarn Ordered",
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <DataTable
        columns={[
          ...purchaseOrderTableColumns,
          {
            key: "action",
            header: "Actions",
            render: (row) => {
              const po = row as PurchaseOrder
              const canOpenDesignModule = user?.role === "super_admin"
              const shouldShowConsumptionAction = [
                "Draft",
                "Consumption Requested",
              ].includes(po.status)
              const consumptionButtonLabel =
                po.status === "Consumption Requested"
                  ? canOpenDesignModule
                    ? "Open Design"
                    : "Requested"
                  : "Request Consumption"

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
                  {shouldShowConsumptionAction ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={
                        !canOpenDesignModule &&
                        po.status === "Consumption Requested"
                      }
                      onClick={() => handleRequestConsumption(po)}
                    >
                      {consumptionButtonLabel}
                    </Button>
                  ) : null}
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
        description="Fill in PO details. The order will start in Draft status, then move to Design for consumption before Yarn Check begins."
        fields={purchaseOrderFields}
        register={register}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingOrder(null)
          reset(defaultFormValues)
        }}
        onReset={() => {
          if (editingOrder) {
            reset(getOrderFormValues(editingOrder))
            return
          }
          reset(defaultFormValues)
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={
          editingOrder ? "Update Purchase Order" : "Submit Purchase Order"
        }
        maxWidthClassName="max-w-6xl"
      />

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Upload PO File</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload the buyer PO file here. This demo stores the file name only for the intake flow preview.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <FileUploadField
                label="PO File"
                value={uploadedPoFileName}
                onChange={setUploadedPoFileName}
                onClear={() => setUploadedPoFileName("")}
                accept=".xlsx,.xls,.csv,.pdf"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setIsUploadModalOpen(false)
                  setUploadedPoFileName("")
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={handleUploadPo}
              >
                Upload File
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
              {getOrderDisplayNo(orderPendingDelete)}` from the list.
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
                    `Purchase order ${getOrderDisplayNo(orderPendingDelete)} deleted successfully.`
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
