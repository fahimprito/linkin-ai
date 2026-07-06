import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  demoKnittingDailyProgress,
  demoKnittingIssueLogs,
  demoKnittingProductionPlans,
  demoKnittingRequisitions,
} from "@/mock/demo-data"
import type {
  KnittingDailyProgress,
  KnittingProductionPlan,
  KnittingYarnIssueLog,
  KnittingYarnRequisition,
} from "@/types/production"
import type { KnittingState } from "@/types/state"

const KEYS = {
  requisitions: "linkin-knitting-requisitions",
  issueLogs: "linkin-knitting-issue-logs",
  productionPlans: "linkin-knitting-production-plans",
  dailyProgress: "linkin-knitting-daily-progress",
} as const

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) {
      return fallback
    }

    const parsed = JSON.parse(rawValue) as T[]
    return parsed.length > 0 ? parsed : fallback
  } catch {
    window.localStorage.removeItem(key)
    return fallback
  }
}

function save<T>(key: string, records: T[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(records))
}

const initialState: KnittingState = {
  requisitions: load<KnittingYarnRequisition>(
    KEYS.requisitions,
    demoKnittingRequisitions
  ),
  issueLogs: load<KnittingYarnIssueLog>(KEYS.issueLogs, demoKnittingIssueLogs),
  productionPlans: load<KnittingProductionPlan>(
    KEYS.productionPlans,
    demoKnittingProductionPlans
  ),
  dailyProgress: load<KnittingDailyProgress>(
    KEYS.dailyProgress,
    demoKnittingDailyProgress
  ),
}

const knittingSlice = createSlice({
  name: "knitting",
  initialState,
  reducers: {
    addRequisition: (
      state,
      action: PayloadAction<KnittingYarnRequisition>
    ) => {
      state.requisitions.unshift(action.payload)
      save(KEYS.requisitions, state.requisitions)
    },
    updateRequisitionStatus: (
      state,
      action: PayloadAction<{
        id: string
        status: KnittingYarnRequisition["status"]
      }>
    ) => {
      state.requisitions = state.requisitions.map((requisition) =>
        requisition.id === action.payload.id
          ? { ...requisition, status: action.payload.status }
          : requisition
      )
      save(KEYS.requisitions, state.requisitions)
    },
    addIssueLog: (state, action: PayloadAction<KnittingYarnIssueLog>) => {
      state.issueLogs.unshift(action.payload)
      save(KEYS.issueLogs, state.issueLogs)
    },
    addProductionPlan: (
      state,
      action: PayloadAction<KnittingProductionPlan>
    ) => {
      state.productionPlans = state.productionPlans.filter(
        (plan) => plan.poId !== action.payload.poId
      )
      state.productionPlans.unshift(action.payload)
      save(KEYS.productionPlans, state.productionPlans)
    },
    addDailyProgress: (
      state,
      action: PayloadAction<KnittingDailyProgress>
    ) => {
      state.dailyProgress.unshift(action.payload)
      save(KEYS.dailyProgress, state.dailyProgress)
    },
  },
})

export const {
  addRequisition,
  updateRequisitionStatus,
  addIssueLog,
  addProductionPlan,
  addDailyProgress,
} = knittingSlice.actions

export default knittingSlice.reducer

