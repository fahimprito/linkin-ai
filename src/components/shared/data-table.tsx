import { cn } from "@/lib/utils"

type DataTableColumn<T> = {
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
    <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-medium">
                  {column.header}
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
