import { useMemo, useState } from "react"

import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { poStatusToStage } from "@/components/shared/stage-tracker"
import { getOrderDisplayNo, getOrderDisplayStyle } from "@/lib/purchase-order-table-columns"
import { useAppSelector } from "@/store/hooks"
import type { PurchaseOrder, YarnBatchInspectionStatus } from "@/types/modules"

type ReportPageProps = {
  title: string
  description?: string
}

type ManagementReportRow = PurchaseOrder & {
  materialSummary: {
    yarnKg: number
    fabricKg: number
    accessoriesQty: number
  }
  eta: string
  inspectionStatus: YarnBatchInspectionStatus | "Pending"
  progress: number
  currentStage: string
}

const progressByStatus: Record<string, number> = {
  Draft: 10,
  "Consumption Requested": 20,
  "Pending Yarn Check": 35,
  "Yarn Ordered": 50,
  "Yarn Receiving": 65,
  "Yarn Available": 75,
  "Ready for Production": 85,
  Knitting: 90,
  Linking: 94,
  Finishing: 97,
  "Finished â€“ Ready to Ship": 100,
}

function normalizeText(value: string | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("en-US").format(value ?? 0)
}

function buildCurrentStage(status: string) {
  const stage = poStatusToStage(status)
  return stage === "Shipped" ? "Shipped" : stage
}

function getProgress(status: string) {
  return progressByStatus[status] ?? 0
}

function getLatestInspectionStatusByPo(
  poId: string,
  deliveryBatches: Array<{
    poId: string
    deliveryDate: string
    inspectedAt?: string
    inspectionStatus: YarnBatchInspectionStatus
  }>
): YarnBatchInspectionStatus | "Pending" {
  const latestBatch = deliveryBatches
    .filter((batch) => batch.poId === poId)
    .sort((left, right) => {
      const leftDate = left.inspectedAt ?? left.deliveryDate
      const rightDate = right.inspectedAt ?? right.deliveryDate
      return new Date(rightDate).getTime() - new Date(leftDate).getTime()
    })[0]

  return latestBatch?.inspectionStatus ?? "Pending"
}

function selectOptions(values: string[], label: string) {
  return [label, ...Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))]
}

function ManagementPoDetailTrackerReport({ title }: ReportPageProps) {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatusFilter, setActiveStatusFilter] = useState("All Status")

  const reportRows = useMemo<ManagementReportRow[]>(
    () =>
      purchaseOrders.map((order) => ({
        ...order,
        materialSummary: {
          yarnKg: order.totalYarnKg ?? 0,
          fabricKg: order.totalFabricKg ?? 0,
          accessoriesQty: order.totalAccessoriesQty ?? 0,
        },
        eta: order.yarnEta ?? "",
        inspectionStatus: getLatestInspectionStatusByPo(order.id, deliveryBatches),
        progress: getProgress(order.status),
        currentStage: buildCurrentStage(order.status),
      })),
    [deliveryBatches, purchaseOrders]
  )

  const filterOptions = useMemo(
    () => selectOptions(reportRows.map((row) => row.status), "All Status"),
    [reportRows]
  )

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return reportRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          getOrderDisplayNo(row),
          getOrderDisplayStyle(row),
          row.styleNo,
          row.color,
          row.itemNameCode,
          row.callNumber,
        ].some((value) => normalizeText(String(value ?? "")).includes(normalizedSearch))

      if (!matchesSearch) {
        return false
      }

      if (activeStatusFilter === "All Status") {
        return true
      }

      return normalizeText(row.status) === normalizeText(activeStatusFilter)
    })
  }, [activeStatusFilter, reportRows, searchQuery])

  const columns = useMemo<DataTableColumn<ManagementReportRow>[]>(
    () => [
      {
        key: "sl",
        header: "SL",
        className: "min-w-[2.75rem] whitespace-nowrap",
        render: (row) => row.sl || "—",
      },
      {
        key: "poNumber",
        header: "PO Number",
        className: "min-w-[5.75rem]",
        render: (row) => getOrderDisplayNo(row),
      },
      {
        key: "styleName",
        header: "Style Name",
        className: "min-w-[7rem]",
        render: (row) => getOrderDisplayStyle(row),
      },
      {
        key: "styleNo",
        header: "Style Number",
        className: "min-w-[5.75rem]",
        render: (row) => row.styleNo || "—",
      },
      {
        key: "quantity",
        header: "Quantity",
        className: "min-w-[5rem]",
        render: (row) => formatNumber(row.poQty ?? row.quantity),
      },
      {
        key: "colors",
        header: "Colors",
        className: "min-w-[5.5rem]",
        render: (row) => row.color || "—",
      },
      {
        key: "ccd",
        header: "CCD",
        className: "min-w-[5.75rem]",
        render: (row) => row.ccd ?? row.deliveryDate ?? "—",
      },
      {
        key: "materialSummary",
        header: "Material Summary",
        className: "min-w-[8rem]",
        render: (row) => (
          <div className="space-y-0.5 text-[10px] leading-4">
            <p>Yarn: {formatNumber(row.materialSummary.yarnKg)} kg</p>
            <p>Fabric: {formatNumber(row.materialSummary.fabricKg)} kg</p>
            <p>Accessories: {formatNumber(row.materialSummary.accessoriesQty)} pcs</p>
          </div>
        ),
      },
      {
        key: "eta",
        header: "ETA",
        className: "min-w-[5.75rem]",
        render: (row) => row.eta || "—",
      },
      {
        key: "inspectionStatus",
        header: "Inspection Status",
        className: "min-w-[6.25rem]",
        render: (row) => <StatusBadge value={row.inspectionStatus} />,
      },
      {
        key: "ppStatus",
        header: "PP Status",
        className: "min-w-[5.75rem]",
        render: (row) => row.ppStatus ?? row.sampleStatus ?? "—",
      },
      {
        key: "shipmentSample",
        header: "Shipment Sample",
        className: "min-w-[6.25rem]",
        render: (row) => row.shipmentSample ?? row.shipMode ?? "—",
      },
      {
        key: "progress",
        header: "Progress (%)",
        className: "min-w-[6.5rem]",
        render: (row) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] font-medium">
              <span>{row.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${row.progress}%` }}
              />
            </div>
          </div>
        ),
      },
      {
        key: "currentStage",
        header: "Current Stage",
        className: "min-w-[6.5rem]",
      },
      {
        key: "status",
        header: "Status",
        className: "min-w-[6.25rem]",
        render: (row) => <StatusBadge value={row.status} />,
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title={title} />

      <SearchFilterBar
        filters={filterOptions}
        activeFilter={activeStatusFilter}
        onFilterChange={setActiveStatusFilter}
        searchPlaceholder="Search PO, style, style number, colors, item name"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredRows.length === 0 ? (
        <EmptyState
          title="No report rows found"
          description="Try another search or adjust the management filters."
        />
      ) : (
        <DataTable columns={columns} data={filteredRows} compact />
      )}
    </div>
  )
}

export function MerchandiseManagementReportPage() {
  return <ManagementPoDetailTrackerReport title="Merchandise Management Report" />
}

export function ManagementPoDetailTrackerPage() {
  return <ManagementPoDetailTrackerReport title="PO Detail Tracker" />
}
