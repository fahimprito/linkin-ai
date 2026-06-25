import type {
  KnittingDailyProgress,
  KnittingYarnIssueLog,
  YarnStockMovement,
} from "@/types/production"

type DatedEntry = {
  entryDate?: string
  issueDate?: string
  movementDate?: string
}

function isSameCalendarDay(value: string | undefined, today: Date) {
  if (!value) {
    return false
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  )
}

export function calculateInclusiveDays(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  const diffMs = end.getTime() - start.getTime()

  if (diffMs < 0) {
    return 0
  }

  return Math.floor(diffMs / 86_400_000) + 1
}

export function sumAllocatedYarnForPo(
  stockMovements: YarnStockMovement[],
  poId: string
) {
  return stockMovements
    .filter(
      (movement) =>
        movement.poId === poId &&
        (movement.movementType === "Allocated Stock" ||
          movement.movementType === "Accepted Receipt")
    )
    .reduce((sum, movement) => sum + movement.quantity, 0)
}

export function sumIssuedYarnForPo(
  stockMovements: YarnStockMovement[],
  poId: string
) {
  return stockMovements
    .filter(
      (movement) =>
        movement.poId === poId &&
        movement.movementType === "Issued to Knitting"
    )
    .reduce((sum, movement) => sum + movement.quantity, 0)
}

export function getAvailableYarnForPo(
  stockMovements: YarnStockMovement[],
  poId: string
) {
  return Math.max(
    0,
    sumAllocatedYarnForPo(stockMovements, poId) -
      sumIssuedYarnForPo(stockMovements, poId)
  )
}

export function sumIssueLogQtyForPo(
  issueLogs: KnittingYarnIssueLog[],
  poId: string
) {
  return issueLogs
    .filter((log) => log.poId === poId)
    .reduce((sum, log) => sum + log.issuedQty, 0)
}

export function sumProducedQtyForPo(
  progressEntries: KnittingDailyProgress[],
  poId: string
) {
  return progressEntries
    .filter((entry) => entry.poId === poId)
    .reduce((sum, entry) => sum + entry.producedQty, 0)
}

export function sumOutputWeightForPo(
  progressEntries: KnittingDailyProgress[],
  poId: string
) {
  return progressEntries
    .filter((entry) => entry.poId === poId)
    .reduce((sum, entry) => sum + entry.finishedOutputWeight, 0)
}

export function calculateWastePercentage(
  issuedQty: number,
  outputWeight: number
) {
  if (issuedQty <= 0) {
    return null
  }

  const wasteQty = issuedQty - outputWeight
  const percentage = (wasteQty / issuedQty) * 100

  return Math.max(0, Number(percentage.toFixed(2)))
}

export function countTodayEntries<T extends DatedEntry>(
  entries: T[],
  dateKey: keyof DatedEntry
) {
  const today = new Date()

  return entries.filter((entry) =>
    isSameCalendarDay(entry[dateKey], today)
  ).length
}
