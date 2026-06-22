import { Outlet } from "react-router"

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.15fr_0.85fr]">
      <section className="hidden bg-[linear-gradient(145deg,_rgba(24,24,27,0.98),_rgba(54,65,83,0.95))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
            Linkin AI
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Manufacturing orchestration across merchandising, production, and inventory.
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/72">
            A unified operations layer for cross-functional teams managing garment planning,
            production execution, quality control, and executive reporting.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
            <p className="text-2xl font-semibold">8</p>
            <p className="mt-2 text-sm text-white/65">Department-specific roles</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
            <p className="text-2xl font-semibold">128</p>
            <p className="mt-2 text-sm text-white/65">Tracked production orders</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-4">
            <p className="text-2xl font-semibold">94%</p>
            <p className="mt-2 text-sm text-white/65">Shipment readiness visibility</p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </div>
  )
}
