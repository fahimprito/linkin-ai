/**
 * Unified Order Data
 *
 * Central computation module that derives data for the Order Summary
 * and Initial Booking + CFMD + Balance pages from the Monthly Confirmed
 * Qty reports (single source of truth).
 *
 * Data flow:
 *   Monthly Confirmed Qty (base reports)
 *     └─► aggregate by buyer + month  → Order Summary buyer-wise table
 *     └─► aggregate by GG + month     → Order Summary month/gauge table
 *     └─► aggregate totals per month  → Order Summary monthly status table
 *     └─► combine with pre-booking    → Initial Booking comparison rows + summaries
 */

import {
  baseMonthlyConfirmedQtyReports,
  monthlyConfirmedQtyCapacityConfig,
} from "@/mock/monthly-confirmed-qty"
import {
  resolveBookingBuyer,
  resolveOrderSummaryBuyer,
  orderSummaryBuyerColorMap,
} from "@/lib/buyer-mapping"
import {
  monthKeys,
  monthNameToKey,
  monthKeyToReportMonth,
  preBookingTargets,
  type MonthKey,
} from "@/lib/pre-booking-config"
import type {
  BookingComparisonCategory,
  BookingComparisonMonths,
  BookingComparisonReport,
  BookingComparisonRow,
  BookingComparisonSummarySection,
} from "@/types/booking-comparison"
import type {
  ReportMonth,
  OrderSummaryMetricRow,
  BuyerWiseOrderSummaryRow,
  BuyerWiseOrderSummaryFooterRow,
  OrderSummaryMonthlyStatusRow,
  OrderSummaryMonthlyStatusCapacityRow,
} from "@/types/order-summary"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseQtyValue(value: string, suffix: string): number {
  return Number(value.replace(/,/g, "").replace(suffix, "").trim()) || 0
}

function formatPcs(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} PCS`
}

function formatMin(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} Min`
}

function isNumericGg(value: string): boolean {
  return /^\d+$/.test(value.trim())
}

function getGgGroup(gg: string): "multi" | "3" | "9" | "12" {
  const trimmed = gg.trim()
  if (trimmed === "3") return "3"
  if (trimmed === "5" || trimmed === "7") return "multi"
  if (trimmed === "9") return "9"
  if (trimmed === "12") return "12"
  return "multi" // fallback
}

function getGaugeCategory(gg: string): "3/5/7 GG" | "9/12 GG" {
  const trimmed = gg.trim()
  if (trimmed === "3" || trimmed === "5" || trimmed === "7") return "3/5/7 GG"
  return "9/12 GG"
}

// ---------------------------------------------------------------------------
// Step 1: Aggregate all monthly confirmed rows across all months
// ---------------------------------------------------------------------------

type MonthlyAggregation = {
  /** Keyed by Order Summary buyer name, then by MonthKey */
  byBuyer: Map<string, Map<MonthKey, { qty: number; min: number }>>
  /** Keyed by GG group label, then by MonthKey */
  byGg: Map<string, Map<MonthKey, { qty: number; min: number }>>
  /** Totals per month */
  totalsByMonth: Map<MonthKey, { qty: number; min: number }>
  /** By booking-comparison buyer, then gauge, then month */
  byBookingBuyer: Map<string, Map<string, Map<MonthKey, number>>>
}

function aggregateAllMonths(): MonthlyAggregation {
  const byBuyer = new Map<string, Map<MonthKey, { qty: number; min: number }>>()
  const byGg = new Map<string, Map<MonthKey, { qty: number; min: number }>>()
  const totalsByMonth = new Map<MonthKey, { qty: number; min: number }>()
  const byBookingBuyer = new Map<string, Map<string, Map<MonthKey, number>>>()

  for (const report of baseMonthlyConfirmedQtyReports) {
    // Extract month key from report value (e.g. "january-2026" → "jan")
    const [monthName] = report.value.split("-")
    const monthKey = monthNameToKey[monthName]
    if (!monthKey) continue

    for (const row of report.rows) {
      if (!isNumericGg(row.gg)) continue

      const qty = parseQtyValue(row.orderQty, "Pcs")
      const min = parseQtyValue(row.totalMinPerOrdStyle, "MIN")

      // ── Buyer aggregation (for Order Summary buyer-wise table) ──
      const osBuyer = resolveOrderSummaryBuyer(row.buyerName)
      if (!byBuyer.has(osBuyer)) byBuyer.set(osBuyer, new Map())
      const buyerMonths = byBuyer.get(osBuyer)!
      const existing = buyerMonths.get(monthKey) ?? { qty: 0, min: 0 }
      existing.qty += qty
      existing.min += min
      buyerMonths.set(monthKey, existing)

      // ── GG aggregation (for Order Summary month/gauge table) ──
      const ggGroup = getGgGroup(row.gg)
      if (!byGg.has(ggGroup)) byGg.set(ggGroup, new Map())
      const ggMonths = byGg.get(ggGroup)!
      const ggExisting = ggMonths.get(monthKey) ?? { qty: 0, min: 0 }
      ggExisting.qty += qty
      ggExisting.min += min
      ggMonths.set(monthKey, ggExisting)

      // ── Totals per month ──
      const monthTotal = totalsByMonth.get(monthKey) ?? { qty: 0, min: 0 }
      monthTotal.qty += qty
      monthTotal.min += min
      totalsByMonth.set(monthKey, monthTotal)

      // ── Booking-comparison aggregation (buyer → gauge → month) ──
      const bookingBuyer = resolveBookingBuyer(osBuyer)
      const gaugeCategory = getGaugeCategory(row.gg)
      if (!byBookingBuyer.has(bookingBuyer)) byBookingBuyer.set(bookingBuyer, new Map())
      const gaugeMap = byBookingBuyer.get(bookingBuyer)!
      if (!gaugeMap.has(gaugeCategory)) gaugeMap.set(gaugeCategory, new Map())
      const gaugeMonths = gaugeMap.get(gaugeCategory)!
      gaugeMonths.set(monthKey, (gaugeMonths.get(monthKey) ?? 0) + qty)
    }
  }

  return { byBuyer, byGg, totalsByMonth, byBookingBuyer }
}

// Run aggregation once at module load
const aggregation = aggregateAllMonths()

// ---------------------------------------------------------------------------
// Step 2: Build Order Summary — Month/Gauge Table Rows
// ---------------------------------------------------------------------------

function buildMonthGaugeRows(): OrderSummaryMetricRow[] {
  const ggGroupOrder: { key: string; label: string }[] = [
    { key: "3", label: "3 GG + Multi" },
    { key: "multi", label: "Multi (5+7)" },
    { key: "9", label: "9 GG" },
    { key: "12", label: "12 GG" },
  ]

  const rows: OrderSummaryMetricRow[] = []

  for (const { key, label } of ggGroupOrder) {
    const monthData = aggregation.byGg.get(key)
    let yearlyQty = 0
    let yearlyMin = 0

    const qtyMonths: Partial<Record<ReportMonth, string>> = {}
    const minMonths: Partial<Record<ReportMonth, string>> = {}
    const avgMonths: Partial<Record<ReportMonth, string>> = {}

    for (const mk of monthKeys) {
      const rm = monthKeyToReportMonth[mk] as ReportMonth
      const data = monthData?.get(mk) ?? { qty: 0, min: 0 }
      yearlyQty += data.qty
      yearlyMin += data.min

      qtyMonths[rm] = `${data.qty.toLocaleString("en-US")} PCS`
      minMonths[rm] = `${data.min.toLocaleString("en-US")} Min`
      avgMonths[rm] = data.qty > 0 ? `${Math.round(data.min / data.qty)} Min` : "#DIV/0!"
    }

    const yearlyAvg = yearlyQty > 0 ? `${Math.round(yearlyMin / yearlyQty)} Min` : "#DIV/0!"

    rows.push(
      {
        label: `${label} Qty/Month`,
        type: "qty",
        months: qtyMonths,
        yearlyTotal: `${yearlyQty.toLocaleString("en-US")} PCS`,
        yearlyAverage: yearlyAvg,
        highlightMonths: ["Jun", "July"],
      },
      {
        label: "Min Per Month",
        type: "min",
        months: minMonths,
        yearlyTotal: `${yearlyMin.toLocaleString("en-US")} Min`,
        highlightMonths: ["Jun", "July"],
      },
      {
        label: "GG Wise Ave. Min/Month",
        type: "avg",
        months: avgMonths,
        highlightMonths: ["Jun", "July"],
      }
    )
  }

  // Grand totals
  let grandYearlyQty = 0
  let grandYearlyMin = 0
  const ttlQtyMonths: Partial<Record<ReportMonth, string>> = {}
  const ttlMinMonths: Partial<Record<ReportMonth, string>> = {}
  const ttlAvgMonths: Partial<Record<ReportMonth, string>> = {}

  for (const mk of monthKeys) {
    const rm = monthKeyToReportMonth[mk] as ReportMonth
    const data = aggregation.totalsByMonth.get(mk) ?? { qty: 0, min: 0 }
    grandYearlyQty += data.qty
    grandYearlyMin += data.min

    ttlQtyMonths[rm] = `${data.qty.toLocaleString("en-US")} PCS`
    ttlMinMonths[rm] = `${data.min.toLocaleString("en-US")} Min`
    ttlAvgMonths[rm] = data.qty > 0 ? `${Math.round(data.min / data.qty)} Min` : "#DIV/0!"
  }

  rows.push(
    {
      label: "TTL Qty/Month",
      type: "qty",
      months: ttlQtyMonths,
      yearlyTotal: `${grandYearlyQty.toLocaleString("en-US")} PCS`,
      yearlyAverage: grandYearlyQty > 0 ? `${Math.round(grandYearlyMin / grandYearlyQty)} Min` : "#DIV/0!",
      highlightMonths: ["Jun", "July"],
    },
    {
      label: "TTL Min/Month",
      type: "min",
      months: ttlMinMonths,
      yearlyTotal: `${grandYearlyMin.toLocaleString("en-US")} Min`,
      highlightMonths: ["Jun", "July"],
    },
    {
      label: "Ave. Min/Month",
      type: "avg",
      months: ttlAvgMonths,
      highlightMonths: ["Jun", "July"],
    }
  )

  return rows
}

// ---------------------------------------------------------------------------
// Step 3: Build Order Summary — Buyer-Wise Table Rows
// ---------------------------------------------------------------------------

/** Canonical buyer display order — buyers with data appear in this order */
const buyerDisplayOrder = [
  "J&J (ORIGINALS+CORE) (IMTIAJ)",
  "J&J (PREMIUM) (SHUPNIL/RIYADH)",
  "J&J INITIAL PRE-BOOKING (KAMRUL)",
  "JJXX (ATIQ)",
  "J&J (ESS & ESS INDIA) (MUSHFIQ)",
  "J&J (PRE-COLL+COLL+O/LET+INDIA) (ZIA/RUSSEL)",
  "J&J (REBEL+PRODUKT) (SHAZAL/MAHFUZ)",
  "VEROMODA (SHAZAL/MAHFUZ)",
  "OBJECT (FAROUK/PARVEJ)",
  "SELECTED (INDIA+O/LET) (FAROUK/PARVEJ)",
  "TERRANOVA (FAROUK/PARVEJ)",
  "SCROLL (FAROUK/PARVEJ)",
  "ELCORTE (LITON NAG/EMDAD)",
  "ONLY+ONLY & SONS (UZZAL/RAIHANUR)",
  "ONLY INITIAL PRE-BOOKING (UZZAL)",
  "KARIBAN (ARNOB)",
  "CONTEMPO (ARNOB)",
  "MGF (LANE BRYANT) (ARNOB)",
  "ARETEX (FAISAL/SAAD)",
  "R BRAND (FAISAL/SAAD)",
  "BUGATTI (MAHMUD)",
  "COLOMBUS (MAHMUD)",
  "CELIO (FAKRUL/TOMAL)",
  "GMS (FAKRUL/TOMAL)",
]

function buildBuyerWiseRows(): BuyerWiseOrderSummaryRow[] {
  const rows: BuyerWiseOrderSummaryRow[] = []
  let serial = 1

  // Build rows for all known buyers (ordered), plus any unexpected ones at the end
  const processedBuyers = new Set<string>()
  const allBuyers = [...buyerDisplayOrder, ...Array.from(aggregation.byBuyer.keys()).filter(b => !buyerDisplayOrder.includes(b))]

  for (const buyerName of allBuyers) {
    if (processedBuyers.has(buyerName)) continue
    processedBuyers.add(buyerName)

    const monthData = aggregation.byBuyer.get(buyerName)
    if (!monthData) continue // skip buyers with no data

    let yearlyQty = 0
    let yearlyMin = 0
    const months: Partial<Record<ReportMonth, { qty?: string; min?: string }>> = {}

    for (const mk of monthKeys) {
      const rm = monthKeyToReportMonth[mk] as ReportMonth
      const data = monthData.get(mk)
      if (data && (data.qty > 0 || data.min > 0)) {
        months[rm] = {
          qty: `${data.qty} PCS`,
          min: `${data.min} Min`,
        }
        yearlyQty += data.qty
        yearlyMin += data.min
      }
    }

    const yearlyAvg = yearlyQty > 0 ? `${Math.round(yearlyMin / yearlyQty)} Min` : "#DIV/0!"

    rows.push({
      serial: String(serial++),
      buyerName,
      buyerCellClassName: orderSummaryBuyerColorMap[buyerName] ?? "bg-slate-200/90 dark:bg-slate-800/80",
      months,
      yearlyQty: `${yearlyQty} PCS`,
      yearlyMin: `${yearlyMin} Min`,
      yearlyAverage: yearlyAvg,
    })
  }

  return rows
}

function buildBuyerWiseFooterRows(): BuyerWiseOrderSummaryFooterRow[] {
  const ttlQty: Partial<Record<ReportMonth, string>> = {}
  const ttlMin: Partial<Record<ReportMonth, string>> = {}
  const ttlAvg: Partial<Record<ReportMonth, string>> = {}
  let grandQty = 0
  let grandMin = 0

  for (const mk of monthKeys) {
    const rm = monthKeyToReportMonth[mk] as ReportMonth
    const data = aggregation.totalsByMonth.get(mk) ?? { qty: 0, min: 0 }
    grandQty += data.qty
    grandMin += data.min
    ttlQty[rm] = `${data.qty} PCS`
    ttlMin[rm] = `${data.min} Min`
    ttlAvg[rm] = data.qty > 0 ? `${Math.round(data.min / data.qty)} Min` : "#DIV/0!"
  }

  const dznTotal = Math.round(grandQty / 12)

  return [
    {
      label: "TTL QTY/MONTH",
      months: ttlQty,
      yearlyTotal: `${grandQty} PCS`,
      highlightMonths: ["Jun", "July"],
    },
    {
      label: "TTL MIN/MONTH",
      months: ttlMin,
      yearlyTotal: `${grandMin} Min`,
      yearlyAverage: grandQty > 0 ? `${Math.round(grandMin / grandQty)} Min` : "",
      highlightMonths: ["Jun", "July"],
    },
    {
      label: "AVE. MIN/MONTH",
      months: ttlAvg,
      yearlyTotal: `${dznTotal} DZN`,
      highlightMonths: ["Jun", "July"],
    },
  ]
}

// ---------------------------------------------------------------------------
// Step 4: Build Order Summary — Monthly Status Table
// ---------------------------------------------------------------------------

function buildMonthlyStatusCapacities(): OrderSummaryMonthlyStatusCapacityRow[] {
  const capacities = [
    { label: "3", ...monthlyConfirmedQtyCapacityConfig["3"] },
    { label: "MUL", ...monthlyConfirmedQtyCapacityConfig["5"] },
    { label: "9", ...monthlyConfirmedQtyCapacityConfig["9"] },
    { label: "12", ...monthlyConfirmedQtyCapacityConfig["12"] },
  ]

  const totalCapacity = capacities.reduce((s, c) => s + (c.monthlyCapacity ?? 0), 0)
  const totalQtyCapacity = capacities.reduce((s, c) => s + (c.qtyCapacity ?? 0), 0)

  return [
    ...capacities.map(c => ({
      label: c.label,
      monthlyCapacity: `${(c.monthlyCapacity ?? 0).toLocaleString("en-US")} Min`,
      qtyCapacity: `${(c.qtyCapacity ?? 0).toLocaleString("en-US")} Pcs`,
    })),
    {
      label: "G.T",
      monthlyCapacity: `${totalCapacity.toLocaleString("en-US")} Min`,
      qtyCapacity: `${totalQtyCapacity.toLocaleString("en-US")} Pcs`,
    },
  ]
}

function buildMonthlyStatusRows(): OrderSummaryMonthlyStatusRow[] {
  const monthLabels = [
    "January", "February", "March", "April", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const totalCapacity = Object.values(monthlyConfirmedQtyCapacityConfig).reduce(
    (s, c) => s + c.monthlyCapacity, 0
  )

  return monthKeys.map((mk, index) => {
    const data = aggregation.totalsByMonth.get(mk) ?? { qty: 0, min: 0 }
    const leftOver = data.min - totalCapacity

    return {
      serial: String(index + 1),
      month: monthLabels[index],
      totalQty: formatPcs(data.qty),
      totalMin: formatMin(data.min),
      leftOverMin: `${leftOver >= 0 ? "" : "-"}${Math.abs(leftOver).toLocaleString("en-US")} Min`,
      highlight: mk === "jun" || mk === "jul",
    }
  })
}

function buildMonthlyStatusTotals(): { totalQty: string; totalMin: string } {
  let grandQty = 0
  let grandMin = 0
  for (const mk of monthKeys) {
    const data = aggregation.totalsByMonth.get(mk) ?? { qty: 0, min: 0 }
    grandQty += data.qty
    grandMin += data.min
  }
  return {
    totalQty: formatPcs(grandQty),
    totalMin: formatMin(grandMin),
  }
}

// ---------------------------------------------------------------------------
// Step 5: Build Initial Booking + CFMD + Balance Report
// ---------------------------------------------------------------------------

function buildBookingComparisonRows(): BookingComparisonRow[] {
  const rows: BookingComparisonRow[] = []

  // Collect all unique buyer serials from pre-booking targets
  const buyerSerials = new Map<string, string>()
  preBookingTargets.forEach(target => {
    if (!buyerSerials.has(target.buyerName)) {
      buyerSerials.set(target.buyerName, target.serial)
    }
  })

  // Also add buyers that have confirmed data but no pre-booking target
  const bookingBuyerNames = Array.from(aggregation.byBookingBuyer.keys())
  let nextSerial = Math.max(...Array.from(buyerSerials.values()).map(Number).filter(n => !isNaN(n)), 0) + 1
  for (const bn of bookingBuyerNames) {
    if (!buyerSerials.has(bn)) {
      buyerSerials.set(bn, String(nextSerial++))
    }
  }

  // For each buyer, build cfmd + pre-booked + balance rows
  const gauges = ["3/5/7 GG", "9/12 GG"]

  for (const [buyerName, serial] of buyerSerials) {
    for (const gauge of gauges) {
      // ── CFMD QTY ──
      const confirmedMonths = aggregation.byBookingBuyer.get(buyerName)?.get(gauge)
      const cfmdMonths: BookingComparisonMonths = { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null }
      let cfmdTotal = 0

      if (confirmedMonths) {
        for (const mk of monthKeys) {
          const val = confirmedMonths.get(mk) ?? null
          cfmdMonths[mk] = val
          if (val) cfmdTotal += val
        }
      }

      if (cfmdTotal > 0 || confirmedMonths) {
        rows.push({
          serial,
          buyerName,
          label: `${buyerName} CFMD QTY`,
          category: "cfmd_qty" as BookingComparisonCategory,
          gauge,
          totalQty: cfmdTotal,
          remarks: "",
          months: cfmdMonths,
        })
      }

      // ── INITIAL PRE-BOOKED QTY ──
      const preBooking = preBookingTargets.find(
        t => t.buyerName === buyerName && t.gauge === gauge
      )
      if (preBooking) {
        rows.push({
          serial,
          buyerName: "INITIAL PRE-BOOKED QTY",
          label: "INITIAL PRE-BOOKED QTY",
          category: "initial_pre_booked_qty" as BookingComparisonCategory,
          gauge,
          totalQty: preBooking.totalQty,
          remarks: "",
          months: { ...preBooking.months },
        })

        // ── QTY BALANCE TO UTILIZE ──
        const balanceMonths: BookingComparisonMonths = { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null }
        let balanceTotal = 0
        let runningBalance = 0

        for (const mk of monthKeys) {
          const preBooked = preBooking.months[mk] ?? 0
          const confirmed = cfmdMonths[mk] ?? 0
          runningBalance += preBooked - confirmed

          if (preBooked > 0 || confirmed > 0) {
            const balance = Math.max(runningBalance, 0)
            balanceMonths[mk] = balance
            balanceTotal += balance
            runningBalance = balance > 0 ? balance : runningBalance
          }
        }

        rows.push({
          serial,
          buyerName: "QTY BALANCE TO UTILIZE",
          label: "QTY BALANCE TO UTILIZE",
          category: "qty_balance_to_utilize" as BookingComparisonCategory,
          gauge,
          totalQty: Math.max(preBooking.totalQty - cfmdTotal, 0),
          remarks: "",
          months: balanceMonths,
        })
      }
    }
  }

  return rows
}

function buildBookingSummarySections(): BookingComparisonSummarySection[] {
  // Aggregate confirmed qty by gauge across all booking buyers
  const cfmd357 = new Map<MonthKey, number>()
  const cfmd912 = new Map<MonthKey, number>()

  for (const [, gaugeMap] of aggregation.byBookingBuyer) {
    for (const [gauge, monthMap] of gaugeMap) {
      const target = gauge === "3/5/7 GG" ? cfmd357 : cfmd912
      for (const [mk, qty] of monthMap) {
        target.set(mk, (target.get(mk) ?? 0) + qty)
      }
    }
  }

  // Pre-booking totals by gauge
  const prebook357 = new Map<MonthKey, number>()
  const prebook912 = new Map<MonthKey, number>()

  for (const target of preBookingTargets) {
    const dest = target.gauge === "3/5/7 GG" ? prebook357 : prebook912
    for (const mk of monthKeys) {
      const val = target.months[mk]
      if (val != null) dest.set(mk, (dest.get(mk) ?? 0) + val)
    }
  }

  function toMonths(map: Map<MonthKey, number>): BookingComparisonMonths {
    const months: BookingComparisonMonths = { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null }
    for (const mk of monthKeys) {
      months[mk] = map.get(mk) ?? null
    }
    return months
  }

  function sumMap(map: Map<MonthKey, number>): number {
    return Array.from(map.values()).reduce((s, v) => s + v, 0)
  }

  // Confirmed section
  const grand357 = sumMap(cfmd357)
  const grand912 = sumMap(cfmd912)
  const grandCfmd = new Map<MonthKey, number>()
  for (const mk of monthKeys) {
    grandCfmd.set(mk, (cfmd357.get(mk) ?? 0) + (cfmd912.get(mk) ?? 0))
  }

  // Balance section
  const bal357 = new Map<MonthKey, number>()
  const bal912 = new Map<MonthKey, number>()
  for (const mk of monthKeys) {
    const b3 = Math.max((prebook357.get(mk) ?? 0) - (cfmd357.get(mk) ?? 0), 0)
    const b9 = Math.max((prebook912.get(mk) ?? 0) - (cfmd912.get(mk) ?? 0), 0)
    bal357.set(mk, b3)
    bal912.set(mk, b9)
  }
  const grandBal = new Map<MonthKey, number>()
  for (const mk of monthKeys) {
    grandBal.set(mk, (bal357.get(mk) ?? 0) + (bal912.get(mk) ?? 0))
  }

  // Combined (confirmed + balance)
  const combined357 = new Map<MonthKey, number>()
  const combined912 = new Map<MonthKey, number>()
  for (const mk of monthKeys) {
    combined357.set(mk, (cfmd357.get(mk) ?? 0) + (bal357.get(mk) ?? 0))
    combined912.set(mk, (cfmd912.get(mk) ?? 0) + (bal912.get(mk) ?? 0))
  }
  const grandCombined = new Map<MonthKey, number>()
  for (const mk of monthKeys) {
    grandCombined.set(mk, (combined357.get(mk) ?? 0) + (combined912.get(mk) ?? 0))
  }

  return [
    {
      title: "Initial Pre-Booked Qty",
      rows: [
        { label: "INITIAL 3/5/7 GG PRE-BOOKED QTY", totalQty: sumMap(prebook357), months: toMonths(prebook357) },
        { label: "INITIAL 9/12 GG PRE-BOOKED QTY", totalQty: sumMap(prebook912), months: toMonths(prebook912) },
      ],
    },
    {
      title: "Confirmed Qty",
      rows: [
        { label: "3/5/7 GG- TTL CFMD QTY", totalQty: grand357, months: toMonths(cfmd357) },
        { label: "9/12 GG- TTL CFMD QTY", totalQty: grand912, months: toMonths(cfmd912) },
        { label: "GRAND TOTAL CFMD QTY", totalQty: grand357 + grand912, months: toMonths(grandCfmd) },
      ],
    },
    {
      title: "Total Pre-Booking Left to Utilize",
      rows: [
        { label: "3/5/7 GG- TTL QTY BALANCE TO UTILIZE", totalQty: sumMap(bal357), months: toMonths(bal357) },
        { label: "9/12 GG- TTL QTY BALANCE TO UTILIZE", totalQty: sumMap(bal912), months: toMonths(bal912) },
        { label: "GRND TTL QTY BAL TO UTILIZE", totalQty: sumMap(grandBal), months: toMonths(grandBal) },
      ],
    },
    {
      title: "Buyer/Brand Wise (Confirmed + Pre-Booked)",
      rows: [
        { label: "3/5/7 GG- TTL TOTAL", totalQty: sumMap(combined357), months: toMonths(combined357) },
        { label: "9/12 GG-TOTAL", totalQty: sumMap(combined912), months: toMonths(combined912) },
        { label: "GRAND TOTAL", totalQty: sumMap(grandCombined), months: toMonths(grandCombined) },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Exported computed data
// ---------------------------------------------------------------------------

// Order Summary — Month/Gauge table
export const computedOrderSummaryMonthGaugeRows: OrderSummaryMetricRow[] = buildMonthGaugeRows()

// Order Summary — Buyer-wise table
export const computedOrderSummaryBuyerWiseRows: BuyerWiseOrderSummaryRow[] = buildBuyerWiseRows()
export const computedOrderSummaryBuyerWiseFooterRows: BuyerWiseOrderSummaryFooterRow[] = buildBuyerWiseFooterRows()

// Order Summary — Monthly status table
export const computedOrderSummaryMonthlyStatusCapacities: OrderSummaryMonthlyStatusCapacityRow[] = buildMonthlyStatusCapacities()
export const computedOrderSummaryMonthlyStatusRows: OrderSummaryMonthlyStatusRow[] = buildMonthlyStatusRows()
export const computedOrderSummaryMonthlyStatusTotals = buildMonthlyStatusTotals()

// Initial Booking + CFMD + Balance report
export const computedBookingComparisonReport: BookingComparisonReport = {
  title: "INITIAL BOOKING + CFMD ORDER + LEFT TO UTILIZE AGAINST YEAR 2026",
  subtitle:
    "BUYER/GG WISE QTY COMPARISON BETWEEN INITIAL BOOKING + CFMD ORDER+LEFT TO UTILIZE AGAINST YEAR 2026",
  dateRange: "Date: 6TH JAN 2026 TO 5TH JAN 2027",
  updatedAt: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  rows: buildBookingComparisonRows(),
  summarySections: buildBookingSummarySections(),
}


