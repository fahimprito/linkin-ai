import { cn } from "@/lib/utils"

type SearchFilterBarProps = {
  filters: string[]
  activeFilter?: string
  onFilterChange?: (filter: string) => void
}

export function SearchFilterBar({
  filters,
  activeFilter,
  onFilterChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-[1.75rem] border border-border/70 bg-card p-4 shadow-sm">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilterChange?.(filter)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-all",
            activeFilter === filter
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
