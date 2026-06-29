import { Download, Pencil } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  DataTable,
  type DataTableHeaderRow,
} from "@/components/shared/data-table"
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
  getPurchaseOrderDisplayItemNameCode,
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
} from "@/lib/purchase-orders"
import {
  deriveStoreWorkflowStatus,
  getStoredStoreControllerRecords,
  isStoreStageReadOnly,
  saveStoredStoreControllerRecords,
  upsertStoreControllerRecord,
} from "@/lib/store-controller"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import type {
  PurchaseOrder,
  StoreControllerPoRecord,
  StoreInspectionStatus,
  YarnSupplierOrder,
} from "@/types/modules"

type StorePoRow = PurchaseOrder & {
  storeRecord?: StoreControllerPoRecord
  accessoriesSupplierOrder?: YarnSupplierOrder
}

type StorePoFormValues = {
  poNumber: string
  supplier: string
  eta: string
  inspectionStatus: StoreInspectionStatus
  inspectionDate: string
  receivedQty: string
  issuedQty: string
  stockBalance: string
  remarks: string
}

const inspectionStatusOptions: StoreInspectionStatus[] = [
  "Pending",
  "Received",
  "Inspected",
  "Approved",
  "Rejected",
]

const editFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number", readOnly: true },
  { name: "supplier", label: "Supplier" },
  { name: "eta", label: "ETA", type: "date" },
  {
    name: "inspectionStatus",
    label: "Inspection Status",
    type: "select",
    options: inspectionStatusOptions,
  },
  { name: "inspectionDate", label: "Inspection Date", type: "date" },
  { name: "receivedQty", label: "Received Qty", type: "number", placeholder: "12000" },
  { name: "issuedQty", label: "Issued Qty", type: "number", placeholder: "5000" },
  { name: "stockBalance", label: "Stock Balance", type: "number", placeholder: "7000" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Store controller update.",
  },
]

const storePoListHeaderRows: DataTableHeaderRow[] = [
  {
    key: "store-po-list",
    cells: [
      {
        key: "styleName",
        label: "Style Name",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "styleNo",
        label: "Style Number",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "poNumber",
        label: "PO Number",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "quantity",
        label: "Quantity",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "colors",
        label: "Colors",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "itemNameCode",
        label: "Item Name & Code",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "accessories",
        label: "Accessories",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "totalAccessoriesQty",
        label: "Total Accessories Qty",
        className: "bg-slate-100 dark:bg-slate-800/90",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "supplier",
        label: "Supplier",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "eta",
        label: "ETA",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "inspectionStatus",
        label: "Inspection Status",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "inspectionDate",
        label: "Inspection Date",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "receivedQty",
        label: "Received Qty",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "issuedQty",
        label: "Issued Qty",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "stockBalance",
        label: "Stock Balance",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "remarks",
        label: "Remarks",
        className: "bg-emerald-100 dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "action",
        label: "Action",
        className: "bg-cyan-100 dark:bg-cyan-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
    ],
  },
]

function getLatestAccessoriesOrderByPo(
  poId: string,
  supplierOrders: YarnSupplierOrder[]
) {
  return supplierOrders
    .filter(
      (order) =>
        (order.itemCategory ?? "Yarn") === "Accessories" &&
        order.poId === poId &&
        order.status !== "Cancelled"
    )
    .sort((left, right) => {
      const leftDate = left.orderedAt || left.expectedArrival || ""
      const rightDate = right.orderedAt || right.expectedArrival || ""
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]
}

function buildStorePoRows(
  purchaseOrders: PurchaseOrder[],
  supplierOrders: YarnSupplierOrder[],
  records: StoreControllerPoRecord[]
) {
  const accessoryPoIds = new Set(
    supplierOrders
      .filter(
        (order) =>
          (order.itemCategory ?? "Yarn") === "Accessories" &&
          order.status !== "Cancelled"
      )
      .map((order) => order.poId)
  )

  return purchaseOrders
    .filter((order) => accessoryPoIds.has(order.id))
    .map((order) => ({
      ...order,
      storeRecord: records.find((record) => record.poId === order.id),
      accessoriesSupplierOrder: getLatestAccessoriesOrderByPo(order.id, supplierOrders),
    }))
}

function downloadStorePoCsv(rows: StorePoRow[]) {
  const headers = [
    "Style Name",
    "Style Number",
    "PO Number",
    "Quantity",
    "Colors",
    "Item Name & Code",
    "Accessories",
    "Total Accessories Qty",
    "Supplier",
    "ETA",
    "Inspection Status",
    "Inspection Date",
    "Received Qty",
    "Issued Qty",
    "Stock Balance",
    "Remarks",
  ]

  const csv = [
    headers,
    ...rows.map((row) => [
      getPurchaseOrderDisplayStyle(row),
      row.styleNo ?? "",
      getPurchaseOrderDisplayNo(row),
      String(getPurchaseOrderDisplayQty(row)),
      row.color ?? "",
      getPurchaseOrderDisplayItemNameCode(row),
      row.accessories ?? "",
      String(row.totalAccessoriesQty ?? ""),
      row.storeRecord?.supplier || row.accessoriesSupplierOrder?.supplier || "",
      row.storeRecord?.eta || row.accessoriesSupplierOrder?.expectedArrival || "",
      row.storeRecord?.inspectionStatus || "",
      row.storeRecord?.inspectionDate || "",
      String(row.storeRecord?.receivedQty ?? ""),
      String(row.storeRecord?.issuedQty ?? ""),
      String(row.storeRecord?.stockBalance ?? ""),
      row.storeRecord?.remarks ?? "",
    ]),
  ]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "store-controller-po-list.csv"
  link.click()
  window.URL.revokeObjectURL(url)
}

export function StorePoListPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [records, setRecords] = useState<StoreControllerPoRecord[]>(() =>
    getStoredStoreControllerRecords()
  )
  const [searchValue, setSearchValue] = useState("")
  const [activeFilter, setActiveFilter] = useState("All POs")
  const [page, setPage] = useState(1)
  const [editingRow, setEditingRow] = useState<StorePoRow | null>(null)
  const { register, handleSubmit, reset } = useForm<StorePoFormValues>({
    defaultValues: {
      poNumber: "",
      supplier: "",
      eta: "",
      inspectionStatus: "Pending",
      inspectionDate: "",
      receivedQty: "",
      issuedQty: "",
      stockBalance: "",
      remarks: "",
    },
  })

  const rows = useMemo(
    () => buildStorePoRows(purchaseOrders, supplierOrders, records),
    [purchaseOrders, supplierOrders, records]
  )

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return rows.filter((row) => {
      const inspectionStatus = row.storeRecord?.inspectionStatus ?? "Pending"
      const matchesFilter =
        activeFilter === "All POs" || inspectionStatus === activeFilter

      if (!matchesFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        getPurchaseOrderDisplayNo(row),
        getPurchaseOrderDisplayStyle(row),
        row.styleNo,
        row.color,
        row.storeRecord?.supplier,
        row.accessoriesSupplierOrder?.supplier,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [activeFilter, rows, searchValue])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  const openEdit = (row: StorePoRow) => {
    if (isStoreStageReadOnly(row.status)) {
      toast.error("This PO is already moved beyond Store. Store fields are read-only.")
      return
    }

    setEditingRow(row)
    reset({
      poNumber: getPurchaseOrderDisplayNo(row),
      supplier:
        row.storeRecord?.supplier || row.accessoriesSupplierOrder?.supplier || "",
      eta: row.storeRecord?.eta || row.accessoriesSupplierOrder?.expectedArrival || "",
      inspectionStatus: row.storeRecord?.inspectionStatus ?? "Pending",
      inspectionDate: row.storeRecord?.inspectionDate ?? "",
      receivedQty:
        row.storeRecord?.receivedQty !== undefined
          ? String(row.storeRecord.receivedQty)
          : "",
      issuedQty:
        row.storeRecord?.issuedQty !== undefined
          ? String(row.storeRecord.issuedQty)
          : "",
      stockBalance:
        row.storeRecord?.stockBalance !== undefined
          ? String(row.storeRecord.stockBalance)
          : "",
      remarks: row.storeRecord?.remarks ?? "",
    })
  }

  const handleSave = (values: StorePoFormValues) => {
    if (!editingRow) {
      return
    }

    const receivedQty = values.receivedQty ? Number(values.receivedQty) : undefined
    const issuedQty = values.issuedQty ? Number(values.issuedQty) : undefined
    const stockBalance = values.stockBalance
      ? Number(values.stockBalance)
      : receivedQty !== undefined && issuedQty !== undefined
        ? receivedQty - issuedQty
        : undefined

    const nextRecords = upsertStoreControllerRecord({
      poId: editingRow.id,
      supplier: values.supplier.trim(),
      eta: values.eta,
      inspectionStatus: values.inspectionStatus,
      inspectionDate: values.inspectionDate,
      receivedQty,
      issuedQty,
      stockBalance,
      remarks: values.remarks.trim(),
    })

    setRecords(nextRecords)
    saveStoredStoreControllerRecords(nextRecords)
    const nextStatus = deriveStoreWorkflowStatus(editingRow, {
      supplier: values.supplier.trim(),
      eta: values.eta,
      inspectionStatus: values.inspectionStatus,
      inspectionDate: values.inspectionDate,
      receivedQty,
      issuedQty,
      stockBalance,
      remarks: values.remarks.trim(),
    })

    if (nextStatus !== editingRow.status) {
      dispatch(
        updatePoStatus({
          id: editingRow.id,
          status: nextStatus,
          changedBy: "Store Controller",
        })
      )
    }

    setEditingRow(null)
    toast.success(`Store Controller fields updated for ${values.poNumber}.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Controller PO List"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => downloadStorePoCsv(filteredRows)}
          >
            <Download className="mr-1.5 size-4" />
            Export
          </Button>
        }
      />

      <SearchFilterBar
        compact
        filters={["All POs", "Pending", "Received", "Inspected", "Approved", "Rejected"]}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter)
          setPage(1)
        }}
        searchPlaceholder="Search PO, style, style number, color, supplier"
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
      />

      {pagedRows.length === 0 ? (
        <EmptyState
          title="No accessories POs yet"
          description="After Merchandise places an accessories supplier order, the PO will appear here automatically."
        />
      ) : (
        <>
          <DataTable
            compact
            headerRows={storePoListHeaderRows}
            columns={[
              {
                key: "styleName",
                header: "Style Name",
                className: "min-w-[7rem]",
                render: (row) => getPurchaseOrderDisplayStyle(row),
              },
              { key: "styleNo", header: "Style Number", className: "min-w-[6rem]" },
              {
                key: "poNumber",
                header: "PO Number",
                className: "min-w-[6rem]",
                render: (row) => getPurchaseOrderDisplayNo(row),
              },
              {
                key: "quantity",
                header: "Quantity",
                className: "min-w-[5rem]",
                render: (row) => getPurchaseOrderDisplayQty(row).toLocaleString(),
              },
              {
                key: "colors",
                header: "Colors",
                className: "min-w-[5rem]",
                render: (row) => row.color ?? "-",
              },
              {
                key: "itemNameCode",
                header: "Item Name & Code",
                className: "min-w-[7rem]",
                render: (row) => getPurchaseOrderDisplayItemNameCode(row) || "-",
              },
              {
                key: "accessories",
                header: "Accessories",
                className: "min-w-[6rem]",
                render: (row) => row.accessories ?? "-",
              },
              {
                key: "totalAccessoriesQty",
                header: "Total Accessories Qty",
                className: "min-w-[6rem]",
                render: (row) =>
                  row.totalAccessoriesQty !== undefined
                    ? String(row.totalAccessoriesQty)
                    : "-",
              },
              {
                key: "supplier",
                header: "Supplier",
                className: "min-w-[7rem]",
                render: (row) =>
                  row.storeRecord?.supplier ||
                  row.accessoriesSupplierOrder?.supplier ||
                  "-",
              },
              {
                key: "eta",
                header: "ETA",
                className: "min-w-[6rem]",
                render: (row) =>
                  row.storeRecord?.eta ||
                  row.accessoriesSupplierOrder?.expectedArrival ||
                  "-",
              },
              {
                key: "inspectionStatus",
                header: "Inspection Status",
                className: "min-w-[6rem]",
                render: (row) => (
                  <StatusBadge value={row.storeRecord?.inspectionStatus ?? "Pending"} />
                ),
              },
              {
                key: "inspectionDate",
                header: "Inspection Date",
                className: "min-w-[6rem]",
                render: (row) => row.storeRecord?.inspectionDate ?? "-",
              },
              {
                key: "receivedQty",
                header: "Received Qty",
                className: "min-w-[5rem]",
                render: (row) =>
                  row.storeRecord?.receivedQty !== undefined
                    ? String(row.storeRecord.receivedQty)
                    : "-",
              },
              {
                key: "issuedQty",
                header: "Issued Qty",
                className: "min-w-[5rem]",
                render: (row) =>
                  row.storeRecord?.issuedQty !== undefined
                    ? String(row.storeRecord.issuedQty)
                    : "-",
              },
              {
                key: "stockBalance",
                header: "Stock Balance",
                className: "min-w-[5rem]",
                render: (row) =>
                  row.storeRecord?.stockBalance !== undefined
                    ? String(row.storeRecord.stockBalance)
                    : "-",
              },
              {
                key: "remarks",
                header: "Remarks",
                className: "min-w-[6rem]",
                render: (row) => row.storeRecord?.remarks ?? "-",
              },
              {
                key: "action",
                header: "Action",
                className: "min-w-[5.5rem]",
                render: (row) => (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg px-2 text-[11px]"
                      onClick={() => openEdit(row)}
                      disabled={isStoreStageReadOnly(row.status)}
                    >
                      <Pencil className="mr-1 size-3.5" />
                      Edit
                    </Button>
                  </div>
                ),
              },
            ]}
            data={pagedRows}
          />

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm shadow-sm">
            <p className="text-muted-foreground">
              Showing {pagedRows.length} of {filteredRows.length} POs
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <RecordFormModal
        open={Boolean(editingRow)}
        title="Edit Store Controller Fields"
        description="Only Store Controller fields are editable here."
        fields={editFields}
        register={register}
        onClose={() => {
          setEditingRow(null)
          reset()
        }}
        onReset={() => {
          if (editingRow) {
            openEdit(editingRow)
          }
        }}
        onSubmit={handleSubmit(handleSave)}
        submitLabel="Save Changes"
        maxWidthClassName="max-w-4xl"
      />
    </div>
  )
}

