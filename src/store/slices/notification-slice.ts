import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { logout, setSession } from "@/features/auth/auth-slice"
import { loadSession } from "@/lib/session"
import { mockUsers } from "@/mock/auth"
import { mockNotifications } from "@/mock/notifications"
import type { UserRole } from "@/types/auth"

const NOTIFICATIONS_STORAGE_KEY = "linkin-ai-admin-notifications"

export type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

export type NotificationRecipients = {
  targetRoles?: UserRole[]
  targetUserIds?: string[]
}

type NotificationState = {
  activeUserId: string | null
  items: NotificationItem[]
}

function getNotificationsStorageKey(userId: string) {
  return `${NOTIFICATIONS_STORAGE_KEY}:${userId}`
}

function cloneMockNotifications() {
  return mockNotifications.map((item) => ({ ...item }))
}

function loadNotificationsForUser(userId: string | null) {
  return loadNotifications(userId)
}

function saveNotificationsForUser(userId: string | null, items: NotificationItem[]) {
  saveNotifications(userId, items)
}

function resolveRecipientUserIds(
  activeUserId: string | null,
  recipients?: NotificationRecipients
) {
  const userIds = new Set<string>()

  recipients?.targetUserIds?.forEach((userId) => {
    if (userId) {
      userIds.add(userId)
    }
  })

  recipients?.targetRoles?.forEach((role) => {
    mockUsers
      .filter((user) => user.role === role)
      .forEach((user) => userIds.add(user.id))
  })

  if (userIds.size === 0 && activeUserId) {
    userIds.add(activeUserId)
  }

  return [...userIds]
}

function loadNotifications(userId: string | null) {
  if (typeof window === "undefined") {
    return cloneMockNotifications()
  }

  if (!userId) {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(getNotificationsStorageKey(userId))

    if (!rawValue) {
      return cloneMockNotifications()
    }

    return JSON.parse(rawValue) as NotificationItem[]
  } catch {
    window.localStorage.removeItem(getNotificationsStorageKey(userId))
    return cloneMockNotifications()
  }
}

function saveNotifications(userId: string | null, items: NotificationItem[]) {
  if (typeof window === "undefined") {
    return
  }

  if (!userId) {
    return
  }

  window.localStorage.setItem(getNotificationsStorageKey(userId), JSON.stringify(items))
}

const initialSession = typeof window === "undefined" ? null : loadSession()

const initialState: NotificationState = {
  activeUserId: initialSession?.user.id ?? null,
  items: loadNotifications(initialSession?.user.id ?? null),
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<NotificationItem & NotificationRecipients>
    ) => {
      const { targetRoles, targetUserIds, ...notification } = action.payload
      const recipientUserIds = resolveRecipientUserIds(state.activeUserId, {
        targetRoles,
        targetUserIds,
      })

      recipientUserIds.forEach((userId) => {
        const existingItems = loadNotificationsForUser(userId)
        saveNotificationsForUser(userId, [notification, ...existingItems])
      })

      if (state.activeUserId && recipientUserIds.includes(state.activeUserId)) {
        state.items.unshift(notification)
      }
    },
    markAllRead: (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        read: true,
      }))
      saveNotifications(state.activeUserId, state.items)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setSession, (state, action) => {
      const userId = action.payload.user.id

      state.activeUserId = userId
      state.items = loadNotifications(userId)
    })

    builder.addCase(logout, (state) => {
      state.activeUserId = null
      state.items = []
    })
  },
})

export const { addNotification, markAllRead } = notificationSlice.actions

export default notificationSlice.reducer
