import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetFinishingModuleQuery } from "@/services/linkin-api"

export function FinishingPage() {
  const { data, isLoading } = useGetFinishingModuleQuery(undefined)

  return (
    <ModuleOverviewPage
      title="Washing, ironing, packing, and readiness"
      description="Track finishing operations across washing, ironing, packing, planning, requisitions, production tracking, and reports."
      filters={[
        "Washing",
        "Ironing",
        "Packing",
        "Production Planning",
        "Requisition Requests",
        "Production Tracking",
        "Management Reports",
      ]}
      data={data}
      isLoading={isLoading}
    />
  )
}
