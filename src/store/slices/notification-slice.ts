import { createSlice } from "@reduxjs/toolkit"

import { mockNotifications } from "@/mock/notifications"

type NotificationState = {
  items: typeof mockNotifications
}

const initialState: NotificationState = {
  items: mockNotifications,
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAllRead: (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        read: true,
      }))
    },
  },
})

export const { markAllRead } = notificationSlice.actions

export default notificationSlice.reducer
