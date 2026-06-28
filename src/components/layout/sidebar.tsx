import { Bot, ChartColumn, LayoutDashboard, Settings, Users } from "lucide-react"
import { NavLink } from "react-router"

import { cn } from "@/lib/utils"

const navigationItems = [
  {
    label: "Overview",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: ChartColumn,
  },
  {
    label: "Team",
    to: "/team",
    icon: Users,
  },
  {
    label: "Automation",
    to: "/automation",
    icon: Bot,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">KnitOps</p>
            <p className="text-xs text-muted-foreground">Admin dashboard</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="rounded-3xl bg-sidebar-accent p-4">
          <p className="text-sm font-semibold">Workspace status</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Base layout is ready. Add charts, tables, and auth next.
          </p>
        </div>
      </div>
    </aside>
  )
}
