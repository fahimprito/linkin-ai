import { Fragment, useMemo, useState } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { monthlyConfirmedQtyReports } from "@/mock/monthly-confirmed-qty"
import type { MonthlyConfirmedQtyRow } from "@/types/reports"

const tableColumnCount = 26

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

function getGroupedRows(rows: MonthlyConfirmedQtyRow[]) {
  const groups = new Map<string, MonthlyConfirmedQtyGroup>()

  rows.forEach((row) => {
    const key = row.gg || "N/A"
    const current = groups.get(key)
    const orderQty = parseNumericValue(row.orderQty, "Pcs")
    const totalMin = parseNumericValue(row.totalMinPerOrdStyle, "MIN")

    if (current) {
      current.rows.push(row)
      current.totalOrderQty += orderQty
      current.totalMin += totalMin
      current.averageMin = current.totalOrderQty > 0 ? Math.round(current.totalMin / current.totalOrderQty) : 0
      return
    }

    groups.set(key, {
      gg: key,
      rows: [row],
      totalOrderQty: orderQty,
      totalMin,
      averageMin: orderQty > 0 ? Math.round(totalMin / orderQty) : 0,
    })
  })

  return Array.from(groups.values())
}

export function MonthlyConfirmedQtyPage() {
  const [selectedMonth, setSelectedMonth] = useState(monthlyConfirmedQtyReports[0]?.value ?? "")

  const activeReport = useMemo(
    () =>
      monthlyConfirmedQtyReports.find((report) => report.value === selectedMonth) ??
      monthlyConfirmedQtyReports[0],
    [selectedMonth]
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
          <div className="flex items-center gap-2">
            <label htmlFor="month-wise-confirmed-select" className="text-sm font-medium text-muted-foreground">
              Select Month
            </label>
            <select
              id="month-wise-confirmed-select"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-11 min-w-[11rem] cursor-pointer rounded-2xl border border-border/80 bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary"
            >
              {monthlyConfirmedQtyReports.map((report) => (
                <option key={report.value} value={report.value}>
                  {report.label}
                </option>
              ))}
            </select>
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
          description="Add a month dataset to start showing month-wise confirmed quantity tracking."
        />
      )}
    </div>
  )
}
