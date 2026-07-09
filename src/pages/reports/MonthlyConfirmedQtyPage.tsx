import { Fragment, useMemo, useState } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { monthlyConfirmedQtyReports } from "@/mock/monthly-confirmed-qty"
import type { MonthlyConfirmedQtyRow } from "@/types/reports"

const tableColumnCount = 26
const monthOptions = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
] as const

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

export function MonthlyConfirmedQtyPage() {
  const initialReport = monthlyConfirmedQtyReports[0]
  const initialParts = getReportParts(initialReport?.value ?? "")
  const currentYear = new Date().getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(initialParts.month || monthOptions[0].value)
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
                {monthOptions.map((month) => (
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
        <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/80 bg-slate-50 px-4 py-4 text-center dark:bg-slate-900/80">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Monthly Confirmed Report
                </p>
                <h2 className="mt-1 text-xl font-black tracking-wide text-slate-900 dark:text-slate-100">
                  {activeReport.title}
                </h2>
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {activeReport.highlightNote}
                </p>
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

          <div className="overflow-x-auto">
            <table className="min-w-[2200px] border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-white dark:bg-slate-950">
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">SL</th>
                  <th className="border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">BYR NAME</th>
                  <th className="border-b border-r border-border/80 bg-sky-50 px-2 py-2 text-center font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">STY/ART/ORD#</th>
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">GG</th>
                  <th className="border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">ORDER QTY</th>
                  <th className="border-b border-r border-border/80 bg-indigo-50 px-2 py-2 text-center font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200">PRPSED INSP DT</th>
                  <th className="border-b border-r border-border/80 bg-emerald-50 px-2 py-2 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">TEN.YRN IN-HOUSE QTY LOC</th>
                  <th className="border-b border-r border-border/80 bg-emerald-50 px-2 py-2 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">TEN YRN IN-HOUSE DT/MF</th>
                  <th className="border-b border-r border-border/80 bg-emerald-50 px-2 py-2 text-center font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">TEN. TRMS/SWN G+PCKING ETA</th>
                  <th className="border-b border-r border-border/80 bg-violet-50 px-2 py-2 text-center font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-200">ATTACHMENT</th>
                  <th className="border-b border-r border-border/80 bg-violet-50 px-2 py-2 text-center font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-200">NYL-SPAN/LUREX/NYL/ELASTIC</th>
                  <th className="border-b border-r border-border/80 bg-lime-50 px-2 py-2 text-center font-semibold text-lime-700 dark:bg-lime-950/30 dark:text-lime-200">PROD APPROVAL STATUS</th>
                  <th className="border-b border-r border-border/80 bg-lime-50 px-2 py-2 text-center font-semibold text-lime-700 dark:bg-lime-950/30 dark:text-lime-200">PROD STATUS</th>
                  <th className="border-b border-r border-border/80 bg-orange-50 px-2 py-2 text-center font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">PROJECTED LOC YRN PROD. STT APPX</th>
                  <th className="border-b border-r border-border/80 bg-orange-50 px-2 py-2 text-center font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">PROJECTED IMP YRN PROD. STT APPX</th>
                  <th className="border-b border-r border-border/80 bg-rose-50 px-2 py-2 text-center font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">LT FOR LOC YRN</th>
                  <th className="border-b border-r border-border/80 bg-rose-50 px-2 py-2 text-center font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">LT FOR IMP YRN</th>
                  <th className="border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">YARN COMPOSITION</th>
                  <th className="border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">STYLE DETAILS</th>
                  <th className="border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">REMARKS</th>
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">CRTFCTE</th>
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">TIMING</th>
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">LOC</th>
                  <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">IMP</th>
                  <th className="border-b border-r border-border/80 bg-fuchsia-50 px-2 py-2 text-center font-semibold text-fuchsia-700 dark:bg-fuchsia-950/30 dark:text-fuchsia-200">TOTAL MIN PER ORD/STY</th>
                  <th className="border-b border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">UNIT</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((group) => (
                  <Fragment key={`${activeReport.value}-${group.gg}`}>
                    <tr className="bg-slate-50 dark:bg-slate-900/80">
                      <td colSpan={tableColumnCount} className="border-b border-border/80 px-3 py-2 text-left font-bold tracking-wide text-slate-900 dark:text-slate-100">
                        {group.gg} GG Section
                      </td>
                    </tr>
                    {group.rows.map((row, index) => (
                      <tr key={`${activeReport.value}-${group.gg}-${row.sl}-${index}`} className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-violet-700 dark:text-violet-300">{row.sl}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 font-medium text-slate-900 dark:text-slate-100">{row.buyerName}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 font-medium text-slate-900 dark:text-slate-100">{row.styleArtOrder || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.gg}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.orderQty}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.proposedInspectionDate}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.tenYarnInHouseQtyLoc || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.tenYarnInHouseDtMf || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.trimsSwingPackingEta || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.attachment || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.nylonSpanLurexElastic || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.prodApprovalStatus || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.prodStatus || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.projectedLocYarnProdStart || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.projectedImpYarnProdStart || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.ltForLocYarn || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.ltForImpYarn || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.yarnComposition || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.styleDetails || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.remarks || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.certificate || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.timingMin}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.locMonth || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">{row.impMonth || "-"}</td>
                        <td className="border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">{row.totalMinPerOrdStyle}</td>
                        <td className="border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{row.unit || "-"}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 dark:bg-slate-900/80">
                      <td colSpan={4} className="border-r border-b-[3px] border-border/80 px-3 py-2 font-bold text-slate-900 dark:text-slate-100">
                        {group.gg} GG Summary
                      </td>
                      <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                        {formatPcs(group.totalOrderQty)}
                      </td>
                      <td colSpan={16} className="border-r border-b-[3px] border-border/80 px-2 py-2" />
                      <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                        AVE MIN/GG
                      </td>
                      <td colSpan={2} className="border-r border-b-[3px] border-border/80 px-2 py-2" />
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
      ) : (
        <EmptyState
          title="No month report found"
          description={`No confirmed quantity report is available for ${selectedMonth.charAt(0).toUpperCase()}${selectedMonth.slice(1)} ${selectedYear}.`}
        />
      )}
    </div>
  )
}
