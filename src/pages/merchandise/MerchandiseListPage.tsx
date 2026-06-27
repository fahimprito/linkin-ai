import { FileUp, Pencil, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
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
  getPurchaseOrderWorkflowColumns,
  getOrderDisplayNo,
  purchaseOrderWorkflowHeaderRows,
} from "@/lib/purchase-order-table-columns"
import { createPurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
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
  { name: "buyer", label: "Buyer", placeholder: "H&M" },
  { name: "design", label: "Design", placeholder: "Striped Jacquard" },
  { name: "styleName", label: "Style Name", placeholder: "Premium Knit Polo" },
  { name: "styleNo", label: "Style Number", placeholder: "ST-2201" },
  { name: "gauge", label: "Gauge", placeholder: "12" },
  {
    name: "quality",
    label: "Quality",
    placeholder: "100% Combed Cotton",
  },
  { name: "poNumber", label: "PO Number", placeholder: "LK-2099" },
  { name: "poQty", label: "Quantity", type: "number", placeholder: "12000" },
  { name: "ccd", label: "CCD", type: "date" },
  { name: "color", label: "Colors", placeholder: "Navy" },
  {
    name: "itemNameCode",
    label: "Item Name & Code",
    placeholder: "CALL-1208 / ITM-44",
  },
  {
    name: "accessories",
    label: "Accessories",
    placeholder: "Buttons, labels, zipper",
  },
  {
    name: "productionUnit",
    label: "Poly/CTN",
    placeholder: "Booked",
  },
  {
    name: "ppStatus",
    label: "PP Status",
    placeholder: "Approved",
  },
  {
    name: "shipmentSample",
    label: "Shipment Sample",
    placeholder: "Submitted",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Urgent order, buyer comments, or merch notes.",
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
    poNumber: order?.poNumber ?? order?.orderNo ?? "",
    productionUnit: order?.productionUnit ?? "",
    polyCartonBooking: order?.polyCartonBooking ?? order?.productionUnit ?? "",
    ppStatus: order?.ppStatus ?? order?.sampleStatus ?? "",
    shipmentSample: order?.shipmentSample ?? order?.shipMode ?? "",
    ccd: order?.ccd ?? order?.deliveryDate ?? "",
    poQty: order?.poQty ?? order?.quantity ?? 0,
    quality: order?.quality ?? order?.yarn ?? order?.yarnComposition ?? "",
    gauge: order?.gauge ?? order?.gg ?? "",
    itemNameCode: order?.itemNameCode ?? order?.callNumber ?? "",
    accessories: order?.accessories ?? order?.buttonZip ?? "",
    remarks: order?.remarks ?? "",
    totalYarnKg: order?.totalYarnKg ?? 0,
    totalFabricKg: order?.totalFabricKg ?? 0,
    totalAccessoriesQty: order?.totalAccessoriesQty ?? 0,
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
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [activeFilter, setActiveFilter] = useState("All POs")
  const [searchQuery, setSearchQuery] = useState("")
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
  const displayedOrders = filteredOrders.filter((po) => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) {
      return true
    }

    const searchableValues = [
      po.sl,
      po.poNumber,
      po.orderNo,
      po.buyer,
      po.styleName,
      po.style,
      po.styleNo,
      po.design,
      po.color,
      po.supplier,
      po.status,
    ]

    return searchableValues.some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearch)
    )
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
    const poNumber = values.poNumber?.trim() || values.orderNo?.trim() || ""
    const styleName = values.styleName?.trim() || values.style?.trim() || ""
    const gauge = values.gauge?.trim() || values.gg?.trim() || ""
    const quality = values.quality?.trim() || values.yarn?.trim() || values.yarnComposition?.trim() || ""
    const ccd = values.ccd?.trim() || values.deliveryDate?.trim() || ""
    const poQty = toNumber(values.poQty ?? values.quantity)
    const normalizedValues = {
      ...values,
      sl:
        values.sl?.trim() ||
        editingOrder?.sl ||
        String(purchaseOrders.length + (editingOrder ? 0 : 1)).padStart(2, "0"),
      poNumber,
      orderNo: poNumber,
      style: styleName,
      quantity: poQty,
      deliveryDate: ccd,
      gg: gauge,
      yarnComposition: quality,
      yarn: quality,
      quality,
      poQty,
      itemNameCode: values.itemNameCode?.trim() || values.callNumber?.trim() || "",
      callNumber: values.itemNameCode?.trim() || values.callNumber?.trim() || "",
      accessories: values.accessories?.trim() || values.buttonZip?.trim() || "",
      buttonZip: values.accessories?.trim() || values.buttonZip?.trim() || "",
      ppStatus: values.ppStatus?.trim() || values.sampleStatus?.trim() || "",
      sampleStatus: values.ppStatus?.trim() || values.sampleStatus?.trim() || "",
      shipmentSample:
        values.shipmentSample?.trim() || values.shipMode?.trim() || "",
      shipMode: values.shipmentSample?.trim() || values.shipMode?.trim() || "",
      polyCartonBooking:
        values.polyCartonBooking?.trim() || values.productionUnit?.trim() || "",
      productionUnit:
        values.productionUnit?.trim() || values.polyCartonBooking?.trim() || "",
      remarks: values.remarks?.trim() || "",
      gauge,
      supplier: editingOrder?.supplier ?? "",
      yarnEta: editingOrder?.yarnEta ?? "",
      requiredYarnQty: editingOrder?.requiredYarnQty ?? 0,
      totalYarnKg: editingOrder?.totalYarnKg ?? 0,
      totalFabricKg: editingOrder?.totalFabricKg ?? 0,
      totalAccessoriesQty: editingOrder?.totalAccessoriesQty ?? 0,
      status: editingOrder?.status ?? "Draft",
    }

    if (editingOrder) {
      dispatch(
        updatePurchaseOrder({
          id: editingOrder.id,
          updates: normalizedValues,
        })
      )
      toast.success(`Purchase order ${poNumber} updated successfully.`)
    } else {
      dispatch(addPurchaseOrder(normalizedValues))
      toast.success(`Purchase order ${poNumber} created successfully.`)
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
  const purchaseOrderWorkflowMetrics = useMemo(() => {
    return createPurchaseOrderWorkflowMetrics({
      purchaseOrders,
      deliveryBatches,
      stockMovements,
      supplierOrders,
    })
  }, [deliveryBatches, purchaseOrders, stockMovements, supplierOrders])
  const purchaseOrderWorkflowColumns = useMemo(
    () => getPurchaseOrderWorkflowColumns(purchaseOrderWorkflowMetrics),
    [purchaseOrderWorkflowMetrics]
  )

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
        searchPlaceholder="Search PO, buyer, style, design, color"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />
      <DataTable
        columns={[
          ...purchaseOrderWorkflowColumns,
          {
            key: "action",
            header: "Actions",
            className: "w-[7.5rem] min-w-[7.5rem]",
            stickyClassName: "sticky right-0 border-l border-border bg-card",
            stickyShadowClassName:
              "shadow-[-6px_0_10px_-8px_rgba(15,23,42,0.35)]",
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
                <div className="flex flex-wrap items-center gap-1.5">
                  {shouldShowConsumptionAction ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg px-2 text-[11px]"
                      disabled={
                        !canOpenDesignModule &&
                        po.status === "Consumption Requested"
                      }
                      onClick={() => handleRequestConsumption(po)}
                    >
                      <span className="hidden sm:inline">
                        {consumptionButtonLabel}
                      </span>
                      <span className="sm:hidden">Req</span>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 cursor-pointer rounded-lg px-0 text-[11px] sm:w-auto sm:px-2"
                    onClick={() => openEditModal(po)}
                    aria-label="Edit purchase order"
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 cursor-pointer rounded-lg px-0 text-[11px] text-destructive hover:text-destructive sm:w-auto sm:px-2"
                    onClick={() => setOrderPendingDelete(po)}
                    aria-label="Delete purchase order"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              )
            },
          },
        ]}
        data={displayedOrders}
        headerRows={purchaseOrderWorkflowHeaderRows}
        compact
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
