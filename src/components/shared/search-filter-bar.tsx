type SearchFilterBarProps = {
  filters: string[]
}

export function SearchFilterBar({ filters }: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-[1.75rem] border border-border/70 bg-card p-4 shadow-sm">
      {filters.map((filter) => (
        <div
          key={filter}
          className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted-foreground"
        >
          {filter}
        </div>
      ))}
    </div>
  )
}
