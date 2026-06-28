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
import {
  getPurchaseOrderDisplayAccessories,
  getPurchaseOrderDisplayCcd,
  getPurchaseOrderDisplayGauge,
  getPurchaseOrderDisplayItemNameCode,
  getPurchaseOrderDisplayPpStatus,
  getPurchaseOrderDisplayProductionUnit,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayShipmentSample,
  getPurchaseOrderDisplayStyle,
  getPurchaseOrderDisplayYarn,
} from "@/lib/purchase-orders"
import { createPurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addNotification } from "@/store/slices/notification-slice"
import {
  addPurchaseOrder,
  deletePurchaseOrder,
  requestConsumption,
  updatePurchaseOrder,
} from "@/store/slices/merchandise-slice"
import type { CreatePurchaseOrderPayload, PurchaseOrder } from "@/types/modules"

const purchaseOrderFields: ModalFormField[] = [
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

const styleCreateReadOnlyFieldNames = new Set([
  "styleName",
  "styleNo",
  "gauge",
  "quality",
  "accessories",
  "productionUnit",
  "ppStatus",
  "shipmentSample",
])

const styleCreateBlankFieldNames = new Set([
  "poNumber",
  "poQty",
  "ccd",
  "color",
  "itemNameCode",
  "remarks",
])

function toNumber(value: unknown) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

function getOrderFormValues(
  order?: PurchaseOrder
): CreatePurchaseOrderPayload {
  const styleName = order ? getPurchaseOrderDisplayStyle(order) : ""
  const poNumber = order?.poNumber ?? ""
  const poQty = order ? getPurchaseOrderDisplayQty(order) : 0
  const ccd = order ? getPurchaseOrderDisplayCcd(order) : ""
  const quality = order ? order.quality ?? getPurchaseOrderDisplayYarn(order) : ""
  const gauge = order ? getPurchaseOrderDisplayGauge(order) : ""
  const itemNameCode = order ? getPurchaseOrderDisplayItemNameCode(order) : ""
  const accessories = order ? getPurchaseOrderDisplayAccessories(order) : ""
  const productionUnit = order ? getPurchaseOrderDisplayProductionUnit(order) : ""
  const ppStatus = order ? getPurchaseOrderDisplayPpStatus(order) : ""
  const shipmentSample = order ? getPurchaseOrderDisplayShipmentSample(order) : ""

  return {
    buyer: order?.buyer ?? "",
    style: styleName,
    design: order?.design ?? "",
    quantity: poQty,
    status: order?.status ?? "Created",
    supplier: order?.supplier ?? "",
    deliveryDate: ccd,
    color: order?.color ?? "",
    requiredYarnQty: order?.requiredYarnQty ?? 0,
    styleName,
    styleNo: order?.styleNo ?? "",
    poNumber,
    productionUnit,
    ppStatus,
    shipmentSample,
    ccd,
    poQty,
    quality,
    gauge,
    itemNameCode,
    accessories,
    remarks: order?.remarks ?? "",
    totalYarnKg: order?.totalYarnKg ?? 0,
    totalFabricKg: order?.totalFabricKg ?? 0,
    totalAccessoriesQty: order?.totalAccessoriesQty ?? 0,
  }
}

function getCreateFromStyleFormValues(
  order: PurchaseOrder
): CreatePurchaseOrderPayload {
  return {
    buyer: "",
    style: getPurchaseOrderDisplayStyle(order),
    design: "",
    quantity: 0,
    status: "Created",
    supplier: "",
    deliveryDate: "",
    color: "",
    requiredYarnQty: 0,
    styleName: getPurchaseOrderDisplayStyle(order),
    styleNo: order.styleNo ?? "",
    poNumber: "",
    productionUnit: getPurchaseOrderDisplayProductionUnit(order),
    ppStatus: getPurchaseOrderDisplayPpStatus(order),
    shipmentSample: getPurchaseOrderDisplayShipmentSample(order),
    poQty: 0,
    ccd: "",
    quality: order.quality ?? getPurchaseOrderDisplayYarn(order),
    gauge: getPurchaseOrderDisplayGauge(order),
    itemNameCode: "",
    accessories: getPurchaseOrderDisplayAccessories(order),
    remarks: "",
    totalYarnKg: 0,
    totalFabricKg: 0,
    totalAccessoriesQty: 0,
  }
}

function getPurchaseOrderFieldsForMode(mode: "create" | "edit") {
  if (mode !== "edit") {
    return purchaseOrderFields
  }

  return purchaseOrderFields
}

function getStyleCreateFields(): ModalFormField[] {
  return purchaseOrderFields.map((field) => {
    if (styleCreateReadOnlyFieldNames.has(field.name)) {
      return {
        ...field,
        readOnly: true,
      }
    }

    if (styleCreateBlankFieldNames.has(field.name)) {
      return {
        ...field,
        placeholder:
          field.name === "poNumber"
            ? "Enter new PO number"
            : field.placeholder,
      }
    }

    return field
  })
}

export function MerchandiseListPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateFromStyleModalOpen, setIsCreateFromStyleModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [selectedStyleName, setSelectedStyleName] = useState("")
  const [styleSourceOrder, setStyleSourceOrder] = useState<PurchaseOrder | null>(null)
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
  const {
    register: registerStyleCreate,
    handleSubmit: handleStyleCreateSubmit,
    reset: resetStyleCreate,
  } = useForm<CreatePurchaseOrderPayload>({
    defaultValues: getOrderFormValues(),
  })

  const defaultFormValues = getOrderFormValues()
  const modalMode: "create" | "edit" = editingOrder ? "edit" : "create"
  const modalFields = useMemo(
    () => getPurchaseOrderFieldsForMode(modalMode),
    [modalMode]
  )
  const styleCreateFields = useMemo(() => getStyleCreateFields(), [])
  const styleOptions = useMemo(() => {
    const styleMap = new Map<string, PurchaseOrder>()

    purchaseOrders.forEach((order) => {
      const styleName = getPurchaseOrderDisplayStyle(order).trim()
      if (!styleName) {
        return
      }

      const normalizedStyleName = styleName.toLowerCase()
      if (!styleMap.has(normalizedStyleName)) {
        styleMap.set(normalizedStyleName, order)
      }
    })

    return Array.from(styleMap.entries())
      .map(([normalizedStyleName, order]) => ({
        normalizedStyleName,
        label: getPurchaseOrderDisplayStyle(order),
        order,
      }))
      .sort((left, right) => left.label.localeCompare(right.label))
  }, [purchaseOrders])

  // Filter POs based on active filter
  const filteredOrders = purchaseOrders.filter((po) => {
    if (activeFilter === "All POs") return true
    if (activeFilter === "Created") return po.status === "Created"
    if (activeFilter === "Sent to Design")
      return po.status === "Sent to Design"
    if (activeFilter === "Yarn Check")
      return ["Sent to Yarn", "Yarn Processing", "Yarn Ready"].includes(po.status)
    if (activeFilter === "Sent to Knitting")
      return po.status === "Sent to Knitting"
    if (activeFilter === "Yarn Processing")
      return po.status === "Yarn Processing"
    return true
  })
  const displayedOrders = filteredOrders.filter((po) => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) {
      return true
    }

    const searchableValues = [
      po.poNumber,
      getPurchaseOrderDisplayStyle(po),
      po.styleNo,
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

  const openCreateFromStyleModal = () => {
    setSelectedStyleName("")
    setStyleSourceOrder(null)
    resetStyleCreate(defaultFormValues)
    setIsCreateFromStyleModalOpen(true)
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

  const handleStyleSelection = (nextStyleName: string) => {
    setSelectedStyleName(nextStyleName)
    const matchedStyle = styleOptions.find(
      (styleOption) =>
        styleOption.label.trim().toLowerCase() === nextStyleName.trim().toLowerCase()
    )?.order

    setStyleSourceOrder(matchedStyle ?? null)
    resetStyleCreate(
      matchedStyle ? getCreateFromStyleFormValues(matchedStyle) : defaultFormValues
    )
  }

  const buildNormalizedPurchaseOrderValues = (
    values: CreatePurchaseOrderPayload,
    baseOrder?: PurchaseOrder | null
  ) => {
    const poNumber = values.poNumber?.trim() || ""
    const styleName = values.styleName?.trim() || values.style?.trim() || ""
    const gauge = values.gauge?.trim() || ""
    const quality = values.quality?.trim() || values.yarn?.trim() || ""
    const ccd = values.ccd?.trim() || values.deliveryDate?.trim() || ""
    const poQty = toNumber(values.poQty)
    const color = values.color?.trim() || ""
    const itemNameCode = values.itemNameCode?.trim() || ""
    const accessories = values.accessories?.trim() || ""
    const ppStatus = values.ppStatus?.trim() || ""
    const shipmentSample = values.shipmentSample?.trim() || ""
    const productionUnit = values.productionUnit?.trim() || ""
    const normalizedPoNumber = poNumber.toLowerCase()

    if (!poNumber) {
      toast.error("PO Number is required.")
      return
    }

    const hasDuplicatePoNumber = purchaseOrders.some(
      (order) =>
        order.id !== editingOrder?.id &&
        order.poNumber.trim().toLowerCase() === normalizedPoNumber
    )

    if (hasDuplicatePoNumber) {
      toast.error("PO Number must be unique.")
      return
    }

    if (poQty <= 0) {
      toast.error("Quantity must be greater than zero.")
      return
    }

    if (!ccd) {
      toast.error("CCD is required.")
      return
    }

    if (!color) {
      toast.error("Colors is required.")
      return
    }

    if (!itemNameCode) {
      toast.error("Item Name & Code is required.")
      return null
    }

    return {
      ...values,
      buyer: editingOrder?.buyer ?? baseOrder?.buyer ?? "",
      design: editingOrder?.design ?? baseOrder?.design ?? "",
      poNumber,
      style: styleName,
      quantity: poQty,
      deliveryDate: ccd,
      yarn: quality,
      quality,
      poQty,
      color,
      itemNameCode,
      accessories,
      ppStatus,
      shipmentSample,
      productionUnit,
      remarks: values.remarks?.trim() || "",
      gauge,
      supplier: editingOrder?.supplier ?? "",
      yarnEta: editingOrder?.yarnEta ?? "",
      requiredYarnQty: editingOrder?.requiredYarnQty ?? 0,
      totalYarnKg: editingOrder?.totalYarnKg ?? 0,
      totalFabricKg: editingOrder?.totalFabricKg ?? 0,
      totalAccessoriesQty: editingOrder?.totalAccessoriesQty ?? 0,
      status: editingOrder?.status ?? "Created",
    }
  }

  const onSubmit = (values: CreatePurchaseOrderPayload) => {
    const normalizedValues = buildNormalizedPurchaseOrderValues(values)
    if (!normalizedValues) {
      return
    }

    if (editingOrder) {
      dispatch(
        updatePurchaseOrder({
          id: editingOrder.id,
          updates: normalizedValues,
        })
      )
      toast.success(
        `Purchase order ${normalizedValues.poNumber} updated successfully.`
      )
    } else {
      dispatch(addPurchaseOrder(normalizedValues))
      dispatch(
        addNotification({
          id: createNotificationId(),
          title: `New PO created: ${normalizedValues.poNumber}`,
          description: `${normalizedValues.styleName || normalizedValues.style} has been created in Merchandise and is ready for workflow follow-up.`,
          time: "Just now",
          read: false,
          targetRoles: ["merchandising_user", "management_user", "super_admin"],
        })
      )
      toast.success(
        `Purchase order ${normalizedValues.poNumber} created successfully.`
      )
    }

    reset(defaultFormValues)
    setEditingOrder(null)
    setIsCreateModalOpen(false)
  }

  const handleCreateFromStyle = (values: CreatePurchaseOrderPayload) => {
    if (!styleSourceOrder) {
      toast.error("Please select a style name first.")
      return
    }

    const normalizedValues = buildNormalizedPurchaseOrderValues(
      values,
      styleSourceOrder
    )
    if (!normalizedValues) {
      return
    }

    dispatch(addPurchaseOrder(normalizedValues))
    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `New PO created from style: ${normalizedValues.poNumber}`,
        description: `${normalizedValues.styleName || normalizedValues.style} has been added as a new Merchandise PO.`,
        time: "Just now",
        read: false,
        targetRoles: ["merchandising_user", "management_user", "super_admin"],
      })
    )
    toast.success(`Purchase order ${normalizedValues.poNumber} created successfully.`)
    setIsCreateFromStyleModalOpen(false)
    setSelectedStyleName("")
    setStyleSourceOrder(null)
    resetStyleCreate(defaultFormValues)
  }

  const handleRequestConsumption = (po: PurchaseOrder) => {
    const currentStatus = po.status

    if (currentStatus === "Created") {
      dispatch(requestConsumption({ id: po.id }))
      dispatch(
        addNotification({
          id: createNotificationId(),
          title: `PO sent to Design: ${getOrderDisplayNo(po)}`,
          description: `${getPurchaseOrderDisplayStyle(po)} is now waiting for Design consumption submission.`,
          time: "Just now",
          read: false,
          targetRoles: ["design_user", "management_user", "super_admin"],
        })
      )
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

    if (currentStatus === "Sent to Design" && user?.role === "super_admin") {
      navigate(`/design/request-consumption?poId=${po.id}`)
      return
    }

    toast.success(
      currentStatus === "Sent to Design"
        ? `${getOrderDisplayNo(po)} is already waiting in the Design module PO list.`
        : `${getOrderDisplayNo(po)} is already in the yarn workflow.`
    )
  }

  // Derive quick metric counts
  const draftCount = purchaseOrders.filter((p) => p.status === "Created").length
  const yarnCheckCount = purchaseOrders.filter((p) =>
    ["Sent to Yarn", "Yarn Processing", "Yarn Ready"].includes(p.status)
  ).length
  const productionCount = purchaseOrders.filter(
    (p) => p.status === "Sent to Knitting"
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
    () =>
      getPurchaseOrderWorkflowColumns(purchaseOrderWorkflowMetrics).map((column) =>
        column.key === "sl"
          ? {
              ...column,
              render: (_row: PurchaseOrder, rowIndex: number) =>
                String(rowIndex + 1).padStart(2, "0"),
            }
          : column
      ),
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
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={openCreateFromStyleModal}
            >
              Create PO from Existing Style
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
          <p className="text-xs text-muted-foreground">Created</p>
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
          <p className="text-xs text-muted-foreground">Sent to Knitting</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {productionCount}
          </p>
        </div>
      </section>

      {/* Search and quick filters */}
      <SearchFilterBar
        filters={[
          "All POs",
          "Created",
          "Sent to Design",
          "Yarn Check",
          "Sent to Knitting",
          "Yarn Processing",
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, style, style number, color"
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
                "Created",
                "Sent to Design",
              ].includes(po.status)
              const consumptionButtonLabel =
                po.status === "Sent to Design"
                  ? canOpenDesignModule
                    ? "Open Design"
                    : "Requested"
                  : "Request Consumption"

              return (
                <div className="flex flex-wrap items-center gap-1.5">
                  {shouldShowConsumptionAction ? (
                    <Button
                      type="button"
                      variant={
                        po.status === "Sent to Design"
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                      className={
                        po.status === "Sent to Design"
                          ? "h-7 rounded-lg border-amber-200 bg-amber-50 px-2 text-[11px] text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/15"
                          : "h-7 rounded-lg border-sky-200 bg-sky-50 px-2 text-[11px] text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/15"
                      }
                      disabled={
                        !canOpenDesignModule &&
                        po.status === "Sent to Design"
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
        title={
          editingOrder
            ? "Edit Purchase Order"
            : "Create PO Request"
        }
        description={
          "Fill in PO details. The order will start in Created status, then move to Design for consumption before Yarn begins."
        }
        fields={modalFields}
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
          editingOrder
            ? "Update Purchase Order"
            : "Submit Purchase Order"
        }
        maxWidthClassName="max-w-6xl"
      />

      {isCreateFromStyleModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Create PO from Existing Style</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Select an existing style, review the read-only fields, then enter the new PO-specific values.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setIsCreateFromStyleModalOpen(false)
                  setSelectedStyleName("")
                  setStyleSourceOrder(null)
                  resetStyleCreate(defaultFormValues)
                }}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              <label htmlFor="existing-style-name" className="text-sm font-medium">
                Style Name
              </label>
              <input
                id="existing-style-name"
                list="existing-style-options"
                value={selectedStyleName}
                onChange={(event) => handleStyleSelection(event.target.value)}
                placeholder="Search and select a style name"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
              />
              <datalist id="existing-style-options">
                {styleOptions.map((styleOption) => (
                  <option key={styleOption.normalizedStyleName} value={styleOption.label} />
                ))}
              </datalist>
            </div>

            <form
              onSubmit={handleStyleCreateSubmit(handleCreateFromStyle)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              {styleCreateFields.map((field) => {
                const commonClassName =
                  "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"

                return (
                  <div
                    key={field.name}
                    className={
                      field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"
                    }
                  >
                    <label htmlFor={`style-create-${field.name}`} className="text-sm font-medium">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={`style-create-${field.name}`}
                        {...registerStyleCreate(field.name as keyof CreatePurchaseOrderPayload, {
                          required: true,
                        })}
                        placeholder={field.placeholder}
                        rows={4}
                        readOnly={field.readOnly}
                        className={`${commonClassName} ${
                          field.readOnly
                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                            : ""
                        }`}
                      />
                    ) : (
                      <input
                        id={`style-create-${field.name}`}
                        type={field.type ?? "text"}
                        {...registerStyleCreate(field.name as keyof CreatePurchaseOrderPayload, {
                          required: true,
                        })}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        className={`${commonClassName} ${
                          field.readOnly
                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                )
              })}

              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    if (styleSourceOrder) {
                      resetStyleCreate(getCreateFromStyleFormValues(styleSourceOrder))
                      return
                    }

                    resetStyleCreate(defaultFormValues)
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setIsCreateFromStyleModalOpen(false)
                    setSelectedStyleName("")
                    setStyleSourceOrder(null)
                    resetStyleCreate(defaultFormValues)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-2xl"
                  disabled={!styleSourceOrder}
                >
                  Create PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
              This action will permanently remove PO{" "}
              <span className="font-medium text-foreground">
                {getOrderDisplayNo(orderPendingDelete)}
              </span>{" "}
              from the list.
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
