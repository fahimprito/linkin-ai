import {
  BarChart3,
  Boxes,
  Cable,
  CheckCircle,
  ClipboardList,
  FileSearch,
  Gauge,
  Handshake,
  List,
  Palette,
  ScanSearch,
  Settings,
  ShoppingBag,
  Truck,
  Warehouse,
} from "lucide-react"

import type { AppModuleKey, UserRole } from "@/types/auth"
import type { NavigationItem } from "@/types/navigation"

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Admin",
  merchandising_user: "Merchandising User",
  design_user: "Design User",
  yarn_user: "Yarn User",
  store_user: "Store User",
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
      "merchandising_user",
      "design_user",
      "yarn_user",
      "store_user",
      "management_user",
    ],
    children: [{ label: "Overview", to: "/dashboard", icon: Gauge }],
  },
  {
    label: "Merchandise",
    to: "/merchandise/dashboard",
    icon: Handshake,
    module: "merchandise",
    allowedRoles: ["super_admin", "merchandising_user"],
    children: [
      { label: "Dashboard", to: "/merchandise/dashboard", icon: Gauge },
      { label: "PO List", to: "/merchandise", icon: List },
      { label: "Sourcing", to: "/merchandise/sourcing", icon: ShoppingBag },
      { label: "Supplier", to: "/merchandise/supplier", icon: ShoppingBag },
      { label: "Production", to: "/merchandise/production", icon: ClipboardList },
      { label: "Inventory", to: "/merchandise/inventory", icon: Boxes },
      { label: "Shipment", to: "/merchandise/shipment", icon: Truck },
      { label: "Report", to: "/merchandise/report", icon: BarChart3 },
      { label: "Settings", to: "/merchandise/settings", icon: Settings },
    ],
  },
  {
    label: "Design",
    to: "/design/dashboard",
    icon: Palette,
    module: "design",
    allowedRoles: ["super_admin", "design_user"],
    children: [
      { label: "Dashboard", to: "/design/dashboard", icon: Gauge },
      {
        label: "Request Consumption",
        to: "/design/request-consumption",
        icon: ClipboardList,
      },
      {
        label: "Submitted PO List",
        to: "/design/submitted-po-list",
        icon: CheckCircle,
      },
      { label: "Reports", to: "/design/reports", icon: BarChart3 },
      { label: "Settings", to: "/design/settings", icon: Settings },
    ],
  },
  {
    label: "Yarn",
    to: "/yarn/dashboard",
    icon: Cable,
    module: "yarn",
    allowedRoles: ["super_admin", "yarn_user"],
    children: [
      { label: "Dashboard", to: "/yarn/dashboard", icon: Gauge },
      { label: "PO List", to: "/yarn/po-list", icon: List },
      { label: "Inspection", to: "/yarn/inspection", icon: FileSearch },
      { label: "Swatch Card", to: "/yarn/swatch-card", icon: CheckCircle },
      { label: "Report", to: "/yarn/report", icon: BarChart3 },
      { label: "Inventory", to: "/yarn/inventory", icon: Boxes },
      { label: "Requisition", to: "/yarn/requisition", icon: CheckCircle },
      { label: "Receive Yarn", to: "/yarn/receipt", icon: Truck },
    ],
  },
  {
    label: "Store",
    to: "/store",
    icon: Warehouse,
    module: "store",
    allowedRoles: ["super_admin", "store_user"],
    children: [
      { label: "Dashboard", to: "/store", icon: Gauge },
      { label: "Requisitions", to: "/store/requisitions", icon: ClipboardList },
      { label: "Issue Log", to: "/store/issue-log", icon: Truck },
    ],
  },
  {
    label: "Management",
    to: "/management",
    icon: BarChart3,
    module: "reports",
    allowedRoles: ["super_admin", "management_user"],
    children: [
      { label: "Dashboard", to: "/management", icon: Gauge },
      { label: "Yarn Information", to: "/management/yarn-information", icon: Cable },
      { label: "Yarn Stock Calc", to: "/management/yarn-stock-calculation", icon: Boxes },
      { label: "PO Tracker", to: "/management/po-tracker", icon: ScanSearch },
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
  return userRole === "super_admin"
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
      return []
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
  userRole: UserRole,
  permissions: AppModuleKey[] | undefined = []
) {
  return getNavigationForUser(userRole, permissions)[0]?.to ?? "/login"
}
