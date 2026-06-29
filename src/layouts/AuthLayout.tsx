import { Outlet } from "react-router"

import authSideBackground from "@/assets/image/AP21123708926950.webp"
import brainSystemLogo from "@/assets/image/brain-system-logo.jpeg"

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.15fr_0.85fr]">
      <section
        className="hidden bg-cover bg-center bg-no-repeat p-10 text-white lg:flex lg:flex-col lg:justify-between"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(24,24,27,0.82), rgba(54,65,83,0.78)), url(${authSideBackground})`,
        }}
      >
        <div className="max-w-md">
          <h1 className="mt-6 text-6xl font-semibold tracking-tight">
            KnitOps
          </h1>
          <p className="mt-3 text-xl font-medium tracking-[0.18em] text-white/65 uppercase">
            Manufacturing orchestration across merchandising, production, and inventory.
          </p>
          <p className="mt-5 text-md leading-7 text-white/72">
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
      <section className="relative flex items-center justify-center bg-secondary/60 px-4 py-10 pb-24">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
        <img
          src={brainSystemLogo}
          alt="Brain System developer logo"
          className="pointer-events-none absolute bottom-4 right-4 h-12 w-auto object-contain opacity-90 sm:bottom-6 sm:right-6 sm:h-14"
        />
      </section>
    </div>
  )
}
