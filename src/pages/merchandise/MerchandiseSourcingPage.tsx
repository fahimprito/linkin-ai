import { Eye, Pencil, Plus, XCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
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
  getPurchaseOrderDisplayStyle,
  getPurchaseOrderDisplayYarn,
} from "@/lib/purchase-orders"
import { getStoredSuppliers } from "@/lib/suppliers"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import {
  addSupplierOrder,
  updateSupplierOrder,
} from "@/store/slices/yarn-check-slice"
import type {
  MerchandiseSupplier,
  PurchaseOrder,
  SupplierOrderItemCategory,
  YarnSupplierOrder,
} from "@/types/modules"

type CreateSourcingOrderFormValues = {
  poId: string
  poNumber: string
  styleName: string
  styleNo: string
  qualityOrItem: string
  orderedQty: string
  supplierCode: string
  supplier: string
  supplierContactPerson: string
  supplierPhone: string
  supplierEmail: string
  supplierAddress: string
  supplierLeadTimeDays: string
  unitPrice: string
  orderDate: string
  expectedArrival: string
  remarks: string
}

type EditExpectedDeliveryFormValues = {
  orderNo: string
  poNumber: string
  supplier: string
  expectedArrival: string
  remarks: string
}

type ViewOrderFormValues = {
  orderNo: string
  poNumber: string
  styleName: string
  orderType: string
  supplier: string
  orderedQty: string
  orderDate: string
  expectedArrival: string
  status: string
  remarks: string
}

function hasSubmittedConsumption(order: PurchaseOrder) {
  return (
    order.totalYarnKg !== undefined ||
    order.totalFabricKg !== undefined ||
    order.totalAccessoriesQty !== undefined
  )
}

function createSupplierOrderId() {
  return `sso-${Date.now()}`
}

function createSupplierOrderNo(orderType: SupplierOrderItemCategory) {
  const prefix = orderType === "Yarn" ? "YSO" : "ASO"
  return `${prefix}-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

function getSupplierOrderCategory(order: YarnSupplierOrder): SupplierOrderItemCategory {
  return order.itemCategory ?? "Yarn"
}

function getSupplierOrderStyleName(order: YarnSupplierOrder) {
  return order.styleName || "-"
}

function getSupplierOrderOrderNo(order: YarnSupplierOrder) {
  return order.orderNo || order.id.toUpperCase()
}

function getOrderTypeItemLabel(orderType: SupplierOrderItemCategory) {
  return orderType === "Yarn" ? "Quality" : "Accessories Qty"
}

function getOrderTypeItemValue(
  orderType: SupplierOrderItemCategory,
  order: PurchaseOrder | null
) {
  if (!order) {
    return ""
  }

  if (orderType === "Yarn") {
    return getPurchaseOrderDisplayYarn(order)
  }

  return String(order.totalAccessoriesQty ?? "")
}

function getOrderTypeQtyValue(
  orderType: SupplierOrderItemCategory,
  order: PurchaseOrder | null
) {
  if (!order) {
    return ""
  }

  if (orderType === "Yarn") {
    return String(order.totalYarnKg ?? order.requiredYarnQty ?? "")
  }

  return String(order.totalAccessoriesQty ?? "")
}

function getSourceablePurchaseOrders(purchaseOrders: PurchaseOrder[]) {
  return purchaseOrders.filter(
    (order) =>
      hasSubmittedConsumption(order) &&
      [
        "Design Completed",
        "Sent to Yarn",
        "Yarn Processing",
        "Yarn Ready",
      ].includes(order.status)
  )
}

function buildCreateOrderFields(
  createOrderType: SupplierOrderItemCategory | null,
  poOptions: Array<{ label: string; value: string }>,
  supplierOptions: Array<{ label: string; value: string }>
): ModalFormField[] {
  if (!createOrderType) {
    return []
  }

  return [
    {
      name: "poId",
      label: "PO Number",
      type: "select",
      options: poOptions,
    },
    {
      name: "poNumber",
      label: "PO Number (Auto)",
      readOnly: true,
    },
    {
      name: "styleName",
      label: "Style Name",
      readOnly: true,
    },
    {
      name: "styleNo",
      label: "Style Number",
      readOnly: true,
    },
    {
      name: "qualityOrItem",
      label: getOrderTypeItemLabel(createOrderType),
      readOnly: true,
    },
    {
      name: "orderedQty",
      label: createOrderType === "Yarn" ? "Total Yarn (kg)" : "Total Accessories Qty",
      readOnly: true,
    },
    {
      name: "supplierCode",
      label: "Supplier",
      type: "select",
      options: supplierOptions,
    },
    {
      name: "supplier",
      label: "Supplier Name",
      readOnly: true,
    },
    {
      name: "supplierContactPerson",
      label: "Contact Person",
      readOnly: true,
    },
    {
      name: "supplierPhone",
      label: "Phone",
      readOnly: true,
    },
    {
      name: "supplierLeadTimeDays",
      label: "Lead Time (Days)",
      readOnly: true,
    },
    {
      name: "unitPrice",
      label: "Unit Price",
      type: "number",
      placeholder: createOrderType === "Yarn" ? "5.25" : "0.18",
    },
    {
      name: "orderDate",
      label: "Order Date",
      type: "date",
    },
    {
      name: "expectedArrival",
      label: "Expected Delivery Date",
      type: "date",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      placeholder: "Supplier follow-up note",
    },
  ]
}

const editExpectedDeliveryFields: ModalFormField[] = [
  { name: "orderNo", label: "Order No.", readOnly: true },
  { name: "poNumber", label: "PO Number", readOnly: true },
  { name: "supplier", label: "Supplier", readOnly: true },
  {
    name: "expectedArrival",
    label: "Expected Delivery Date",
    type: "date",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Updated delivery note",
  },
]

const viewOrderFields: ModalFormField[] = [
  { name: "orderNo", label: "Order No.", readOnly: true },
  { name: "poNumber", label: "PO Number", readOnly: true },
  { name: "styleName", label: "Style Name", readOnly: true },
  { name: "orderType", label: "Order Type", readOnly: true },
  { name: "supplier", label: "Supplier", readOnly: true },
  { name: "orderedQty", label: "Ordered Qty", readOnly: true },
  { name: "orderDate", label: "Order Date", readOnly: true },
  { name: "expectedArrival", label: "Expected Delivery", readOnly: true },
  { name: "status", label: "Status", readOnly: true },
  { name: "remarks", label: "Remarks", type: "textarea", readOnly: true },
]

export function MerchandiseSourcingPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [activeFilter, setActiveFilter] = useState("All Orders")
  const [searchValue, setSearchValue] = useState("")
  const [createOrderType, setCreateOrderType] =
    useState<SupplierOrderItemCategory | null>(null)
  const [editingOrder, setEditingOrder] = useState<YarnSupplierOrder | null>(null)
  const [viewingOrder, setViewingOrder] = useState<YarnSupplierOrder | null>(null)
  const [suppliers] = useState<MerchandiseSupplier[]>(() => getStoredSuppliers())

  const sourceablePurchaseOrders = useMemo(
    () => getSourceablePurchaseOrders(purchaseOrders),
    [purchaseOrders]
  )

  const poOptions = useMemo(
    () =>
      sourceablePurchaseOrders.map((po) => ({
        value: po.id,
        label: `${getPurchaseOrderDisplayNo(po)} - ${getPurchaseOrderDisplayStyle(po)}`,
      })),
    [sourceablePurchaseOrders]
  )

  const supplierOptions = useMemo(
    () =>
      suppliers
        .filter(
          (supplier) =>
            supplier.status === "Active" &&
            (supplier.supplierType === "Both" ||
              supplier.supplierType === createOrderType)
        )
        .map((supplier) => ({
          value: supplier.supplierCode,
          label: `${supplier.supplierName} (${supplier.supplierCode})`,
        })),
    [createOrderType, suppliers]
  )

  const createFields = useMemo(
    () => buildCreateOrderFields(createOrderType, poOptions, supplierOptions),
    [createOrderType, poOptions, supplierOptions]
  )

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    control: createControl,
    setValue: setCreateValue,
  } = useForm<CreateSourcingOrderFormValues>({
    defaultValues: {
      poId: "",
      poNumber: "",
      styleName: "",
      styleNo: "",
      qualityOrItem: "",
      orderedQty: "",
      supplierCode: "",
      supplier: "",
      supplierContactPerson: "",
      supplierPhone: "",
      supplierEmail: "",
      supplierAddress: "",
      supplierLeadTimeDays: "",
      unitPrice: "",
      orderDate: "",
      expectedArrival: "",
      remarks: "",
    },
  })

  const selectedCreatePoId = useWatch({
    control: createControl,
    name: "poId",
  })
  const selectedSupplierCode = useWatch({
    control: createControl,
    name: "supplierCode",
  })

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<EditExpectedDeliveryFormValues>({
    defaultValues: {
      orderNo: "",
      poNumber: "",
      supplier: "",
      expectedArrival: "",
      remarks: "",
    },
  })

  const {
    register: registerView,
    handleSubmit: handleViewSubmit,
    reset: resetView,
  } = useForm<ViewOrderFormValues>({
    defaultValues: {
      orderNo: "",
      poNumber: "",
      styleName: "",
      orderType: "",
      supplier: "",
      orderedQty: "",
      orderDate: "",
      expectedArrival: "",
      status: "",
      remarks: "",
    },
  })

  useEffect(() => {
    if (!createOrderType || !selectedCreatePoId) {
      return
    }

    const selectedPo =
      sourceablePurchaseOrders.find((po) => po.id === selectedCreatePoId) ?? null

    setCreateValue("poNumber", selectedPo?.poNumber ?? "")
    setCreateValue(
      "styleName",
      selectedPo ? getPurchaseOrderDisplayStyle(selectedPo) : ""
    )
    setCreateValue("styleNo", selectedPo?.styleNo ?? "")
    setCreateValue(
      "qualityOrItem",
      getOrderTypeItemValue(createOrderType, selectedPo)
    )
    setCreateValue(
      "orderedQty",
      getOrderTypeQtyValue(createOrderType, selectedPo)
    )
  }, [
    createOrderType,
    selectedCreatePoId,
    setCreateValue,
    sourceablePurchaseOrders,
  ])

  useEffect(() => {
    const selectedSupplier =
      suppliers.find((supplier) => supplier.supplierCode === selectedSupplierCode) ??
      null

    setCreateValue("supplier", selectedSupplier?.supplierName ?? "")
    setCreateValue(
      "supplierContactPerson",
      selectedSupplier?.contactPerson ?? ""
    )
    setCreateValue("supplierPhone", selectedSupplier?.phone ?? "")
    setCreateValue("supplierEmail", selectedSupplier?.email ?? "")
    setCreateValue("supplierAddress", selectedSupplier?.address ?? "")
    setCreateValue(
      "supplierLeadTimeDays",
      selectedSupplier?.leadTimeDays !== undefined
        ? String(selectedSupplier.leadTimeDays)
        : ""
    )
  }, [selectedSupplierCode, setCreateValue, suppliers])

  const filteredOrders = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return supplierOrders.filter((order) => {
      const matchesFilter =
        activeFilter === "All Orders" ||
        getSupplierOrderCategory(order) === activeFilter

      if (!matchesFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        getSupplierOrderOrderNo(order),
        order.poNumber,
        getSupplierOrderStyleName(order),
        order.supplier,
        order.itemName ?? order.yarnType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [activeFilter, searchValue, supplierOrders])

  const openCreateModal = (orderType: SupplierOrderItemCategory) => {
    setCreateOrderType(orderType)
    resetCreate({
      poId: "",
      poNumber: "",
      styleName: "",
      styleNo: "",
      qualityOrItem: "",
      orderedQty: "",
      supplierCode: "",
      supplier: "",
      supplierContactPerson: "",
      supplierPhone: "",
      supplierEmail: "",
      supplierAddress: "",
      supplierLeadTimeDays: "",
      unitPrice: "",
      orderDate: new Date().toISOString().slice(0, 10),
      expectedArrival: "",
      remarks: "",
    })
  }

  const openEditModal = (order: YarnSupplierOrder) => {
    setEditingOrder(order)
    resetEdit({
      orderNo: getSupplierOrderOrderNo(order),
      poNumber: order.poNumber,
      supplier: order.supplier,
      expectedArrival: order.expectedArrival,
      remarks: order.remarks ?? "",
    })
  }

  const openViewModal = (order: YarnSupplierOrder) => {
    setViewingOrder(order)
    resetView({
      orderNo: getSupplierOrderOrderNo(order),
      poNumber: order.poNumber,
      styleName: getSupplierOrderStyleName(order),
      orderType: getSupplierOrderCategory(order),
      supplier: order.supplier,
      orderedQty: String(order.orderedQty),
      orderDate: new Date(order.orderedAt).toLocaleDateString(),
      expectedArrival: order.expectedArrival,
      status: order.status,
      remarks: order.remarks ?? "-",
    })
  }

  const handleCreateOrder = (values: CreateSourcingOrderFormValues) => {
    if (!createOrderType) {
      return
    }

    const selectedPo =
      sourceablePurchaseOrders.find((po) => po.id === values.poId) ?? null
    const selectedSupplier =
      suppliers.find((supplier) => supplier.supplierCode === values.supplierCode) ??
      null

    if (!selectedPo) {
      toast.error("Please select a PO.")
      return
    }

    if (!selectedSupplier) {
      toast.error("Please select a supplier.")
      return
    }

    const orderedQty = Number(values.orderedQty)
    const unitPrice = Number(values.unitPrice)

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      toast.error("Please enter a valid unit price.")
      return
    }

    dispatch(
      addSupplierOrder({
        id: createSupplierOrderId(),
        orderNo: createSupplierOrderNo(createOrderType),
        yarnCheckRequestId: selectedPo.yarnCheckRequestId ?? "",
        poId: selectedPo.id,
        poNumber: selectedPo.poNumber,
        styleName: getPurchaseOrderDisplayStyle(selectedPo),
        styleNo: selectedPo.styleNo,
        supplierCode: selectedSupplier.supplierCode,
        supplierContactPerson: selectedSupplier.contactPerson,
        supplierPhone: selectedSupplier.phone,
        supplierEmail: selectedSupplier.email,
        supplierAddress: selectedSupplier.address,
        supplierLeadTimeDays: selectedSupplier.leadTimeDays,
        supplier: selectedSupplier.supplierName,
        yarnType:
          createOrderType === "Yarn"
            ? getPurchaseOrderDisplayYarn(selectedPo)
            : "Accessories",
        itemName: values.qualityOrItem.trim(),
        itemCategory: createOrderType,
        color: selectedPo.color ?? "",
        orderedQty,
        unitPrice,
        expectedArrival: values.expectedArrival,
        orderedAt: new Date(values.orderDate).toISOString(),
        remarks: values.remarks.trim(),
        status: "Ordered",
      })
    )

    if (createOrderType === "Yarn") {
      dispatch(
        updatePoStatus({
          id: selectedPo.id,
          status: "Sent to Yarn",
          changedBy: "Merchandiser",
        })
      )
      dispatch(
        addNotification({
          id: createNotificationId(),
          title: `Yarn order placed: ${selectedPo.poNumber}`,
          description: `${selectedSupplier.supplierName} has been assigned for yarn sourcing. Yarn Controller can continue the receiving workflow.`,
          time: "Just now",
          read: false,
          targetRoles: ["yarn_user", "management_user", "super_admin"],
        })
      )
    } else {
      dispatch(
        addNotification({
          id: createNotificationId(),
          title: `Accessories order placed: ${selectedPo.poNumber}`,
          description: `${selectedSupplier.supplierName} has been assigned for accessories sourcing. Store Controller can continue the receiving workflow.`,
          time: "Just now",
          read: false,
          targetRoles: ["store_user", "management_user", "super_admin"],
        })
      )
    }

    toast.success(
      `${createOrderType} order placed for ${selectedPo.poNumber}.`
    )
    setCreateOrderType(null)
  }

  const handleEditExpectedDelivery = (
    values: EditExpectedDeliveryFormValues
  ) => {
    if (!editingOrder) {
      return
    }

    dispatch(
      updateSupplierOrder({
        id: editingOrder.id,
        updates: {
          expectedArrival: values.expectedArrival,
          remarks: values.remarks.trim(),
        },
      })
    )
    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `ETA updated: ${editingOrder.poNumber}`,
        description: `${editingOrder.supplier} expected delivery is now ${values.expectedArrival}.`,
        time: "Just now",
        read: false,
        targetRoles:
          getSupplierOrderCategory(editingOrder) === "Yarn"
            ? ["yarn_user", "management_user", "super_admin"]
            : ["store_user", "management_user", "super_admin"],
      })
    )

    toast.success(`Expected delivery updated for ${editingOrder.poNumber}.`)
    setEditingOrder(null)
  }

  const handleCancelOrder = (order: YarnSupplierOrder) => {
    if (order.status === "Fully Received" || order.status === "Cancelled") {
      return
    }

    dispatch(
      updateSupplierOrder({
        id: order.id,
        updates: {
          status: "Cancelled",
        },
      })
    )
    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `Order cancelled: ${order.poNumber}`,
        description: `${getSupplierOrderCategory(order)} supplier order ${getSupplierOrderOrderNo(order)} has been cancelled.`,
        time: "Just now",
        read: false,
        targetRoles:
          getSupplierOrderCategory(order) === "Yarn"
            ? ["yarn_user", "management_user", "super_admin"]
            : ["store_user", "management_user", "super_admin"],
      })
    )

    toast.success(`Order ${getSupplierOrderOrderNo(order)} cancelled.`)
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
              Place New Yarn Order
            </Button>
            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => openCreateModal("Accessories")}
            >
              <Plus className="mr-1.5 size-4" />
              Place New Accessories Order
            </Button>
          </>
        }
      />

      <SearchFilterBar
        compact
        filters={["All Orders", "Yarn", "Accessories"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search order no, PO, style, supplier"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No sourcing orders yet"
          description="Place a yarn or accessories order after Design submits material calculation."
        />
      ) : (
        <DataTable
          compact
          columns={[
            {
              key: "orderNo",
              header: "Order No.",
              className: "min-w-[6.5rem]",
              render: (row) => getSupplierOrderOrderNo(row),
            },
            {
              key: "poNumber",
              header: "PO Number",
              className: "min-w-[6rem]",
            },
            {
              key: "styleName",
              header: "Style Name",
              className: "min-w-[8rem]",
              render: (row) => getSupplierOrderStyleName(row),
            },
            {
              key: "itemCategory",
              header: "Order Type",
              className: "min-w-[6rem]",
              render: (row) => getSupplierOrderCategory(row),
            },
            {
              key: "supplier",
              header: "Supplier",
              className: "min-w-[7rem]",
            },
            {
              key: "orderedQty",
              header: "Ordered Qty",
              className: "min-w-[6rem]",
              render: (row) => Number(row.orderedQty).toLocaleString(),
            },
            {
              key: "orderedAt",
              header: "Order Date",
              className: "min-w-[6rem]",
              render: (row) =>
                new Date(row.orderedAt).toLocaleDateString(),
            },
            {
              key: "expectedArrival",
              header: "Expected Delivery",
              className: "min-w-[7rem]",
            },
            {
              key: "status",
              header: "Status",
              className: "min-w-[6rem]",
              render: (row) => <StatusBadge value={row.status} />,
            },
            {
              key: "actions",
              header: "Action",
              className: "min-w-[13rem]",
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg px-2 text-[11px]"
                    onClick={() => openViewModal(row)}
                  >
                    <Eye className="mr-1 size-3.5" />
                    View
                  </Button>
                  {row.status !== "Cancelled" &&
                  row.status !== "Fully Received" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg px-2 text-[11px]"
                      onClick={() => openEditModal(row)}
                    >
                      <Pencil className="mr-1 size-3.5" />
                      Edit ETA
                    </Button>
                  ) : null}
                  {row.status !== "Cancelled" &&
                  row.status !== "Fully Received" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg border-rose-200 bg-rose-50 px-2 text-[11px] text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15"
                      onClick={() => handleCancelOrder(row)}
                    >
                      <XCircle className="mr-1 size-3.5" />
                      Cancel
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          data={filteredOrders}
        />
      )}

      <RecordFormModal
        open={Boolean(createOrderType)}
        title={
          createOrderType === "Yarn"
            ? "Place New Yarn Order"
            : "Place New Accessories Order"
        }
        description="Create a sourcing order from a Design-submitted PO using the existing workflow."
        fields={createFields}
        register={registerCreate}
        onClose={() => {
          setCreateOrderType(null)
          resetCreate()
        }}
        onReset={() =>
          resetCreate({
            poId: "",
            poNumber: "",
            styleName: "",
            styleNo: "",
            qualityOrItem: "",
            orderedQty: "",
            supplierCode: "",
            supplier: "",
            supplierContactPerson: "",
            supplierPhone: "",
            supplierEmail: "",
            supplierAddress: "",
            supplierLeadTimeDays: "",
            unitPrice: "",
            orderDate: new Date().toISOString().slice(0, 10),
            expectedArrival: "",
            remarks: "",
          })
        }
        onSubmit={handleCreateSubmit(handleCreateOrder)}
        submitLabel="Save Order"
        maxWidthClassName="max-w-4xl"
      />

      <RecordFormModal
        open={Boolean(editingOrder)}
        title="Edit Expected Delivery"
        description="Update the supplier ETA for this sourcing order."
        fields={editExpectedDeliveryFields}
        register={registerEdit}
        onClose={() => {
          setEditingOrder(null)
          resetEdit()
        }}
        onReset={() => {
          if (!editingOrder) {
            return
          }

          resetEdit({
            orderNo: getSupplierOrderOrderNo(editingOrder),
            poNumber: editingOrder.poNumber,
            supplier: editingOrder.supplier,
            expectedArrival: editingOrder.expectedArrival,
            remarks: editingOrder.remarks ?? "",
          })
        }}
        onSubmit={handleEditSubmit(handleEditExpectedDelivery)}
        submitLabel="Save Changes"
        maxWidthClassName="max-w-3xl"
      />

      <RecordFormModal
        open={Boolean(viewingOrder)}
        title="Supplier Order Details"
        description="View the sourcing order details."
        fields={viewOrderFields}
        register={registerView}
        onClose={() => {
          setViewingOrder(null)
          resetView()
        }}
        onReset={() => {
          if (!viewingOrder) {
            return
          }

          openViewModal(viewingOrder)
        }}
        onSubmit={handleViewSubmit(() => {
          setViewingOrder(null)
        })}
        submitLabel="Close"
        maxWidthClassName="max-w-4xl"
      />
    </div>
  )
}


