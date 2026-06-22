import { Menu, Moon, Search, Sun } from "lucide-react"

import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { UserMenu } from "@/components/shared/user-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/hooks/use-auth"
import { useAppDispatch } from "@/store/hooks"
import { toggleSidebar } from "@/store/slices/ui-slice"

export function AppHeader() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="flex h-20 items-center gap-3 px-4 md:px-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Linkin AI Platform
          </p>
          <h1 className="truncate text-lg font-semibold">
            Garment Manufacturing Operations
          </h1>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2 shadow-sm md:flex">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search PO, buyer, shipment, status"
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <NotificationDropdown />
        {user ? <UserMenu user={user} className="hidden lg:block" /> : null}
      </div>
    </header>
  )
}
