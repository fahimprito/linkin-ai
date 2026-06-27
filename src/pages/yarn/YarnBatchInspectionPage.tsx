import { Eye, Pencil } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { FileUploadField } from "@/components/shared/file-upload-field"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { updateBatchInspectionStatus } from "@/store/slices/yarn-check-slice"

type InspectionReport = {
  id: string
  poId: string
  poNumber: string
  batchId?: string
  batchNumber: string
  quality: string
  elasticity: string
  moisture: string
  quantityVerification: string
  shadeMatch: string
  result: "Pass" | "Fail"
  inspectionDate: string
  inspector: string
  remarks: string
  testReportName?: string
  createdAt: string
}

type InspectionFormValues = Omit<
  InspectionReport,
  "id" | "createdAt" | "testReportName"
> & {
  testReportName?: string
}

const INSPECTION_STORAGE_KEY = "linkin-yarn-inspection-reports"

function loadInspectionReports() {
  if (typeof window === "undefined") {
    return [] as InspectionReport[]
  }

  try {
    const raw = window.localStorage.getItem(INSPECTION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as InspectionReport[]) : []
  } catch {
    window.localStorage.removeItem(INSPECTION_STORAGE_KEY)
    return []
  }
}

function saveInspectionReports(records: InspectionReport[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(records))
}

function createInspectionReportId() {
  return `inspection-${Date.now()}`
}

export function YarnBatchInspectionPage() {
  const dispatch = useAppDispatch()
  const deliveryBatches = useAppSelector(
    (state) => state.yarnCheck.deliveryBatches
  )
  const [reports, setReports] = useState<InspectionReport[]>(() =>
    loadInspectionReports()
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Reports")
  const [editingReport, setEditingReport] = useState<InspectionReport | null>(null)
  const [viewingReport, setViewingReport] = useState<InspectionReport | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [testReportName, setTestReportName] = useState("")

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<InspectionFormValues>({
      defaultValues: {
        poId: "",
        poNumber: "",
        batchId: "",
        batchNumber: "",
        quality: "",
        elasticity: "",
        moisture: "",
        quantityVerification: "",
        shadeMatch: "",
        result: "Pass",
        inspectionDate: new Date().toISOString().split("T")[0],
        inspector: "",
        remarks: "",
      },
    })

  const poNumberValue = watch("poNumber")
  const availableBatches = useMemo(
    () =>
      deliveryBatches.filter((batch) =>
        poNumberValue
          ? batch.poNumber.toLowerCase().includes(poNumberValue.toLowerCase())
          : true
      ),
    [deliveryBatches, poNumberValue]
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
        report.batchNumber,
        report.inspector,
        report.quality,
        report.result,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, reports, searchQuery])

  const openCreateForm = () => {
    setEditingReport(null)
    setTestReportName("")
    reset({
      poId: "",
      poNumber: "",
      batchId: "",
      batchNumber: "",
      quality: "",
      elasticity: "",
      moisture: "",
      quantityVerification: "",
      shadeMatch: "",
      result: "Pass",
      inspectionDate: new Date().toISOString().split("T")[0],
      inspector: "",
      remarks: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (report: InspectionReport) => {
    setEditingReport(report)
    setTestReportName(report.testReportName ?? "")
    reset({
      poId: report.poId,
      poNumber: report.poNumber,
      batchId: report.batchId ?? "",
      batchNumber: report.batchNumber,
      quality: report.quality,
      elasticity: report.elasticity,
      moisture: report.moisture,
      quantityVerification: report.quantityVerification,
      shadeMatch: report.shadeMatch,
      result: report.result,
      inspectionDate: report.inspectionDate,
      inspector: report.inspector,
      remarks: report.remarks,
    })
    setIsFormOpen(true)
  }

  const onSubmit = (values: InspectionFormValues) => {
    const nextRecord: InspectionReport = editingReport
      ? {
          ...editingReport,
          ...values,
          testReportName: testReportName || undefined,
        }
      : {
          id: createInspectionReportId(),
          ...values,
          testReportName: testReportName || undefined,
          createdAt: new Date().toISOString(),
        }

    const nextReports = editingReport
      ? reports.map((report) => (report.id === editingReport.id ? nextRecord : report))
      : [nextRecord, ...reports]

    setReports(nextReports)
    saveInspectionReports(nextReports)

    const matchedBatch = deliveryBatches.find(
      (batch) =>
        (values.batchId && batch.id === values.batchId) ||
        (batch.poNumber === values.poNumber && batch.batchNumber === values.batchNumber)
    )

    if (matchedBatch) {
      dispatch(
        updateBatchInspectionStatus({
          id: matchedBatch.id,
          inspectionStatus: values.result === "Pass" ? "Accepted" : "Rejected",
          inspectedBy: values.inspector,
          inspectedAt: values.inspectionDate,
          testReportName: testReportName || undefined,
          rejectionReason: values.result === "Fail" ? values.remarks : undefined,
          remarks: values.remarks,
        })
      )
      if (values.result === "Pass") {
        dispatch(
          updatePoStatus({
            id: matchedBatch.poId,
            status: "Yarn Ready",
            changedBy: "Yarn Controller",
          })
        )
      } else {
        dispatch(
          updatePoStatus({
            id: matchedBatch.poId,
            status: "Yarn Processing",
            changedBy: "Yarn Controller",
          })
        )
      }
    }

    setIsFormOpen(false)
    setEditingReport(null)
    setTestReportName("")
    toast.success(
      editingReport ? "Inspection report updated." : "Inspection report created."
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspection"
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
        searchPlaceholder="Search PO, batch, inspector, quality"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          title="No inspection reports yet"
          description="Create a new inspection report to start building the inspection log."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "batchNumber", header: "Batch No.", className: "min-w-[5rem]" },
            { key: "quality", header: "Quality", className: "min-w-[5rem]" },
            { key: "elasticity", header: "Elasticity", className: "min-w-[5rem]" },
            { key: "moisture", header: "Moisture", className: "min-w-[4.75rem]" },
            {
              key: "quantityVerification",
              header: "Quantity Verification",
              className: "min-w-[6rem]",
            },
            { key: "shadeMatch", header: "Shade Match", className: "min-w-[5rem]" },
            {
              key: "result",
              header: "Pass / Fail",
              className: "min-w-[5.25rem]",
              render: (row) => <StatusBadge value={String(row.result)} />,
            },
            { key: "inspectionDate", header: "Inspection Date", className: "min-w-[5.75rem]" },
            { key: "inspector", header: "Inspector", className: "min-w-[5rem]" },
            { key: "remarks", header: "Remarks", className: "min-w-[6rem]" },
            {
              key: "testReportName",
              header: "Test Report",
              className: "min-w-[6rem]",
              render: (row) => String(row.testReportName ?? "—"),
            },
            {
              key: "action",
              header: "Action",
              className: "min-w-[5.5rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setViewingReport(row as InspectionReport)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => openEditForm(row as InspectionReport)}
                  >
                    <Pencil className="size-3.5" />
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
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingReport ? "Edit Inspection Report" : "New Inspection Report"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Capture yarn inspection results using the shared project form pattern.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingReport(null)
                  setTestReportName("")
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
                <label htmlFor="inspection-po-number" className="text-sm font-medium">
                  PO Number
                </label>
                <input
                  id="inspection-po-number"
                  {...register("poNumber", { required: true })}
                  placeholder="LK-2005"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="inspection-batch-id" className="text-sm font-medium">
                  Batch No.
                </label>
                <select
                  id="inspection-batch-id"
                  {...register("batchId")}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  onChange={(event) => {
                    const matchedBatch = deliveryBatches.find(
                      (batch) => batch.id === event.target.value
                    )
                    setValue("batchId", event.target.value)
                    if (matchedBatch) {
                      setValue("poId", matchedBatch.poId)
                      setValue("poNumber", matchedBatch.poNumber)
                      setValue("batchNumber", matchedBatch.batchNumber)
                    }
                  }}
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

              <input type="hidden" {...register("poId")} />
              <input type="hidden" {...register("batchNumber")} />

              {[
                ["quality", "Quality", "A Grade"],
                ["elasticity", "Elasticity", "Stable"],
                ["moisture", "Moisture", "6.2%"],
                ["quantityVerification", "Quantity Verification", "Matched"],
                ["shadeMatch", "Shade Match", "Matched"],
                ["inspector", "Inspector", "Nusrat Jahan"],
              ].map(([name, label, placeholder]) => (
                <div key={name} className="space-y-2">
                  <label htmlFor={name} className="text-sm font-medium">
                    {label}
                  </label>
                  <input
                    id={name}
                    {...register(name as keyof InspectionFormValues, { required: true })}
                    placeholder={placeholder}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label htmlFor="inspection-result" className="text-sm font-medium">
                  Pass / Fail
                </label>
                <select
                  id="inspection-result"
                  {...register("result", { required: true })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="inspection-date" className="text-sm font-medium">
                  Inspection Date
                </label>
                <input
                  id="inspection-date"
                  type="date"
                  {...register("inspectionDate", { required: true })}
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

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="inspection-remarks" className="text-sm font-medium">
                  Remarks
                </label>
                <textarea
                  id="inspection-remarks"
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
                    setTestReportName("")
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
                ["Quality", viewingReport.quality],
                ["Elasticity", viewingReport.elasticity],
                ["Moisture", viewingReport.moisture],
                ["Quantity Verification", viewingReport.quantityVerification],
                ["Shade Match", viewingReport.shadeMatch],
                ["Result", viewingReport.result],
                ["Inspection Date", viewingReport.inspectionDate],
                ["Inspector", viewingReport.inspector],
                ["Test Report", viewingReport.testReportName ?? "—"],
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
