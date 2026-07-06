import type { ReactNode } from "react"

export type DataTableColumn<T> = {
  key: keyof T | string
  header: string
  className?: string
  stickyClassName?: string
  stickyShadowClassName?: string
  render?: (row: T, rowIndex: number) => ReactNode
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

export type DataTableProps<T extends object> = {
  columns: DataTableColumn<T>[]
  data: T[]
  headerRows?: DataTableHeaderRow[]
  compact?: boolean
}

