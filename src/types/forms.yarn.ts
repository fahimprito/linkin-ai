export type ChecklistValue = "Pass" | "Fail"
export type FinalResult = "Accept" | "Reject"

export type YarnInspectionReport = {
  id: string
  poId: string
  poNumber: string
  styleNo: string
  buyer: string
  batchId?: string
  batchNumber: string
  supplier: string
  color: string
  yarnCount: string
  receivedQty: number
  checkedQty: number
  strength: ChecklistValue
  elasticityCheck: ChecklistValue
  cleanliness: ChecklistValue
  shadeMatch: ChecklistValue
  moistureCheck: ChecklistValue
  quantityVerificationCheck: ChecklistValue
  criticalWindingProblem: number
  majorWindingProblem: number
  minorWindingProblem: number
  criticalCrossedYarn: number
  majorCrossedYarn: number
  minorCrossedYarn: number
  criticalUnevenDyeing: number
  majorUnevenDyeing: number
  minorUnevenDyeing: number
  criticalDustMarks: number
  majorDustMarks: number
  minorDustMarks: number
  criticalSpotYarn: number
  majorSpotYarn: number
  minorSpotYarn: number
  criticalForeignYarn: number
  majorForeignYarn: number
  minorForeignYarn: number
  criticalKnot: number
  majorKnot: number
  minorKnot: number
  criticalThickThin: number
  majorThickThin: number
  minorThickThin: number
  overallObservation: string
  reservationComments: string
  finalResult: FinalResult
  inspector: string
  inspectionDate: string
  testReportName?: string
  createdAt: string
}

export type InspectionFormValues = Omit<
  YarnInspectionReport,
  "id" | "createdAt" | "testReportName"
> & {
  testReportName?: string
}

export type SupplierOrderFormValues = {
  poId: string
  poNumber: string
  yarnCheckRequestId: string
  supplier: string
  yarnType: string
  color: string
  orderedQty: string
  expectedArrival: string
}

