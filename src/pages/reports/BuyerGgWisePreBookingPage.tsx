import { Pencil, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { Button } from "@/components/ui/button"
import { buyerGgWisePreBooking2026 } from "@/mock/pre-booking"
import type {
  BuyerGgWisePreBookingGroup,
  BuyerGgWisePreBookingRecord,
  BuyerGgWisePreBookingRowType,
  PreBookingMonthKey,
} from "@/types/pre-booking"

const STORAGE_KEY = "linkin-ai-admin:buyer-gg-wise-pre-booking-2026"

const monthColumns: { key: PreBookingMonthKey; label: string }[] = [
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
  { key: "mar", label: "Mar" },
  { key: "apr", label: "April" },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "July" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
]

const monthOptions = monthColumns.map((month) => ({
  label: month.label,
  value: month.key,
}))

const numberFieldOptions = {
  setValueAs: (value: string) => {
    if (value === "" || value == null) {
      return null
    }

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  },
}

const formFields: ModalFormField[] = [
  {
    name: "rowType",
    label: "Row Type",
    type: "select",
    required: true,
    options: [
      { label: "Normal Row", value: "normal" },
      { label: "Note Row", value: "note" },
    ],
  },
  { name: "buyerName", label: "Buyer Name", placeholder: "ELCORTE", required: true },
  { name: "gauge", label: "Gauges", placeholder: "7 GG", required: true },
  {
    name: "noteFrom",
    label: "Note From Month",
    type: "select",
    required: false,
    options: monthOptions,
  },
  {
    name: "noteTo",
    label: "Note To Month",
    type: "select",
    required: false,
    options: monthOptions,
  },
  {
    name: "noteText",
    label: "Note Text",
    type: "textarea",
    placeholder: "J&J (97707 PCS IN FEB + 222664 PCS IN MAR)= TOTAL ...",
    required: false,
  },
  ...monthColumns.map<ModalFormField>((month) => ({
    name: month.key,
    label: month.label,
    type: "number",
    placeholder: "0",
    required: false,
    registerOptions: numberFieldOptions,
  })),
  {
    name: "totalQty",
    label: "Total Qty",
    type: "number",
    placeholder: "Auto calculated",
    required: false,
    readOnly: true,
  },
]

type PreBookingFormValues = Omit<BuyerGgWisePreBookingRecord, "id" | "serial">
type DisplayRecord = BuyerGgWisePreBookingRecord & {
  displaySerial: string
  displayBuyerName: string
}

function createRecordId() {
  return `pre-booking-${Date.now()}`
}

function flattenPreBookingGroups(groups: BuyerGgWisePreBookingGroup[]) {
  return groups.flatMap<BuyerGgWisePreBookingRecord>((group) =>
    group.rows.map((row, rowIndex) => ({
      id: `${group.id}-${row.gauge.toLowerCase().replace(/\s+/g, "-")}-${rowIndex}`,
      serial: group.serial,
      buyerName: group.buyerName,
      gauge: row.gauge,
      rowType: row.note ? "note" : "normal",
      noteText: row.note?.text ?? "",
      noteFrom: row.note?.from ?? "",
      noteTo: row.note?.to ?? "",
      jan: row.note ? null : (row.months.jan ?? null),
      feb: row.note ? null : (row.months.feb ?? null),
      mar: row.note ? null : (row.months.mar ?? null),
      apr: row.note ? null : (row.months.apr ?? null),
      may: row.note ? null : (row.months.may ?? null),
      jun: row.note ? null : (row.months.jun ?? null),
      jul: row.note ? null : (row.months.jul ?? null),
      aug: row.note ? null : (row.months.aug ?? null),
      sep: row.note ? null : (row.months.sep ?? null),
      oct: row.note ? null : (row.months.oct ?? null),
      nov: row.note ? null : (row.months.nov ?? null),
      dec: row.note ? null : (row.months.dec ?? null),
      totalQty: row.note ? null : row.totalQty,
    }))
  )
}

const defaultMockRecords = flattenPreBookingGroups(buyerGgWisePreBooking2026)

function getDefaultValues(): PreBookingFormValues {
  return {
    buyerName: "",
    gauge: "",
    rowType: "normal",
    noteText: "",
    noteFrom: "",
    noteTo: "",
    jan: null,
    feb: null,
    mar: null,
    apr: null,
    may: null,
    jun: null,
    jul: null,
    aug: null,
    sep: null,
    oct: null,
    nov: null,
    dec: null,
    totalQty: null,
  }
}

function getFormValues(record: BuyerGgWisePreBookingRecord): PreBookingFormValues {
  return {
    buyerName: record.buyerName,
    gauge: record.gauge,
    rowType: record.rowType,
    noteText: record.noteText,
    noteFrom: record.noteFrom,
    noteTo: record.noteTo,
    jan: record.jan,
    feb: record.feb,
    mar: record.mar,
    apr: record.apr,
    may: record.may,
    jun: record.jun,
    jul: record.jul,
    aug: record.aug,
    sep: record.sep,
    oct: record.oct,
    nov: record.nov,
    dec: record.dec,
    totalQty: record.totalQty,
  }
}

function normalizeBuyerName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function getBuyerGroupKey(value: string) {
  return normalizeBuyerName(value).toLowerCase()
}

function normalizeNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      return null
    }

    const parsed = Number(normalizedValue.replace(/,/g, "").replace(/\s*PCS$/i, ""))
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function formatQtyValue(value: number | null | undefined) {
  const normalizedValue = normalizeNumber(value)

  if (normalizedValue == null) {
    return ""
  }

  return `${new Intl.NumberFormat("en-US").format(normalizedValue)} PCS`
}

function calculateTotalQty(values: Partial<PreBookingFormValues>) {
  if (values.rowType === "note") {
    return null
  }

  return monthColumns.reduce((sum, month) => {
    return sum + (normalizeNumber(values[month.key]) ?? 0)
  }, 0)
}

function isHighlightedMonthValue(value: number | null | undefined) {
  const normalizedValue = normalizeNumber(value)
  return normalizedValue != null && normalizedValue > 0
}

function monthIndex(key: PreBookingMonthKey | "") {
  return monthColumns.findIndex((month) => month.key === key)
}

function renderStandardValue(value: number | null | undefined) {
  const normalizedValue = normalizeNumber(value)

  if (normalizedValue == null) {
    return <span className="text-muted-foreground/40">-</span>
  }

  if (isHighlightedMonthValue(normalizedValue)) {
    return (
      <span className="inline-flex rounded-lg bg-cyan-50 px-1.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">
        {formatQtyValue(normalizedValue)}
      </span>
    )
  }

  return <span className="text-[11px] font-semibold text-slate-500">0 PCS</span>
}

function getNoteSpan(row: DisplayRecord) {
  if (row.rowType !== "note" || !row.noteFrom || !row.noteTo) {
    return 0
  }

  const fromIndex = monthIndex(row.noteFrom)
  const toIndex = monthIndex(row.noteTo)

  if (fromIndex === -1 || toIndex === -1 || toIndex < fromIndex) {
    return 1
  }

  return toIndex - fromIndex + 1
}

function buildDisplayRecords(records: BuyerGgWisePreBookingRecord[]) {
  const grouped = new Map<string, BuyerGgWisePreBookingRecord[]>()

  records.forEach((record) => {
    const buyerKey = getBuyerGroupKey(record.buyerName)
    const existing = grouped.get(buyerKey)

    if (existing) {
      existing.push(record)
      return
    }

    grouped.set(buyerKey, [record])
  })

  return Array.from(grouped.entries()).flatMap<DisplayRecord>(([, groupRecords], index) =>
    groupRecords.map((record, recordIndex) => ({
      ...record,
      displaySerial: recordIndex === 0 ? String(index + 1) : "",
      displayBuyerName:
        recordIndex === 0
          ? normalizeBuyerName(groupRecords[0]?.buyerName ?? record.buyerName)
          : "",
    }))
  )
}

function getInitialRecords() {
  if (typeof window === "undefined") {
    return defaultMockRecords
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return defaultMockRecords
  }

  try {
    const parsed = JSON.parse(stored) as BuyerGgWisePreBookingRecord[]

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultMockRecords
    }

    return parsed.map((record) => ({
      ...record,
      jan: normalizeNumber(record.jan),
      feb: normalizeNumber(record.feb),
      mar: normalizeNumber(record.mar),
      apr: normalizeNumber(record.apr),
      may: normalizeNumber(record.may),
      jun: normalizeNumber(record.jun),
      jul: normalizeNumber(record.jul),
      aug: normalizeNumber(record.aug),
      sep: normalizeNumber(record.sep),
      oct: normalizeNumber(record.oct),
      nov: normalizeNumber(record.nov),
      dec: normalizeNumber(record.dec),
      totalQty: normalizeNumber(record.totalQty),
    }))
  } catch {
    return defaultMockRecords
  }
}

export function BuyerGgWisePreBookingPage() {
  const [records, setRecords] = useState<BuyerGgWisePreBookingRecord[]>(() => getInitialRecords())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Buyers")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<BuyerGgWisePreBookingRecord | null>(null)
  const [recordPendingDelete, setRecordPendingDelete] =
    useState<BuyerGgWisePreBookingRecord | null>(null)
  const { control, register, handleSubmit, reset } = useForm<PreBookingFormValues>({
    defaultValues: getDefaultValues(),
  })
  const watchedFormValues = useWatch({ control })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const liveTotalQty = useMemo(() => calculateTotalQty(watchedFormValues), [watchedFormValues])

  const visibleFormFields = useMemo(() => {
    const sharedFields = formFields.filter(
      (field) =>
        !monthColumns.some((month) => month.key === field.name) &&
        field.name !== "noteFrom" &&
        field.name !== "noteTo" &&
        field.name !== "noteText" &&
        field.name !== "totalQty"
    )

    if (watchedFormValues.rowType === "note") {
      return [
        ...sharedFields,
        ...formFields.filter((field) => ["noteFrom", "noteTo", "noteText"].includes(field.name)),
      ]
    }

    return [
      ...sharedFields,
      ...formFields.filter((field) => monthColumns.some((month) => month.key === field.name)),
      ...formFields
        .filter((field) => field.name === "totalQty")
        .map((field) => ({
          ...field,
          value: liveTotalQty ?? "",
        })),
    ]
  }, [liveTotalQty, watchedFormValues.rowType])

  const filterOptions = useMemo(
    () => [
      "All Buyers",
      ...Array.from(new Set(records.map((record) => normalizeBuyerName(record.buyerName)))).sort(
        (a, b) => a.localeCompare(b)
      ),
    ],
    [records]
  )

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      const matchesBuyer =
        activeFilter === "All Buyers" || normalizeBuyerName(record.buyerName) === activeFilter

      if (!matchesBuyer) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return Object.values(record).some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, records, searchQuery])

  const displayRecords = useMemo(() => buildDisplayRecords(filteredRecords), [filteredRecords])

  const openCreateModal = useCallback(() => {
    setEditingRecord(null)
    reset(getDefaultValues())
    setIsModalOpen(true)
  }, [reset])

  const openEditModal = useCallback(
    (record: BuyerGgWisePreBookingRecord) => {
      setEditingRecord(record)
      reset(getFormValues(record))
      setIsModalOpen(true)
    },
    [reset]
  )

  const closeModal = useCallback(() => {
    setEditingRecord(null)
    reset(getDefaultValues())
    setIsModalOpen(false)
  }, [reset])

  const onSubmit = (values: PreBookingFormValues) => {
    const normalizedRowType = values.rowType as BuyerGgWisePreBookingRowType
    const normalizedValues: PreBookingFormValues = {
      ...values,
      buyerName: normalizeBuyerName(values.buyerName),
      gauge: values.gauge.trim(),
      rowType: normalizedRowType,
      noteText: normalizedRowType === "note" ? values.noteText.trim() : "",
      noteFrom: normalizedRowType === "note" ? values.noteFrom : "",
      noteTo: normalizedRowType === "note" ? values.noteTo : "",
      jan: normalizedRowType === "note" ? null : normalizeNumber(values.jan),
      feb: normalizedRowType === "note" ? null : normalizeNumber(values.feb),
      mar: normalizedRowType === "note" ? null : normalizeNumber(values.mar),
      apr: normalizedRowType === "note" ? null : normalizeNumber(values.apr),
      may: normalizedRowType === "note" ? null : normalizeNumber(values.may),
      jun: normalizedRowType === "note" ? null : normalizeNumber(values.jun),
      jul: normalizedRowType === "note" ? null : normalizeNumber(values.jul),
      aug: normalizedRowType === "note" ? null : normalizeNumber(values.aug),
      sep: normalizedRowType === "note" ? null : normalizeNumber(values.sep),
      oct: normalizedRowType === "note" ? null : normalizeNumber(values.oct),
      nov: normalizedRowType === "note" ? null : normalizeNumber(values.nov),
      dec: normalizedRowType === "note" ? null : normalizeNumber(values.dec),
      totalQty: normalizedRowType === "note" ? null : calculateTotalQty(values),
    }

    const nextRecord: BuyerGgWisePreBookingRecord = {
      id: editingRecord?.id ?? createRecordId(),
      serial: "",
      ...normalizedValues,
    }

    setRecords((current) =>
      editingRecord
        ? current.map((record) => (record.id === editingRecord.id ? nextRecord : record))
        : [...current, nextRecord]
    )

    toast.success(editingRecord ? "Pre-booking row updated." : "Pre-booking row added.")
    closeModal()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="BUYER/GG WISE PRE-BOOKING PER MONTH BALANCE TO UTILIZE AGAINST YEAR 2026"
        actions={
          <Button type="button" className="rounded-2xl" onClick={openCreateModal}>
            <Plus className="size-4" />
            Add Row
          </Button>
        }
      />

      <SearchFilterBar
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search buyer, gauge, month value, note text, or total qty"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {displayRecords.length ? (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-xs text-left">
              <thead className="text-muted-foreground">
                <tr className="bg-white dark:bg-slate-950">
                  <th className="border-b border-r border-border/80 bg-violet-50 px-2 py-2.5 text-center font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">SL.</th>
                  <th className="border-b border-r border-border/80 bg-amber-50 px-2 py-2.5 text-center font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">Buyer Name</th>
                  <th className="border-b border-r border-border/80 bg-cyan-50 px-2 py-2.5 text-center font-semibold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">Gauges</th>
                  {monthColumns.map((month, index) => (
                    <th
                      key={month.key}
                      className={`border-b border-r border-border/80 px-2 py-2.5 text-center font-semibold ${
                        index % 2 === 0
                          ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                      }`}
                    >
                      {month.label}
                    </th>
                  ))}
                  <th className="border-b border-r border-border/80 bg-rose-50 px-2 py-2.5 text-center font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">Total Qty</th>
                  <th className="border-b border-border/80 bg-slate-100 px-2 py-2.5 text-center font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords.map((row, rowIndex) => {
                  const noteStartIndex = row.rowType === "note" ? monthIndex(row.noteFrom) : -1
                  const noteEndIndex = row.rowType === "note" ? monthIndex(row.noteTo) : -1
                  const noteSpan = getNoteSpan(row)

                  return (
                    <tr key={row.id} className={rowIndex % 2 === 0 ? "bg-background/80" : "bg-card"}>
                      <td className="min-w-[3rem] border-r border-b border-border/70 px-2 py-2 align-top">
                        {row.displaySerial ? (
                          <span className="font-bold italic text-violet-700 dark:text-violet-300">{row.displaySerial}</span>
                        ) : null}
                      </td>
                      <td className="min-w-[8.5rem] border-r border-b border-border/70 px-2 py-2 align-top">
                        {row.displayBuyerName ? (
                          <span className="font-semibold text-amber-700 dark:text-amber-200">{row.displayBuyerName}</span>
                        ) : null}
                      </td>
                      <td className="min-w-[5rem] border-r border-b border-border/70 px-2 py-2 align-top">
                        <span className="inline-flex rounded-lg bg-cyan-100 px-1.5 py-1 text-[11px] font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200">
                          {row.gauge}
                        </span>
                      </td>
                      {monthColumns.map((month, index) => {
                        if (row.rowType === "note") {
                          if (noteStartIndex !== -1 && index === noteStartIndex) {
                            return (
                              <td
                                key={`${row.id}-${month.key}`}
                                colSpan={noteSpan}
                                className="min-w-[10rem] border-r border-b border-border/70 px-2 py-2 align-top"
                              >
                                <span className="block text-[11px] font-semibold italic leading-4 text-red-600">
                                  {row.noteText || "-"}
                                </span>
                              </td>
                            )
                          }

                          if (
                            noteStartIndex !== -1 &&
                            noteEndIndex !== -1 &&
                            index > noteStartIndex &&
                            index <= noteEndIndex
                          ) {
                            return null
                          }
                        }

                        return (
                          <td
                            key={`${row.id}-${month.key}`}
                            className="min-w-[5.2rem] border-r border-b border-border/70 px-2 py-2 align-top"
                          >
                            {row.rowType === "note" ? (
                              <span className="text-muted-foreground/40">-</span>
                            ) : (
                              renderStandardValue(row[month.key])
                            )}
                          </td>
                        )
                      })}
                      <td className="min-w-[7rem] border-r border-b border-border/70 px-2 py-2 align-top">
                        <span className="font-bold italic text-rose-700 dark:text-rose-300">
                          {formatQtyValue(row.totalQty) || "-"}
                        </span>
                      </td>
                      <td className="min-w-[8rem] border-b border-border/70 px-2 py-2 align-top">
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer rounded-xl px-2"
                            onClick={() => openEditModal(row)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer rounded-xl px-2 text-destructive hover:text-destructive"
                            onClick={() => setRecordPendingDelete(row)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No report rows found"
          description="Try another search or buyer filter, or add a new pre-booking balance row."
        />
      )}

      <RecordFormModal
        open={isModalOpen}
        title={editingRecord ? "Edit Pre-Booking Row" : "Add Pre-Booking Row"}
        description="Choose Normal Row for month-wise quantities, or Note Row for a red note entry tied to a month range."
        fields={visibleFormFields}
        register={register}
        onClose={closeModal}
        onReset={() => {
          if (editingRecord) {
            reset(getFormValues(editingRecord))
            return
          }

          reset(getDefaultValues())
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={editingRecord ? "Update Row" : "Add Row"}
        maxWidthClassName="max-w-6xl"
      />

      {recordPendingDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Delete row?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will remove the selected pre-booking report row from the table.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setRecordPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() => {
                  setRecords((current) => current.filter((record) => record.id !== recordPendingDelete.id))
                  toast.success("Pre-booking row deleted.")
                  setRecordPendingDelete(null)
                }}
              >
                Delete Row
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


