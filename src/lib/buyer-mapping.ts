/**
 * Buyer Name Mapping
 *
 * Maps granular buyer names from Monthly Confirmed Qty reports
 * to the grouped buyer names used in Order Summary and
 * Initial Booking comparison reports.
 *
 * Three naming levels:
 *   1. Confirmed Qty (granular): "MGF(VS - Swim-SU26)- SHAFIQ"
 *   2. Order Summary (mid-level): "J&J (ORIGINALS+CORE) (IMTIAJ)"
 *   3. Booking Comparison (broad): "J&J"
 */

function normalizeBuyerMapKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
}

function buildNormalizedLookup(map: Record<string, string>) {
  return Object.entries(map).reduce<Record<string, string>>((accumulator, [key, value]) => {
    accumulator[normalizeBuyerMapKey(key)] = value
    return accumulator
  }, {})
}

// ---------------------------------------------------------------------------
// Confirmed-Qty buyer name -> Order Summary buyer group
// ---------------------------------------------------------------------------

export const confirmedToOrderSummaryBuyerMap: Record<string, string> = {
  "J&J(ORIGINALS)-IMTIAJ": "J&J (ORIGINALS+CORE) (IMTIAJ)",
  "J&J(PREMIUM)-SHUPNIL": "J&J (PREMIUM) (SHUPNIL/RIYADH)",
  "J&J INITIAL PRE-BOOKING": "J&J INITIAL PRE-BOOKING (KAMRUL)",
  "J &J INITIAL PRE-BOOKING": "J&J INITIAL PRE-BOOKING (KAMRUL)",
  "J.&J INITIAL PRE-BOOKING": "J&J INITIAL PRE-BOOKING (KAMRUL)",
  "JJXX-ATIQ": "JJXX (ATIQ)",
  "JJXX- ATIQ": "JJXX (ATIQ)",
  "JO-Y-JO(NEXT)- RUMON": "J&J (ESS & ESS INDIA) (MUSHFIQ)",
  "JO-Y-JO(NEXT)-RUMON": "J&J (ESS & ESS INDIA) (MUSHFIQ)",
  "JO-Y-JO(TOPSHOP AW26)-RUMON": "J&J (ESS & ESS INDIA) (MUSHFIQ)",
  "J&J(REBEL-WOMEN'S)-SHAZAL": "J&J (REBEL+PRODUKT) (SHAZAL/MAHFUZ)",
  "J&J-REBEL-SHAZAL": "J&J (REBEL+PRODUKT) (SHAZAL/MAHFUZ)",
  "VEROMODA-SHAZAL": "VEROMODA (SHAZAL/MAHFUZ)",
  "SELECTED HOMME-FAROUK": "SELECTED (INDIA+O/LET) (FAROUK/PARVEJ)",
  "TERRANOVA-FAROUK": "TERRANOVA (FAROUK/PARVEJ)",
  "ELCORTE-NAG LITON": "ELCORTE (LITON NAG/EMDAD)",
  "ELCORTE INITIAL PRE-BOOKING": "ELCORTE (LITON NAG/EMDAD)",
  "ONLY-UZZAL": "ONLY+ONLY & SONS (UZZAL/RAIHANUR)",
  "ONLY- UZZAL": "ONLY+ONLY & SONS (UZZAL/RAIHANUR)",
  "ONLY INITIAL PRE-BOOKING-UZZAL": "ONLY INITIAL PRE-BOOKING (UZZAL)",
  "ONLY PRE-BOOKING-UZZAL": "ONLY INITIAL PRE-BOOKING (UZZAL)",
  "ONLY PRE-BOOKING- UZZAL": "ONLY INITIAL PRE-BOOKING (UZZAL)",
  "CONTEMPO (BOOT BARN)- ARNOB": "CONTEMPO (ARNOB)",
  "CONTEMPO (BOOT BARN)-ARNOB": "CONTEMPO (ARNOB)",
  "CONTEMPO (QVC)- ARNOB": "CONTEMPO (ARNOB)",
  "MGF(LANE BRYANT)- ARNOB": "MGF (LANE BRYANT) (ARNOB)",
  "MGF(LANE BRYANT)-ARNOB": "MGF (LANE BRYANT) (ARNOB)",
  "MGF(PREMIUM BRANDS)- MAHBUB": "MGF (LANE BRYANT) (ARNOB)",
  "MGF(PREMIUM BRANDS)-MAHBUB": "MGF (LANE BRYANT) (ARNOB)",
  "MGF(VS - Swim-SU26)- SHAFIQ": "ARETEX (FAISAL/SAAD)",
  "MGF(VS - PINK-HOL26)-SHAFIQ": "ARETEX (FAISAL/SAAD)",
  "MGF(VS - PINK-SP27)- SHAFIQ/MIZAN": "ARETEX (FAISAL/SAAD)",
  "MGF (PINK-FA26)- SHAFIQ": "ARETEX (FAISAL/SAAD)",
  "MGF (STF HOL26)- MIZAN": "ARETEX (FAISAL/SAAD)",
  "PRE-BOOKING MGF(PINK-HO26)-SHAFIQ": "ARETEX (FAISAL/SAAD)",
  "MGF- ALL BRAND APPROX PRE-BOOKING": "ARETEX (FAISAL/SAAD)",
  "MGF- ALL BRAND APPROX PRE-BOOKING-RUMON": "ARETEX (FAISAL/SAAD)",
  "ARETEX(FH OUTLET LADIES)-FAISAL": "ARETEX (FAISAL/SAAD)",
  "ARETEX(FH)-S1 FAISAL": "ARETEX (FAISAL/SAAD)",
  "ARETEX(WALB USCH)-FAISAL": "ARETEX (FAISAL/SAAD)",
  "ARETEX(WALBU SCH)- FAISAL": "ARETEX (FAISAL/SAAD)",
  "ARETEX INITIAL PRE-BOOKING": "ARETEX (FAISAL/SAAD)",
  "COLUMBUS(Mar velis)-MAHMUD": "COLOMBUS (MAHMUD)",
  "KATAG-MAHBUB": "COLOMBUS (MAHMUD)",
  "CELIO-FAKRUL": "CELIO (FAKRUL/TOMAL)",
  "GMS-FAKRUL": "GMS (FAKRUL/TOMAL)",
  "GMS- FAKRUL": "GMS (FAKRUL/TOMAL)",
  "BONONO-FAKRUL": "CELIO (FAKRUL/TOMAL)",
  "Kappahl-RUMON": "R BRAND (FAISAL/SAAD)",
  "KAPPAHL INITIAL PRE-BOOKING-RUMON": "R BRAND (FAISAL/SAAD)",
  "JOYJO- PRE-BOOKING": "J&J INITIAL PRE-BOOKING (KAMRUL)",
  "JOYJO-PRE-BOOKING": "J&J INITIAL PRE-BOOKING (KAMRUL)",
}

// ---------------------------------------------------------------------------
// Merchandise pre-booking buyer -> Booking Comparison buyer group
// ---------------------------------------------------------------------------

export const merchandisePreBookingBuyerMap: Record<string, string> = {
  "J&J": "J&J",
  "JJXX": "J&J",
  "VEROMODA": "VEROMODA",
  "VERO MODA": "VEROMODA",
  "OBJECT": "OBJECT",
  "SELECTED": "SELECTED",
  "TERRANOVA": "TERRANOVA",
  "SCROLL": "SCROLL",
  "ELCORTE": "ELCORTE",
  "ONLY": "ONLY",
  "ONLY & SONS": "ONLY",
  "ONLY+ONLY & SONS": "ONLY",
  "ARETEX": "ARETEX",
  "BNB": "BNB/CELIO/GMS",
  "CELIO": "BNB/CELIO/GMS",
  "GMS": "GMS",
  "COLOMBUS": "COLOMBUS",
  "COLUMBUS": "COLOMBUS",
  "BUGATTI": "BUGATTI",
  "CONTEMPO": "CONTEMPO",
  "KARIBAN": "CONTEMPO",
  "JO-Y-JO": "JO-Y-JO",
  "JOYJO": "JO-Y-JO",
  "KAPPAHL": "KAPPAHL",
  "MGF": "MGF(LANE BRYANT)",
  "MGF LANE BRYANT": "MGF(LANE BRYANT)",
  "MGF PREMIUM BRANDS": "MGF(PREMIUM BRNDS)",
  "BESTSELLER": "BESTSELLER",
}

// ---------------------------------------------------------------------------
// Order Summary buyer -> Booking Comparison buyer name (broad group)
// ---------------------------------------------------------------------------

export const orderSummaryToBookingBuyerMap: Record<string, string> = {
  "J&J (ORIGINALS+CORE) (IMTIAJ)": "J&J",
  "J&J (PREMIUM) (SHUPNIL/RIYADH)": "J&J",
  "J&J INITIAL PRE-BOOKING (KAMRUL)": "J&J",
  "JJXX (ATIQ)": "J&J",
  "J&J (ESS & ESS INDIA) (MUSHFIQ)": "J&J",
  "J&J (PRE-COLL+COLL+O/LET+INDIA) (ZIA/RUSSEL)": "J&J",
  "J&J (REBEL+PRODUKT) (SHAZAL/MAHFUZ)": "J&J",
  "VEROMODA (SHAZAL/MAHFUZ)": "VEROMODA",
  "OBJECT (FAROUK/PARVEJ)": "OBJECT",
  "SELECTED (INDIA+O/LET) (FAROUK/PARVEJ)": "SELECTED",
  "TERRANOVA (FAROUK/PARVEJ)": "TERRANOVA",
  "SCROLL (FAROUK/PARVEJ)": "SCROLL",
  "ELCORTE (LITON NAG/EMDAD)": "ELCORTE",
  "ONLY+ONLY & SONS (UZZAL/RAIHANUR)": "ONLY",
  "ONLY INITIAL PRE-BOOKING (UZZAL)": "ONLY",
  "KARIBAN (ARNOB)": "CONTEMPO",
  "CONTEMPO (ARNOB)": "CONTEMPO",
  "MGF (LANE BRYANT) (ARNOB)": "MGF(LANE BRYANT)",
  "ARETEX (FAISAL/SAAD)": "ARETEX",
  "R BRAND (FAISAL/SAAD)": "JO-Y-JO",
  "BUGATTI (MAHMUD)": "BUGATTI",
  "COLOMBUS (MAHMUD)": "COLOMBUS",
  "CELIO (FAKRUL/TOMAL)": "BNB/CELIO/GMS",
  "GMS (FAKRUL/TOMAL)": "GMS",
}

export const orderSummaryBuyerColorMap: Record<string, string> = {
  "J&J (ORIGINALS+CORE) (IMTIAJ)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "J&J (PREMIUM) (SHUPNIL/RIYADH)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "J&J INITIAL PRE-BOOKING (KAMRUL)": "bg-slate-300/80 dark:bg-slate-800/80",
  "JJXX (ATIQ)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "J&J (ESS & ESS INDIA) (MUSHFIQ)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "J&J (PRE-COLL+COLL+O/LET+INDIA) (ZIA/RUSSEL)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "J&J (REBEL+PRODUKT) (SHAZAL/MAHFUZ)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "VEROMODA (SHAZAL/MAHFUZ)": "bg-cyan-100/80 dark:bg-cyan-950/40",
  "OBJECT (FAROUK/PARVEJ)": "bg-yellow-100/80 dark:bg-yellow-950/40",
  "SELECTED (INDIA+O/LET) (FAROUK/PARVEJ)": "bg-yellow-100/80 dark:bg-yellow-950/40",
  "TERRANOVA (FAROUK/PARVEJ)": "bg-yellow-100/80 dark:bg-yellow-950/40",
  "SCROLL (FAROUK/PARVEJ)": "bg-yellow-100/80 dark:bg-yellow-950/40",
  "ELCORTE (LITON NAG/EMDAD)": "bg-slate-200/90 dark:bg-slate-800/80",
  "ONLY+ONLY & SONS (UZZAL/RAIHANUR)": "bg-yellow-100/80 dark:bg-yellow-950/40",
  "ONLY INITIAL PRE-BOOKING (UZZAL)": "bg-slate-300/80 dark:bg-slate-800/80",
  "KARIBAN (ARNOB)": "bg-slate-200/90 dark:bg-slate-800/80",
  "CONTEMPO (ARNOB)": "bg-slate-200/90 dark:bg-slate-800/80",
  "MGF (LANE BRYANT) (ARNOB)": "bg-slate-200/90 dark:bg-slate-800/80",
  "ARETEX (FAISAL/SAAD)": "bg-lime-100/80 dark:bg-lime-950/40",
  "R BRAND (FAISAL/SAAD)": "bg-lime-100/80 dark:bg-lime-950/40",
  "BUGATTI (MAHMUD)": "bg-slate-200/90 dark:bg-slate-800/80",
  "COLOMBUS (MAHMUD)": "bg-slate-200/90 dark:bg-slate-800/80",
  "CELIO (FAKRUL/TOMAL)": "bg-yellow-200/90 dark:bg-yellow-950/50",
  "GMS (FAKRUL/TOMAL)": "bg-yellow-200/90 dark:bg-yellow-950/50",
}

const normalizedConfirmedToOrderSummaryBuyerMap = buildNormalizedLookup(
  confirmedToOrderSummaryBuyerMap
)
const normalizedOrderSummaryToBookingBuyerMap = buildNormalizedLookup(
  orderSummaryToBookingBuyerMap
)
const normalizedMerchandisePreBookingBuyerMap = buildNormalizedLookup(
  merchandisePreBookingBuyerMap
)

export function resolveOrderSummaryBuyer(confirmedBuyerName: string): string {
  return (
    confirmedToOrderSummaryBuyerMap[confirmedBuyerName] ??
    normalizedConfirmedToOrderSummaryBuyerMap[normalizeBuyerMapKey(confirmedBuyerName)] ??
    confirmedBuyerName.trim()
  )
}

export function resolveBookingBuyer(orderSummaryBuyerName: string): string {
  return (
    orderSummaryToBookingBuyerMap[orderSummaryBuyerName] ??
    normalizedOrderSummaryToBookingBuyerMap[normalizeBuyerMapKey(orderSummaryBuyerName)] ??
    orderSummaryBuyerName.trim()
  )
}

export function resolvePreBookingBuyer(preBookingBuyerName: string): string {
  const normalizedKey = normalizeBuyerMapKey(preBookingBuyerName)

  return (
    merchandisePreBookingBuyerMap[preBookingBuyerName] ??
    normalizedMerchandisePreBookingBuyerMap[normalizedKey] ??
    normalizedOrderSummaryToBookingBuyerMap[normalizedKey] ??
    resolveBookingBuyer(resolveOrderSummaryBuyer(preBookingBuyerName))
  )
}
