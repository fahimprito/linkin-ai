import { ModuleFormPage } from "@/pages/shared/ModuleFormPage"

const statusOptions = ["Knitting", "Linking", "Finishing"]
const requisitionTypeOptions = ["Yarn", "Accessories", "Packing Materials"]
const finishingSubStageOptions = ["Wash", "Sew", "Iron", "Pack"]

export function MerchandiseFetchPoPage() {
  return (
    <ModuleFormPage
      title="Fetch PO From Buyer Portal"
      description="Capture purchase order intake from the buyer portal, standardize incoming fields, and prepare the merchandising workflow."
      storageKey="form-merchandise-fetch-po"
      summaryCards={(records) => {
        return [
          {
            label: "Portal Captures",
            value: String(records.length).padStart(2, "0"),            tone: "success",
          },
          {
            label: "Standardized Entries",
            value: String(records.length).padStart(2, "0"),            tone: "default",
          },
        ]
      }}
      fields={[
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "styleNo", label: "Style No", placeholder: "ST-2048" },
        { name: "gg", label: "GG", placeholder: "12" },
        { name: "orderQty", label: "Order Qty", type: "number", placeholder: "12000" },
        { name: "designLayout", label: "Design Layout", placeholder: "Cable knit mockup" },
        { name: "approval", label: "Approval Info", placeholder: "Approved by buyer" },
        { name: "techPack", label: "Tech Pack", placeholder: "TP-v4" },
      ]}
    />
  )
}

export function MerchandiseYarnRequestPage() {
  return (
    <ModuleFormPage
      title="Yarn Consumption Request"
      description="Raise yarn consumption requirements from merchandise to design and coordinate sourcing readiness."
      storageKey="form-merchandise-yarn-request"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "styleNo", label: "Style No", placeholder: "ST-2048" },
        { name: "color", label: "Color", placeholder: "Navy" },
        { name: "yarnComposition", label: "Yarn Composition", placeholder: "80% Wool / 20% Nylon" },
        { name: "requestedQty", label: "Requested Qty", type: "number", placeholder: "950" },
        { name: "requestedBy", label: "Requested By", placeholder: "Merchandiser Name" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Urgent for first sample and bulk plan." },
      ]}
    />
  )
}

export function MerchandiseSupplierFollowUpPage() {
  return (
    <ModuleFormPage
      title="Supplier Follow-up"
      description="Track yarn and accessories order placement, sourcing status, and supplier follow-up actions."
      storageKey="form-merchandise-supplier-follow-up"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
        { name: "itemType", label: "Item Type", type: "select", options: ["Yarn", "Accessories"] },
        { name: "orderDate", label: "Order Date", type: "date" },
        { name: "expectedArrival", label: "Expected Arrival", type: "date" },
        { name: "followUpStatus", label: "Follow-up Status", placeholder: "Pending dispatch confirmation" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Store stock checked before order placement." },
      ]}
    />
  )
}

export function MerchandiseProductionUpdatesPage() {
  return (
    <ModuleFormPage
      title="Production Updates"
      description="Track merchandising follow-up across knitting, linking, and finishing updates for each PO."
      storageKey="form-merchandise-production-updates"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "currentStatus", label: "Current Status", type: "select", options: statusOptions },
        { name: "knittingUpdate", label: "Knitting Update", placeholder: "6,500 complete" },
        { name: "linkingUpdate", label: "Linking Update", placeholder: "3,200 complete" },
        { name: "finishingUpdate", label: "Finishing Update", placeholder: "1,000 packed" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Awaiting wash approval for next lot." },
      ]}
    />
  )
}

export function MerchandiseManagementReportPage() {
  return (
    <ModuleFormPage
      title="Merchandise Management Report"
      description="Prepare a management-ready status report from purchase order, sourcing, and production follow-up information."
      storageKey="form-merchandise-management-report"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "orderQty", label: "Order Qty", type: "number", placeholder: "12000" },
        { name: "productionStatus", label: "Production Status", type: "select", options: statusOptions },
        { name: "shippingStatus", label: "Shipping Status", placeholder: "On schedule" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Ready for management review." },
      ]}
    />
  )
}

export function YarnPoIntakePage() {
  return (
    <ModuleFormPage
      title="Accept PO For Yarn Control"
      description="Register yarn PO intake before supplier receiving, inspection, stock updates, and floor issue."
      storageKey="form-yarn-po-intake"
      fields={[
        { name: "buyerName", label: "Buyer Name", placeholder: "Zara" },
        { name: "styleNo", label: "Style No", placeholder: "ST-4102" },
        { name: "poNumber", label: "PO Number", placeholder: "YP-1044" },
        { name: "color", label: "Color", placeholder: "Black" },
        { name: "quantity", label: "Quantity", type: "number", placeholder: "800" },
        { name: "bag", label: "Bag", type: "number", placeholder: "32" },
        { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
      ]}
    />
  )
}

export function YarnSupplierReceiptPage() {
  return (
    <ModuleFormPage
      title="Supplier Receipt And Stock Update"
      description="Receive yarn quantities from suppliers and update stock records immediately."
      storageKey="form-yarn-supplier-receipt"
      fields={[
        { name: "receivedDate", label: "Received Date", type: "date" },
        { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
        { name: "lotNo", label: "Lot No", placeholder: "LOT-9932" },
        { name: "quantity", label: "Quantity", type: "number", placeholder: "820" },
        { name: "bag", label: "Bag", type: "number", placeholder: "33" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Received and placed in inspection queue." },
      ]}
    />
  )
}

export function YarnInspectionPage() {
  return (
    <ModuleFormPage
      title="Yarn Inspection Record"
      description="Inspect yarn quality, elasticity, moisture, quantity, and supplier compliance before release."
      storageKey="form-yarn-inspection"
      fields={[
        { name: "buyerName", label: "Buyer Name", placeholder: "Zara" },
        { name: "styleNo", label: "Style No", placeholder: "ST-4102" },
        { name: "color", label: "Color", placeholder: "Black" },
        { name: "lotNo", label: "Lot No", placeholder: "LOT-9932" },
        { name: "quality", label: "Quality", placeholder: "A" },
        { name: "elasticity", label: "Elasticity", placeholder: "Stable" },
        { name: "moisture", label: "Moisture", placeholder: "6.2%" },
        { name: "quantity", label: "Quantity", placeholder: "820 kg" },
        { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
      ]}
    />
  )
}

export function YarnFloorDeliveryPage() {
  return (
    <ModuleFormPage
      title="Yarn Floor Delivery"
      description="Issue yarn to the floor according to requisitions raised by production departments."
      storageKey="form-yarn-floor-delivery"
      fields={[
        { name: "date", label: "Date", type: "date" },
        { name: "colorQty", label: "Color Qty", placeholder: "Navy 320 kg" },
        { name: "deliveryYarn", label: "Delivery Yarn", placeholder: "240 kg" },
        { name: "deliveryBag", label: "Delivery Bag", placeholder: "12" },
        { name: "balanceYarn", label: "Balance Yarn", placeholder: "80 kg" },
        { name: "balanceBag", label: "Balance Bag", placeholder: "4" },
        { name: "signature", label: "Controller Signature", placeholder: "Nusrat Jahan" },
      ]}
    />
  )
}

export function YarnManagementReportPage() {
  return (
    <ModuleFormPage
      title="Yarn Management Report"
      description="Prepare management reporting for yarn PO intake, receipt, inspection, stock, and floor delivery."
      storageKey="form-yarn-management-report"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "openPos", label: "Open POs", placeholder: "18" },
        { name: "receivedToday", label: "Received Today", placeholder: "06" },
        { name: "inspectionStatus", label: "Inspection Status", placeholder: "2 pending / 8 passed" },
        { name: "criticalStock", label: "Critical Stock", placeholder: "Cotton 30/1 low" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Management summary for yarn control." },
      ]}
    />
  )
}

export function StoreAccessoriesPoPage() {
  return (
    <ModuleFormPage
      title="Accept Accessories PO"
      description="Register accessories purchase orders before supplier receiving, inspection, and delivery handling."
      storageKey="form-store-accessories-po"
      fields={[
        { name: "buyerName", label: "Buyer Name", placeholder: "Uniqlo" },
        { name: "styleNo", label: "Style No", placeholder: "AC-5001" },
        { name: "poNumber", label: "PO Number", placeholder: "AP-221" },
        { name: "itemName", label: "Item Name", placeholder: "Hang Tag" },
        { name: "orderQty", label: "Order Qty", type: "number", placeholder: "15000" },
        { name: "supplier", label: "Supplier", placeholder: "Label House" },
      ]}
    />
  )
}

export function StoreStockReceiptPage() {
  return (
    <ModuleFormPage
      title="Receive Qty And Update Stock"
      description="Receive accessory quantities from suppliers and update store records with current stock."
      storageKey="form-store-stock-receipt"
      fields={[
        { name: "receivedDate", label: "Received Date", type: "date" },
        { name: "itemName", label: "Item Name", placeholder: "Hang Tag" },
        { name: "receivedQty", label: "Received Qty", type: "number", placeholder: "12000" },
        { name: "stockBalance", label: "Stock Balance", placeholder: "18200" },
        { name: "supplier", label: "Supplier", placeholder: "Label House" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Updated into store control stock." },
      ]}
    />
  )
}

export function StoreInspectionPage() {
  return (
    <ModuleFormPage
      title="Accessories Inspection Record"
      description="Inspect accessories and update receiving quality records before release to production."
      storageKey="form-store-inspection"
      fields={[
        { name: "itemName", label: "Item Name", placeholder: "Elastic Tape" },
        { name: "buyerName", label: "Buyer Name", placeholder: "Uniqlo" },
        { name: "styleNo", label: "Style No", placeholder: "AC-5001" },
        { name: "inspectionResult", label: "Inspection Result", placeholder: "Passed" },
        { name: "receivedQty", label: "Received Qty", placeholder: "4200" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Approved for floor issue." },
      ]}
    />
  )
}

export function StoreFloorDeliveryPage() {
  return (
    <ModuleFormPage
      title="Accessories Floor Delivery"
      description="Deliver accessories to the floor according to production requisitions and log current issue status."
      storageKey="form-store-floor-delivery"
      fields={[
        { name: "date", label: "Date", type: "date" },
        { name: "requisitionNo", label: "Requisition No", placeholder: "REQ-ST-221" },
        { name: "itemName", label: "Item Name", placeholder: "Hang Tag" },
        { name: "deliveryQty", label: "Delivery Qty", placeholder: "5000" },
        { name: "balanceQty", label: "Balance Qty", placeholder: "7000" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Issued to production floor A." },
      ]}
    />
  )
}

export function StoreStatusReportPage() {
  return (
    <ModuleFormPage
      title="Store Status Report"
      description="Prepare a management snapshot of accessories intake, inspection, stock, and floor delivery."
      storageKey="form-store-status-report"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "openPos", label: "Open POs", placeholder: "24" },
        { name: "receivedToday", label: "Received Today", placeholder: "04" },
        { name: "inspectionQueue", label: "Inspection Queue", placeholder: "09" },
        { name: "deliveryStatus", label: "Delivery Status", placeholder: "6 completed" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Management summary for store control." },
      ]}
    />
  )
}

export function KnittingAcceptPoPage() {
  return (
    <ModuleFormPage
      title="Accept PO For Knitting"
      description="Register production orders for knitting and prepare operational planning."
      storageKey="form-knitting-accept-po"
      fields={[
        { name: "serialNo", label: "Serial No", placeholder: "01" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "gg", label: "GG", placeholder: "12" },
        { name: "styleNo", label: "Style No", placeholder: "KN-1102" },
        { name: "orderQty", label: "Order Qty", type: "number", placeholder: "12000" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Accepted into knitting production." },
      ]}
    />
  )
}

export function KnittingRequisitionPage() {
  return (
    <ModuleFormPage
      title="Raise Requisition To Yarn And Store"
      description="Submit material requisitions from knitting to yarn control and store control."
      storageKey="form-knitting-requisition"
      fields={[
        { name: "requisitionNo", label: "Requisition No", placeholder: "REQ-KN-109" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "requestType", label: "Request Type", type: "select", options: requisitionTypeOptions },
        { name: "requiredQty", label: "Required Qty", placeholder: "320 kg" },
        { name: "requiredDate", label: "Required Date", type: "date" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Needed for line start tomorrow morning." },
      ]}
    />
  )
}

export function KnittingPlanningPage() {
  return (
    <ModuleFormPage
      title="Knitting Production Planning"
      description="Plan knitting execution and update records for line assignment and current schedule."
      storageKey="form-knitting-planning"
      fields={[
        { name: "line", label: "Line", placeholder: "Knitting 05" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "todayPlan", label: "Today Plan", placeholder: "1500 pcs" },
        { name: "totalPlan", label: "Total Plan", placeholder: "12000 pcs" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Shift plan aligned with available yarn." },
      ]}
    />
  )
}

export function KnittingDailyUpdatePage() {
  return (
    <ModuleFormPage
      title="Knitting Daily Production Update"
      description="Update current knitting production records for day-to-day tracking and management visibility."
      storageKey="form-knitting-daily-update"
      fields={[
        { name: "serialNo", label: "Serial No", placeholder: "01" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "styleNo", label: "Style No", placeholder: "KN-1102" },
        { name: "orderQty", label: "Order Qty", placeholder: "12000" },
        { name: "todayOutput", label: "Knitting Today", placeholder: "850" },
        { name: "totalOutput", label: "Knitting Total", placeholder: "6500" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Machine 3 maintenance delayed one lot." },
      ]}
    />
  )
}

export function KnittingStatusReportPage() {
  return (
    <ModuleFormPage
      title="Knitting Status Report"
      description="Summarize knitting production status for management review."
      storageKey="form-knitting-status-report"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "runningOrders", label: "Running Orders", placeholder: "11" },
        { name: "todayOutput", label: "Today Output", placeholder: "4,300" },
        { name: "lateRequisitions", label: "Late Requisitions", placeholder: "02" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Current knitting summary." },
      ]}
    />
  )
}

export function LinkingAcceptPoPage() {
  return (
    <ModuleFormPage
      title="Accept PO For Linking"
      description="Register linking production orders before planning and live production tracking."
      storageKey="form-linking-accept-po"
      fields={[
        { name: "serial", label: "Serial", placeholder: "01" },
        { name: "buyerName", label: "Buyer Name", placeholder: "Zara" },
        { name: "gg", label: "GG", placeholder: "12" },
        { name: "orderQty", label: "Order Qty", placeholder: "8500" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Accepted into linking queue." },
      ]}
    />
  )
}

export function LinkingPlanningPage() {
  return (
    <ModuleFormPage
      title="Linking Production Plan"
      description="Create the linking plan after Store Control has issued the required materials."
      storageKey="form-linking-planning"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-2002" },
        { name: "line", label: "Line / Team", placeholder: "Line A" },
        { name: "startDate", label: "Start Date", type: "date" },
        { name: "endDate", label: "End Date", type: "date" },
        { name: "totalDays", label: "Total Days", placeholder: "7" },
        { name: "dailyTarget", label: "Daily Target", placeholder: "1200" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Plan aligned with available store issue and operator capacity." },
      ]}
    />
  )
}

export function LinkingDailyUpdatePage() {
  return (
    <ModuleFormPage
      title="Linking Daily Production Progress"
      description="Submit the daily linking report so the module dashboard and management dashboard stay updated."
      storageKey="form-linking-daily-update"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-2002" },
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "plannedQty", label: "Planned Qty", placeholder: "1200" },
        { name: "producedQty", label: "Produced Qty", placeholder: "950" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Daily linking progress and floor remarks." },
      ]}
    />
  )
}

export function LinkingStatusReportPage() {
  return (
    <ModuleFormPage
      title="Linking Status Report"
      description="Prepare a status summary for current linking operations and management review."
      storageKey="form-linking-status-report"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "activeOrders", label: "Active Orders", placeholder: "09" },
        { name: "dailyOutput", label: "Daily Output", placeholder: "4,600" },
        { name: "balanceLots", label: "Balance Lots", placeholder: "01 critical" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Linking management update." },
      ]}
    />
  )
}

export function FinishingAcceptPoPage() {
  return (
    <ModuleFormPage
      title="Accept PO For Finishing"
      description="Register finishing POs for wash, ironing, packing, and downstream execution."
      storageKey="form-finishing-accept-po"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-3003" },
        { name: "buyerName", label: "Buyer Name", placeholder: "Uniqlo" },
        { name: "styleNo", label: "Style No", placeholder: "FN-2044" },
        { name: "orderQty", label: "Order Qty", placeholder: "15000" },
        { name: "section", label: "Section", type: "select", options: ["Wash", "Iron", "Packing"] },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Accepted for finishing schedule." },
      ]}
    />
  )
}

export function FinishingRequisitionPage() {
  return (
    <ModuleFormPage
      title="Finishing Store Requisition"
      description="Send a material requisition from Finishing to Store Control for stage support items."
      storageKey="form-finishing-requisition"
      fields={[
        { name: "requisitionNo", label: "Requisition No", placeholder: "REQ-FN-221" },
        { name: "poNumber", label: "PO Number", placeholder: "LK-2003" },
        { name: "itemName", label: "Item Name", placeholder: "Poly Bag Large" },
        { name: "requestType", label: "Request Type", type: "select", options: ["Accessories", "Packing Materials"] },
        { name: "requiredQty", label: "Required Qty", placeholder: "3,000 pcs" },
        { name: "requiredDate", label: "Required Date", type: "date" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Required before final packing." },
      ]}
    />
  )
}

export function FinishingPlanningPage() {
  return (
    <ModuleFormPage
      title="Finishing Sub-stage Planning"
      description="Create separate finishing plans for wash, sew, iron, and pack under the same PO."
      storageKey="form-finishing-planning"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-2003" },
        { name: "subStage", label: "Sub-stage", type: "select", options: finishingSubStageOptions },
        { name: "startDate", label: "Start Date", type: "date" },
        { name: "endDate", label: "End Date", type: "date" },
        { name: "totalDays", label: "Total Days", placeholder: "4" },
        { name: "dailyTarget", label: "Daily Target", placeholder: "2500" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Plan aligned with finishing section capacity." },
      ]}
    />
  )
}

export function FinishingDailyUpdatePage() {
  return (
    <ModuleFormPage
      title="Finishing Daily Progress"
      description="Submit the daily progress for each finishing sub-stage so the dashboards stay in sync."
      storageKey="form-finishing-daily-update"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-2003" },
        { name: "subStage", label: "Sub-stage", type: "select", options: finishingSubStageOptions },
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "plannedQty", label: "Planned Qty", placeholder: "2500" },
        { name: "producedQty", label: "Produced Qty", placeholder: "2100" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Daily finishing remarks for this sub-stage." },
      ]}
    />
  )
}

export function FinishingStatusReportPage() {
  return (
    <ModuleFormPage
      title="Finishing Status Report"
      description="Summarize current finishing status for wash, iron, packing, and management visibility."
      storageKey="form-finishing-status-report"
      fields={[
        { name: "reportDate", label: "Report Date", type: "date" },
        { name: "washQueue", label: "Wash Queue", placeholder: "13" },
        { name: "packingReady", label: "Packing Ready", placeholder: "7850" },
        { name: "ironCapacity", label: "Iron Capacity", placeholder: "91%" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Finishing status summary." },
      ]}
    />
  )
}

export function FullSystemProductionReportPage() {
  return (
    <ModuleFormPage
      title="Daily Full System Production Report"
      description="Capture the daily full-system production report across knitting, linking, trimming, mending, wash, attachment, sewing, and packing."
      storageKey="form-report-full-system-production"
      fields={[
        { name: "serialNo", label: "Serial No", placeholder: "01" },
        { name: "gg", label: "GG", placeholder: "12" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "styleNo", label: "Style No", placeholder: "ST-2048" },
        { name: "orderQty", label: "Order Qty", placeholder: "12000" },
        { name: "inspection", label: "Inspection", placeholder: "Passed" },
        { name: "knittingToday", label: "Knitting Today", placeholder: "850" },
        { name: "knittingTotal", label: "Knitting Total", placeholder: "6500" },
        { name: "linkingToday", label: "Linking Today", placeholder: "700" },
        { name: "linkingTotal", label: "Linking Total", placeholder: "4300" },
        { name: "trimmingToday", label: "Trimming Today", placeholder: "500" },
        { name: "trimmingTotal", label: "Trimming Total", placeholder: "2500" },
        { name: "mendingToday", label: "Mending Today", placeholder: "420" },
        { name: "mendingTotal", label: "Mending Total", placeholder: "1900" },
        { name: "washToday", label: "Wash Today", placeholder: "350" },
        { name: "washTotal", label: "Wash Total", placeholder: "900" },
        { name: "attachmentToday", label: "Attachment Today", placeholder: "320" },
        { name: "attachmentTotal", label: "Attachment Total", placeholder: "740" },
        { name: "sewingToday", label: "Sewing Today", placeholder: "280" },
        { name: "sewingTotal", label: "Sewing Total", placeholder: "620" },
        { name: "packingToday", label: "Packing Today", placeholder: "210" },
        { name: "packingTotal", label: "Packing Total", placeholder: "500" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Daily full production remarks." },
      ]}
    />
  )
}

export function YarnInformationReportPage() {
  return (
    <ModuleFormPage
      title="Yarn Information Register"
      description="Maintain yarn information fields for buyer, style, color, lot, composition, receiving, and supplier traceability."
      storageKey="form-report-yarn-information"
      fields={[
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "styleNo", label: "Style No", placeholder: "ST-2048" },
        { name: "color", label: "Color", placeholder: "Navy" },
        { name: "lotNo", label: "Lot No", placeholder: "LOT-1022" },
        { name: "yarnComposition", label: "Yarn Composition", placeholder: "80% Wool / 20% Nylon" },
        { name: "receivedDate", label: "Received Date", type: "date" },
        { name: "quantity", label: "Quantity", placeholder: "820 kg" },
        { name: "bag", label: "Bag", placeholder: "33" },
        { name: "remarks", label: "Remarks", placeholder: "Released for knitting" },
        { name: "supplier", label: "Supplier", placeholder: "Delta Yarn" },
      ]}
    />
  )
}

export function YarnStockCalculationReportPage() {
  return (
    <ModuleFormPage
      title="Yarn Stock Calculation"
      description="Track daily yarn stock movement by color, delivered quantities, balances, and controller signature."
      storageKey="form-report-yarn-stock-calculation"
      fields={[
        { name: "date", label: "Date", type: "date" },
        { name: "colorQty", label: "Color Qty", placeholder: "Navy 320 kg" },
        { name: "deliveryYarn", label: "Delivery Yarn", placeholder: "240 kg" },
        { name: "deliveryBag", label: "Delivery Bag", placeholder: "12" },
        { name: "balanceYarn", label: "Balance Yarn", placeholder: "80 kg" },
        { name: "balanceBag", label: "Balance Bag", placeholder: "4" },
        { name: "signature", label: "Signature", placeholder: "Controller Name" },
      ]}
    />
  )
}

export function PackingSectionReportPage() {
  return (
    <ModuleFormPage
      title="Packing Section Report"
      description="Capture packing section quantities for before, today, and total progress against each order."
      storageKey="form-report-packing-section"
      fields={[
        { name: "slNo", label: "SL No", placeholder: "01" },
        { name: "buyer", label: "Buyer", placeholder: "Uniqlo" },
        { name: "style", label: "Style", placeholder: "FN-2044" },
        { name: "orderQty", label: "Order Qty", placeholder: "15000" },
        { name: "before", label: "Before", placeholder: "9200" },
        { name: "today", label: "Today", placeholder: "500" },
        { name: "total", label: "Total", placeholder: "9700" },
      ]}
    />
  )
}

export function LinkingProductionReportPage() {
  return (
    <ModuleFormPage
      title="Linking Production Report"
      description="Track knitting received, linking, trimming, and mending progress with today, total, and balance values."
      storageKey="form-report-linking-production"
      fields={[
        { name: "serial", label: "Serial", placeholder: "01" },
        { name: "buyerName", label: "Buyer Name", placeholder: "Zara" },
        { name: "gg", label: "GG", placeholder: "12" },
        { name: "orderQty", label: "Order Qty", placeholder: "8500" },
        { name: "knittingReceivedToday", label: "Knitting Recvd Today", placeholder: "1200" },
        { name: "knittingReceivedTotal", label: "Knitting Recvd Total", placeholder: "7300" },
        { name: "knittingBalance", label: "Knitting Balance", placeholder: "1200" },
        { name: "linkingToday", label: "Linking Today", placeholder: "900" },
        { name: "linkingTotal", label: "Linking Total", placeholder: "5400" },
        { name: "linkingBalance", label: "Linking Balance", placeholder: "1900" },
        { name: "trimmingToday", label: "Trimming Today", placeholder: "600" },
        { name: "trimmingTotal", label: "Trimming Total", placeholder: "3100" },
        { name: "trimmingBalance", label: "Trimming Balance", placeholder: "2300" },
        { name: "mendingToday", label: "Mending Today", placeholder: "500" },
        { name: "mendingTotal", label: "Mending Total", placeholder: "2600" },
        { name: "mendingBalance", label: "Mending Balance", placeholder: "2500" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Linking production remarks." },
      ]}
    />
  )
}

export function PoTrackerReportPage() {
  return (
    <ModuleFormPage
      title="PO Detail Tracker"
      description="Track PO-level design layout, approvals, tech pack references, and searchable management notes."
      storageKey="form-report-po-tracker"
      fields={[
        { name: "poNumber", label: "PO Number", placeholder: "LK-3001" },
        { name: "buyerName", label: "Buyer Name", placeholder: "H&M" },
        { name: "styleNo", label: "Style No", placeholder: "ST-2048" },
        { name: "designLayout", label: "Design Layout", placeholder: "Cable knit mockup" },
        { name: "approval", label: "Approval", placeholder: "Approved" },
        { name: "techPack", label: "Tech Pack", placeholder: "TP-v4" },
        { name: "productionStatus", label: "Production Status", placeholder: "Linking in progress" },
        { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Searchable PO tracking notes." },
      ]}
    />
  )
}
