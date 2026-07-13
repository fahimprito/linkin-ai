import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  applyMultiGroupToCapacityRows,
  buildComputedMonthlyFooter,
  monthlyConfirmedQtyReports,
} from "@/mock/monthly-confirmed-qty"
import type { CreatePurchaseOrderPayload } from "@/types/modules"
import type { MonthlyConfirmedQtyReport, MonthlyConfirmedQtyRow } from "@/types/reports"

// ── Persistence ──────────────────────────────────────────────────────

const STORAGE_KEY = "linkin-ai-admin:monthly-confirmed-po-rows"

type PersistedPoRow = {
  reportValue: string
  row: MonthlyConfirmedQtyRow
}

function loadPersistedPoRows(): PersistedPoRow[] {
  if (typeof window === "undefined") {
    return []
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored) as PersistedPoRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePersistedPoRows(rows: PersistedPoRow[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

// ── Month Mapping ────────────────────────────────────────────────────

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

function getMonthNameFromIndex(monthIndex: number) {
  return MONTH_NAMES[monthIndex] ?? "january"
}

function getReportValueFromDate(dateStr: string): string | null {
  if (!dateStr) {
    return null
  }

  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  const monthName = getMonthNameFromIndex(parsed.getMonth())
  const year = parsed.getFullYear()

  return `${monthName}-${year}`
}

function getMonthLabel(monthName: string) {
  return monthName.charAt(0).toUpperCase() + monthName.slice(1)
}

function formatProposedInspectionDate(dateStr: string): string {
  if (!dateStr) {
    return ""
  }

  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) {
    return dateStr
  }

  const day = parsed.getDate()
  const monthShort = parsed.toLocaleDateString("en-US", { month: "short" })
  const year = String(parsed.getFullYear()).slice(-2)

  return `${day}-${monthShort}-${year}`
}

// ── PO → MonthlyConfirmedQtyRow mapping ──────────────────────────────

function mapPurchaseOrderToRow(
  po: CreatePurchaseOrderPayload,
  nextSlIndex: number
): MonthlyConfirmedQtyRow {
  const quantity = po.poQty ?? po.quantity ?? 0
  const ccdDate = po.ccd ?? po.deliveryDate ?? ""

  return {
    sl: String(nextSlIndex),
    buyerName: po.buyer || "",
    styleArtOrder: po.poNumber || "",
    gg: po.gauge || "12",
    orderQty: `${new Intl.NumberFormat("en-US").format(quantity)} Pcs`,
    proposedInspectionDate: formatProposedInspectionDate(ccdDate),
    tenYarnInHouseQtyLoc: "",
    tenYarnInHouseDtMf: "",
    trimsSwingPackingEta: "",
    attachment: "",
    nylonSpanLurexElastic: "",
    prodApprovalStatus: "",
    prodStatus: "",
    projectedLocYarnProdStart: "",
    projectedImpYarnProdStart: "",
    ltForLocYarn: "",
    ltForImpYarn: "",
    yarnComposition: po.quality ?? po.yarn ?? "",
    styleDetails: po.styleName ?? po.style ?? "",
    remarks: po.remarks ?? "",
    certificate: "",
    timingMin: "",
    locMonth: "",
    impMonth: "",
    totalMinPerOrdStyle: "",
    unit: "",
  }
}

// ── Recompute footer for a report ────────────────────────────────────

function recomputeReportFooter(
  report: MonthlyConfirmedQtyReport
): MonthlyConfirmedQtyReport {
  const footer = buildComputedMonthlyFooter(report.rows)

  return {
    ...report,
    footer: {
      ...footer,
      capacityRows: applyMultiGroupToCapacityRows(
        report.rows,
        footer.capacityRows
      ),
    },
  }
}

// ── Build initial state: merge mock data + persisted PO rows ─────────

function buildInitialReports(): MonthlyConfirmedQtyReport[] {
  const baseReports = monthlyConfirmedQtyReports.map((report) => ({
    ...report,
    rows: [...report.rows],
  }))

  const persistedRows = loadPersistedPoRows()
  if (persistedRows.length === 0) {
    return baseReports
  }

  const reportMap = new Map<string, MonthlyConfirmedQtyReport>()
  baseReports.forEach((report) => {
    reportMap.set(report.value, report)
  })

  persistedRows.forEach(({ reportValue, row }) => {
    let report = reportMap.get(reportValue)

    if (!report) {
      const [month = "", year = ""] = reportValue.split("-")
      report = {
        value: reportValue,
        label: `${getMonthLabel(month)} ${year}`,
        title: `CONFIRMED QTY MONTH ${month.toUpperCase()}`,
        updatedOn: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }),
        highlightNote: "",
        rows: [],
        sourceSections: ["qty_intl", "order_summary"],
      }
      reportMap.set(reportValue, report)
    }

    report.rows.push(row)
  })

  // Recompute footers for any reports that received PO rows
  const affectedReportValues = new Set(persistedRows.map((r) => r.reportValue))
  affectedReportValues.forEach((reportValue) => {
    const report = reportMap.get(reportValue)
    if (report) {
      reportMap.set(reportValue, recomputeReportFooter(report))
    }
  })

  return Array.from(reportMap.values())
}

// ── Slice ────────────────────────────────────────────────────────────

type MonthlyConfirmedState = {
  reports: MonthlyConfirmedQtyReport[]
  poRows: PersistedPoRow[]
}

const initialPoRows = loadPersistedPoRows()

const initialState: MonthlyConfirmedState = {
  reports: buildInitialReports(),
  poRows: initialPoRows,
}

const monthlyConfirmedSlice = createSlice({
  name: "monthlyConfirmed",
  initialState,
  reducers: {
    addPoToMonthlyReport: (
      state,
      action: PayloadAction<CreatePurchaseOrderPayload>
    ) => {
      const po = action.payload
      const ccdDate = po.ccd ?? po.deliveryDate ?? ""
      const reportValue = getReportValueFromDate(ccdDate)

      if (!reportValue) {
        return
      }

      let reportIndex = state.reports.findIndex(
        (r) => r.value === reportValue
      )

      if (reportIndex === -1) {
        const [month = "", year = ""] = reportValue.split("-")
        const newReport: MonthlyConfirmedQtyReport = {
          value: reportValue,
          label: `${getMonthLabel(month)} ${year}`,
          title: `CONFIRMED QTY MONTH ${month.toUpperCase()}`,
          updatedOn: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
          highlightNote: "",
          rows: [],
          sourceSections: ["qty_intl", "order_summary"],
        }
        state.reports.push(newReport)
        reportIndex = state.reports.length - 1
      }

      const report = state.reports[reportIndex]
      const nextSlIndex = report.rows.length + 1
      const newRow = mapPurchaseOrderToRow(po, nextSlIndex)

      report.rows.push(newRow)

      // Update the updatedOn timestamp
      report.updatedOn = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })

      // Recompute footer
      const footer = buildComputedMonthlyFooter(report.rows)
      report.footer = {
        ...footer,
        capacityRows: applyMultiGroupToCapacityRows(
          report.rows,
          footer.capacityRows
        ),
      }

      // Persist the PO row
      state.poRows.push({ reportValue, row: newRow })
      savePersistedPoRows(state.poRows)
    },
  },
})

export const { addPoToMonthlyReport } = monthlyConfirmedSlice.actions
export default monthlyConfirmedSlice.reducer
