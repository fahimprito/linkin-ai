import { StoreIssueLogTable } from "@/components/shared/store-issue-log-table"

export function LinkingStoreIssueLogPage() {
  return (
    <StoreIssueLogTable
      sourceModule="Linking"
      title="Linking Store Issuance Log"
      description="Read-only visibility of all materials issued by Store Control for Linking."
      emptyDescription="Once Store Control issues materials against a Linking requisition, the log will appear here."
    />
  )
}
