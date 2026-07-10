import { Fragment, useMemo, useState } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  getMonthlyConfirmedQtyCapacityValue,
  getMonthlyConfirmedQtyCellValue,
  getMonthlyConfirmedQtySlotValue,
  monthlyConfirmedQtyCapacityColumns,
  monthlyConfirmedQtyMainTableColumns,
  monthlyConfirmedQtyMonthOptions,
  monthlyConfirmedQtySlotWiseColumns,
} from "@/lib/monthly-confirmed-report-schema"
import { monthlyConfirmedQtyReports } from "@/mock/monthly-confirmed-qty"
import type { MonthlyConfirmedQtyRow } from "@/types/reports"

const tableColumnCount = monthlyConfirmedQtyMainTableColumns.length

type MonthlyConfirmedQtyGroup = {
  gg: string
  rows: MonthlyConfirmedQtyRow[]
  totalOrderQty: number
  totalMin: number
  averageMin: number
}

function parseNumericValue(value: string, suffix: string) {
  return Number(value.replace(/,/g, "").replace(suffix, "").trim()) || 0
}

function formatPcs(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} Pcs`
}

function formatMin(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} MIN`
}

function isNumericGg(value: string) {
  return /^\d+$/.test(value.trim())
}

function getReportParts(value: string) {
  const [month = "", year = ""] = value.split("-")
  return { month, year }
}

function pushRowToGroup(group: MonthlyConfirmedQtyGroup, row: MonthlyConfirmedQtyRow) {
  const orderQty = parseNumericValue(row.orderQty, "Pcs")
  const totalMin = parseNumericValue(row.totalMinPerOrdStyle, "MIN")

  group.rows.push(row)
  group.totalOrderQty += orderQty
  group.totalMin += totalMin
  group.averageMin = group.totalOrderQty > 0 ? Math.round(group.totalMin / group.totalOrderQty) : 0
}

function getGroupedRows(rows: MonthlyConfirmedQtyRow[]) {
  const groups: MonthlyConfirmedQtyGroup[] = []
  const groupMap = new Map<string, MonthlyConfirmedQtyGroup>()
  const pendingRows: MonthlyConfirmedQtyRow[] = []
  let currentGroup: MonthlyConfirmedQtyGroup | undefined

  rows.forEach((row) => {
    const gg = row.gg?.trim() || ""

    if (isNumericGg(gg)) {
      let targetGroup = groupMap.get(gg)

      if (!targetGroup) {
        targetGroup = {
          gg,
          rows: [],
          totalOrderQty: 0,
          totalMin: 0,
          averageMin: 0,
        }

        groups.push(targetGroup)
        groupMap.set(gg, targetGroup)
      }

      if (pendingRows.length > 0) {
        pendingRows.splice(0).forEach((pendingRow) => {
          pushRowToGroup(targetGroup!, pendingRow)
        })
      }

      pushRowToGroup(targetGroup, row)
      currentGroup = targetGroup
      return
    }

    if (currentGroup) {
      pushRowToGroup(currentGroup, row)
      return
    }

    pendingRows.push(row)
  })

  if (pendingRows.length > 0) {
    if (groups[0]) {
      pendingRows.forEach((pendingRow) => {
        pushRowToGroup(groups[0], pendingRow)
      })
    } else {
      const fallbackGroup: MonthlyConfirmedQtyGroup = {
        gg: "Other",
        rows: [],
        totalOrderQty: 0,
        totalMin: 0,
        averageMin: 0,
      }

      pendingRows.forEach((pendingRow) => {
        pushRowToGroup(fallbackGroup, pendingRow)
      })

      groups.push(fallbackGroup)
    }
  }

  return groups
}

function getSlotHeaderClassName(index: number) {
  if (index === 0) {
    return "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-bold"
  }

  if (index >= 1 && index <= 3) {
    return "border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-bold text-cyan-700"
  }

  if (index >= 4 && index <= 6) {
    return "border-b border-r border-border/80 bg-violet-50 px-2 py-2 text-center font-bold text-violet-700"
  }

  return index === monthlyConfirmedQtySlotWiseColumns.length - 1
    ? "border-b border-border/80 bg-amber-50 px-2 py-2 text-center font-bold text-amber-700"
    : "border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-bold text-amber-700"
}

function getCapacityHeaderClassName(index: number) {
  const lastIndex = monthlyConfirmedQtyCapacityColumns.length - 1

  if (index === 0 || index === lastIndex) {
    return index === 0
      ? "border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-bold"
      : "border-b border-border/80 bg-slate-100 px-2 py-2 text-center font-bold"
  }

  if (index >= 1 && index <= 4) {
    return "border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-bold text-cyan-700"
  }

  if (index === 5) {
    return "border-b border-r border-border/80 bg-violet-50 px-2 py-2 text-center font-bold text-violet-700"
  }

  if (index === 6) {
    return "border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-bold text-amber-700"
  }

  return "border-b border-r border-border/80 bg-rose-50 px-2 py-2 text-center font-bold text-rose-700"
}

export function MonthlyConfirmedQtyPage() {
  const initialReport = monthlyConfirmedQtyReports[0]
  const initialParts = getReportParts(initialReport?.value ?? "")
  const currentYear = new Date().getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(initialParts.month || monthlyConfirmedQtyMonthOptions[0].value)
  const [selectedYear, setSelectedYear] = useState(initialParts.year || String(currentYear))

  const yearOptions = useMemo(
    () => Array.from({ length: currentYear - 2000 + 1 }, (_, index) => String(2000 + index)),
    [currentYear]
  )

  const activeReport = useMemo(
    () =>
      monthlyConfirmedQtyReports.find(
        (report) => report.value === `${selectedMonth}-${selectedYear}`
      ) ?? null,
    [selectedMonth, selectedYear]
  )

  const groupedRows = useMemo(
    () => (activeReport ? getGroupedRows(activeReport.rows) : []),
    [activeReport]
  )

  const hasOrderSummarySection = Boolean(
    activeReport?.footer && (activeReport.sourceSections?.includes("order_summary") ?? true)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Month Wise Confirmed Qty"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="month-wise-confirmed-month"
                className="text-sm font-medium text-muted-foreground"
              >
                Month
              </label>
              <select
                id="month-wise-confirmed-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-11 min-w-[10rem] cursor-pointer rounded-2xl border border-border/80 bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary"
              >
                {monthlyConfirmedQtyMonthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="month-wise-confirmed-year"
                className="text-sm font-medium text-muted-foreground"
              >
                Year
              </label>
              <select
                id="month-wise-confirmed-year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="h-11 min-w-[8rem] cursor-pointer rounded-2xl border border-border/80 bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      {activeReport ? (
        <>
          <section className="overflow-hidden rounded-xl border border-border/80 bg-card p-0 shadow-sm">
            <div className="border-b border-border/80 bg-slate-50 px-4 py-4 text-center dark:bg-slate-900/80">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                    Monthly Confirmed Report
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-wide text-slate-900 dark:text-slate-100">
                    {activeReport.title}
                  </h2>
                </div>
                <div className="rounded-2xl border border-border/70 bg-white px-3 py-2 text-left shadow-sm dark:bg-slate-950">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Updated On
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeReport.updatedOn}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto px-0">
              <table className="min-w-[2200px] border-separate border-spacing-0 text-xs">
                <thead>
                  <tr className="bg-white dark:bg-slate-950">
                    {monthlyConfirmedQtyMainTableColumns.map((column) => (
                      <th key={column.key} className={column.headerClassName}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map((group) => (
                    <Fragment key={`${activeReport.value}-${group.gg}`}>
                      <tr className="bg-slate-50 dark:bg-slate-900/80">
                        <td
                          colSpan={tableColumnCount}
                          className="border-b border-border/80 px-3 py-2 text-left font-bold tracking-wide text-slate-900 dark:text-slate-100"
                        >
                          {group.gg} GG Section
                        </td>
                      </tr>
                      {group.rows.map((row, index) => (
                        <tr
                          key={`${activeReport.value}-${group.gg}-${row.sl}-${index}`}
                          className={index % 2 === 0 ? "bg-background/80" : "bg-card"}
                        >
                          {monthlyConfirmedQtyMainTableColumns.map((column) => (
                            <td key={`${activeReport.value}-${group.gg}-${row.sl}-${column.key}`} className={column.cellClassName}>
                              {getMonthlyConfirmedQtyCellValue(row, column.key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-slate-100 dark:bg-slate-900/80">
                        <td className="border-r border-b-[3px] border-border/80 px-3 py-2 font-bold text-slate-900 dark:text-slate-100" colSpan={4}>
                          {group.gg} GG Summary
                        </td>
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                          {formatPcs(group.totalOrderQty)}
                        </td>
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2" colSpan={16} />
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                          AVE MIN/GG
                        </td>
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2" colSpan={2} />
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                          {formatMin(group.totalMin)}
                        </td>
                        <td className="border-b-[3px] border-border/80 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                          {group.averageMin} MIN
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {hasOrderSummarySection ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border/80 bg-background">
                <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-xs">
                  <thead>
                    <tr>
                      <th
                        colSpan={monthlyConfirmedQtySlotWiseColumns.length}
                        className="border-b border-border/80 bg-slate-100 px-4 py-3 text-center text-sm font-black tracking-wide text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {activeReport.footer?.slotWiseTitle || "SLOT WISE CFMD ORDER QTY + TOTAL MINUTES"}
                      </th>
                    </tr>
                    <tr className="bg-white dark:bg-slate-950">
                      {monthlyConfirmedQtySlotWiseColumns.map((column, index) => (
                        <th key={`${column.key}-${index}`} className={getSlotHeaderClassName(index)}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.footer?.slotWiseRows.map((row, index) => (
                      <tr key={`${activeReport.value}-slot-${row.gg}-${index}`} className={index % 2 === 0 ? "bg-background" : "bg-slate-50/70 dark:bg-slate-900/30"}>
                        {monthlyConfirmedQtySlotWiseColumns.map((column, columnIndex) => (
                          <td
                            key={`${activeReport.value}-slot-${row.gg}-${column.key}-${columnIndex}`}
                            className={columnIndex === monthlyConfirmedQtySlotWiseColumns.length - 1
                              ? "border-b border-border/70 px-2 py-2 text-center font-semibold"
                              : "border-r border-b border-border/70 px-2 py-2 text-center font-semibold"}
                          >
                            {getMonthlyConfirmedQtySlotValue(row, column.key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {activeReport.footer?.slotWiseTotals ? (
                      <tr className="bg-slate-100 dark:bg-slate-900/80">
                        <td className="border-r border-border/80 px-2 py-2 text-center font-black" colSpan={4}>
                          Total Qty: {activeReport.footer.slotWiseTotals.totalQty || "-"}
                        </td>
                        <td className="border-border/80 px-2 py-2 text-center font-black" colSpan={6}>
                          Total Minute: {activeReport.footer.slotWiseTotals.totalMin || "-"}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="overflow-x-auto rounded-2xl border border-border/80 bg-background">
                  <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-xs">
                    <thead>
                      <tr>
                        <th colSpan={monthlyConfirmedQtyCapacityColumns.length} className="border-b border-border/80 bg-slate-100 px-4 py-3 text-center text-sm font-black tracking-wide text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                          GG / Qty Wise Capacity Per Month
                        </th>
                      </tr>
                      <tr className="bg-white dark:bg-slate-950">
                        {monthlyConfirmedQtyCapacityColumns.map((column, index) => (
                          <th key={`${column.key}-${index}`} className={getCapacityHeaderClassName(index)}>
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeReport.footer?.capacityRows.map((row, index) => (
                        <tr key={`${activeReport.value}-capacity-${row.gg}-${index}`} className={index % 2 === 0 ? "bg-background" : "bg-slate-50/70 dark:bg-slate-900/30"}>
                          {!row.hideGroupedSummaryCells ? (
                            <>
                              <td className="border-r border-b border-border/70 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100" rowSpan={row.rowSpan ?? 1}>
                                {row.gg === "5" && row.groupLabel === "MULTI" ? "MUL" : row.gg}
                              </td>
                              <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold" rowSpan={row.rowSpan ?? 1}>
                                {row.qtyCapacity}
                              </td>
                            </>
                          ) : null}
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">{row.gg}</td>
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold">{row.orderReceivedQty}</td>
                          {!row.hideCombinedOrderQty ? (
                            <td className="border-r border-b border-border/70 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100" rowSpan={row.rowSpan ?? 1}>
                              {row.combinedOrderReceivedQty || row.orderReceivedQty}
                            </td>
                          ) : null}
                          {!row.hideGroupedSummaryCells ? (
                            <>
                              <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold" rowSpan={row.rowSpan ?? 1}>
                                {getMonthlyConfirmedQtyCapacityValue(row, "totalOrdersMinute")}
                              </td>
                              <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold" rowSpan={row.rowSpan ?? 1}>
                                {getMonthlyConfirmedQtyCapacityValue(row, "monthlyCapacity")}
                              </td>
                              <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold" rowSpan={row.rowSpan ?? 1}>
                                {getMonthlyConfirmedQtyCapacityValue(row, "balanceCapacity")}
                              </td>
                              <td className="border-b border-border/70 px-2 py-2 text-center font-semibold" rowSpan={row.rowSpan ?? 1}>
                                {getMonthlyConfirmedQtyCapacityValue(row, "groupLabel")}
                              </td>
                            </>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeReport.footer?.preBookingLeftRows?.length ? (
                  <div className="rounded-2xl border border-border/80 bg-background p-4">
                    <h3 className="border-b border-border/80 pb-3 text-center text-sm font-black tracking-wide text-slate-900 dark:text-slate-100">
                      Pre-Booked Qty Left To Utilize
                    </h3>
                    <div className="mt-3 space-y-3">
                      {activeReport.footer.preBookingLeftRows.map((row, index) => (
                        <div key={`${activeReport.value}-left-${row.label}-${index}`} className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3 dark:bg-slate-900/40">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                            {row.label}
                          </p>
                          <p className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
                            {row.qty}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No month report found"
          description={`No confirmed quantity report is available for ${selectedMonth.charAt(0).toUpperCase()}${selectedMonth.slice(1)} ${selectedYear}.`}
        />
      )}
    </div>
  )
}
