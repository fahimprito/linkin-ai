import * as React from "react"

import { cn } from "@/lib/utils"

export type DataTableColumn<T> = {
  key: keyof T | string
  header: string
  className?: string
  stickyClassName?: string
  stickyShadowClassName?: string
  render?: (row: T, rowIndex: number) => React.ReactNode
}

export type DataTableHeaderCell = {
  key: string
  label: string
  colSpan?: number
  rowSpan?: number
  className?: string
  labelClassName?: string
  stickyClassName?: string
  stickyShadowClassName?: string
}

export type DataTableHeaderRow = {
  key: string
  cells: DataTableHeaderCell[]
  className?: string
}

type DataTableProps<T extends object> = {
  columns: DataTableColumn<T>[]
  data: T[]
  headerRows?: DataTableHeaderRow[]
  compact?: boolean
}

function getCellValue<T extends object>(row: T, key: DataTableColumn<T>["key"]) {
  if (typeof key === "string" && key in row) {
    return (row as Record<string, unknown>)[key]
  }

  return ""
}

export function DataTable<T extends object>({
  columns,
  data,
  headerRows,
  compact = false,
}: DataTableProps<T>) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [showStickyShadow, setShowStickyShadow] =
    React.useState(true)
  const resolvedHeaderRows: DataTableHeaderRow[] =
    headerRows ??
    [
      {
        key: "default",
        cells: columns.map<DataTableHeaderCell>((column) => ({
          key: String(column.key),
          label: column.header,
        })),
      },
    ]

  React.useEffect(() => {
    const container = scrollContainerRef.current

    if (!container) {
      return
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth
    setShowStickyShadow(container.scrollLeft < maxScrollLeft)
  }, [columns.length, data.length, headerRows])

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        onScroll={(event) => {
          const container = event.currentTarget
          const maxScrollLeft = container.scrollWidth - container.clientWidth
          setShowStickyShadow(container.scrollLeft < maxScrollLeft)
        }}
      >
        <table
          className={cn(
            "min-w-full border-separate border-spacing-0 text-left",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <thead className="text-muted-foreground">
            {resolvedHeaderRows.map((headerRow, rowIndex) => (
              <tr
                key={headerRow.key}
                className={cn(
                  rowIndex === 0 && resolvedHeaderRows.length > 1
                    ? "bg-slate-50 dark:bg-slate-900/80"
                    : "bg-slate-100 dark:bg-slate-800/90",
                  headerRow.className
                )}
              >
                {headerRow.cells.map((cell, cellIndex) => (
                  <th
                    key={cell.key}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    className={cn(
                      "sticky align-middle font-medium backdrop-blur",
                      rowIndex === 0
                        ? compact
                          ? "top-0 z-20 px-2 py-2.5"
                          : "top-0 z-20 px-4 py-3.5"
                        : compact
                          ? "top-[42px] z-10 px-2 py-2"
                          : "top-[52px] z-10 px-4 py-3",
                      "border-b border-r border-border/80",
                      cellIndex === headerRow.cells.length - 1 && "border-r-0",
                      cell.stickyClassName,
                      showStickyShadow && cell.stickyShadowClassName,
                      cell.className
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex font-semibold tracking-wide",
                        compact
                          ? "max-w-[5.5rem] whitespace-normal px-2 py-0.5 text-[11px] leading-4 text-center"
                          : "whitespace-nowrap px-2.5 py-1 text-xs",
                        cell.labelClassName
                      )}
                    >
                      {cell.label}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"
                )}
              >
                {columns.map((column, columnIndex) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      compact
                        ? "border-r border-b border-border/70 px-2 py-2 align-top"
                        : "border-r border-b border-border/70 px-4 py-3 align-top",
                      column.stickyClassName,
                      showStickyShadow && column.stickyShadowClassName,
                      column.stickyClassName &&
                      (rowIndex % 2 === 0 ? "z-10 bg-background/95" : "z-10 bg-card"),
                      columnIndex === columns.length - 1 && "border-r-0",
                      rowIndex === data.length - 1 && "border-b-0",
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : String(getCellValue(row, column.key) ?? "")}
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
