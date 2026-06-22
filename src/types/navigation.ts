import type { LucideIcon } from "lucide-react"

import type { AppModuleKey, UserRole } from "@/types/auth"

export type BreadcrumbLabel =
  | string
  | ((params: Record<string, string | undefined>) => string)

export type BreadcrumbHandle =
  | BreadcrumbLabel
  | {
      label: BreadcrumbLabel
      to?: string
    }

export type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  module: AppModuleKey
  allowedRoles: UserRole[]
}
