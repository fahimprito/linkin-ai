import { cn } from "@/lib/utils"

export type DataTableColumn<T> = {
  key: keyof T | string
  header: string
  className?: string
  render?: (row: T) => React.ReactNode
}

type DataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumn<T>[]
  data: T[]
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-medium">
                  <span
                    className={cn(
                      "inline-flex whitespace-nowrap rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                    )}
                  >
                    {column.header}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-t border-border/60",
                  rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn("px-4 py-3 align-top", column.className)}
                  >
                    {column.render
                      ? column.render(row)
                      : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
