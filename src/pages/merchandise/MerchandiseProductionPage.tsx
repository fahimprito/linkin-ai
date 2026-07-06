import { Download, Eye, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getPurchaseOrderDisplayCcd,
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayProductionUnit,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayStyle,
} from "@/lib/purchase-orders"
import { useAppSelector } from "@/store/hooks"
import type {
  POStatus,
  PurchaseOrder,
  PurchaseOrderWorkflowHistoryEntry,
} from "@/types/modules"

const productionStatusSequence: POStatus[] = [
  "Created",
  "Sent to Design",
  "Design Completed",
  "Sent to Yarn",
  "Yarn Processing",
  "Yarn Ready",
  "Sent to Store",
  "Store Processing",
  "Store Ready",
  "Sent to Knitting",
  "Knitting In Progress",
  "Knitting Completed",
  "Sent to Linking",
  "Linking In Progress",
  "Linking Completed",
  "Sent to Finishing",
  "Finishing In Progress",
  "Ready to Ship",
  "Completed",
]

const overallStatusOptions = [
  "Pending",
  "Queued",
  "In Progress",
  "Ready",
  "Delayed",
  "Completed",
] as const

type OverallProductionStatus = (typeof overallStatusOptions)[number]

type ProductionTrackingRow = {
  id: string
  poNumber: string
  styleName: string
  styleNumber: string
  quantity: number
  productionUnit: string
  currentWorkflowStage: string
  currentDepartment: string
  expectedNextStage: string
  ccd: string
  overallStatus: OverallProductionStatus
  lastUpdated: string
  workflowHistory: PurchaseOrderWorkflowHistoryEntry[]
}

function getFallbackWorkflowHistory(order: PurchaseOrder) {
  if (order.workflowHistory && order.workflowHistory.length > 0) {
    return order.workflowHistory
  }

  return [
    {
      status: order.status,
      changedAt: order.createdAt,
      changedBy: "System",
    },
  ]
}

function getCurrentDepartment(status: string) {
  if (["Created", "Draft"].includes(status)) {
    return "Merchandising"
  }

  if (["Sent to Design", "Design Completed"].includes(status)) {
    return "Design"
  }

  if (["Sent to Yarn", "Yarn Processing", "Yarn Ready"].includes(status)) {
    return "Yarn"
  }

  if (["Sent to Store", "Store Processing", "Store Ready"].includes(status)) {
    return "Store"
  }

  if (
    ["Sent to Knitting", "Knitting In Progress", "Knitting Completed"].includes(
      status
    )
  ) {
    return "Knitting"
  }

  if (
    ["Sent to Linking", "Linking In Progress", "Linking Completed"].includes(status)
  ) {
    return "Linking"
  }

  if (["Sent to Finishing", "Finishing In Progress"].includes(status)) {
    return "Finishing"
  }

  if (status === "Ready to Ship") {
    return "Shipment"
  }

  if (status === "Completed") {
    return "Completed"
  }

  return "Merchandising"
}

function getExpectedNextStage(status: string) {
  const currentIndex = productionStatusSequence.findIndex(
    (currentStatus) => currentStatus === status
  )

  if (currentIndex === -1 || currentIndex === productionStatusSequence.length - 1) {
    return "-"
  }

  return productionStatusSequence[currentIndex + 1]
}

function isCompletedStatus(status: string) {
  return ["Ready to Ship", "Completed"].includes(status)
}

function hasDatePassed(value: string) {
  if (!value) {
    return false
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return false
  }

  const targetDate = new Date(parsedDate)
  targetDate.setHours(23, 59, 59, 999)

  return targetDate.getTime() < Date.now()
}

function getOverallStatus(status: string, ccd: string): OverallProductionStatus {
  if (isCompletedStatus(status)) {
    return "Completed"
  }

  if (hasDatePassed(ccd)) {
    return "Delayed"
  }

  if (["Created"].includes(status)) {
    return "Pending"
  }

  if (
    [
      "Sent to Design",
      "Sent to Yarn",
      "Sent to Store",
      "Sent to Knitting",
      "Sent to Linking",
      "Sent to Finishing",
    ].includes(status)
  ) {
    return "Queued"
  }

  if (
    [
      "Design Completed",
      "Yarn Ready",
      "Store Ready",
      "Knitting Completed",
      "Linking Completed",
    ].includes(status)
  ) {
    return "Ready"
  }

  return "In Progress"
}

function formatDate(value: string) {
  if (!value) {
    return "-"
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleDateString()
}

function formatDateTime(value: string) {
  if (!value) {
    return "-"
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleString()
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

function buildProductionTrackingRows(
  purchaseOrders: PurchaseOrder[]
): ProductionTrackingRow[] {
  return purchaseOrders
    .map((order) => {
      const workflowHistory = getFallbackWorkflowHistory(order)
      const lastUpdatedEntry = workflowHistory[workflowHistory.length - 1]
      const ccd = getPurchaseOrderDisplayCcd(order)

      return {
        id: order.id,
        poNumber: getPurchaseOrderDisplayNo(order),
        styleName: getPurchaseOrderDisplayStyle(order),
        styleNumber: order.styleNo ?? "-",
        quantity: getPurchaseOrderDisplayQty(order),
        productionUnit: getPurchaseOrderDisplayProductionUnit(order) || "-",
        currentWorkflowStage: order.status,
        currentDepartment: getCurrentDepartment(order.status),
        expectedNextStage: getExpectedNextStage(order.status),
        ccd,
        overallStatus: getOverallStatus(order.status, ccd),
        lastUpdated: lastUpdatedEntry?.changedAt ?? order.createdAt,
        workflowHistory,
      }
    })
    .sort(
      (left, right) =>
        new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime()
    )
}

function getTimelineStepStatus(stepIndex: number, totalSteps: number) {
  if (stepIndex === totalSteps - 1) {
    return "Current"
  }

  return "Completed"
}

export function MerchandiseProductionPage() {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const [searchValue, setSearchValue] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Tracking")
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState<ProductionTrackingRow | null>(null)

  const rows = useMemo(
    () => buildProductionTrackingRows(purchaseOrders),
    [purchaseOrders]
  )

  const filterOptions = useMemo(
    () => [
      "All Tracking",
      ...productionStatusSequence.map((status) => `Stage: ${status}`),
      ...overallStatusOptions.map((status) => `Overall: ${status}`),
    ],
    []
  )

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesFilter =
        activeFilter === "All Tracking" ||
        activeFilter === `Stage: ${row.currentWorkflowStage}` ||
        activeFilter === `Overall: ${row.overallStatus}`

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        row.poNumber,
        row.styleName,
        row.productionUnit,
        row.currentWorkflowStage,
        row.overallStatus,
        row.ccd,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, rows, searchValue])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 10))
  const pagedRows = filteredRows.slice((page - 1) * 10, page * 10)

  const exportRows = useMemo(
    () => [
      [
        "PO Number",
        "Style Name",
        "Style Number",
        "Quantity",
        "Production Unit",
        "Current Workflow Stage",
        "Current Department",
        "Expected Next Stage",
        "CCD",
        "Overall Status",
        "Last Updated",
      ],
      ...filteredRows.map((row) => [
        row.poNumber,
        row.styleName,
        row.styleNumber,
        String(row.quantity),
        row.productionUnit,
        row.currentWorkflowStage,
        row.currentDepartment,
        row.expectedNextStage,
        row.ccd,
        row.overallStatus,
        formatDateTime(row.lastUpdated),
      ]),
    ],
    [filteredRows]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Updates"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() =>
              downloadCsv("merchandise-production-tracking.csv", exportRows)
            }
          >
            <Download className="mr-1.5 size-4" />
            Export
          </Button>
        }
      />

      {/* <div className="rounded-[1.5rem] border border-border/70 bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
        This is a read-only production tracking view. Current workflow data comes
        directly from each PO status and workflow history, and future Knitting,
        Linking, and Finishing columns can be added without redesigning the table.
      </div> */}

      <SearchFilterBar
        compact
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter)
          setPage(1)
        }}
        searchPlaceholder="Search PO number, style, production unit, stage, status, CCD"
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
      />

      {pagedRows.length === 0 ? (
        <EmptyState
          title="No production tracking rows found"
          description="No purchase orders match the current production search or filter."
        />
      ) : (
        <>
          <DataTable
            compact
            columns={[
              {
                key: "poNumber",
                header: "PO Number",
                className: "min-w-[6rem]",
              },
              {
                key: "styleName",
                header: "Style Name",
                className: "min-w-[8rem]",
              },
              {
                key: "styleNumber",
                header: "Style Number",
                className: "min-w-[6rem]",
              },
              {
                key: "quantity",
                header: "Quantity",
                className: "min-w-[5rem]",
                render: (row) => row.quantity.toLocaleString(),
              },
              {
                key: "productionUnit",
                header: "Production Unit",
                className: "min-w-[7rem]",
              },
              {
                key: "currentWorkflowStage",
                header: "Current Workflow Stage",
                className: "min-w-[8rem]",
                render: (row) => <StatusBadge value={row.currentWorkflowStage} />,
              },
              {
                key: "currentDepartment",
                header: "Current Department",
                className: "min-w-[6rem]",
              },
              {
                key: "expectedNextStage",
                header: "Expected Next Stage",
                className: "min-w-[8rem]",
                render: (row) =>
                  row.expectedNextStage === "-" ? (
                    row.expectedNextStage
                  ) : (
                    <StatusBadge value={row.expectedNextStage} />
                  ),
              },
              {
                key: "ccd",
                header: "CCD",
                className: "min-w-[6rem]",
                render: (row) => formatDate(row.ccd),
              },
              {
                key: "overallStatus",
                header: "Overall Status",
                className: "min-w-[6rem]",
                render: (row) => <StatusBadge value={row.overallStatus} />,
              },
              {
                key: "lastUpdated",
                header: "Last Updated",
                className: "min-w-[8rem]",
                render: (row) => formatDateTime(row.lastUpdated),
              },
              {
                key: "action",
                header: "Action",
                className: "min-w-[8rem]",
                render: (row) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setSelectedRow(row)}
                  >
                    <Eye className="mr-1.5 size-3.5" />
                    View PO Timeline
                  </Button>
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

      {selectedRow ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  PO Timeline: {selectedRow.poNumber}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Current department: {selectedRow.currentDepartment}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setSelectedRow(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-border/70 bg-secondary/35 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Style
                </p>
                <p className="mt-1 text-sm font-medium">{selectedRow.styleName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Production Unit
                </p>
                <p className="mt-1 text-sm font-medium">{selectedRow.productionUnit}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Current Stage
                </p>
                <div className="mt-1">
                  <StatusBadge value={selectedRow.currentWorkflowStage} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Expected Next Stage
                </p>
                <div className="mt-1">
                  {selectedRow.expectedNextStage === "-" ? (
                    <p className="text-sm font-medium">-</p>
                  ) : (
                    <StatusBadge value={selectedRow.expectedNextStage} />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {selectedRow.workflowHistory.map((step, index) => {
                const stepState = getTimelineStepStatus(
                  index,
                  selectedRow.workflowHistory.length
                )

                return (
                  <div key={`${step.status}-${step.changedAt}-${index}`} className="flex gap-4">
                    <div className="flex w-8 flex-col items-center">
                      <span className="mt-1 size-3 rounded-full bg-primary" />
                      {index < selectedRow.workflowHistory.length - 1 ? (
                        <span className="mt-2 h-full min-h-8 w-px bg-border" />
                      ) : null}
                    </div>
                    <div className="flex-1 rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge value={step.status} />
                            <StatusBadge value={stepState} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Responsible department: {getCurrentDepartment(step.status)}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground sm:text-right">
                          <p>{formatDateTime(step.changedAt)}</p>
                          <p className="mt-1">Updated by {step.changedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


