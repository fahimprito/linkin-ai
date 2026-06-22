import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetKnittingModuleQuery } from "@/services/linkin-api"

export function KnittingPage() {
  const { data, isLoading } = useGetKnittingModuleQuery(undefined)

  return (
    <ModuleOverviewPage
      title="Knitting planning and production tracking"
      description="Handle production orders, planning, requisitions, progress updates, and operational reports for knitting lines."
      filters={[
        "Production Orders",
        "Production Planning",
        "Requisition Requests",
        "Production Tracking",
        "Progress Updates",
        "Management Reports",
      ]}
      data={data}
      isLoading={isLoading}
    />
  )
}
