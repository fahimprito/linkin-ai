import { Download, Eye } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { demoSwatchCards, demoYarnInspectionReports } from "@/mock/demo-data"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"

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

type SwatchCardRecord = {
  id: string
  poNumber: string
  styleName: string
  yarnType: string
  color: string
  status: string
  notes: string
  createdAt: string
}

const INSPECTION_STORAGE_KEY = "linkin-yarn-inspection-reports"
const SWATCH_STORAGE_KEY = "linkin-yarn-swatch-cards"

function loadRecords<T>(storageKey: string) {
  const fallback =
    storageKey === INSPECTION_STORAGE_KEY
      ? (demoYarnInspectionReports as T[])
      : storageKey === SWATCH_STORAGE_KEY
        ? (demoSwatchCards as T[])
        : ([] as T[])

  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return fallback
    }

    const parsed = JSON.parse(raw) as T[]
    return parsed.length > 0 ? parsed : fallback
  } catch {
    window.localStorage.removeItem(storageKey)
    return fallback
  }
}

function downloadTextFile(fileName: string, content: string) {
  if (typeof window === "undefined") {
    return
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function YarnTestReportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Reports")
  const [viewingReport, setViewingReport] = useState<InspectionReport | null>(null)
  const reports = useMemo(
    () => loadRecords<InspectionReport>(INSPECTION_STORAGE_KEY),
    []
  )

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
        report.inspector,
        report.quality,
        report.result,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, reports, searchQuery])

  return (
    <div className="space-y-6">
      <PageHeader title="Yarn Test Report" />
      <SearchFilterBar
        filters={["All Reports", "Pass", "Fail"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, batch, inspector, result"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />
      {filteredReports.length === 0 ? (
        <EmptyState
          title="No yarn test reports yet"
          description="Inspection reports will appear here automatically."
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
              key: "result",
              header: "Result",
              className: "min-w-[5rem]",
              render: (row) => <StatusBadge value={String(row.result)} />,
            },
            {
              key: "inspectionDate",
              header: "Inspection Date",
              className: "min-w-[5.75rem]",
            },
            { key: "inspector", header: "Inspector", className: "min-w-[5rem]" },
            {
              key: "action",
              header: "Action",
              className: "min-w-[6rem]",
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
                    onClick={() =>
                      downloadTextFile(
                        `yarn-test-report-${String(row.poNumber)}-${String(row.batchNumber)}.txt`,
                        JSON.stringify(row, null, 2)
                      )
                    }
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

      {viewingReport ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Yarn Test Report</h2>
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

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() =>
                  downloadTextFile(
                    `yarn-test-report-${viewingReport.poNumber}-${viewingReport.batchNumber}.txt`,
                    JSON.stringify(viewingReport, null, 2)
                  )
                }
              >
                <Download className="mr-1.5 size-4" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function YarnSwatchPhysicalTestReportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Reports")
  const [viewingRecord, setViewingRecord] = useState<SwatchCardRecord | null>(null)
  const records = useMemo(
    () => loadRecords<SwatchCardRecord>(SWATCH_STORAGE_KEY),
    []
  )

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      const matchesFilter =
        activeFilter === "All Reports" || record.status === activeFilter

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        record.poNumber,
        record.styleName,
        record.yarnType,
        record.color,
        record.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, records, searchQuery])

  return (
    <div className="space-y-6">
      <PageHeader title="Yarn Swatch Physical Test Report" />
      <SearchFilterBar
        filters={["All Reports", "Generated", "Prepared", "Sent", "Approved"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, style, yarn type, color"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />
      {filteredRecords.length === 0 ? (
        <EmptyState
          title="No swatch physical test reports yet"
          description="Generated swatch records will appear here."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "styleName", header: "Style Name", className: "min-w-[6rem]" },
            { key: "yarnType", header: "Yarn Type", className: "min-w-[6rem]" },
            { key: "color", header: "Color", className: "min-w-[5rem]" },
            {
              key: "status",
              header: "Status",
              className: "min-w-[5.25rem]",
              render: (row) => <StatusBadge value={String(row.status)} />,
            },
            {
              key: "createdAt",
              header: "Created",
              className: "min-w-[5.75rem]",
              render: (row) =>
                new Date(String(row.createdAt)).toLocaleDateString(),
            },
            {
              key: "action",
              header: "Action",
              className: "min-w-[6rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setViewingRecord(row as SwatchCardRecord)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      downloadTextFile(
                        `swatch-physical-test-${String(row.poNumber)}.txt`,
                        JSON.stringify(row, null, 2)
                      )
                    }
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredRecords}
        />
      )}

      {viewingRecord ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Yarn Swatch Physical Test Report
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {viewingRecord.poNumber} · {viewingRecord.styleName}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setViewingRecord(null)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["PO Number", viewingRecord.poNumber],
                ["Style Name", viewingRecord.styleName],
                ["Yarn Type", viewingRecord.yarnType],
                ["Color", viewingRecord.color],
                ["Status", viewingRecord.status],
                ["Created", new Date(viewingRecord.createdAt).toLocaleString()],
                ["Notes", viewingRecord.notes || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={label === "Notes" ? "space-y-1 md:col-span-2" : "space-y-1"}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() =>
                  downloadTextFile(
                    `swatch-physical-test-${viewingRecord.poNumber}.txt`,
                    JSON.stringify(viewingRecord, null, 2)
                  )
                }
              >
                <Download className="mr-1.5 size-4" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
