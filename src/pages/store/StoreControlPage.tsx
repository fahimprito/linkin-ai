import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetStoreModuleQuery } from "@/services/linkin-api"
import { useAppSelector } from "@/store/hooks"
import { selectStoreDashboardMetrics } from "@/store/selectors/dashboard-metrics"

export function StoreControlPage() {
  const { data, isLoading } = useGetStoreModuleQuery(undefined)
  const metrics = useAppSelector(selectStoreDashboardMetrics)

  return (
    <ModuleOverviewPage
      title="Accessories inventory and stock flow"
      description="Track accessories purchase orders, receipts, inspections, deliveries, inventory, and stock reporting."
      filters={[
        "Accessories Purchase Orders",
        "Supplier Receipts",
        "Inventory Tracking",
        "Inspection Records",
        "Delivery Records",
        "Stock Reports",
      ]}
      data={data}
      isLoading={isLoading}
      metrics={metrics}
    />
  )
}
