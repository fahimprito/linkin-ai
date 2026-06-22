import {
  BarChart3,
  Boxes,
  Gauge,
  Package,
  ScanSearch,
  Shirt,
  ShoppingBag,
  Workflow,
} from "lucide-react"

import type { AppModuleKey, UserRole } from "@/types/auth"
import type { NavigationItem } from "@/types/navigation"

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  merchandise_user: "Merchandise User",
  yarn_control_user: "Yarn Control User",
  store_control_user: "Store Control User",
  knitting_user: "Knitting User",
  linking_user: "Linking User",
  finishing_user: "Finishing User",
  management_user: "Management User",
}

export const dashboardNavigation: NavigationItem[] = [
  {
    label: "Executive Dashboard",
    to: "/dashboard",
    icon: Gauge,
    module: "dashboard",
    allowedRoles: ["super_admin", "management_user"],
  },
  {
    label: "Merchandise",
    to: "/merchandise",
    icon: ShoppingBag,
    module: "merchandise",
    allowedRoles: ["super_admin", "merchandise_user"],
  },
  {
    label: "Yarn Control",
    to: "/yarn",
    icon: ScanSearch,
    module: "yarn",
    allowedRoles: ["super_admin", "yarn_control_user"],
  },
  {
    label: "Store Control",
    to: "/store",
    icon: Boxes,
    module: "store",
    allowedRoles: ["super_admin", "store_control_user"],
  },
  {
    label: "Knitting",
    to: "/knitting",
    icon: Workflow,
    module: "knitting",
    allowedRoles: ["super_admin", "knitting_user"],
  },
  {
    label: "Linking",
    to: "/linking",
    icon: Shirt,
    module: "linking",
    allowedRoles: ["super_admin", "linking_user"],
  },
  {
    label: "Finishing",
    to: "/finishing",
    icon: Package,
    module: "finishing",
    allowedRoles: ["super_admin", "finishing_user"],
  },
  {
    label: "Reports & Analytics",
    to: "/reports",
    icon: BarChart3,
    module: "reports",
    allowedRoles: ["super_admin", "management_user"],
  },
]

export function hasRoleAccess(userRole: UserRole, allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.includes(userRole)
}

export function hasModuleAccess(
  permissions: AppModuleKey[] | undefined,
  moduleKey: AppModuleKey
) {
  return permissions?.includes(moduleKey) ?? false
}

export function getDefaultRoute(
  permissions: AppModuleKey[] | undefined = []
) {
  return dashboardNavigation.find((item) => permissions.includes(item.module))?.to ?? "/login"
}
