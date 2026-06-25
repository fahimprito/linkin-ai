import { ModuleFormPage } from "@/pages/shared/ModuleFormPage"

export function LinkingStoreRequisitionPage() {
  return (
    <ModuleFormPage
      title="Linking Store Requisition"
      description="Create the material requisition from Linking to Store Control before planning and daily execution."
      storageKey="form-linking-store-requisition"
      fields={[
        { name: "requisitionNo", label: "Requisition No", placeholder: "REQ-LK-101" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-2002" },
        { name: "itemName", label: "Item Name", placeholder: "Thread Cone" },
        {
          name: "requestType",
          label: "Request Type",
          type: "select",
          options: ["Accessories", "Packing Materials"],
        },
        { name: "requiredQty", label: "Required Qty", placeholder: "2500 pcs" },
        { name: "requiredDate", label: "Required Date", type: "date" },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          placeholder: "Required before starting the next linking lot.",
        },
      ]}
    />
  )
}
