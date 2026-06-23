import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetLinkingModuleQuery } from "@/services/linkin-api"
import { useAppSelector } from "@/store/hooks"
import { selectLinkingDashboardMetrics } from "@/store/selectors/dashboard-metrics"

export function LinkingPage() {
  const { data, isLoading } = useGetLinkingModuleQuery(undefined)
  const metrics = useAppSelector(selectLinkingDashboardMetrics)

  return (
    <ModuleOverviewPage
      title="Linking planning and status updates"
      description="Manage linking orders, operator planning, production tracking, and status updates for in-line visibility."
      filters={[
        "Linking Orders",
        "Planning",
        "Production Tracking",
        "Status Updates",
        "Management Reports",
      ]}
      data={data}
      isLoading={isLoading}
      metrics={metrics}
    />
  )
}
