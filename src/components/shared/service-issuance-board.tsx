import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"

export type ServiceIssuanceRow = {
  id: string
  title: string
  subtitle: string
  status: string
  requiredQty: number
  issuedQty: number
  remainingQty: number
  availableQty?: number
  progressPercent: number
  actionLabel: string
  canIssue: boolean
}

type ServiceIssuanceBoardProps = {
  emptyDescription: string
  emptyTitle: string
  issueButtonLabel?: string
  onIssue: (id: string) => void
  rows: ServiceIssuanceRow[]
  title: string
}

export function ServiceIssuanceBoard({
  emptyDescription,
  emptyTitle,
  issueButtonLabel = "Issue Now",
  onIssue,
  rows,
  title,
}: ServiceIssuanceBoardProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {rows.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.subtitle}
                  </p>
                </div>
                <StatusBadge value={row.status} />
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>Required: {row.requiredQty} kg</p>
                <p>Issued: {row.issuedQty} kg</p>
                <p>Remaining: {row.remainingQty} kg</p>
                {typeof row.availableQty === "number" ? (
                  <p>Available: {row.availableQty} kg</p>
                ) : null}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Resolution progress</span>
                  <span>{row.progressPercent}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${row.progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-secondary/60 px-3 py-2 text-sm">
                <span className="font-medium">Resolution status:</span>{" "}
                {row.actionLabel}
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-4 w-full rounded-xl"
                disabled={!row.canIssue}
                onClick={() => onIssue(row.id)}
              >
                {row.canIssue ? issueButtonLabel : "Solved / Blocked"}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  )
}
