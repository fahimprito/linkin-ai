import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetFinishingModuleQuery } from "@/services/linkin-api"
import { useAppSelector } from "@/store/hooks"
import { selectFinishingDashboardMetrics } from "@/store/selectors/dashboard-metrics"

export function FinishingPage() {
  const { data, isLoading } = useGetFinishingModuleQuery(undefined)
  const metrics = useAppSelector(selectFinishingDashboardMetrics)

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
      metrics={metrics}
    />
  )
}
