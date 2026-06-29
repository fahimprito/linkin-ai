import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { demoStoreIssueLogs, demoStoreRequisitions } from "@/mock/demo-data"
import type {
  StoreIssueLog,
  StoreMaterialRequisition,
} from "@/types/production"

const KEYS = {
  requisitions: "linkin-store-requisitions",
  issueLogs: "linkin-store-issue-logs",
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

type StoreServiceState = {
  requisitions: StoreMaterialRequisition[]
  issueLogs: StoreIssueLog[]
}

const initialState: StoreServiceState = {
  requisitions: load<StoreMaterialRequisition>(
    KEYS.requisitions,
    demoStoreRequisitions
  ),
  issueLogs: load<StoreIssueLog>(KEYS.issueLogs, demoStoreIssueLogs),
}

const storeServiceSlice = createSlice({
  name: "storeService",
  initialState,
  reducers: {
    addRequisition: (
      state,
      action: PayloadAction<StoreMaterialRequisition>
    ) => {
      state.requisitions.unshift(action.payload)
      save(KEYS.requisitions, state.requisitions)
    },
    updateRequisitionStatus: (
      state,
      action: PayloadAction<{
        id: string
        status: StoreMaterialRequisition["status"]
      }>
    ) => {
      state.requisitions = state.requisitions.map((requisition) =>
        requisition.id === action.payload.id
          ? { ...requisition, status: action.payload.status }
          : requisition
      )
      save(KEYS.requisitions, state.requisitions)
    },
    addIssueLog: (state, action: PayloadAction<StoreIssueLog>) => {
      state.issueLogs.unshift(action.payload)
      save(KEYS.issueLogs, state.issueLogs)
    },
  },
})

export const {
  addRequisition,
  updateRequisitionStatus,
  addIssueLog,
} = storeServiceSlice.actions

export default storeServiceSlice.reducer
