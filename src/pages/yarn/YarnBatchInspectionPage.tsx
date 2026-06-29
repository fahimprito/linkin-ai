import { Download, Eye, Pencil } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { FileUploadField } from "@/components/shared/file-upload-field"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { applyInspectionToInventory } from "@/lib/yarn-inventory"
import {
  getPurchaseOrderDisplayStyle,
  getPurchaseOrderDisplayYarn,
  getResolvedPurchaseOrderBuyer,
} from "@/lib/purchase-orders"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { addNotification } from "@/store/slices/notification-slice"
import { updateBatchInspectionStatus } from "@/store/slices/yarn-check-slice"

type ChecklistValue = "Pass" | "Fail"
type FinalResult = "Accept" | "Reject"

type YarnInspectionReport = {
  id: string
  poId: string
  poNumber: string
  styleNo: string
  buyer: string
  batchId?: string
  batchNumber: string
  supplier: string
  color: string
  yarnCount: string
  receivedQty: number
  checkedQty: number
  strength: ChecklistValue
  elasticityCheck: ChecklistValue
  cleanliness: ChecklistValue
  shadeMatch: ChecklistValue
  moistureCheck: ChecklistValue
  quantityVerificationCheck: ChecklistValue
  criticalWindingProblem: number
  majorWindingProblem: number
  minorWindingProblem: number
  criticalCrossedYarn: number
  majorCrossedYarn: number
  minorCrossedYarn: number
  criticalUnevenDyeing: number
  majorUnevenDyeing: number
  minorUnevenDyeing: number
  criticalDustMarks: number
  majorDustMarks: number
  minorDustMarks: number
  criticalSpotYarn: number
  majorSpotYarn: number
  minorSpotYarn: number
  criticalForeignYarn: number
  majorForeignYarn: number
  minorForeignYarn: number
  criticalKnot: number
  majorKnot: number
  minorKnot: number
  criticalThickThin: number
  majorThickThin: number
  minorThickThin: number
  overallObservation: string
  reservationComments: string
  finalResult: FinalResult
  inspector: string
  inspectionDate: string
  testReportName?: string
  createdAt: string
}

type InspectionFormValues = Omit<YarnInspectionReport, "id" | "createdAt" | "testReportName"> & {
  testReportName?: string
}

const INSPECTION_STORAGE_KEY = "linkin-yarn-inspection-reports"

const defectRows = [
  { key: "WindingProblem", label: "Winding Problem" },
  { key: "CrossedYarn", label: "Crossed Yarn" },
  { key: "UnevenDyeing", label: "Uneven Dyeing" },
  { key: "DustMarks", label: "Dust Marks" },
  { key: "SpotYarn", label: "Spot Yarn" },
  { key: "ForeignYarn", label: "Foreign Yarn" },
  { key: "Knot", label: "Knot" },
  { key: "ThickThin", label: "Thick & Thin" },
] as const

function createInspectionReportId() {
  return `inspection-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

function normalizeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function buildDefaultValues(): InspectionFormValues {
  return {
    poId: "",
    poNumber: "",
    styleNo: "",
    buyer: "",
    batchId: "",
    batchNumber: "",
    supplier: "",
    color: "",
    yarnCount: "",
    receivedQty: 0,
    checkedQty: 0,
    strength: "Pass",
    elasticityCheck: "Pass",
    cleanliness: "Pass",
    shadeMatch: "Pass",
    moistureCheck: "Pass",
    quantityVerificationCheck: "Pass",
    criticalWindingProblem: 0,
    majorWindingProblem: 0,
    minorWindingProblem: 0,
    criticalCrossedYarn: 0,
    majorCrossedYarn: 0,
    minorCrossedYarn: 0,
    criticalUnevenDyeing: 0,
    majorUnevenDyeing: 0,
    minorUnevenDyeing: 0,
    criticalDustMarks: 0,
    majorDustMarks: 0,
    minorDustMarks: 0,
    criticalSpotYarn: 0,
    majorSpotYarn: 0,
    minorSpotYarn: 0,
    criticalForeignYarn: 0,
    majorForeignYarn: 0,
    minorForeignYarn: 0,
    criticalKnot: 0,
    majorKnot: 0,
    minorKnot: 0,
    criticalThickThin: 0,
    majorThickThin: 0,
    minorThickThin: 0,
    overallObservation: "",
    reservationComments: "",
    finalResult: "Accept",
    inspector: "",
    inspectionDate: new Date().toISOString().split("T")[0],
  }
}

function migrateLegacyReport(raw: Record<string, unknown>): YarnInspectionReport {
  return {
    id: String(raw.id ?? createInspectionReportId()),
    poId: String(raw.poId ?? ""),
    poNumber: String(raw.poNumber ?? ""),
    styleNo: String(raw.styleNo ?? ""),
    buyer: String(raw.buyer ?? ""),
    batchId: raw.batchId ? String(raw.batchId) : undefined,
    batchNumber: String(raw.batchNumber ?? ""),
    supplier: String(raw.supplier ?? ""),
    color: String(raw.color ?? ""),
    yarnCount: String(raw.yarnCount ?? raw.quality ?? ""),
    receivedQty: normalizeNumber(raw.receivedQty),
    checkedQty: normalizeNumber(raw.checkedQty ?? raw.receivedQty),
    strength: raw.strength === "Fail" ? "Fail" : "Pass",
    elasticityCheck: raw.elasticityCheck === "Fail" ? "Fail" : "Pass",
    cleanliness: raw.cleanliness === "Fail" ? "Fail" : "Pass",
    shadeMatch: raw.shadeMatch === "Fail" ? "Fail" : "Pass",
    moistureCheck: raw.moistureCheck === "Fail" ? "Fail" : "Pass",
    quantityVerificationCheck:
      raw.quantityVerificationCheck === "Fail" ? "Fail" : "Pass",
    criticalWindingProblem: normalizeNumber(raw.criticalWindingProblem),
    majorWindingProblem: normalizeNumber(raw.majorWindingProblem),
    minorWindingProblem: normalizeNumber(raw.minorWindingProblem),
    criticalCrossedYarn: normalizeNumber(raw.criticalCrossedYarn),
    majorCrossedYarn: normalizeNumber(raw.majorCrossedYarn),
    minorCrossedYarn: normalizeNumber(raw.minorCrossedYarn),
    criticalUnevenDyeing: normalizeNumber(raw.criticalUnevenDyeing),
    majorUnevenDyeing: normalizeNumber(raw.majorUnevenDyeing),
    minorUnevenDyeing: normalizeNumber(raw.minorUnevenDyeing),
    criticalDustMarks: normalizeNumber(raw.criticalDustMarks),
    majorDustMarks: normalizeNumber(raw.majorDustMarks),
    minorDustMarks: normalizeNumber(raw.minorDustMarks),
    criticalSpotYarn: normalizeNumber(raw.criticalSpotYarn),
    majorSpotYarn: normalizeNumber(raw.majorSpotYarn),
    minorSpotYarn: normalizeNumber(raw.minorSpotYarn),
    criticalForeignYarn: normalizeNumber(raw.criticalForeignYarn),
    majorForeignYarn: normalizeNumber(raw.majorForeignYarn),
    minorForeignYarn: normalizeNumber(raw.minorForeignYarn),
    criticalKnot: normalizeNumber(raw.criticalKnot),
    majorKnot: normalizeNumber(raw.majorKnot),
    minorKnot: normalizeNumber(raw.minorKnot),
    criticalThickThin: normalizeNumber(raw.criticalThickThin),
    majorThickThin: normalizeNumber(raw.majorThickThin),
    minorThickThin: normalizeNumber(raw.minorThickThin),
    overallObservation: String(raw.overallObservation ?? raw.remarks ?? ""),
    reservationComments: String(raw.reservationComments ?? ""),
    finalResult: raw.finalResult === "Reject" || raw.result === "Fail" ? "Reject" : "Accept",
    inspector: String(raw.inspector ?? ""),
    inspectionDate: String(raw.inspectionDate ?? new Date().toISOString().split("T")[0]),
    testReportName: raw.testReportName ? String(raw.testReportName) : undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  }
}

function loadInspectionReports() {
  if (typeof window === "undefined") {
    return [] as YarnInspectionReport[]
  }

  try {
    const raw = window.localStorage.getItem(INSPECTION_STORAGE_KEY)
    if (!raw) {
      return [] as YarnInspectionReport[]
    }

    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>
    const normalized = parsed.map(migrateLegacyReport)
    window.localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    window.localStorage.removeItem(INSPECTION_STORAGE_KEY)
    return [] as YarnInspectionReport[]
  }
}

function saveInspectionReports(records: YarnInspectionReport[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(records))
}

function downloadCsv(fileName: string, rows: Array<Record<string, string | number>>) {
  if (typeof window === "undefined" || rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadTestReport(report: YarnInspectionReport) {
  if (typeof window === "undefined") {
    return
  }

  const content = [
    `PO Number: ${report.poNumber}`,
    `Style Number: ${report.styleNo}`,
    `Supplier: ${report.supplier}`,
    `Batch No.: ${report.batchNumber}`,
    `Color: ${report.color}`,
    `Yarn Count: ${report.yarnCount}`,
    `Checked Qty: ${report.checkedQty} kg`,
    `Final Result: ${report.finalResult}`,
    `Inspector: ${report.inspector}`,
    `Inspection Date: ${report.inspectionDate}`,
    `Observation: ${report.overallObservation}`,
    `Comments: ${report.reservationComments}`,
  ].join("\n")

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = report.testReportName || `${report.poNumber}-${report.batchNumber}.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}

function buildSummaryRows(reports: YarnInspectionReport[]) {
  return reports.map((report) => ({
    "PO Number": report.poNumber,
    "Style Number": report.styleNo,
    Supplier: report.supplier,
    "Batch No.": report.batchNumber,
    Color: report.color,
    "Yarn Count": report.yarnCount,
    "Received Qty (kg)": report.receivedQty,
    "Inspection Result": report.finalResult === "Accept" ? "Pass" : "Fail",
    "Inspection Date": report.inspectionDate,
    Inspector: report.inspector,
    "Test Report": report.testReportName ?? "—",
  }))
}

export function YarnBatchInspectionPage() {
  const dispatch = useAppDispatch()
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const [reports, setReports] = useState<YarnInspectionReport[]>(() => loadInspectionReports())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Reports")
  const [editingReport, setEditingReport] = useState<YarnInspectionReport | null>(null)
  const [viewingReport, setViewingReport] = useState<YarnInspectionReport | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [testReportName, setTestReportName] = useState("")

  const { register, handleSubmit, reset, setValue, control } =
    useForm<InspectionFormValues>({
      defaultValues: buildDefaultValues(),
    })

  const watchedBatchId = useWatch({
    control,
    name: "batchId",
  })

  const availableBatches = useMemo(
    () =>
      deliveryBatches.filter(
        (batch) =>
          batch.quantity > 0 &&
          !reports.some((report) => report.batchId === batch.id)
      ),
    [deliveryBatches, reports]
  )

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return reports.filter((report) => {
      const matchesFilter =
        activeFilter === "All Reports" ||
        (activeFilter === "Pass" && report.finalResult === "Accept") ||
        (activeFilter === "Fail" && report.finalResult === "Reject")

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        report.poNumber,
        report.styleNo,
        report.supplier,
        report.batchNumber,
        report.color,
        report.yarnCount,
        report.inspector,
        report.inspectionDate,
        report.finalResult,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, reports, searchQuery])

  const selectedBatch = useMemo(
    () => deliveryBatches.find((batch) => batch.id === watchedBatchId) ?? null,
    [deliveryBatches, watchedBatchId]
  )

  const selectedOrder = useMemo(
    () => purchaseOrders.find((order) => order.id === selectedBatch?.poId) ?? null,
    [purchaseOrders, selectedBatch?.poId]
  )

  const openCreateForm = () => {
    setEditingReport(null)
    setTestReportName("")
    reset(buildDefaultValues())
    setIsFormOpen(true)
  }

  const openEditForm = (report: YarnInspectionReport) => {
    const resolvedBuyer =
      report.buyer ||
      getResolvedPurchaseOrderBuyer(
        purchaseOrders.find((order) => order.id === report.poId) ?? null,
        purchaseOrders
      )

    setEditingReport(report)
    setTestReportName(report.testReportName ?? "")
    reset({
      ...report,
      buyer: resolvedBuyer,
      batchId: report.batchId ?? "",
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingReport(null)
    setTestReportName("")
  }

  const handleBatchChange = (batchId: string) => {
    const matchedBatch = deliveryBatches.find((batch) => batch.id === batchId)
    const matchedOrder = purchaseOrders.find((order) => order.id === matchedBatch?.poId)
    const resolvedBuyer = getResolvedPurchaseOrderBuyer(matchedOrder, purchaseOrders)

    setValue("batchId", batchId)
    setValue("batchNumber", matchedBatch?.batchNumber ?? "")
    setValue("poId", matchedBatch?.poId ?? "")
    setValue("poNumber", matchedBatch?.poNumber ?? "")
    setValue("styleNo", matchedOrder?.styleNo ?? "")
    setValue("buyer", resolvedBuyer)
    setValue("supplier", matchedOrder?.supplier || "")
    setValue("color", matchedOrder?.color ?? "")
    setValue("yarnCount", matchedOrder ? getPurchaseOrderDisplayYarn(matchedOrder) : "")
    setValue("receivedQty", matchedBatch?.quantity ?? 0)
    setValue("checkedQty", matchedBatch?.quantity ?? 0)
  }

  const onSubmit = (values: InspectionFormValues) => {
    const matchedBatch = deliveryBatches.find(
      (batch) =>
        (values.batchId && batch.id === values.batchId) ||
        (batch.poNumber === values.poNumber && batch.batchNumber === values.batchNumber)
    )

    if (!matchedBatch) {
      toast.error("Please select a valid received batch.")
      return
    }

    const matchedOrder =
      purchaseOrders.find((order) => order.id === matchedBatch.poId) ?? null
    const resolvedBuyer =
      values.buyer || getResolvedPurchaseOrderBuyer(matchedOrder, purchaseOrders)
    const receivedQty = normalizeNumber(values.receivedQty)
    const checkedQty = normalizeNumber(values.checkedQty)

    if (checkedQty <= 0) {
      toast.error("Checked quantity must be greater than zero.")
      return
    }

    if (checkedQty > receivedQty) {
      toast.error("Checked quantity cannot exceed received quantity.")
      return
    }

    const approvedQty = values.finalResult === "Accept" ? checkedQty : 0
    const rejectedQty = values.finalResult === "Reject" ? checkedQty : 0

    const nextRecord: YarnInspectionReport = editingReport
      ? {
          ...editingReport,
          ...values,
          buyer: resolvedBuyer,
          receivedQty,
          checkedQty,
          testReportName: testReportName || undefined,
        }
      : {
          id: createInspectionReportId(),
          ...values,
          buyer: resolvedBuyer,
          receivedQty,
          checkedQty,
          testReportName: testReportName || undefined,
          createdAt: new Date().toISOString(),
        }

    const nextReports = editingReport
      ? reports.map((report) => (report.id === editingReport.id ? nextRecord : report))
      : [nextRecord, ...reports]

    setReports(nextReports)
    saveInspectionReports(nextReports)

    applyInspectionToInventory({
      yarnName: matchedOrder ? getPurchaseOrderDisplayYarn(matchedOrder) : values.yarnCount,
      quality: values.yarnCount,
      lotNo: values.batchNumber,
      supplier: values.supplier,
      checkedQty,
      approvedQty,
      rejectedQty,
      actionDate: values.inspectionDate,
      notes: values.reservationComments || values.overallObservation,
      poId: values.poId,
      poNumber: values.poNumber,
      previousCheckedQty: editingReport?.checkedQty,
      previousApprovedQty:
        editingReport?.finalResult === "Accept" ? editingReport.checkedQty : 0,
      previousRejectedQty:
        editingReport?.finalResult === "Reject" ? editingReport.checkedQty : 0,
    })

    dispatch(
      updateBatchInspectionStatus({
        id: matchedBatch.id,
        inspectionStatus: values.finalResult === "Accept" ? "Accepted" : "Rejected",
        inspectedBy: values.inspector,
        inspectedAt: values.inspectionDate,
        testReportName: testReportName || undefined,
        rejectionReason:
          values.finalResult === "Reject" ? values.reservationComments || values.overallObservation : undefined,
        remarks: values.overallObservation,
      })
    )

    dispatch(
      updatePoStatus({
        id: matchedBatch.poId,
        status: values.finalResult === "Accept" ? "Yarn Ready" : "Yarn Processing",
        changedBy: "Yarn Controller",
      })
    )

    dispatch(
      addNotification({
        id: createNotificationId(),
        title:
          values.finalResult === "Accept"
            ? `Yarn inspection passed: ${values.poNumber}`
            : `Yarn inspection failed: ${values.poNumber}`,
        description:
          values.finalResult === "Accept"
            ? `Batch ${values.batchNumber} accepted. ${approvedQty} kg is now available in yarn stock.`
            : `Batch ${values.batchNumber} rejected. ${rejectedQty} kg was recorded as rejected stock.`,
        time: "Just now",
        read: false,
        targetRoles: ["merchandising_user", "management_user", "super_admin"],
      })
    )

    closeForm()
    toast.success(editingReport ? "Inspection report updated." : "Inspection report created.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspection"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() =>
                downloadCsv("yarn-inspection-report.csv", buildSummaryRows(filteredReports))
              }
            >
              <Download className="mr-1.5 size-4" />
              Export
            </Button>
            <Button type="button" className="rounded-2xl" onClick={openCreateForm}>
              New Inspection Report
            </Button>
          </div>
        }
      />

      <SearchFilterBar
        filters={["All Reports", "Pass", "Fail"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, style no, supplier, batch, color, yarn count, inspector, date"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          title="No inspection reports yet"
          description="Create a new yarn inspection report to start the inspection log."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "styleNo", header: "Style Number", className: "min-w-[5.5rem]" },
            { key: "supplier", header: "Supplier", className: "min-w-[6rem]" },
            { key: "batchNumber", header: "Batch No.", className: "min-w-[5rem]" },
            { key: "color", header: "Color", className: "min-w-[5rem]" },
            { key: "yarnCount", header: "Yarn Count", className: "min-w-[6rem]" },
            {
              key: "receivedQty",
              header: "Received Qty (kg)",
              className: "min-w-[6rem]",
              render: (row) => String(row.receivedQty),
            },
            {
              key: "finalResult",
              header: "Inspection Result",
              className: "min-w-[6rem]",
              render: (row) => (
                <StatusBadge value={row.finalResult === "Accept" ? "Pass" : "Fail"} />
              ),
            },
            {
              key: "inspectionDate",
              header: "Inspection Date",
              className: "min-w-[6rem]",
              render: (row) => formatDate(row.inspectionDate),
            },
            { key: "inspector", header: "Inspector", className: "min-w-[5rem]" },
            {
              key: "testReportName",
              header: "Test Report",
              className: "min-w-[6rem]",
              render: (row) => String(row.testReportName ?? "—"),
            },
            {
              key: "action",
              header: "Action",
              className: "min-w-[8rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setViewingReport(row as YarnInspectionReport)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openEditForm(row as YarnInspectionReport)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => downloadTestReport(row as YarnInspectionReport)}
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredReports}
        />
      )}

      {isFormOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingReport ? "Edit Inspection Report" : "New Inspection Report"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Complete the yarn inspection report using a factory-style checklist while keeping the ERP workflow compact.
                </p>
              </div>
              <Button type="button" variant="outline" className="rounded-2xl" onClick={closeForm}>
                Close
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  General Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <label htmlFor="batch-id" className="text-sm font-medium">
                      Batch No.
                    </label>
                    <select
                      id="batch-id"
                      {...register("batchId", { required: true })}
                      disabled={Boolean(editingReport)}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring disabled:cursor-not-allowed disabled:bg-muted"
                      onChange={(event) => handleBatchChange(event.target.value)}
                      defaultValue={editingReport?.batchId ?? ""}
                    >
                      <option value="">Select batch</option>
                      {availableBatches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.batchNumber} ({batch.poNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  {[
                    ["poNumber", "PO Number"],
                    ["styleNo", "Style Number"],
                    ["buyer", "Buyer"],
                    ["supplier", "Supplier"],
                    ["color", "Color"],
                    ["yarnCount", "Yarn Count"],
                    ["receivedQty", "Received Qty (kg)"],
                  ].map(([name, label]) => (
                    <div key={name} className="space-y-2">
                      <label htmlFor={name} className="text-sm font-medium">
                        {label}
                      </label>
                      <input
                        id={name}
                        {...register(name as keyof InspectionFormValues)}
                        readOnly={name !== "supplier"}
                        type={name === "receivedQty" ? "number" : "text"}
                        className="w-full rounded-2xl border border-input bg-muted px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <label htmlFor="checkedQty" className="text-sm font-medium">
                      Checked Qty (kg)
                    </label>
                    <input
                      id="checkedQty"
                      type="number"
                      {...register("checkedQty", { valueAsNumber: true })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Inspection Checklist
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["strength", "Strength"],
                    ["elasticityCheck", "Elasticity"],
                    ["cleanliness", "Cleanliness"],
                    ["shadeMatch", "Shade Match"],
                    ["moistureCheck", "Moisture"],
                    ["quantityVerificationCheck", "Quantity Verification"],
                  ].map(([name, label]) => (
                    <div key={name} className="space-y-2">
                      <label htmlFor={name} className="text-sm font-medium">
                        {label}
                      </label>
                      <select
                        id={name}
                        {...register(name as keyof InspectionFormValues)}
                        className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Defect Inspection
                </h3>
                <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/90">
                          <th className="border-r border-b border-border/80 px-4 py-3 text-left font-semibold">
                            Inspection Item
                          </th>
                          <th className="border-r border-b border-border/80 px-4 py-3 text-left font-semibold">
                            Critical
                          </th>
                          <th className="border-r border-b border-border/80 px-4 py-3 text-left font-semibold">
                            Major
                          </th>
                          <th className="border-b border-border/80 px-4 py-3 text-left font-semibold">
                            Minor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {defectRows.map((row, rowIndex) => (
                          <tr key={row.key} className={rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"}>
                            <td className="border-r border-b border-border/70 px-4 py-3 align-middle font-medium">
                              {row.label}
                            </td>
                            {(["critical", "major", "minor"] as const).map((severity, severityIndex) => {
                              const fieldName = `${severity}${row.key}` as keyof InspectionFormValues
                              return (
                                <td
                                  key={fieldName}
                                  className={
                                    severityIndex === 2
                                      ? "border-b border-border/70 px-4 py-3"
                                      : "border-r border-b border-border/70 px-4 py-3"
                                  }
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    {...register(fieldName, { valueAsNumber: true })}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none transition focus:border-ring"
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Inspection Summary
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="overallObservation" className="text-sm font-medium">
                      Overall Observation
                    </label>
                    <textarea
                      id="overallObservation"
                      {...register("overallObservation")}
                      rows={3}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="reservationComments" className="text-sm font-medium">
                      Reservation / Comments
                    </label>
                    <textarea
                      id="reservationComments"
                      {...register("reservationComments")}
                      rows={3}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="finalResult" className="text-sm font-medium">
                      Final Result
                    </label>
                    <select
                      id="finalResult"
                      {...register("finalResult")}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    >
                      <option value="Accept">Accept</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inspector" className="text-sm font-medium">
                      Inspector
                    </label>
                    <input
                      id="inspector"
                      {...register("inspector")}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inspectionDate" className="text-sm font-medium">
                      Inspection Date
                    </label>
                    <input
                      id="inspectionDate"
                      type="date"
                      {...register("inspectionDate")}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <FileUploadField
                      label="Upload Test Report"
                      value={testReportName}
                      onChange={setTestReportName}
                      onClear={() => setTestReportName("")}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" className="rounded-2xl" onClick={closeForm}>
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
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Inspection Report</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {viewingReport.poNumber} · {viewingReport.batchNumber}
                </p>
              </div>
              <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setViewingReport(null)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["PO Number", viewingReport.poNumber],
                  ["Style Number", viewingReport.styleNo],
                  ["Buyer", viewingReport.buyer],
                  ["Supplier", viewingReport.supplier],
                  ["Batch No.", viewingReport.batchNumber],
                  ["Color", viewingReport.color],
                  ["Yarn Count", viewingReport.yarnCount],
                  ["Received Qty (kg)", String(viewingReport.receivedQty)],
                  ["Checked Qty (kg)", String(viewingReport.checkedQty)],
                  ["Final Result", viewingReport.finalResult],
                  ["Inspector", viewingReport.inspector],
                  ["Inspection Date", viewingReport.inspectionDate],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Strength", viewingReport.strength],
                  ["Elasticity", viewingReport.elasticityCheck],
                  ["Cleanliness", viewingReport.cleanliness],
                  ["Shade Match", viewingReport.shadeMatch],
                  ["Moisture", viewingReport.moistureCheck],
                  ["Quantity Verification", viewingReport.quantityVerificationCheck],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <StatusBadge value={String(value)} />
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/90">
                        <th className="border-r border-b border-border/80 px-4 py-3 text-left font-semibold">
                          Inspection Item
                        </th>
                        <th className="border-r border-b border-border/80 px-4 py-3 text-left font-semibold">
                          Critical
                        </th>
                        <th className="border-r border-b border-border/80 px-4 py-3 text-left font-semibold">
                          Major
                        </th>
                        <th className="border-b border-border/80 px-4 py-3 text-left font-semibold">
                          Minor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {defectRows.map((row, rowIndex) => (
                        <tr key={row.key} className={rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"}>
                          <td className="border-r border-b border-border/70 px-4 py-3 align-middle font-medium">
                            {row.label}
                          </td>
                          <td className="border-r border-b border-border/70 px-4 py-3">
                            {String(viewingReport[`critical${row.key}` as keyof YarnInspectionReport] ?? 0)}
                          </td>
                          <td className="border-r border-b border-border/70 px-4 py-3">
                            {String(viewingReport[`major${row.key}` as keyof YarnInspectionReport] ?? 0)}
                          </td>
                          <td className="border-b border-border/70 px-4 py-3">
                            {String(viewingReport[`minor${row.key}` as keyof YarnInspectionReport] ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Overall Observation
                  </p>
                  <p className="text-sm">{viewingReport.overallObservation || "—"}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Reservation / Comments
                  </p>
                  <p className="text-sm">{viewingReport.reservationComments || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Test Report
                  </p>
                  <p className="text-sm">{viewingReport.testReportName || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
