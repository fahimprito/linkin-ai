import {
  Activity,
  BarChart3,
  Boxes,
  Cable,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Factory,
  Handshake,
  Gauge,
  List,
  PackageOpen,
  ScanSearch,
  Send,
  Shirt,
  ShoppingBag,
  Truck,
  Warehouse,
  CheckCircle,
  FileSearch,
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
    label: "Main Dashboard",
    to: "/dashboard",
    icon: Gauge,
    module: "dashboard",
    allowedRoles: [
      "super_admin",
      "merchandise_user",
      "yarn_control_user",
      "store_control_user",
      "knitting_user",
      "linking_user",
      "finishing_user",
      "management_user",
    ],
    children: [{ label: "Overview", to: "/dashboard", icon: Gauge }],
  },
  {
    label: "Merchandise",
    to: "/merchandise",
    icon: Handshake,
    module: "merchandise",
    allowedRoles: ["super_admin", "merchandise_user"],
    children: [
      { label: "PO List", to: "/merchandise", icon: List },
    ],
  },
  {
    label: "Yarn Control",
    to: "/yarn",
    icon: Cable,
    module: "yarn",
    allowedRoles: ["super_admin", "yarn_control_user"],
    children: [
      { label: "Overview", to: "/yarn", icon: Gauge },
      { label: "Check Requests", to: "/yarn/check-requests", icon: CheckCircle },
      { label: "Supplier Orders", to: "/yarn/supplier-orders", icon: ShoppingBag },
      { label: "Delivery Log", to: "/yarn/delivery-log", icon: Truck },
      { label: "Batch Inspection", to: "/yarn/batch-inspection", icon: FileSearch },
      { label: "Issue to Knitting", to: "/yarn/issue-to-knitting", icon: Send },
    ],
  },
  {
    label: "Store Control",
    to: "/store",
    icon: Warehouse,
    module: "store",
    allowedRoles: ["super_admin", "store_control_user"],
    children: [
      { label: "Overview", to: "/store", icon: Gauge },
      { label: "Requisitions", to: "/store/requisitions", icon: ClipboardList },
      { label: "Issue Log", to: "/store/issue-log", icon: Truck },
    ],
  },
  {
    label: "Knitting",
    to: "/knitting",
    icon: Factory,
    module: "knitting",
    allowedRoles: ["super_admin", "knitting_user"],
    children: [
      { label: "Overview", to: "/knitting", icon: Gauge },
      { label: "Yarn Requisition", to: "/knitting/requisition", icon: Send },
      { label: "Yarn Issuance", to: "/knitting/issuance-log", icon: Boxes },
      { label: "Planning", to: "/knitting/planning", icon: CalendarRange },
      { label: "Daily Progress", to: "/knitting/daily-progress", icon: Activity },
    ],
  },
  {
    label: "Linking",
    to: "/linking",
    icon: Shirt,
    module: "linking",
    allowedRoles: ["super_admin", "linking_user"],
    children: [
      { label: "Overview", to: "/linking", icon: Gauge },
      { label: "Store Requisition", to: "/linking/store-requisition", icon: ClipboardList },
      { label: "Store Issuance Log", to: "/linking/store-issuance-log", icon: ClipboardCheck },
      { label: "Planning", to: "/linking/planning", icon: CalendarRange },
      { label: "Daily Progress", to: "/linking/daily-progress", icon: Activity },
    ],
  },
  {
    label: "Finishing",
    to: "/finishing",
    icon: PackageOpen,
    module: "finishing",
    allowedRoles: ["super_admin", "finishing_user"],
    children: [
      { label: "Overview", to: "/finishing", icon: Gauge },
      { label: "Store Requisition", to: "/finishing/store-requisition", icon: ClipboardList },
      { label: "Store Issuance Log", to: "/finishing/store-issuance-log", icon: ClipboardCheck },
      { label: "Planning", to: "/finishing/planning", icon: CalendarRange },
      { label: "Daily Progress", to: "/finishing/daily-progress", icon: Activity },
    ],
  },
  {
    label: "Reports & Analytics",
    to: "/reports",
    icon: BarChart3,
    module: "reports",
    allowedRoles: ["super_admin", "management_user"],
    children: [
      { label: "Overview", to: "/reports", icon: Gauge },
      { label: "Full Production", to: "/reports/full-system-production", icon: Activity },
      { label: "Yarn Information", to: "/reports/yarn-information", icon: Cable },
      { label: "Yarn Stock Calc", to: "/reports/yarn-stock-calculation", icon: Boxes },
      { label: "Linking Report", to: "/reports/linking-production", icon: Shirt },
      { label: "PO Tracker", to: "/reports/po-tracker", icon: ScanSearch },
    ],
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

export function isPrivilegedSidebarRole(userRole: UserRole) {
  return userRole === "super_admin" || userRole === "management_user"
}

export function getNavigationForUser(
  userRole: UserRole,
  permissions: AppModuleKey[] = []
) {
  const allowedItems = dashboardNavigation.filter((item) =>
    permissions.includes(item.module)
  )

  if (isPrivilegedSidebarRole(userRole)) {
    return allowedItems
  }

  return allowedItems.flatMap((item) => {
    if (item.module === "dashboard") {
      return [
        {
          ...item,
          children: undefined,
        },
      ]
    }

    if (!item.children?.length) {
      return [
        {
          ...item,
          children: undefined,
        },
      ]
    }

    return item.children.map((child) => ({
      ...item,
      label: child.label,
      to: child.to,
      icon: child.icon ?? item.icon,
      children: undefined,
    }))
  })
}

export function getDefaultRoute(
  permissions: AppModuleKey[] | undefined = []
) {
  return dashboardNavigation.find((item) => permissions.includes(item.module))?.to ?? "/login"
}
