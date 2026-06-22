import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetStoreModuleQuery } from "@/services/linkin-api"

export function StoreControlPage() {
  const { data, isLoading } = useGetStoreModuleQuery(undefined)

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
    />
  )
}
