import { createSelector } from "@reduxjs/toolkit"

import {
  resolveBookingBuyer,
  resolveOrderSummaryBuyer,
  resolvePreBookingBuyer,
  orderSummaryBuyerColorMap,
} from "@/lib/buyer-mapping"
import {
  monthKeys,
  monthKeyToReportMonth,
  monthNameToKey,
  preBookingTargets,
  type MonthKey,
  type PreBookingTarget,
} from "@/lib/pre-booking-config"
import {
  baseMonthlyConfirmedQtyReports,
  monthlyConfirmedQtyCapacityConfig,
} from "@/mock/monthly-confirmed-qty"
import type {
  BookingComparisonCategory,
  BookingComparisonMonths,
  BookingComparisonReport,
  BookingComparisonRow,
  BookingComparisonSummarySection,
} from "@/types/booking-comparison"
import type { MerchandisePreBookingRecord } from "@/types/merchandise-pre-booking"
import type {
  BuyerWiseOrderSummaryFooterRow,
  BuyerWiseOrderSummaryRow,
  OrderSummaryMetricRow,
  OrderSummaryMonthlyStatusCapacityRow,
  OrderSummaryMonthlyStatusRow,
  ReportMonth,
} from "@/types/order-summary"
import type { RootState } from "@/store"

function parseQtyValue(value: string, suffix: string): number {
  return (
    Number(
      value
        .replace(/,/g, "")
        .replace(new RegExp(`\\s*${suffix}$`, "i"), "")
        .trim()
    ) || 0
  )
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

  return "multi"
}

function getGaugeCategory(gg: string): "3/5/7 GG" | "9/12 GG" {
  const trimmed = gg.trim()
  if (trimmed === "3" || trimmed === "5" || trimmed === "7") {
    return "3/5/7 GG"
  }

  return "9/12 GG"
}

type MonthlyAggregation = {
  byBuyer: Map<string, Map<MonthKey, { qty: number; min: number }>>
  byGg: Map<string, Map<MonthKey, { qty: number; min: number }>>
  totalsByMonth: Map<MonthKey, { qty: number; min: number }>
  byBookingBuyer: Map<string, Map<string, Map<MonthKey, number>>>
}

function aggregateAllMonths(): MonthlyAggregation {
  const byBuyer = new Map<string, Map<MonthKey, { qty: number; min: number }>>()
  const byGg = new Map<string, Map<MonthKey, { qty: number; min: number }>>()
  const totalsByMonth = new Map<MonthKey, { qty: number; min: number }>()
  const byBookingBuyer = new Map<string, Map<string, Map<MonthKey, number>>>()

  for (const report of baseMonthlyConfirmedQtyReports) {
    const [monthName] = report.value.split("-")
    const monthKey = monthNameToKey[monthName]
    if (!monthKey) {
      continue
    }

    for (const row of report.rows) {
      if (!isNumericGg(row.gg)) {
        continue
      }

      const qty = parseQtyValue(row.orderQty, "Pcs")
      const min = parseQtyValue(row.totalMinPerOrdStyle, "MIN")

      const orderSummaryBuyer = resolveOrderSummaryBuyer(row.buyerName)
      if (!byBuyer.has(orderSummaryBuyer)) {
        byBuyer.set(orderSummaryBuyer, new Map())
      }
      const buyerMonths = byBuyer.get(orderSummaryBuyer)!
      const existingBuyerMonth = buyerMonths.get(monthKey) ?? { qty: 0, min: 0 }
      existingBuyerMonth.qty += qty
      existingBuyerMonth.min += min
      buyerMonths.set(monthKey, existingBuyerMonth)

      const ggGroup = getGgGroup(row.gg)
      if (!byGg.has(ggGroup)) {
        byGg.set(ggGroup, new Map())
      }
      const ggMonths = byGg.get(ggGroup)!
      const existingGgMonth = ggMonths.get(monthKey) ?? { qty: 0, min: 0 }
      existingGgMonth.qty += qty
      existingGgMonth.min += min
      ggMonths.set(monthKey, existingGgMonth)

      const totalMonth = totalsByMonth.get(monthKey) ?? { qty: 0, min: 0 }
      totalMonth.qty += qty
      totalMonth.min += min
      totalsByMonth.set(monthKey, totalMonth)

      const bookingBuyer = resolveBookingBuyer(orderSummaryBuyer)
      const gaugeCategory = getGaugeCategory(row.gg)
      if (!byBookingBuyer.has(bookingBuyer)) {
        byBookingBuyer.set(bookingBuyer, new Map())
      }
      const gaugeMap = byBookingBuyer.get(bookingBuyer)!
      if (!gaugeMap.has(gaugeCategory)) {
        gaugeMap.set(gaugeCategory, new Map())
      }
      const gaugeMonths = gaugeMap.get(gaugeCategory)!
      gaugeMonths.set(monthKey, (gaugeMonths.get(monthKey) ?? 0) + qty)
    }
  }

  return {
    byBuyer,
    byGg,
    totalsByMonth,
    byBookingBuyer,
  }
}

const aggregation = aggregateAllMonths()

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

    for (const monthKey of monthKeys) {
      const reportMonth = monthKeyToReportMonth[monthKey] as ReportMonth
      const data = monthData?.get(monthKey) ?? { qty: 0, min: 0 }
      yearlyQty += data.qty
      yearlyMin += data.min

      qtyMonths[reportMonth] = `${data.qty.toLocaleString("en-US")} PCS`
      minMonths[reportMonth] = `${data.min.toLocaleString("en-US")} Min`
      avgMonths[reportMonth] = data.qty > 0 ? `${Math.round(data.min / data.qty)} Min` : "#DIV/0!"
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

  let grandYearlyQty = 0
  let grandYearlyMin = 0
  const ttlQtyMonths: Partial<Record<ReportMonth, string>> = {}
  const ttlMinMonths: Partial<Record<ReportMonth, string>> = {}
  const ttlAvgMonths: Partial<Record<ReportMonth, string>> = {}

  for (const monthKey of monthKeys) {
    const reportMonth = monthKeyToReportMonth[monthKey] as ReportMonth
    const data = aggregation.totalsByMonth.get(monthKey) ?? { qty: 0, min: 0 }
    grandYearlyQty += data.qty
    grandYearlyMin += data.min

    ttlQtyMonths[reportMonth] = `${data.qty.toLocaleString("en-US")} PCS`
    ttlMinMonths[reportMonth] = `${data.min.toLocaleString("en-US")} Min`
    ttlAvgMonths[reportMonth] = data.qty > 0 ? `${Math.round(data.min / data.qty)} Min` : "#DIV/0!"
  }

  rows.push(
    {
      label: "TTL Qty/Month",
      type: "qty",
      months: ttlQtyMonths,
      yearlyTotal: `${grandYearlyQty.toLocaleString("en-US")} PCS`,
      yearlyAverage:
        grandYearlyQty > 0 ? `${Math.round(grandYearlyMin / grandYearlyQty)} Min` : "#DIV/0!",
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
  const processedBuyers = new Set<string>()
  const allBuyers = [
    ...buyerDisplayOrder,
    ...Array.from(aggregation.byBuyer.keys()).filter(
      (buyerName) => !buyerDisplayOrder.includes(buyerName)
    ),
  ]

  for (const buyerName of allBuyers) {
    if (processedBuyers.has(buyerName)) {
      continue
    }

    processedBuyers.add(buyerName)
    const monthData = aggregation.byBuyer.get(buyerName)
    if (!monthData) {
      continue
    }

    let yearlyQty = 0
    let yearlyMin = 0
    const months: Partial<Record<ReportMonth, { qty?: string; min?: string }>> = {}

    for (const monthKey of monthKeys) {
      const reportMonth = monthKeyToReportMonth[monthKey] as ReportMonth
      const data = monthData.get(monthKey)

      if (data && (data.qty > 0 || data.min > 0)) {
        months[reportMonth] = {
          qty: `${data.qty} PCS`,
          min: `${data.min} Min`,
        }
        yearlyQty += data.qty
        yearlyMin += data.min
      }
    }

    rows.push({
      serial: String(serial++),
      buyerName,
      buyerCellClassName:
        orderSummaryBuyerColorMap[buyerName] ?? "bg-slate-200/90 dark:bg-slate-800/80",
      months,
      yearlyQty: `${yearlyQty} PCS`,
      yearlyMin: `${yearlyMin} Min`,
      yearlyAverage: yearlyQty > 0 ? `${Math.round(yearlyMin / yearlyQty)} Min` : "#DIV/0!",
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

  for (const monthKey of monthKeys) {
    const reportMonth = monthKeyToReportMonth[monthKey] as ReportMonth
    const data = aggregation.totalsByMonth.get(monthKey) ?? { qty: 0, min: 0 }
    grandQty += data.qty
    grandMin += data.min
    ttlQty[reportMonth] = `${data.qty} PCS`
    ttlMin[reportMonth] = `${data.min} Min`
    ttlAvg[reportMonth] = data.qty > 0 ? `${Math.round(data.min / data.qty)} Min` : "#DIV/0!"
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

function buildMonthlyStatusCapacities(): OrderSummaryMonthlyStatusCapacityRow[] {
  const capacities = [
    { label: "3", ...monthlyConfirmedQtyCapacityConfig["3"] },
    { label: "MUL", ...monthlyConfirmedQtyCapacityConfig["5"] },
    { label: "9", ...monthlyConfirmedQtyCapacityConfig["9"] },
    { label: "12", ...monthlyConfirmedQtyCapacityConfig["12"] },
  ]

  const totalCapacity = capacities.reduce((sum, capacity) => sum + (capacity.monthlyCapacity ?? 0), 0)
  const totalQtyCapacity = capacities.reduce((sum, capacity) => sum + (capacity.qtyCapacity ?? 0), 0)

  return [
    ...capacities.map((capacity) => ({
      label: capacity.label,
      monthlyCapacity: `${(capacity.monthlyCapacity ?? 0).toLocaleString("en-US")} Min`,
      qtyCapacity: `${(capacity.qtyCapacity ?? 0).toLocaleString("en-US")} Pcs`,
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  const totalCapacity = Object.values(monthlyConfirmedQtyCapacityConfig).reduce(
    (sum, capacity) => sum + capacity.monthlyCapacity,
    0
  )

  return monthKeys.map((monthKey, index) => {
    const data = aggregation.totalsByMonth.get(monthKey) ?? { qty: 0, min: 0 }
    const leftOver = data.min - totalCapacity

    return {
      serial: String(index + 1),
      month: monthLabels[index],
      totalQty: formatPcs(data.qty),
      totalMin: formatMin(data.min),
      leftOverMin: `${leftOver >= 0 ? "" : "-"}${Math.abs(leftOver).toLocaleString("en-US")} Min`,
      highlight: monthKey === "jun" || monthKey === "jul",
    }
  })
}

function buildMonthlyStatusTotals() {
  let grandQty = 0
  let grandMin = 0

  for (const monthKey of monthKeys) {
    const data = aggregation.totalsByMonth.get(monthKey) ?? { qty: 0, min: 0 }
    grandQty += data.qty
    grandMin += data.min
  }

  return {
    totalQty: formatPcs(grandQty),
    totalMin: formatMin(grandMin),
  }
}

function createEmptyBookingMonths(): BookingComparisonMonths {
  return {
    jan: null,
    feb: null,
    mar: null,
    apr: null,
    may: null,
    jun: null,
    jul: null,
    aug: null,
    sep: null,
    oct: null,
    nov: null,
    dec: null,
  }
}

const shortMonthToKey: Record<string, MonthKey> = {
  jan: "jan",
  feb: "feb",
  mar: "mar",
  apr: "apr",
  may: "may",
  jun: "jun",
  jul: "jul",
  aug: "aug",
  sep: "sep",
  oct: "oct",
  nov: "nov",
  dec: "dec",
}

function getMonthKeyFromInspectionDate(inspectionDate: string): MonthKey | null {
  if (!inspectionDate) {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(inspectionDate)) {
    const parsed = new Date(inspectionDate)
    if (Number.isNaN(parsed.getTime())) {
      return null
    }

    return monthKeys[parsed.getMonth()] ?? null
  }

  const shortMatch = inspectionDate.match(/^\d{1,2}-([A-Za-z]{3})-\d{2,4}$/)
  if (shortMatch) {
    return shortMonthToKey[shortMatch[1].toLowerCase()] ?? null
  }

  const parsed = new Date(inspectionDate)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return monthKeys[parsed.getMonth()] ?? null
}

function clonePreBookingTarget(target: PreBookingTarget): PreBookingTarget {
  return {
    ...target,
    months: { ...target.months },
  }
}

function buildRuntimePreBookingTargets(
  merchandisePreBookings: MerchandisePreBookingRecord[]
): PreBookingTarget[] {
  const runtimeTargets = preBookingTargets.map(clonePreBookingTarget)
  const targetMap = new Map<string, PreBookingTarget>()
  let nextSerial = Math.max(...runtimeTargets.map((target) => Number(target.serial) || 0), 0) + 1

  runtimeTargets.forEach((target) => {
    targetMap.set(`${target.buyerName}::${target.gauge}`, target)
  })

  for (const record of merchandisePreBookings) {
    const monthKey = getMonthKeyFromInspectionDate(record.inspectionDate)
    if (!monthKey) {
      continue
    }

    const bookingBuyer = resolvePreBookingBuyer(record.buyerName.trim())
    const gauge = getGaugeCategory(record.gg)
    const targetKey = `${bookingBuyer}::${gauge}`

    let target = targetMap.get(targetKey)
    if (!target) {
      target = {
        serial: String(nextSerial++),
        buyerName: bookingBuyer,
        gauge,
        totalQty: 0,
        months: createEmptyBookingMonths(),
      }
      runtimeTargets.push(target)
      targetMap.set(targetKey, target)
    }

    target.totalQty += record.orderQty
    target.months[monthKey] = (target.months[monthKey] ?? 0) + record.orderQty
  }

  return runtimeTargets
}

function buildBookingComparisonRows(targets: PreBookingTarget[]): BookingComparisonRow[] {
  const rows: BookingComparisonRow[] = []
  const buyerSerials = new Map<string, string>()

  targets.forEach((target) => {
    if (!buyerSerials.has(target.buyerName)) {
      buyerSerials.set(target.buyerName, target.serial)
    }
  })

  const bookingBuyerNames = Array.from(aggregation.byBookingBuyer.keys())
  let nextSerial =
    Math.max(...Array.from(buyerSerials.values()).map((value) => Number(value) || 0), 0) + 1

  for (const bookingBuyerName of bookingBuyerNames) {
    if (!buyerSerials.has(bookingBuyerName)) {
      buyerSerials.set(bookingBuyerName, String(nextSerial++))
    }
  }

  const gauges = ["3/5/7 GG", "9/12 GG"]

  for (const [buyerName, serial] of buyerSerials) {
    for (const gauge of gauges) {
      const confirmedMonths = aggregation.byBookingBuyer.get(buyerName)?.get(gauge)
      const cfmdMonths = createEmptyBookingMonths()
      let cfmdTotal = 0

      if (confirmedMonths) {
        for (const monthKey of monthKeys) {
          const value = confirmedMonths.get(monthKey) ?? null
          cfmdMonths[monthKey] = value
          if (value) {
            cfmdTotal += value
          }
        }
      }

      if (cfmdTotal > 0 || confirmedMonths?.size) {
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

      const preBooking = targets.find(
        (target) => target.buyerName === buyerName && target.gauge === gauge
      )

      if (!preBooking) {
        continue
      }

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

      const balanceMonths = createEmptyBookingMonths()
      let runningBalance = 0

      for (const monthKey of monthKeys) {
        const preBooked = preBooking.months[monthKey] ?? 0
        const confirmed = cfmdMonths[monthKey] ?? 0
        runningBalance += preBooked - confirmed

        if (preBooked > 0 || confirmed > 0) {
          const balance = Math.max(runningBalance, 0)
          balanceMonths[monthKey] = balance
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

  return rows
}

function buildBookingSummarySections(targets: PreBookingTarget[]): BookingComparisonSummarySection[] {
  const cfmd357 = new Map<MonthKey, number>()
  const cfmd912 = new Map<MonthKey, number>()

  for (const [, gaugeMap] of aggregation.byBookingBuyer) {
    for (const [gauge, monthMap] of gaugeMap) {
      const targetMap = gauge === "3/5/7 GG" ? cfmd357 : cfmd912
      for (const [monthKey, qty] of monthMap) {
        targetMap.set(monthKey, (targetMap.get(monthKey) ?? 0) + qty)
      }
    }
  }

  const prebook357 = new Map<MonthKey, number>()
  const prebook912 = new Map<MonthKey, number>()

  for (const target of targets) {
    const targetMap = target.gauge === "3/5/7 GG" ? prebook357 : prebook912
    for (const monthKey of monthKeys) {
      const value = target.months[monthKey]
      if (value != null) {
        targetMap.set(monthKey, (targetMap.get(monthKey) ?? 0) + value)
      }
    }
  }

  function toMonths(map: Map<MonthKey, number>): BookingComparisonMonths {
    const months = createEmptyBookingMonths()
    for (const monthKey of monthKeys) {
      months[monthKey] = map.get(monthKey) ?? null
    }
    return months
  }

  function sumMap(map: Map<MonthKey, number>) {
    return Array.from(map.values()).reduce((sum, value) => sum + value, 0)
  }

  const grandCfmd = new Map<MonthKey, number>()
  for (const monthKey of monthKeys) {
    grandCfmd.set(monthKey, (cfmd357.get(monthKey) ?? 0) + (cfmd912.get(monthKey) ?? 0))
  }

  const bal357 = new Map<MonthKey, number>()
  const bal912 = new Map<MonthKey, number>()
  for (const monthKey of monthKeys) {
    bal357.set(monthKey, Math.max((prebook357.get(monthKey) ?? 0) - (cfmd357.get(monthKey) ?? 0), 0))
    bal912.set(monthKey, Math.max((prebook912.get(monthKey) ?? 0) - (cfmd912.get(monthKey) ?? 0), 0))
  }

  const grandBal = new Map<MonthKey, number>()
  const combined357 = new Map<MonthKey, number>()
  const combined912 = new Map<MonthKey, number>()
  const grandCombined = new Map<MonthKey, number>()

  for (const monthKey of monthKeys) {
    grandBal.set(monthKey, (bal357.get(monthKey) ?? 0) + (bal912.get(monthKey) ?? 0))
    combined357.set(monthKey, (cfmd357.get(monthKey) ?? 0) + (bal357.get(monthKey) ?? 0))
    combined912.set(monthKey, (cfmd912.get(monthKey) ?? 0) + (bal912.get(monthKey) ?? 0))
    grandCombined.set(
      monthKey,
      (combined357.get(monthKey) ?? 0) + (combined912.get(monthKey) ?? 0)
    )
  }

  return [
    {
      title: "Initial Pre-Booked Qty",
      rows: [
        {
          label: "INITIAL 3/5/7 GG PRE-BOOKED QTY",
          totalQty: sumMap(prebook357),
          months: toMonths(prebook357),
        },
        {
          label: "INITIAL 9/12 GG PRE-BOOKED QTY",
          totalQty: sumMap(prebook912),
          months: toMonths(prebook912),
        },
      ],
    },
    {
      title: "Confirmed Qty",
      rows: [
        {
          label: "3/5/7 GG- TTL CFMD QTY",
          totalQty: sumMap(cfmd357),
          months: toMonths(cfmd357),
        },
        {
          label: "9/12 GG- TTL CFMD QTY",
          totalQty: sumMap(cfmd912),
          months: toMonths(cfmd912),
        },
        {
          label: "GRAND TOTAL CFMD QTY",
          totalQty: sumMap(cfmd357) + sumMap(cfmd912),
          months: toMonths(grandCfmd),
        },
      ],
    },
    {
      title: "Total Pre-Booking Left to Utilize",
      rows: [
        {
          label: "3/5/7 GG- TTL QTY BALANCE TO UTILIZE",
          totalQty: sumMap(bal357),
          months: toMonths(bal357),
        },
        {
          label: "9/12 GG- TTL QTY BALANCE TO UTILIZE",
          totalQty: sumMap(bal912),
          months: toMonths(bal912),
        },
        {
          label: "GRND TTL QTY BAL TO UTILIZE",
          totalQty: sumMap(grandBal),
          months: toMonths(grandBal),
        },
      ],
    },
    {
      title: "Buyer/Brand Wise (Confirmed + Pre-Booked)",
      rows: [
        {
          label: "3/5/7 GG- TTL TOTAL",
          totalQty: sumMap(combined357),
          months: toMonths(combined357),
        },
        {
          label: "9/12 GG-TOTAL",
          totalQty: sumMap(combined912),
          months: toMonths(combined912),
        },
        {
          label: "GRAND TOTAL",
          totalQty: sumMap(grandCombined),
          months: toMonths(grandCombined),
        },
      ],
    },
  ]
}

function buildBookingComparisonReport(
  merchandisePreBookings: MerchandisePreBookingRecord[]
): BookingComparisonReport {
  const runtimeTargets = buildRuntimePreBookingTargets(merchandisePreBookings)

  return {
    title: "INITIAL BOOKING + CFMD ORDER + LEFT TO UTILIZE AGAINST YEAR 2026",
    subtitle:
      "BUYER/GG WISE QTY COMPARISON BETWEEN INITIAL BOOKING + CFMD ORDER+LEFT TO UTILIZE AGAINST YEAR 2026",
    dateRange: "Date: 6TH JAN 2026 TO 5TH JAN 2027",
    updatedAt: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    rows: buildBookingComparisonRows(runtimeTargets),
    summarySections: buildBookingSummarySections(runtimeTargets),
  }
}

export const computedOrderSummaryMonthGaugeRows: OrderSummaryMetricRow[] = buildMonthGaugeRows()
export const computedOrderSummaryBuyerWiseRows: BuyerWiseOrderSummaryRow[] = buildBuyerWiseRows()
export const computedOrderSummaryBuyerWiseFooterRows: BuyerWiseOrderSummaryFooterRow[] =
  buildBuyerWiseFooterRows()
export const computedOrderSummaryMonthlyStatusCapacities: OrderSummaryMonthlyStatusCapacityRow[] =
  buildMonthlyStatusCapacities()
export const computedOrderSummaryMonthlyStatusRows: OrderSummaryMonthlyStatusRow[] =
  buildMonthlyStatusRows()
export const computedOrderSummaryMonthlyStatusTotals = buildMonthlyStatusTotals()

export const computedBookingComparisonReport: BookingComparisonReport =
  buildBookingComparisonReport([])

export const selectComputedBookingComparisonReport = createSelector(
  [(state: RootState) => state.merchandise.preBookings],
  (preBookings) => buildBookingComparisonReport(preBookings)
)


