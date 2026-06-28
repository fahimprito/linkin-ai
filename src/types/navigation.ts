import type { LucideIcon } from "lucide-react"

import type { AppModuleKey, UserRole } from "@/types/auth"

export type NavigationChildItem = {
  label: string
  to: string
  icon?: LucideIcon
  children?: NavigationChildItem[]
}

export type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  module: AppModuleKey
  allowedRoles: UserRole[]
  children?: NavigationChildItem[]
}
