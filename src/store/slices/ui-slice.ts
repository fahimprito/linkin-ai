import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { UiState } from "@/types/state"

const initialState: UiState = {
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  confirmationDialog: {
    open: false,
    title: "",
    description: "",
  },
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    closeSidebar: (state) => {
      state.isSidebarOpen = false
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed
    },
    openConfirmationDialog: (
      state,
      action: PayloadAction<{ title: string; description: string }>
    ) => {
      state.confirmationDialog = {
        open: true,
        title: action.payload.title,
        description: action.payload.description,
      }
    },
    closeConfirmationDialog: (state) => {
      state.confirmationDialog = {
        open: false,
        title: "",
        description: "",
      }
    },
  },
})

export const {
  closeConfirmationDialog,
  closeSidebar,
  openConfirmationDialog,
  openSidebar,
  toggleSidebar,
  toggleSidebarCollapsed,
} = uiSlice.actions

export default uiSlice.reducer

