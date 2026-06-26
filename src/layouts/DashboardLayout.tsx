import { Outlet } from "react-router"

import { AppHeader } from "@/components/layout/app-header"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeSidebar } from "@/store/slices/ui-slice"

export function DashboardLayout() {
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen)
  const { navigation } = useAuth()

  return (
    <div className="h-svh overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.08),_transparent_35%),linear-gradient(180deg,_rgba(24,24,27,0.02),_transparent_45%)]">
      <div className="flex h-full overflow-hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
            isSidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => dispatch(closeSidebar())}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 transition-transform lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarNav items={navigation} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          <div className="flex-1 overflow-y-auto">
            <main className="p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <ConfirmationDialog />
    </div>
  )
}
