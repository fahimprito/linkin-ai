import { Outlet } from "react-router"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeSidebar } from "@/store/slices/ui-slice"

export function AdminLayout() {
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen)

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.08),_transparent_35%),linear-gradient(180deg,_rgba(24,24,27,0.02),_transparent_45%)]">
      <div className="flex min-h-svh">
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
            isSidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => dispatch(closeSidebar())}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 transition-transform lg:static lg:z-auto lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
