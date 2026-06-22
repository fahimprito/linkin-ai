import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetLinkingModuleQuery } from "@/services/linkin-api"

export function LinkingPage() {
  const { data, isLoading } = useGetLinkingModuleQuery(undefined)

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
    />
  )
}
