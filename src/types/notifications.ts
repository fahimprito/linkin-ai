import type { UserRole } from "@/types/auth"

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

export type NotificationState = {
  activeUserId: string | null
  items: NotificationItem[]
}



