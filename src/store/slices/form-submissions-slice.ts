import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import {
  getStoredFormRecords,
  saveStoredFormRecords,
  type StoredFormRecord,
} from "@/lib/form-submissions"
import { allFormStorageKeys } from "@/lib/form-registry"

type FormSubmissionsState = {
  recordsByKey: Record<string, StoredFormRecord[]>
}

function buildInitialState(): FormSubmissionsState {
  return {
    recordsByKey: Object.fromEntries(
      allFormStorageKeys.map((storageKey) => [
        storageKey,
        getStoredFormRecords(storageKey),
      ])
    ),
  }
}

const formSubmissionsSlice = createSlice({
  name: "formSubmissions",
  initialState: buildInitialState(),
  reducers: {
    addFormSubmission: (
      state,
      action: PayloadAction<{
        storageKey: string
        record: StoredFormRecord
      }>
    ) => {
      const currentRecords = state.recordsByKey[action.payload.storageKey] ?? []
      const nextRecords = [action.payload.record, ...currentRecords]

      state.recordsByKey[action.payload.storageKey] = nextRecords
      saveStoredFormRecords(action.payload.storageKey, nextRecords)
    },
    updateFormSubmission: (
      state,
      action: PayloadAction<{
        storageKey: string
        recordId: string
        updates: Omit<StoredFormRecord, "id">
      }>
    ) => {
      const currentRecords = state.recordsByKey[action.payload.storageKey] ?? []
      const nextRecords = currentRecords.map((record) =>
        record.id === action.payload.recordId
          ? {
              ...record,
              ...action.payload.updates,
              id: record.id,
            }
          : record
      )

      state.recordsByKey[action.payload.storageKey] = nextRecords
      saveStoredFormRecords(action.payload.storageKey, nextRecords)
    },
    deleteFormSubmission: (
      state,
      action: PayloadAction<{
        storageKey: string
        recordId: string
      }>
    ) => {
      const currentRecords = state.recordsByKey[action.payload.storageKey] ?? []
      const nextRecords = currentRecords.filter(
        (record) => record.id !== action.payload.recordId
      )

      state.recordsByKey[action.payload.storageKey] = nextRecords
      saveStoredFormRecords(action.payload.storageKey, nextRecords)
    },
  },
})

export const {
  addFormSubmission,
  updateFormSubmission,
  deleteFormSubmission,
} = formSubmissionsSlice.actions

export default formSubmissionsSlice.reducer
