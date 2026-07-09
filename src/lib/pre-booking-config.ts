/**
 * Pre-Booking Configuration
 *
 * Contains the management-set initial pre-booking targets by buyer and gauge.
 * These are static targets that don't change when order data changes -
 * they represent how much capacity was pre-booked per buyer/gauge/month.
 *
 * This data was extracted from the `booking-comparison.ts` mock to serve
 * as the canonical source for pre-booking targets across all pages.
 */

export type MonthKey = "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec"

export type PreBookingTarget = {
  serial: string
  buyerName: string
  gauge: string
  totalQty: number
  months: Record<MonthKey, number | null>
}

/**
 * The ordered list of month keys matching the fiscal year (Jan → Dec).
 */
export const monthKeys: MonthKey[] = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
]

/**
 * Maps a month name from the monthly-confirmed-qty report value field
 * to the corresponding MonthKey.
 */
export const monthNameToKey: Record<string, MonthKey> = {
  january: "jan",
  february: "feb",
  march: "mar",
  april: "apr",
  may: "may",
  june: "jun",
  july: "jul",
  august: "aug",
  september: "sep",
  october: "oct",
  november: "nov",
  december: "dec",
}

/**
 * Maps MonthKey to the display month labels used in Order Summary tables.
 */
export const monthKeyToReportMonth: Record<MonthKey, string> = {
  jan: "Jan",
  feb: "Feb",
  mar: "Mar",
  apr: "April",
  may: "May",
  jun: "Jun",
  jul: "July",
  aug: "Aug",
  sep: "Sep",
  oct: "Oct",
  nov: "Nov",
  dec: "Dec",
}

/**
 * Initial pre-booking targets set by management.
 * Each entry represents a buyer+gauge combination and the pre-booked quantity per month.
 *
 * Sourced from the Initial Booking + CFMD + Balance report.
 */
export const preBookingTargets: PreBookingTarget[] = [
  // J&J — 3/5/7 GG
  {
    serial: "1",
    buyerName: "J&J",
    gauge: "3/5/7 GG",
    totalQty: 1610000,
    months: { jan: 50000, feb: null, mar: 200000, apr: 350000, may: 150000, jun: 250000, jul: 300000, aug: 170000, sep: 50000, oct: 40000, nov: 40000, dec: 10000 },
  },
  // J&J — 9/12 GG
  {
    serial: "1",
    buyerName: "J&J",
    gauge: "9/12 GG",
    totalQty: 3750000,
    months: { jan: 520000, feb: 150000, mar: 200000, apr: 500000, may: 50000, jun: 450000, jul: 400000, aug: 250000, sep: 160000, oct: 350000, nov: 360000, dec: 360000 },
  },
  // TEDDY — 3/5/7 GG
  {
    serial: "7",
    buyerName: "TEDDY",
    gauge: "3/5/7 GG",
    totalQty: 150000,
    months: { jan: null, feb: null, mar: null, apr: null, may: 30000, jun: 30000, jul: 50000, aug: 40000, sep: null, oct: null, nov: null, dec: null },
  },
  // TEDDY — 9/12 GG
  {
    serial: "7",
    buyerName: "TEDDY",
    gauge: "9/12 GG",
    totalQty: 140000,
    months: { jan: null, feb: null, mar: null, apr: null, may: 30000, jun: 40000, jul: 40000, aug: 30000, sep: null, oct: null, nov: null, dec: null },
  },
  // ELCORTE — 3/5/7 GG
  {
    serial: "8",
    buyerName: "ELCORTE",
    gauge: "3/5/7 GG",
    totalQty: 390000,
    months: { jan: null, feb: null, mar: null, apr: 30000, may: 50000, jun: 100000, jul: 60000, aug: 100000, sep: 50000, oct: null, nov: null, dec: null },
  },
  // ELCORTE — 9/12 GG
  {
    serial: "8",
    buyerName: "ELCORTE",
    gauge: "9/12 GG",
    totalQty: 950000,
    months: { jan: null, feb: null, mar: null, apr: 250000, may: 250000, jun: 150000, jul: 150000, aug: 100000, sep: 50000, oct: null, nov: null, dec: null },
  },
  // ONLY — 3/5/7 GG
  {
    serial: "9",
    buyerName: "ONLY",
    gauge: "3/5/7 GG",
    totalQty: 2520000,
    months: { jan: null, feb: null, mar: 15000, apr: 45000, may: 100000, jun: 600000, jul: 360000, aug: 500000, sep: 545000, oct: 235000, nov: 120000, dec: null },
  },
  // ONLY — 9/12 GG
  {
    serial: "9",
    buyerName: "ONLY",
    gauge: "9/12 GG",
    totalQty: 1376000,
    months: { jan: null, feb: null, mar: null, apr: 45000, may: 110000, jun: 203000, jul: 293000, aug: 210000, sep: 200000, oct: 155000, nov: 200000, dec: 160000 },
  },
  // ARETEX — 3/5/7 GG
  {
    serial: "10",
    buyerName: "ARETEX",
    gauge: "3/5/7 GG",
    totalQty: 420000,
    months: { jan: null, feb: null, mar: null, apr: 50000, may: 50000, jun: 120000, jul: 80000, aug: 80000, sep: 40000, oct: null, nov: null, dec: null },
  },
  // ARETEX — 9/12 GG
  {
    serial: "10",
    buyerName: "ARETEX",
    gauge: "9/12 GG",
    totalQty: 250000,
    months: { jan: null, feb: null, mar: null, apr: 30000, may: 30000, jun: 50000, jul: 50000, aug: 50000, sep: 20000, oct: 20000, nov: null, dec: null },
  },
  // BNB/CELIO/GMS — 3/5/7 GG
  {
    serial: "11",
    buyerName: "BNB/CELIO/GMS",
    gauge: "3/5/7 GG",
    totalQty: 426000,
    months: { jan: null, feb: null, mar: null, apr: 30000, may: 80000, jun: 60000, jul: 66000, aug: 60000, sep: 60000, oct: 30000, nov: 40000, dec: null },
  },
  // BNB/CELIO/GMS — 9/12 GG
  {
    serial: "11",
    buyerName: "BNB/CELIO/GMS",
    gauge: "9/12 GG",
    totalQty: 400000,
    months: { jan: null, feb: null, mar: null, apr: 40000, may: 40000, jun: null, jul: null, aug: 100000, sep: 120000, oct: 50000, nov: 50000, dec: null },
  },
  // COLOMBUS — 3/5/7 GG
  {
    serial: "12",
    buyerName: "COLOMBUS",
    gauge: "3/5/7 GG",
    totalQty: 95000,
    months: { jan: null, feb: null, mar: null, apr: null, may: 20000, jun: null, jul: null, aug: 25000, sep: 25000, oct: 25000, nov: null, dec: null },
  },
  // COLOMBUS — 9/12 GG
  {
    serial: "12",
    buyerName: "COLOMBUS",
    gauge: "9/12 GG",
    totalQty: 160000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: 40000, sep: 40000, oct: 40000, nov: 40000, dec: null },
  },
  // BUGATTI — 3/5/7 GG
  {
    serial: "13",
    buyerName: "BUGATTI",
    gauge: "3/5/7 GG",
    totalQty: 56000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: 12000, jul: null, aug: null, sep: 24000, oct: 20000, nov: null, dec: null },
  },
  // BUGATTI — 9/12 GG
  {
    serial: "13",
    buyerName: "BUGATTI",
    gauge: "9/12 GG",
    totalQty: 80000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: 20000, oct: 20000, nov: 20000, dec: 20000 },
  },
  // MGF(VS+PINK) — 3/5/7 GG
  {
    serial: "14",
    buyerName: "MGF(VS+PINK)",
    gauge: "3/5/7 GG",
    totalQty: 490000,
    months: { jan: null, feb: null, mar: 200000, apr: 200000, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // MGF(PREMIUM BRNDS) — 9/12 GG
  {
    serial: "15",
    buyerName: "MGF(PREMIUM BRNDS)",
    gauge: "9/12 GG",
    totalQty: 300000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // MGF(LANE BRYANT) — 9/12 GG
  {
    serial: "16",
    buyerName: "MGF(LANE BRYANT)",
    gauge: "9/12 GG",
    totalQty: 150000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // CONTEMPO — 3/5/7 GG
  {
    serial: "17",
    buyerName: "CONTEMPO",
    gauge: "3/5/7 GG",
    totalQty: 70000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // CONTEMPO — 9/12 GG
  {
    serial: "17",
    buyerName: "CONTEMPO",
    gauge: "9/12 GG",
    totalQty: 100000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // JO-Y-JO — 3/5/7 GG
  {
    serial: "18",
    buyerName: "JO-Y-JO",
    gauge: "3/5/7 GG",
    totalQty: 150000,
    months: { jan: null, feb: null, mar: null, apr: null, may: 10000, jun: 30000, jul: 30000, aug: 30000, sep: 30000, oct: 20000, nov: null, dec: null },
  },
  // JO-Y-JO — 9/12 GG
  {
    serial: "18",
    buyerName: "JO-Y-JO",
    gauge: "9/12 GG",
    totalQty: 120000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: 30000, sep: 30000, oct: 30000, nov: 30000, dec: null },
  },
  // KAPPAHL — 3/5/7 GG
  {
    serial: "19",
    buyerName: "KAPPAHL",
    gauge: "3/5/7 GG",
    totalQty: 20000,
    months: { jan: null, feb: null, mar: null, apr: null, may: 10000, jun: null, jul: null, aug: 10000, sep: null, oct: null, nov: null, dec: null },
  },
  // STORMTECH — 9/12 GG
  {
    serial: "20",
    buyerName: "STORMTECH",
    gauge: "9/12 GG",
    totalQty: 100000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // EL GANSO — 9/12 GG
  {
    serial: "21",
    buyerName: "EL GANSO",
    gauge: "9/12 GG",
    totalQty: 50000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // ENGELBERT — 3/5/7 GG
  {
    serial: "22",
    buyerName: "ENGELBERT",
    gauge: "3/5/7 GG",
    totalQty: 50000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // GALERIA — 3/5/7 GG
  {
    serial: "23",
    buyerName: "GALERIA",
    gauge: "3/5/7 GG",
    totalQty: 35000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: 15000, aug: null, sep: null, oct: 20000, nov: null, dec: null },
  },
  // GALERIA — 9/12 GG
  {
    serial: "23",
    buyerName: "GALERIA",
    gauge: "9/12 GG",
    totalQty: 20000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // CUPCAKE(TESCO) — 3/5/7 GG
  {
    serial: "24",
    buyerName: "CUPCAKE(TESCO)",
    gauge: "3/5/7 GG",
    totalQty: 60000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: 30000, sep: null, oct: null, nov: null, dec: null },
  },
  // CUPCAKE(TESCO) — 9/12 GG
  {
    serial: "24",
    buyerName: "CUPCAKE(TESCO)",
    gauge: "9/12 GG",
    totalQty: 60000,
    months: { jan: null, feb: null, mar: null, apr: null, may: null, jun: null, jul: null, aug: null, sep: null, oct: null, nov: null, dec: null },
  },
  // KOMAR — 3/5/7 GG  (no pre-booking, only cfmd data rows)
  // KOMAR — 9/12 GG
]
