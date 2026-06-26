import type { LucideIcon } from "lucide-react"

import type { AppModuleKey, UserRole } from "@/types/auth"

export type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  module: AppModuleKey
  allowedRoles: UserRole[]
  children?: Array<{
    label: string
    to: string
    icon?: LucideIcon
  }>
}
