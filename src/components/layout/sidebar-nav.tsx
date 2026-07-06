import { Bot, ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"
import { NavLink, useLocation } from "react-router"

import { UserMenu } from "@/components/shared/user-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import type { NavigationChildItem, NavigationItem } from "@/types/navigation"

type SidebarNavProps = {
  items: NavigationItem[]
  collapsed?: boolean
}

export function SidebarNav({ items, collapsed = false }: SidebarNavProps) {
  const { roleLabel, user } = useAuth()
  const location = useLocation()
  const [manualExpandedSections, setManualExpandedSections] = useState<
    Record<string, boolean>
  >({})

  const autoExpandedSections = useMemo(
    () =>
      items.reduce<Record<string, boolean>>((accumulator, item) => {
        if (!item.children?.length) {
          return accumulator
        }

        accumulator[item.to] = item.children.some((child) =>
          location.pathname.startsWith(child.to)
        )

        return accumulator
      }, {}),
    [items, location.pathname]
  )

  const toggleSection = (key: string) => {
    setManualExpandedSections((current) => ({
      ...current,
      [key]: !(current[key] ?? autoExpandedSections[key] ?? false),
    }))
  }

  const hasActiveDescendant = (children: NavigationChildItem[]): boolean =>
    children.some(
      (child) =>
        location.pathname.startsWith(child.to) ||
        (child.children?.length ? hasActiveDescendant(child.children) : false)
    )

  const renderChildItems = (children: NavigationChildItem[]) =>
    children.map((child) => {
      const hasChildren = Boolean(child.children?.length)
      const isExpanded =
        manualExpandedSections[child.to] ?? autoExpandedSections[child.to] ?? false

      if (hasChildren) {
        return (
          <div key={child.to} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection(child.to)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-all duration-200",
                isExpanded || hasActiveDescendant(child.children ?? [])
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
              )}
            >
              {child.icon ? <child.icon className="size-3.5" /> : null}
              <span className="flex-1">{child.label}</span>
              <ChevronDown
                className={cn("size-3.5 transition-transform", isExpanded && "rotate-180")}
              />
            </button>
            <div
              className={cn(
                "ml-3 overflow-hidden border-l border-sidebar-border pl-2 transition-all duration-300 ease-out",
                isExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {renderChildItems(child.children ?? [])}
            </div>
          </div>
        )
      }

      return (
        <NavLink
          key={child.to}
          to={child.to}
          end
          className={({ isActive }) =>
            cn(
              "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
            )
          }
        >
          {child.icon ? <child.icon className="size-3.5" /> : null}
          <span>{child.label}</span>
        </NavLink>
      )
    })

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "sticky top-0 z-10 flex h-20 items-center border-b border-sidebar-border bg-sidebar",
          collapsed ? "justify-center px-3" : "px-5"
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10">
            <Bot className="size-5" />
          </div>
          <div className={cn(collapsed && "hidden")}>
            <p className="text-sm lg:text-xl font-semibold">KnitOps</p>
            <p className="text-xs text-muted-foreground">
              {roleLabel ?? "Operations ERP"}
            </p>
          </div>
        </div>
      </div>
      <nav
        className={cn(
          "flex-1 space-y-2 py-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {items.map((item) => {
          const Icon = item.icon
          const hasChildren = Boolean(item.children?.length)
          const isSectionExpanded =
            manualExpandedSections[item.to] ?? autoExpandedSections[item.to] ?? false

          return (
            <div key={item.to} className="space-y-1">
              {hasChildren && !collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleSection(item.to)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-colors",
                    isSectionExpanded
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      isSectionExpanded && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <NavLink
                  to={item.to}
                  end={!item.children?.length}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      "flex rounded-2xl text-sm font-medium transition-colors",
                      collapsed
                        ? "justify-center px-2 py-3"
                        : "items-center gap-3 px-3 py-3",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <Icon className="size-4" />
                  <span className={cn(collapsed && "hidden")}>{item.label}</span>
                </NavLink>
              )}
              {hasChildren && !collapsed ? (
                <div
                  className={cn(
                    "ml-4 overflow-hidden border-l border-sidebar-border pl-3 transition-all duration-300 ease-out",
                    isSectionExpanded
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  {renderChildItems(item.children ?? [])}
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


