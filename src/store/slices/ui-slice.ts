import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type UiState = {
  isSidebarOpen: boolean
  confirmationDialog: {
    open: boolean
    title: string
    description: string
  }
}

const initialState: UiState = {
  isSidebarOpen: false,
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
} = uiSlice.actions

export default uiSlice.reducer
