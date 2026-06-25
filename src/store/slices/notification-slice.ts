import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { mockNotifications } from "@/mock/notifications"

const NOTIFICATIONS_STORAGE_KEY = "linkin-ai-admin-notifications"

export type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

type NotificationState = {
  items: NotificationItem[]
}

function loadNotifications() {
  if (typeof window === "undefined") {
    return mockNotifications
  }

  try {
    const rawValue = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)

    if (!rawValue) {
      return mockNotifications
    }

    return JSON.parse(rawValue) as NotificationItem[]
  } catch {
    window.localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
    return mockNotifications
  }
}

function saveNotifications(items: NotificationItem[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(items)
  )
}

const initialState: NotificationState = {
  items: loadNotifications(),
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.items.unshift(action.payload)
      saveNotifications(state.items)
    },
    markAllRead: (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        read: true,
      }))
      saveNotifications(state.items)
    },
  },
})

export const { addNotification, markAllRead } = notificationSlice.actions

export default notificationSlice.reducer
