import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

type SearchFilterBarProps = {
  filters: string[]
  activeFilter?: string
  onFilterChange?: (filter: string) => void
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  compact?: boolean
}

export function SearchFilterBar({
  filters,
  activeFilter,
  onFilterChange,
  searchPlaceholder = "Search",
  searchValue = "",
  onSearchChange,
  compact = false,
}: SearchFilterBarProps) {
  if (compact) {
    return (
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border-2 border-border/90 bg-card py-2.5 pr-4 pl-10 text-sm outline-none shadow-sm transition focus:border-primary/50"
          />
        </div>
        <select
          value={activeFilter}
          onChange={(event) => onFilterChange?.(event.target.value)}
          className="w-full rounded-2xl border-2 border-border/90 bg-card px-4 py-2.5 text-sm text-foreground outline-none shadow-sm transition focus:border-primary/50 md:w-56"
        >
          {filters.map((filter) => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>
    )
  }

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
