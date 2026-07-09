import { Fragment, useMemo, useState } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { computedBookingComparisonReport } from "@/lib/unified-order-data"
import type {
  BookingComparisonCategory,
  BookingComparisonMonthKey,
  BookingComparisonRow,
  BookingComparisonSummarySection,
} from "@/types/booking-comparison"

const monthColumns: { key: BookingComparisonMonthKey; label: string }[] = [
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
  { key: "mar", label: "Mar" },
  { key: "apr", label: "April" },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "July" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
]

type DisplayRow = BookingComparisonRow & {
  displaySerial: string
  displayBuyerName: string
}

type RowGroup = {
  serial: string
  buyerName: string
  rows: BookingComparisonRow[]
}

function formatQtyValue(value: number | null | undefined) {
  if (value == null) {
    return ""
  }

  return `${new Intl.NumberFormat("en-US").format(value)} PCS`
}

function normalizeBuyerName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function getCategoryLabel(category: BookingComparisonCategory) {
  switch (category) {
    case "cfmd_qty":
      return "CFMD Qty"
    case "initial_pre_booked_qty":
      return "Initial Pre-Booked Qty"
    case "qty_balance_to_utilize":
      return "Qty Balance to Utilize"
    default:
      return category
  }
}

function getCategoryClassName(category: BookingComparisonCategory) {
  switch (category) {
    case "cfmd_qty":
      return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200"
    case "initial_pre_booked_qty":
      return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
    case "qty_balance_to_utilize":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
  }
}

function renderStandardValue(value: number | null | undefined) {
  if (value == null) {
    return <span className="text-muted-foreground/40">-</span>
  }

  if (value === 0) {
    return <span className="text-[11px] font-semibold text-slate-500">0 PCS</span>
  }

  return (
    <span className="inline-flex rounded-lg bg-cyan-50 px-1.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">
      {formatQtyValue(value)}
    </span>
  )
}

function buildGroups(records: BookingComparisonRow[]) {
  const grouped = new Map<string, RowGroup>()

  records.forEach((record) => {
    const existing = grouped.get(record.serial)

    if (existing) {
      existing.rows.push(record)
      return
    }

    grouped.set(record.serial, {
      serial: record.serial,
      buyerName: normalizeBuyerName(record.buyerName),
      rows: [record],
    })
  })

  return Array.from(grouped.values())
}

function buildDisplayRows(groups: RowGroup[]) {
  return groups.flatMap<DisplayRow>((group, groupIndex) =>
    group.rows.map((row, rowIndex) => ({
      ...row,
      displaySerial: rowIndex === 0 ? String(groupIndex + 1) : "",
      displayBuyerName: rowIndex === 0 ? group.buyerName : "",
    }))
  )
}

function isSummaryEmphasis(label: string) {
  return /GRAND TOTAL|GRND TTL/i.test(label)
}

function getSummarySectionTitleClassName(title: string) {
  switch (title) {
    case "Initial Pre-Booked Qty":
      return "text-violet-700 dark:text-violet-300"
    case "Confirmed Qty":
      return "text-sky-700 dark:text-sky-300"
    case "Total Pre-Booking Left to Utilize":
      return "text-emerald-700 dark:text-emerald-300"
    case "Buyer/Brand Wise (Confirmed + Pre-Booked)":
      return "text-rose-700 dark:text-rose-300"
    default:
      return "text-slate-900 dark:text-slate-100"
  }
}


function SummarySectionTable({ section }: { section: BookingComparisonSummarySection }) {
  return (
    <section className="space-y-3">
      <div className="rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-sm">
        <h2 className={`text-lg text-center font-semibold tracking-tight ${getSummarySectionTitleClassName(section.title)}`}>{section.title}</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-xs text-left">
            <thead className="text-muted-foreground">
              <tr className="bg-white dark:bg-slate-950">
                <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2.5 text-left font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Summary Label
                </th>
                {monthColumns.map((month, index) => (
                  <th
                    key={month.key}
                    className={`border-b border-r border-border/80 px-2 py-2.5 text-center font-semibold ${index % 2 === 0
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                      }`}
                  >
                    {month.label}
                  </th>
                ))}
                <th className="border-b border-border/80 bg-rose-50 px-2 py-2.5 text-center font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                  Total Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => {
                const emphasized = isSummaryEmphasis(row.label)
                return (
                  <tr key={`${section.title}-${row.label}`} className={rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"}>
                    <td className={`min-w-[18rem] border-r border-b border-border/70 px-2 py-2 font-semibold ${emphasized ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"}`}>
                      {row.label}
                    </td>
                    {monthColumns.map((month) => (
                      <td key={`${section.title}-${row.label}-${month.key}`} className="min-w-[5.2rem] border-r border-b border-border/70 px-2 py-2 text-center">
                        {renderStandardValue(row.months[month.key])}
                      </td>
                    ))}
                    <td className="min-w-28 border-b border-border/70 px-2 py-2 text-center">
                      <span className={`font-bold italic ${emphasized ? "text-rose-700 dark:text-rose-300" : "text-slate-700 dark:text-slate-200"}`}>
                        {formatQtyValue(row.totalQty) || "-"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function InitialBookingCfmdBalancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Buyers")

  const groupedRows = useMemo(() => buildGroups(computedBookingComparisonReport.rows), [])

  const filterOptions = useMemo(
    () => [
      "All Buyers",
      ...groupedRows.map((group) => group.buyerName).filter((value, index, array) => array.indexOf(value) === index),
    ],
    [groupedRows]
  )

  const filteredGroups = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return groupedRows.filter((group) => {
      const matchesBuyer =
        activeFilter === "All Buyers" || normalizeBuyerName(group.buyerName) === activeFilter

      if (!matchesBuyer) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return group.rows.some((row) => {
        const monthValues = monthColumns.map((month) => formatQtyValue(row.months[month.key]) || "")
        return [
          group.buyerName,
          row.label,
          row.gauge,
          row.remarks,
          formatQtyValue(row.totalQty) || "",
          ...monthValues,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      })
    })
  }, [activeFilter, groupedRows, searchQuery])

  const displayRows = useMemo(() => buildDisplayRows(filteredGroups), [filteredGroups])

  return (
    <div className="space-y-6">
      <PageHeader title="Initial Booking + CFMD + Balance" />

      <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Management Comparison Report
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          {computedBookingComparisonReport.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {computedBookingComparisonReport.dateRange}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Updated: {computedBookingComparisonReport.updatedAt}
        </p>
      </div>

      <SearchFilterBar
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search buyer, row type, gauge, remarks, or month value"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {displayRows.length ? (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-xs text-left">
              <thead className="text-muted-foreground">
                <tr className="bg-white dark:bg-slate-950">
                  <th className="border-b border-r border-border/80 bg-violet-50 px-2 py-2.5 text-center font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">SL.</th>
                  <th className="border-b border-r border-border/80 bg-amber-50 px-2 py-2.5 text-center font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">Buyer Name</th>
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2.5 text-center font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Type</th>
                  <th className="border-b border-r border-border/80 bg-cyan-50 px-2 py-2.5 text-center font-semibold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">Gauges</th>
                  {monthColumns.map((month, index) => (
                    <th
                      key={month.key}
                      className={`border-b border-r border-border/80 px-2 py-2.5 text-center font-semibold ${index % 2 === 0
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                        }`}
                    >
                      {month.label}
                    </th>
                  ))}
                  <th className="border-b border-r border-border/80 bg-rose-50 px-2 py-2.5 text-center font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">Total Qty</th>
                  <th className="border-b border-border/80 bg-slate-100 px-2 py-2.5 text-center font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, rowIndex) => (
                  <tr key={`${row.serial}-${row.label}-${row.gauge}-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"}>
                    <td className="min-w-12 border-r border-b border-border/70 px-2 py-2 align-top">
                      {row.displaySerial ? (
                        <span className="font-bold italic text-violet-700 dark:text-violet-300">{row.displaySerial}</span>
                      ) : null}
                    </td>
                    <td className="min-w-34 border-r border-b border-border/70 px-2 py-2 align-top">
                      {row.displayBuyerName ? (
                        <span className="font-semibold text-amber-700 dark:text-amber-200">{row.displayBuyerName}</span>
                      ) : null}
                    </td>
                    <td className="min-w-36 border-r border-b border-border/70 px-2 py-2 align-top">
                      <span className={`inline-flex rounded-lg px-1.5 py-1 text-[11px] font-bold ${getCategoryClassName(row.category)}`}>
                        {getCategoryLabel(row.category)}
                      </span>
                    </td>
                    <td className="min-w-20 border-r border-b border-border/70 px-2 py-2 align-top">
                      <span className="inline-flex rounded-lg bg-cyan-100 px-1.5 py-1 text-[11px] font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200">
                        {row.gauge}
                      </span>
                    </td>
                    {monthColumns.map((month) => (
                      <td key={`${row.serial}-${row.label}-${row.gauge}-${month.key}`} className="min-w-20 border-r border-b border-border/70 px-2 py-2 text-center align-top">
                        {renderStandardValue(row.months[month.key])}
                      </td>
                    ))}
                    <td className="min-w-28 border-r border-b border-border/70 px-2 py-2 text-center align-top">
                      <span className="font-bold italic text-rose-700 dark:text-rose-300">
                        {formatQtyValue(row.totalQty) || "-"}
                      </span>
                    </td>
                    <td className="min-w-28 border-b border-border/70 px-2 py-2 align-top text-[11px] leading-5 text-muted-foreground">
                      {row.remarks || "-"} 
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No report rows found"
          description="Try another search or buyer filter to find the booking comparison rows."
        />
      )}

      {computedBookingComparisonReport.summarySections.map((section) => (
        <Fragment key={section.title}>
          <SummarySectionTable section={section} />
        </Fragment>
      ))}
    </div>
  )
}




