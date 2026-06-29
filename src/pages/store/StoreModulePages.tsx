import { Download, Eye, Pencil, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { FileUploadField } from "@/components/shared/file-upload-field"
import { demoStoreInspectionReports } from "@/mock/demo-data"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  applyStoreInspectionToInventory,
  getStoredAccessoryReceipts,
  getStoredStoreInventoryHistory,
  getStoredStoreInventoryRecords,
  saveStoredStoreInventoryHistory,
  saveStoredStoreInventoryRecords,
} from "@/lib/store-accessories"
import {
  deriveStoreWorkflowStatus,
  getStoredStoreControllerRecords,
  isStoreStageReadOnly,
  saveStoredStoreControllerRecords,
  upsertStoreControllerRecord,
} from "@/lib/store-controller"
import {
  getPurchaseOrderDisplayItemName,
  getPurchaseOrderDisplayItemNameCode,
  getResolvedPurchaseOrderBuyer,
} from "@/lib/purchase-orders"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import type {
  PurchaseOrder,
  StoreAccessoryReceipt,
  StoreInventoryHistoryRecord,
  StoreInventoryRecord,
} from "@/types/modules"

type StoreInspectionReport = {
  id: string
  poId: string
  poNumber: string
  buyer: string
  receiptId?: string
  batchNumber: string
  supplier: string
  quantityVerification: string
  colorMatch: string
  sizeVerification: string
  printingCheck: string
  packagingCheck: string
  result: "Pass" | "Fail"
  inspectionDate: string
  inspector: string
  remarks: string
  reportFileName?: string
  approvedQty: number
  rejectedQty: number
  createdAt: string
}

type StoreInspectionFormValues = Omit<
  StoreInspectionReport,
  "id" | "createdAt" | "reportFileName" | "approvedQty" | "rejectedQty"
> & {
  reportFileName?: string
}

type StoreInventoryFormValues = {
  itemName: string
  itemCode: string
  supplier: string
  lotNo: string
  availableQty: string
  reservedQty: string
  issuedQty: string
  lastUpdated: string
  notes: string
}

const STORE_INSPECTION_STORAGE_KEY = "linkin-store-inspection-reports"

const inventoryFields: ModalFormField[] = [
  { name: "itemName", label: "Item Name" },
  { name: "itemCode", label: "Item Code", placeholder: "ITM-101" },
  { name: "supplier", label: "Supplier" },
  { name: "lotNo", label: "Batch No." },
  {
    name: "availableQty",
    label: "Available Qty",
    type: "number",
    placeholder: "1200",
  },
  {
    name: "reservedQty",
    label: "Reserved Qty",
    type: "number",
    placeholder: "0",
  },
  {
    name: "issuedQty",
    label: "Issued Qty",
    type: "number",
    placeholder: "0",
  },
  { name: "lastUpdated", label: "Last Updated", type: "date" },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Stock adjustment note.",
  },
]

function loadInspectionReports() {
  if (typeof window === "undefined") {
    return demoStoreInspectionReports as StoreInspectionReport[]
  }

  try {
    const raw = window.localStorage.getItem(STORE_INSPECTION_STORAGE_KEY)
    if (!raw) {
      return demoStoreInspectionReports as StoreInspectionReport[]
    }

    const parsed = JSON.parse(raw) as StoreInspectionReport[]
    return parsed.length > 0 ? parsed : (demoStoreInspectionReports as StoreInspectionReport[])
  } catch {
    window.localStorage.removeItem(STORE_INSPECTION_STORAGE_KEY)
    return demoStoreInspectionReports as StoreInspectionReport[]
  }
}

function saveInspectionReports(records: StoreInspectionReport[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    STORE_INSPECTION_STORAGE_KEY,
    JSON.stringify(records)
  )
}

function createInspectionReportId() {
  return `store-inspection-${Date.now()}`
}

function createInventoryRecordId() {
  return `store-inventory-${Date.now()}`
}

function createInventoryHistoryId() {
  return `store-inventory-history-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

function computeCurrentStock(
  record: Pick<StoreInventoryRecord, "availableQty" | "reservedQty" | "issuedQty">
) {
  return Math.max(0, record.availableQty - record.reservedQty - record.issuedQty)
}

function downloadCsv(fileName: string, rows: string[][]) {
  if (typeof window === "undefined") {
    return
  }

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(url)
}

function getInventoryStatus(record: StoreInventoryRecord) {
  return record.currentStock > 0 ? "In Stock" : "Out of Stock"
}

function getInspectionReportCsvRows(reports: StoreInspectionReport[]) {
  return [
    [
      "PO Number",
      "Batch Number",
      "Supplier",
      "Quantity Verification",
      "Color Match",
      "Size Verification",
      "Printing Check",
      "Packaging Check",
      "Result",
      "Inspection Date",
      "Inspector",
      "Approved Qty",
      "Rejected Qty",
      "Inspection Report",
      "Remarks",
    ],
    ...reports.map((report) => [
      report.poNumber,
      report.batchNumber,
      report.supplier,
      report.quantityVerification,
      report.colorMatch,
      report.sizeVerification,
      report.printingCheck,
      report.packagingCheck,
      report.result,
      report.inspectionDate,
      report.inspector,
      String(report.approvedQty),
      String(report.rejectedQty),
      report.reportFileName ?? "",
      report.remarks,
    ]),
  ]
}

function getReceivingReportCsvRows(receipts: StoreAccessoryReceipt[]) {
  return [
    [
      "PO Number",
      "Supplier",
      "Batch Number",
      "Received Qty",
      "Receive Date",
      "Remarks",
      "Created By",
      "Created At",
    ],
    ...receipts.map((receipt) => [
      receipt.poNumber,
      receipt.supplier,
      receipt.batchNumber,
      String(receipt.quantity),
      receipt.receiveDate,
      receipt.remarks ?? "",
      receipt.createdBy,
      receipt.createdAt,
    ]),
  ]
}

function getInventoryCsvRows(records: StoreInventoryRecord[]) {
  return [
    [
      "Item Name",
      "Item Code",
      "Supplier",
      "Batch No.",
      "Available Qty",
      "Reserved Qty",
      "Issued Qty",
      "Current Stock",
      "Last Updated",
      "Source",
    ],
    ...records.map((record) => [
      record.itemName,
      record.itemCode ?? "",
      record.supplier,
      record.lotNo,
      String(record.availableQty),
      String(record.reservedQty),
      String(record.issuedQty),
      String(record.currentStock),
      record.lastUpdated,
      record.source,
    ]),
  ]
}

function getFallbackPurchaseOrder(matchedReceipt: StoreAccessoryReceipt): PurchaseOrder {
  return {
    id: matchedReceipt.poId,
    poNumber: matchedReceipt.poNumber,
    buyer: "",
    style: "",
    design: "",
    quantity: 0,
    status: "Created",
    supplier: matchedReceipt.supplier,
    createdAt: matchedReceipt.createdAt,
    deliveryDate: "",
  }
}

function StockHistoryModal(props: {
  record: StoreInventoryRecord | null
  history: StoreInventoryHistoryRecord[]
  onClose: () => void
}) {
  if (!props.record) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-4xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Stock History</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {props.record.itemName} · {props.record.lotNo}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={props.onClose}
          >
            Close
          </Button>
        </div>

        {props.history.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No stock history for this item yet.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <DataTable
              compact
              columns={[
                { key: "action", header: "Action", className: "min-w-[7rem]" },
                { key: "quantity", header: "Quantity", className: "min-w-[5rem]" },
                {
                  key: "actionDate",
                  header: "Action Date",
                  className: "min-w-[6rem]",
                },
                {
                  key: "notes",
                  header: "Notes",
                  className: "min-w-[8rem]",
                  render: (row) => String(row.notes ?? "—"),
                },
              ]}
              data={props.history}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function StoreInspectionPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const receipts = getStoredAccessoryReceipts()
  const [reports, setReports] = useState<StoreInspectionReport[]>(() =>
    loadInspectionReports()
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Reports")
  const [editingReport, setEditingReport] = useState<StoreInspectionReport | null>(
    null
  )
  const [viewingReport, setViewingReport] = useState<StoreInspectionReport | null>(
    null
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [reportFileName, setReportFileName] = useState("")
  const { register, handleSubmit, reset, setValue, control } =
    useForm<StoreInspectionFormValues>({
      defaultValues: {
        poId: "",
        poNumber: "",
        buyer: "",
        receiptId: "",
        batchNumber: "",
        supplier: "",
        quantityVerification: "",
        colorMatch: "",
        sizeVerification: "",
        printingCheck: "",
        packagingCheck: "",
        result: "Pass",
        inspectionDate: new Date().toISOString().split("T")[0],
        inspector: "",
        remarks: "",
      },
    })

  const poNumberValue = useWatch({
    control,
    name: "poNumber",
  })
  const availableReceipts = useMemo(
    () =>
      receipts.filter((receipt) =>
        poNumberValue
          ? receipt.poNumber.toLowerCase().includes(poNumberValue.toLowerCase())
          : true
      ),
    [poNumberValue, receipts]
  )

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return reports.filter((report) => {
      const matchesFilter =
        activeFilter === "All Reports" ||
        (activeFilter === "Pass" && report.result === "Pass") ||
        (activeFilter === "Fail" && report.result === "Fail")

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        report.poNumber,
        report.buyer,
        report.batchNumber,
        report.supplier,
        report.inspector,
        report.result,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, reports, searchQuery])

  const openCreateForm = () => {
    setEditingReport(null)
    setReportFileName("")
    reset({
      poId: "",
      poNumber: "",
      buyer: "",
      receiptId: "",
      batchNumber: "",
      supplier: "",
      quantityVerification: "",
      colorMatch: "",
      sizeVerification: "",
      printingCheck: "",
      packagingCheck: "",
      result: "Pass",
      inspectionDate: new Date().toISOString().split("T")[0],
      inspector: "",
      remarks: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (report: StoreInspectionReport) => {
    const matchedOrder = purchaseOrders.find((order) => order.id === report.poId)
    if (matchedOrder && isStoreStageReadOnly(matchedOrder.status)) {
      toast.error("This PO is already moved beyond Store. Inspection is read-only.")
      return
    }

    setEditingReport(report)
    setReportFileName(report.reportFileName ?? "")
    reset({
      poId: report.poId,
      poNumber: report.poNumber,
      buyer: report.buyer,
      receiptId: report.receiptId ?? "",
      batchNumber: report.batchNumber,
      supplier: report.supplier,
      quantityVerification: report.quantityVerification,
      colorMatch: report.colorMatch,
      sizeVerification: report.sizeVerification,
      printingCheck: report.printingCheck,
      packagingCheck: report.packagingCheck,
      result: report.result,
      inspectionDate: report.inspectionDate,
      inspector: report.inspector,
      remarks: report.remarks,
    })
    setIsFormOpen(true)
  }

  const onSubmit = (values: StoreInspectionFormValues) => {
    const matchedReceipt = receipts.find(
      (receipt) =>
        (values.receiptId && receipt.id === values.receiptId) ||
        (receipt.poNumber === values.poNumber &&
          receipt.batchNumber === values.batchNumber)
    )

    if (!matchedReceipt) {
      toast.error("Please select a valid receipt batch.")
      return
    }

    const matchedOrder = purchaseOrders.find((order) => order.id === matchedReceipt.poId)
    if (matchedOrder && isStoreStageReadOnly(matchedOrder.status)) {
      toast.error("This PO is already moved beyond Store. Inspection is read-only.")
      return
    }

    const resolvedBuyer = getResolvedPurchaseOrderBuyer(
      matchedOrder ?? null,
      purchaseOrders
    )
    const approvedQty = values.result === "Pass" ? matchedReceipt.quantity : 0
    const rejectedQty = values.result === "Fail" ? matchedReceipt.quantity : 0

    const nextRecord: StoreInspectionReport = editingReport
      ? {
          ...editingReport,
          ...values,
          buyer: resolvedBuyer,
          reportFileName: reportFileName || undefined,
          approvedQty,
          rejectedQty,
        }
      : {
          id: createInspectionReportId(),
          ...values,
          buyer: resolvedBuyer,
          reportFileName: reportFileName || undefined,
          approvedQty,
          rejectedQty,
          createdAt: new Date().toISOString(),
        }

    const nextReports = editingReport
      ? reports.map((report) => (report.id === editingReport.id ? nextRecord : report))
      : [nextRecord, ...reports]

    setReports(nextReports)
    saveInspectionReports(nextReports)

    const orderForMetrics =
      matchedOrder ?? getFallbackPurchaseOrder(matchedReceipt)

    applyStoreInspectionToInventory({
      itemName:
        getPurchaseOrderDisplayItemName(orderForMetrics) ||
        getPurchaseOrderDisplayItemNameCode(orderForMetrics) ||
        "Accessories",
      lotNo: matchedReceipt.batchNumber,
      supplier: matchedReceipt.supplier,
      checkedQty: matchedReceipt.quantity,
      approvedQty,
      rejectedQty,
      actionDate: values.inspectionDate,
      notes: values.remarks,
      poId: matchedReceipt.poId,
      poNumber: matchedReceipt.poNumber,
      previousCheckedQty: editingReport ? matchedReceipt.quantity : 0,
      previousApprovedQty:
        editingReport?.result === "Pass" ? editingReport.approvedQty : 0,
      previousRejectedQty:
        editingReport?.result === "Fail" ? editingReport.rejectedQty : 0,
    })

    const storeRecords = getStoredStoreControllerRecords()
    const existingStoreRecord = storeRecords.find(
      (record) => record.poId === matchedReceipt.poId
    )
    const nextStoreRecords = upsertStoreControllerRecord({
      poId: matchedReceipt.poId,
      supplier: matchedReceipt.supplier,
      eta: existingStoreRecord?.eta,
      inspectionStatus: values.result === "Pass" ? "Approved" : "Rejected",
      inspectionDate: values.inspectionDate,
      receivedQty: existingStoreRecord?.receivedQty,
      issuedQty: existingStoreRecord?.issuedQty,
      stockBalance:
        values.result === "Fail"
          ? Math.max(
              0,
              (existingStoreRecord?.stockBalance ?? 0) -
                nextRejectedQty +
                previousRejectedQty
            )
          : existingStoreRecord?.stockBalance,
      remarks: values.remarks,
    })
    saveStoredStoreControllerRecords(nextStoreRecords)
    const nextStatus = deriveStoreWorkflowStatus(orderForMetrics, {
      poId: matchedReceipt.poId,
      supplier: matchedReceipt.supplier,
      eta: existingStoreRecord?.eta,
      inspectionStatus: values.result === "Pass" ? "Approved" : "Rejected",
      inspectionDate: values.inspectionDate,
      receivedQty: existingStoreRecord?.receivedQty,
      issuedQty: existingStoreRecord?.issuedQty,
      stockBalance:
        values.result === "Fail"
          ? Math.max(
              0,
              (existingStoreRecord?.stockBalance ?? 0) -
                nextRejectedQty +
                previousRejectedQty
            )
          : existingStoreRecord?.stockBalance,
      remarks: values.remarks,
    })

    if (matchedOrder && nextStatus !== matchedOrder.status) {
      dispatch(
        updatePoStatus({
          id: matchedOrder.id,
          status: nextStatus,
          changedBy: "Store Controller",
        })
      )
    }

    dispatch(
      addNotification({
        id: createNotificationId(),
        title:
          values.result === "Pass"
            ? `Accessories approved: ${values.poNumber}`
            : `Accessories rejected: ${values.poNumber}`,
        description:
          values.result === "Pass"
            ? `Batch ${values.batchNumber} passed store inspection and stock is approved.`
            : `Batch ${values.batchNumber} failed store inspection and rejected quantity was recorded.`,
        time: "Just now",
        read: false,
        targetRoles: ["merchandising_user", "management_user", "super_admin"],
      })
    )

    setIsFormOpen(false)
    setEditingReport(null)
    setReportFileName("")
    toast.success(
      editingReport ? "Inspection report updated." : "Inspection report created."
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Inspection"
        actions={
          <Button type="button" className="rounded-2xl" onClick={openCreateForm}>
            New Inspection Report
          </Button>
        }
      />

      <SearchFilterBar
        filters={["All Reports", "Pass", "Fail"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, buyer, batch, supplier, inspector"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          title="No inspection reports yet"
          description="Create a new accessories inspection report to start the inspection log."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "buyer", header: "Buyer", className: "min-w-[5.5rem]" },
            { key: "batchNumber", header: "Batch Number", className: "min-w-[5rem]" },
            { key: "supplier", header: "Supplier", className: "min-w-[6rem]" },
            {
              key: "quantityVerification",
              header: "Quantity Verification",
              className: "min-w-[6rem]",
            },
            { key: "colorMatch", header: "Color Match", className: "min-w-[5rem]" },
            {
              key: "sizeVerification",
              header: "Size Verification",
              className: "min-w-[6rem]",
            },
            {
              key: "printingCheck",
              header: "Printing Check",
              className: "min-w-[5rem]",
            },
            {
              key: "packagingCheck",
              header: "Packaging Check",
              className: "min-w-[6rem]",
            },
            {
              key: "result",
              header: "Pass / Fail",
              className: "min-w-[5rem]",
              render: (row) => <StatusBadge value={String(row.result)} />,
            },
            {
              key: "inspectionDate",
              header: "Inspection Date",
              className: "min-w-[6rem]",
            },
            { key: "inspector", header: "Inspector", className: "min-w-[5rem]" },
            {
              key: "approvedQty",
              header: "Approved Qty",
              className: "min-w-[5rem]",
              render: (row) => String(row.approvedQty),
            },
            {
              key: "rejectedQty",
              header: "Rejected Qty",
              className: "min-w-[5rem]",
              render: (row) => String(row.rejectedQty),
            },
            {
              key: "reportFileName",
              header: "Inspection Report",
              className: "min-w-[6rem]",
              render: (row) => String(row.reportFileName ?? "—"),
            },
            {
              key: "action",
              header: "Action",
              className: "min-w-[5.5rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  {(() => {
                    const report = row as StoreInspectionReport
                    const matchedOrder = purchaseOrders.find(
                      (order) => order.id === report.poId
                    )
                    const isReadOnly = matchedOrder
                      ? isStoreStageReadOnly(matchedOrder.status)
                      : false

                    return (
                      <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setViewingReport(row as StoreInspectionReport)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openEditForm(row as StoreInspectionReport)}
                    disabled={isReadOnly}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                      </>
                    )
                  })()}
                </div>
              ),
            },
          ]}
          data={filteredReports}
        />
      )}

      {isFormOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingReport ? "Edit Inspection Report" : "New Inspection Report"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Capture accessories inspection results using the shared project form pattern.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingReport(null)
                  setReportFileName("")
                }}
              >
                Close
              </Button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <label htmlFor="store-inspection-po-number" className="text-sm font-medium">
                  PO Number
                </label>
                <input
                  id="store-inspection-po-number"
                  {...register("poNumber", { required: true })}
                  readOnly
                  placeholder="Auto-filled from selected batch"
                  className="w-full rounded-2xl border border-input bg-muted px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="store-inspection-buyer" className="text-sm font-medium">
                  Buyer
                </label>
                <input
                  id="store-inspection-buyer"
                  {...register("buyer")}
                  readOnly
                  className="w-full rounded-2xl border border-input bg-muted px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="store-inspection-receipt-id" className="text-sm font-medium">
                  Batch Number
                </label>
                <select
                  id="store-inspection-receipt-id"
                  {...register("receiptId")}
                  disabled={Boolean(editingReport)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring disabled:cursor-not-allowed disabled:bg-muted"
                  onChange={(event) => {
                    const matchedReceipt = receipts.find(
                      (receipt) => receipt.id === event.target.value
                    )
                    setValue("receiptId", event.target.value)
                    if (matchedReceipt) {
                      const linkedOrder =
                        purchaseOrders.find((order) => order.id === matchedReceipt.poId) ?? null
                      setValue("poId", matchedReceipt.poId)
                      setValue("poNumber", matchedReceipt.poNumber)
                      setValue(
                        "buyer",
                        getResolvedPurchaseOrderBuyer(linkedOrder, purchaseOrders)
                      )
                      setValue("batchNumber", matchedReceipt.batchNumber)
                      setValue("supplier", matchedReceipt.supplier)
                    }
                  }}
                  defaultValue={editingReport?.receiptId ?? ""}
                >
                  <option value="">Select batch</option>
                  {availableReceipts.map((receipt) => (
                    <option key={receipt.id} value={receipt.id}>
                      {receipt.batchNumber} ({receipt.poNumber})
                    </option>
                  ))}
                </select>
              </div>

              <input type="hidden" {...register("poId")} />
              <input type="hidden" {...register("batchNumber")} />

              <div className="space-y-2">
                <label htmlFor="store-inspection-supplier" className="text-sm font-medium">
                  Supplier
                </label>
                <input
                  id="store-inspection-supplier"
                  {...register("supplier", { required: true })}
                  readOnly
                  className="w-full rounded-2xl border border-input bg-muted px-4 py-3 text-sm outline-none"
                />
              </div>

              {[
                ["quantityVerification", "Quantity Verification", "Matched"],
                ["colorMatch", "Color Match", "Matched"],
                ["sizeVerification", "Size Verification", "Matched"],
                ["printingCheck", "Printing Check", "Passed"],
                ["packagingCheck", "Packaging Check", "Passed"],
                ["inspector", "Inspector", "Store Inspector"],
              ].map(([name, label, placeholder]) => (
                <div key={name} className="space-y-2">
                  <label htmlFor={name} className="text-sm font-medium">
                    {label}
                  </label>
                  <input
                    id={name}
                    {...register(name as keyof StoreInspectionFormValues, {
                      required: true,
                    })}
                    placeholder={placeholder}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label htmlFor="store-inspection-result" className="text-sm font-medium">
                  Pass / Fail
                </label>
                <select
                  id="store-inspection-result"
                  {...register("result", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="store-inspection-date" className="text-sm font-medium">
                  Inspection Date
                </label>
                <input
                  id="store-inspection-date"
                  type="date"
                  {...register("inspectionDate", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <FileUploadField
                  label="Upload Inspection Report"
                  value={reportFileName}
                  onChange={setReportFileName}
                  onClear={() => setReportFileName("")}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="store-inspection-remarks" className="text-sm font-medium">
                  Remarks
                </label>
                <textarea
                  id="store-inspection-remarks"
                  {...register("remarks", { required: true })}
                  placeholder="Inspection remarks"
                  rows={4}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingReport(null)
                    setReportFileName("")
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  {editingReport ? "Update Report" : "Create Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewingReport ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Inspection Report</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {viewingReport.poNumber} · {viewingReport.batchNumber}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setViewingReport(null)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Supplier", viewingReport.supplier],
                ["Buyer", viewingReport.buyer],
                ["Quantity Verification", viewingReport.quantityVerification],
                ["Color Match", viewingReport.colorMatch],
                ["Size Verification", viewingReport.sizeVerification],
                ["Printing Check", viewingReport.printingCheck],
                ["Packaging Check", viewingReport.packagingCheck],
                ["Result", viewingReport.result],
                ["Inspection Date", viewingReport.inspectionDate],
                ["Inspector", viewingReport.inspector],
                ["Approved Qty", String(viewingReport.approvedQty)],
                ["Rejected Qty", String(viewingReport.rejectedQty)],
                ["Inspection Report", viewingReport.reportFileName ?? "—"],
                ["Remarks", viewingReport.remarks],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={label === "Remarks" ? "space-y-1 md:col-span-2" : "space-y-1"}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function StoreInventoryPage() {
  const [inventoryRecords, setInventoryRecords] = useState<StoreInventoryRecord[]>(() =>
    getStoredStoreInventoryRecords()
  )
  const [inventoryHistory, setInventoryHistory] = useState<
    StoreInventoryHistoryRecord[]
  >(() => getStoredStoreInventoryHistory())
  const [searchValue, setSearchValue] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Stock")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<StoreInventoryRecord | null>(
    null
  )
  const [historyRecord, setHistoryRecord] = useState<StoreInventoryRecord | null>(
    null
  )
  const { register, handleSubmit, reset } = useForm<StoreInventoryFormValues>({
    defaultValues: {
      itemName: "",
      itemCode: "",
      supplier: "",
      lotNo: "",
      availableQty: "",
      reservedQty: "0",
      issuedQty: "0",
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  const filteredInventoryRecords = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return inventoryRecords.filter((record) => {
      const matchesFilter =
        activeFilter === "All Stock" ||
        (activeFilter === "In Stock" && record.currentStock > 0) ||
        (activeFilter === "Out of Stock" && record.currentStock <= 0) ||
        (activeFilter === "Manual" && record.source === "manual") ||
        (activeFilter === "Received" && record.source === "received")

      if (!matchesFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [record.itemName, record.itemCode, record.lotNo, record.supplier, record.poNumber]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [activeFilter, inventoryRecords, searchValue])

  const selectedHistory = useMemo(
    () => inventoryHistory.filter((record) => record.inventoryId === historyRecord?.id),
    [historyRecord, inventoryHistory]
  )

  const openAddStock = () => {
    setEditingRecord(null)
    setModalOpen(true)
    reset({
      itemName: "",
      itemCode: "",
      supplier: "",
      lotNo: "",
      availableQty: "",
      reservedQty: "0",
      issuedQty: "0",
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: "",
    })
  }

  const openEditStock = (record: StoreInventoryRecord) => {
    setEditingRecord(record)
    setModalOpen(true)
    reset({
      itemName: record.itemName,
      itemCode: record.itemCode ?? "",
      supplier: record.supplier,
      lotNo: record.lotNo,
      availableQty: String(record.availableQty),
      reservedQty: String(record.reservedQty),
      issuedQty: String(record.issuedQty),
      lastUpdated: record.lastUpdated,
      notes: "",
    })
  }

  const handleInventorySave = (values: StoreInventoryFormValues) => {
    const itemName = values.itemName.trim()
    const supplier = values.supplier.trim()
    const lotNo = values.lotNo.trim()
    const availableQty = Number(values.availableQty)
    const reservedQty = Number(values.reservedQty || 0)
    const issuedQty = Number(values.issuedQty || 0)

    if (!itemName) {
      toast.error("Item name is required.")
      return
    }

    if (!supplier) {
      toast.error("Supplier is required.")
      return
    }

    if (!lotNo) {
      toast.error("Batch number is required.")
      return
    }

    if (
      [availableQty, reservedQty, issuedQty].some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      toast.error("Stock quantities must be zero or greater.")
      return
    }

    const nextRecord: StoreInventoryRecord = editingRecord
      ? {
          ...editingRecord,
          itemName,
          itemCode: values.itemCode.trim() || undefined,
          supplier,
          lotNo,
          availableQty,
          reservedQty,
          issuedQty,
          currentStock: computeCurrentStock({ availableQty, reservedQty, issuedQty }),
          lastUpdated: values.lastUpdated,
        }
      : {
          id: createInventoryRecordId(),
          itemName,
          itemCode: values.itemCode.trim() || undefined,
          supplier,
          lotNo,
          availableQty,
          reservedQty,
          issuedQty,
          currentStock: computeCurrentStock({ availableQty, reservedQty, issuedQty }),
          lastUpdated: values.lastUpdated,
          source: "manual",
        }

    const nextInventoryRecords = editingRecord
      ? inventoryRecords.map((record) => (record.id === editingRecord.id ? nextRecord : record))
      : [nextRecord, ...inventoryRecords]

    const historyQuantity = editingRecord
      ? Math.abs(availableQty - editingRecord.availableQty)
      : availableQty

    const nextInventoryHistory = [
      {
        id: createInventoryHistoryId(),
        inventoryId: nextRecord.id,
        action: editingRecord ? "Updated Stock" : "Manual Stock Added",
        quantity: historyQuantity,
        actionDate: values.lastUpdated,
        notes: values.notes.trim() || undefined,
      },
      ...inventoryHistory,
    ]

    setInventoryRecords(nextInventoryRecords)
    setInventoryHistory(nextInventoryHistory)
    saveStoredStoreInventoryRecords(nextInventoryRecords)
    saveStoredStoreInventoryHistory(nextInventoryHistory)
    setModalOpen(false)
    setEditingRecord(null)
    reset()
    toast.success(editingRecord ? "Stock updated." : "Stock added.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Inventory"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" className="rounded-2xl" onClick={openAddStock}>
              <Plus className="mr-1.5 size-4" />
              Add Stock
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() =>
                downloadCsv("store-inventory.csv", getInventoryCsvRows(filteredInventoryRecords))
              }
            >
              <Download className="mr-1.5 size-4" />
              Export
            </Button>
          </div>
        }
      />

      <SearchFilterBar
        compact
        filters={["All Stock", "In Stock", "Out of Stock", "Manual", "Received"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search item, code, batch, supplier, PO"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {filteredInventoryRecords.length === 0 ? (
        <EmptyState
          title="No inventory records yet"
          description="Inventory records will appear here automatically after receiving accessories or when you add stock manually."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "itemName", header: "Item Name", className: "min-w-[7rem]" },
            {
              key: "itemCode",
              header: "Item Code",
              className: "min-w-[5.5rem]",
              render: (row) => String(row.itemCode ?? "—"),
            },
            { key: "supplier", header: "Supplier", className: "min-w-[7rem]" },
            { key: "lotNo", header: "Batch No.", className: "min-w-[6rem]" },
            { key: "availableQty", header: "Available Qty", className: "min-w-[5rem]" },
            { key: "reservedQty", header: "Reserved Qty", className: "min-w-[5rem]" },
            { key: "issuedQty", header: "Issued Qty", className: "min-w-[5rem]" },
            { key: "currentStock", header: "Current Stock", className: "min-w-[5rem]" },
            { key: "lastUpdated", header: "Last Updated", className: "min-w-[6rem]" },
            {
              key: "action",
              header: "Action",
              className: "min-w-[7rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setHistoryRecord(row as StoreInventoryRecord)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openEditStock(row as StoreInventoryRecord)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredInventoryRecords}
        />
      )}

      <RecordFormModal
        open={modalOpen}
        title={editingRecord ? "Update Stock" : "Add Stock"}
        description="Maintain store inventory using the existing modal workflow."
        fields={inventoryFields}
        register={register}
        onClose={() => {
          setModalOpen(false)
          setEditingRecord(null)
          reset()
        }}
        onReset={() => {
          if (editingRecord) {
            openEditStock(editingRecord)
          } else {
            openAddStock()
          }
        }}
        onSubmit={handleSubmit(handleInventorySave)}
        submitLabel={editingRecord ? "Update Stock" : "Add Stock"}
        maxWidthClassName="max-w-4xl"
      />

      <StockHistoryModal
        record={historyRecord}
        history={selectedHistory}
        onClose={() => setHistoryRecord(null)}
      />
    </div>
  )
}

export function StoreReportsPage() {
  const inspectionReports = loadInspectionReports()
  const receiptHistory = getStoredAccessoryReceipts()
  const inventoryRecords = getStoredStoreInventoryRecords()
  const totalReceivedQty = receiptHistory.reduce(
    (sum, receipt) => sum + receipt.quantity,
    0
  )
  const totalRejectedQty = inspectionReports.reduce(
    (sum, report) => sum + report.rejectedQty,
    0
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Store Reports" />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Inspection Reports</p>
          <p className="mt-1 text-2xl font-bold">{inspectionReports.length}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Receiving Records</p>
          <p className="mt-1 text-2xl font-bold">{receiptHistory.length}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Received Qty</p>
          <p className="mt-1 text-2xl font-bold">{totalReceivedQty}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Rejected Qty</p>
          <p className="mt-1 text-2xl font-bold">{totalRejectedQty}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/store/reports/accessories-inspection"
          className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <p className="font-semibold">Accessories Inspection Report</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Review pass/fail inspection history with export support.
          </p>
        </Link>
        <Link
          to="/store/reports/accessories-receiving"
          className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <p className="font-semibold">Accessories Receiving Report</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Review receiving batches, dates, and suppliers with export support.
          </p>
        </Link>
      </section>

      {inventoryRecords.length === 0 ? (
        <EmptyState
          title="No store report data yet"
          description="Store reporting will populate automatically after accessories receiving starts."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "itemName", header: "Item Name", className: "min-w-[7rem]" },
            {
              key: "itemCode",
              header: "Item Code",
              className: "min-w-[5.5rem]",
              render: (row) => String(row.itemCode ?? "—"),
            },
            { key: "supplier", header: "Supplier", className: "min-w-[7rem]" },
            { key: "lotNo", header: "Batch No.", className: "min-w-[6rem]" },
            { key: "currentStock", header: "Current Stock", className: "min-w-[5rem]" },
            {
              key: "status",
              header: "Status",
              className: "min-w-[6rem]",
              render: (row: StoreInventoryRecord) => (
                <StatusBadge value={getInventoryStatus(row)} />
              ),
            },
          ]}
          data={inventoryRecords}
        />
      )}
    </div>
  )
}

export function StoreAccessoriesInspectionReportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Reports")
  const reports = useMemo(() => loadInspectionReports(), [])

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return reports.filter((report) => {
      const matchesFilter =
        activeFilter === "All Reports" || report.result === activeFilter

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        report.poNumber,
        report.batchNumber,
        report.supplier,
        report.inspector,
        report.result,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, reports, searchQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accessories Inspection Report"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() =>
              downloadCsv(
                "store-accessories-inspection-report.csv",
                getInspectionReportCsvRows(filteredReports)
              )
            }
          >
            <Download className="mr-1.5 size-4" />
            Export
          </Button>
        }
      />

      <SearchFilterBar
        compact
        filters={["All Reports", "Pass", "Fail"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, batch, supplier, inspector"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          title="No accessories inspection reports yet"
          description="Inspection reports will appear here automatically."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "batchNumber", header: "Batch Number", className: "min-w-[5rem]" },
            { key: "supplier", header: "Supplier", className: "min-w-[6rem]" },
            {
              key: "quantityVerification",
              header: "Qty Verification",
              className: "min-w-[6rem]",
            },
            { key: "colorMatch", header: "Color Match", className: "min-w-[5rem]" },
            {
              key: "sizeVerification",
              header: "Size Verification",
              className: "min-w-[6rem]",
            },
            {
              key: "result",
              header: "Result",
              className: "min-w-[5rem]",
              render: (row) => <StatusBadge value={String(row.result)} />,
            },
            {
              key: "inspectionDate",
              header: "Inspection Date",
              className: "min-w-[6rem]",
            },
            { key: "inspector", header: "Inspector", className: "min-w-[5rem]" },
            { key: "approvedQty", header: "Approved Qty", className: "min-w-[5rem]" },
            { key: "rejectedQty", header: "Rejected Qty", className: "min-w-[5rem]" },
          ]}
          data={filteredReports}
        />
      )}
    </div>
  )
}

export function StoreAccessoriesReceivingReportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Receipts")
  const receipts = useMemo(() => getStoredAccessoryReceipts(), [])

  const filteredReceipts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return receipts.filter((receipt) => {
      const matchesFilter =
        activeFilter === "All Receipts" ||
        (activeFilter === "With Remarks" && Boolean(receipt.remarks)) ||
        (activeFilter === "No Remarks" && !receipt.remarks)

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [receipt.poNumber, receipt.supplier, receipt.batchNumber, receipt.createdBy]
        .some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch))
    })
  }, [activeFilter, receipts, searchQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accessories Receiving Report"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() =>
              downloadCsv(
                "store-accessories-receiving-report.csv",
                getReceivingReportCsvRows(filteredReceipts)
              )
            }
          >
            <Download className="mr-1.5 size-4" />
            Export
          </Button>
        }
      />

      <SearchFilterBar
        compact
        filters={["All Receipts", "With Remarks", "No Remarks"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, batch, supplier, receiver"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredReceipts.length === 0 ? (
        <EmptyState
          title="No accessories receiving reports yet"
          description="Receiving records will appear here automatically."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "supplier", header: "Supplier", className: "min-w-[6rem]" },
            { key: "batchNumber", header: "Batch Number", className: "min-w-[5.5rem]" },
            { key: "quantity", header: "Received Qty", className: "min-w-[5rem]" },
            { key: "receiveDate", header: "Receive Date", className: "min-w-[6rem]" },
            {
              key: "remarks",
              header: "Remarks",
              className: "min-w-[7rem]",
              render: (row) => String(row.remarks ?? "—"),
            },
            { key: "createdBy", header: "Created By", className: "min-w-[6rem]" },
          ]}
          data={filteredReceipts}
        />
      )}
    </div>
  )
}
