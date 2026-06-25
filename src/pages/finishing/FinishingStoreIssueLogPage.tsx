import { StoreIssueLogTable } from "@/components/shared/store-issue-log-table"

export function FinishingStoreIssueLogPage() {
  return (
    <StoreIssueLogTable
      sourceModule="Finishing"
      title="Finishing Store Issuance Log"
      description="Read-only visibility of all materials issued by Store Control for Finishing."
      emptyDescription="Once Store Control issues materials against a Finishing requisition, the log will appear here."
    />
  )
}
