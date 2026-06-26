import { Bot } from "lucide-react"
import { NavLink } from "react-router"

import { UserMenu } from "@/components/shared/user-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import type { NavigationItem } from "@/types/navigation"

type SidebarNavProps = {
  items: NavigationItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const { roleLabel, user } = useAuth()

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="sticky top-0 z-10 flex h-20 items-center border-b border-sidebar-border bg-sidebar px-5">
        <div className="flex items-center gap-3 h-20">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="text-sm lg:text-xl font-semibold">KnitOps</p>
            <p className="text-xs text-muted-foreground">
              {roleLabel ?? "Operations ERP"}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.to} className="space-y-1">
              <NavLink
                to={item.to}
                end={!item.children?.length}
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
              {item.children?.length ? (
                <div className="ml-4 border-l border-sidebar-border pl-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                        )
                      }
                    >
                      {child.icon ? <child.icon className="size-3.5" /> : null}
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>
      {user ? (
        <div className="border-t border-sidebar-border p-3 lg:hidden">
          <UserMenu
            user={user}
            className="w-full"
            showDetailsOnMobile
            triggerClassName="h-auto w-full justify-start rounded-2xl bg-sidebar-accent px-3 py-3"
            dropdownClassName="right-0 left-0 top-auto bottom-full mb-2 w-full"
          />
        </div>
      ) : null}
    </aside>
  )
}
