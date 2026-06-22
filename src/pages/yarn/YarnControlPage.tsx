import { ModuleOverviewPage } from "@/pages/shared/ModuleOverviewPage"
import { useGetYarnModuleQuery } from "@/services/linkin-api"

export function YarnControlPage() {
  const { data, isLoading } = useGetYarnModuleQuery(undefined)

  return (
    <ModuleOverviewPage
      title="Yarn purchasing, stock, and inspections"
      description="Monitor yarn purchase orders, supplier receipts, stock movement, inspection results, and floor delivery records."
      filters={[
        "Yarn Purchase Orders",
        "Supplier Receipts",
        "Stock Management",
        "Quality",
        "Elasticity",
        "Moisture",
        "Floor Delivery Records",
      ]}
      data={data}
      isLoading={isLoading}
      extraTableTitle="Inspection fields"
    />
  )
}
