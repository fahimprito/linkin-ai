import {
  Activity,
  BarChart3,
  BellRing,
  Boxes,
  Cable,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Download,
  Factory,
  FileText,
  Handshake,
  Gauge,
  List,
  PackageOpen,
  Package,
  ScanSearch,
  Send,
  Shirt,
  ShoppingBag,
  Truck,
  Warehouse,
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
      { label: "Fetch Buyer PO", to: "/merchandise/fetch-po", icon: Download },
      { label: "Yarn Request", to: "/merchandise/yarn-request", icon: Send },
      { label: "Supplier Follow-up", to: "/merchandise/supplier-follow-up", icon: BellRing },
      { label: "Production Updates", to: "/merchandise/production-updates", icon: Activity },
      { label: "Mgmt Report", to: "/merchandise/management-report", icon: FileText },
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
      { label: "Accept PO", to: "/yarn/po-intake", icon: ClipboardList },
      { label: "Supplier Receipt", to: "/yarn/supplier-receipt", icon: ShoppingBag },
      { label: "Inspection", to: "/yarn/inspection", icon: ScanSearch },
      { label: "Floor Delivery", to: "/yarn/floor-delivery", icon: Truck },
      { label: "Mgmt Report", to: "/yarn/management-report", icon: FileText },
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
      { label: "Accessories PO", to: "/store/accessories-po", icon: ClipboardList },
      { label: "Receive & Stock", to: "/store/stock-receipt", icon: Boxes },
      { label: "Inspection", to: "/store/inspection", icon: ClipboardCheck },
      { label: "Floor Delivery", to: "/store/floor-delivery", icon: Truck },
      { label: "Status Report", to: "/store/status-report", icon: FileText },
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
      { label: "Accept PO", to: "/knitting/accept-po", icon: ClipboardList },
      { label: "Requisition", to: "/knitting/requisition", icon: Send },
      { label: "Planning", to: "/knitting/planning", icon: CalendarRange },
      { label: "Daily Update", to: "/knitting/daily-update", icon: Activity },
      { label: "Status Report", to: "/knitting/status-report", icon: FileText },
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
      { label: "Accept PO", to: "/linking/accept-po", icon: ClipboardList },
      { label: "Planning", to: "/linking/planning", icon: CalendarRange },
      { label: "Daily Update", to: "/linking/daily-update", icon: Activity },
      { label: "Status Report", to: "/linking/status-report", icon: FileText },
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
      { label: "Accept PO", to: "/finishing/accept-po", icon: ClipboardList },
      { label: "Requisition", to: "/finishing/requisition", icon: Send },
      { label: "Planning", to: "/finishing/planning", icon: CalendarRange },
      { label: "Daily Update", to: "/finishing/daily-update", icon: Activity },
      { label: "Status Report", to: "/finishing/status-report", icon: FileText },
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
      { label: "Executive Analytics", to: "/reports/executive-analytics", icon: BarChart3 },
      { label: "Full Production", to: "/reports/full-system-production", icon: Activity },
      { label: "Yarn Information", to: "/reports/yarn-information", icon: Cable },
      { label: "Yarn Stock Calc", to: "/reports/yarn-stock-calculation", icon: Boxes },
      { label: "Packing Section", to: "/reports/packing-section", icon: Package },
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
