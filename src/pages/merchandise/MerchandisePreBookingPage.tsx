import { Pencil, Plus, Trash2 } from "lucide-react"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { merchandisePreBookingMockData } from "@/mock/merchandise-pre-booking"
import type { MerchandisePreBookingRecord } from "@/types/merchandise-pre-booking"

const STORAGE_KEY = "linkin-ai-admin:merchandise-pre-booking"
const ggOptions = ["3", "7", "9", "12"]
const tableColumnCount = 8

type PreBookingFormValues = {
  buyerName: string
  gg: string
  orderQty: number
  inspectionDate: string
  remarks: string
}

type GroupedSection = {
  gg: string
  rows: MerchandisePreBookingRecord[]
  totalQty: number
}

type SummaryRow = {
  gg: string
  firstSlotCapacity: string
  firstSlotConfirmedMinutes: string
  firstLotReceived: string
  secondSlotCapacity: string
  secondSlotConfirmedMinutes: string
  secondLotReceived: string
  thirdSlotCapacity: string
  thirdSlotConfirmedMinutes: string
  thirdLotReceived: string
}

const formFields: ModalFormField[] = [
  {
    name: "buyerName",
    label: "Buyer Name",
    placeholder: "BESTSELLER",
  },
  {
    name: "gg",
    label: "GG",
    type: "select",
    options: ggOptions.map((value) => ({ label: `${value} GG`, value })),
  },
  {
    name: "orderQty",
    label: "Order Quantity",
    type: "number",
    placeholder: "8000",
    registerOptions: {
      setValueAs: (value: string) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
      },
    },
  },
  {
    name: "inspectionDate",
    label: "Inspection Date",
    type: "date",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Certification or pre-booking note",
    required: false,
  },
]

function createPreBookingId() {
  return `merch-pre-booking-${Date.now()}`
}

function formatInspectionDate(value: string) {
  if (!value) {
    return ""
  }

  if (/^\d{1,2}-[A-Za-z]{3}-\d{2}$/.test(value)) {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })
}

function toInputDate(value: string) {
  if (!value) {
    return ""
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/)
    if (!match) {
      return ""
    }

    const [, day, month, year] = match
    const monthIndex = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].indexOf(month.toLowerCase())

    if (monthIndex === -1) {
      return ""
    }

    return `20${year}-${String(monthIndex + 1).padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  return parsed.toISOString().slice(0, 10)
}

function parseInspectionDate(value: string) {
  if (!value) {
    return null
  }

  const isoDate = toInputDate(value)
  if (!isoDate) {
    return null
  }

  const parsed = new Date(isoDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatPcs(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} PCS`
}

function getStoredPreBookings() {
  if (typeof window === "undefined") {
    return merchandisePreBookingMockData
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return merchandisePreBookingMockData
  }

  try {
    const parsed = JSON.parse(stored) as MerchandisePreBookingRecord[]
    return Array.isArray(parsed) ? parsed : merchandisePreBookingMockData
  } catch {
    return merchandisePreBookingMockData
  }
}

function getDefaultFormValues(): PreBookingFormValues {
  return {
    buyerName: "",
    gg: "3",
    orderQty: 0,
    inspectionDate: "",
    remarks: "",
  }
}

function getFormValues(record: MerchandisePreBookingRecord): PreBookingFormValues {
  return {
    buyerName: record.buyerName,
    gg: record.gg,
    orderQty: record.orderQty,
    inspectionDate: toInputDate(record.inspectionDate),
    remarks: record.remarks,
  }
}

function buildRecord(values: PreBookingFormValues, existingId?: string): MerchandisePreBookingRecord {
  return {
    id: existingId ?? createPreBookingId(),
    buyerName: values.buyerName.trim(),
    gg: values.gg.trim(),
    orderQty: Number(values.orderQty) || 0,
    inspectionDate: formatInspectionDate(values.inspectionDate),
    remarks: values.remarks.trim(),
    createdAt: new Date().toISOString(),
  }
}

function getSlotIndex(inspectionDate: string) {
  const parsed = parseInspectionDate(inspectionDate)
  if (!parsed) {
    return 2
  }

  const day = parsed.getDate()
  if (day <= 10) {
    return 0
  }

  if (day <= 20) {
    return 1
  }

  return 2
}

function buildSummaryRows(records: MerchandisePreBookingRecord[]): SummaryRow[] {
  const rows = ggOptions.map((gg) => {
    const sectionRecords = records.filter((record) => record.gg === gg)
    const slotQty = [0, 0, 0]

    sectionRecords.forEach((record) => {
      slotQty[getSlotIndex(record.inspectionDate)] += record.orderQty
    })

    return {
      gg,
      firstSlotCapacity: "0 MIN",
      firstSlotConfirmedMinutes: "0 MIN",
      firstLotReceived: formatPcs(slotQty[0]),
      secondSlotCapacity: "0 MIN",
      secondSlotConfirmedMinutes: "0 MIN",
      secondLotReceived: formatPcs(slotQty[1]),
      thirdSlotCapacity: "0 MIN",
      thirdSlotConfirmedMinutes: "0 MIN",
      thirdLotReceived: formatPcs(slotQty[2]),
    }
  })

  const totals = rows.reduce(
    (accumulator, row) => {
      accumulator.first += Number(row.firstLotReceived.replace(/[^\d]/g, "")) || 0
      accumulator.second += Number(row.secondLotReceived.replace(/[^\d]/g, "")) || 0
      accumulator.third += Number(row.thirdLotReceived.replace(/[^\d]/g, "")) || 0
      return accumulator
    },
    { first: 0, second: 0, third: 0 }
  )

  rows.push({
    gg: "G.T",
    firstSlotCapacity: "0 MIN",
    firstSlotConfirmedMinutes: "0 MIN",
    firstLotReceived: formatPcs(totals.first),
    secondSlotCapacity: "0 MIN",
    secondSlotConfirmedMinutes: "0 MIN",
    secondLotReceived: formatPcs(totals.second),
    thirdSlotCapacity: "0 MIN",
    thirdSlotConfirmedMinutes: "0 MIN",
    thirdLotReceived: formatPcs(totals.third),
  })

  return rows
}

export function MerchandisePreBookingPage() {
  const [records, setRecords] = useState<MerchandisePreBookingRecord[]>(() => getStoredPreBookings())
  const [searchValue, setSearchValue] = useState("")
  const [activeFilter, setActiveFilter] = useState("All GG")
  const [editingRecord, setEditingRecord] = useState<MerchandisePreBookingRecord | null>(null)
  const [recordPendingDelete, setRecordPendingDelete] = useState<MerchandisePreBookingRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<PreBookingFormValues>({
    defaultValues: getDefaultFormValues(),
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const filteredRecords = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return records.filter((record) => {
      const matchesFilter =
        activeFilter === "All GG" || record.gg === activeFilter.replace(" GG", "")

      if (!matchesFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        record.buyerName,
        record.gg,
        record.inspectionDate,
        record.remarks,
        String(record.orderQty),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [activeFilter, records, searchValue])

  const groupedSections = useMemo<GroupedSection[]>(() => {
    const groupedMap = filteredRecords.reduce<Map<string, MerchandisePreBookingRecord[]>>(
      (accumulator, record) => {
        const currentGroup = accumulator.get(record.gg) ?? []
        currentGroup.push(record)
        accumulator.set(record.gg, currentGroup)
        return accumulator
      },
      new Map()
    )

    return ggOptions
      .map((gg) => {
        const rows = groupedMap.get(gg) ?? []
        return {
          gg,
          rows,
          totalQty: rows.reduce((sum, row) => sum + row.orderQty, 0),
        }
      })
      .filter((section) => section.rows.length > 0)
  }, [filteredRecords])

  const summaryRows = useMemo(() => buildSummaryRows(filteredRecords), [filteredRecords])

  const openCreateModal = () => {
    setEditingRecord(null)
    reset(getDefaultFormValues())
    setIsModalOpen(true)
  }

  const openEditModal = (record: MerchandisePreBookingRecord) => {
    setEditingRecord(record)
    reset(getFormValues(record))
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRecord(null)
    reset(getDefaultFormValues())
  }

  const onSubmit = (values: PreBookingFormValues) => {
    const nextRecord = buildRecord(values, editingRecord?.id)

    if (!nextRecord.buyerName) {
      toast.error("Buyer name is required.")
      return
    }

    if (!nextRecord.gg) {
      toast.error("GG is required.")
      return
    }

    if (nextRecord.orderQty <= 0) {
      toast.error("Order quantity must be greater than zero.")
      return
    }

    if (!nextRecord.inspectionDate) {
      toast.error("Inspection date is required.")
      return
    }

    setRecords((current) => {
      if (editingRecord) {
        return current.map((record) =>
          record.id === editingRecord.id
            ? {
              ...record,
              ...nextRecord,
              createdAt: record.createdAt,
            }
            : record
        )
      }

      return [...current, nextRecord]
    })

    toast.success(editingRecord ? "Pre-booking updated." : "Pre-booking added.")
    handleCloseModal()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-booking"
        description="Track buyer-wise merchandise pre-booking rows with GG grouping, inspection date, and GG-wise totals."
        actions={
          <Button type="button" className="rounded-2xl" onClick={openCreateModal}>
            <Plus className="mr-1.5 size-4" />
            Pre-booking
          </Button>
        }
      />

      <SearchFilterBar
        filters={["All GG", "3 GG", "7 GG", "9 GG", "12 GG"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search buyer, GG, remarks, or inspection date"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        compact
      />

      {groupedSections.length === 0 ? (
        <EmptyState
          title="No pre-booking rows found"
          description="Try another GG filter or search term, or add a new pre-booking entry."
        />
      ) : (
        <>
          <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
            <div className="border-b border-border/80 bg-white px-4 py-4 text-center dark:bg-slate-950">
              <h2 className="text-xl font-black italic tracking-wide text-slate-900 dark:text-slate-100">
                Confirmed Minutes / Qty Summery
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full w-full border-separate border-spacing-0 text-xs">
                <thead>
                  <tr className="bg-white dark:bg-slate-950">
                    <th className="border-r border-b border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      GG
                    </th>
                    <th className="border-r border-b border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                      First Slot Date 1st to 10th Capacity 30%
                    </th>
                    <th className="border-r border-b border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                      1st Slot Confirmed GG Vise Orders Minute
                    </th>
                    <th className="border-r border-b border-border/80 bg-sky-50 px-2 py-2 text-center font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
                      First Lot Received
                    </th>
                    <th className="border-r border-b border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                      Second Slot Date 11th to 20th Capacity 35%
                    </th>
                    <th className="border-r border-b border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                      2nd Slot Confirmed GG Vise Orders Minute
                    </th>
                    <th className="border-r border-b border-border/80 bg-sky-50 px-2 py-2 text-center font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
                      Second Lot Received
                    </th>
                    <th className="border-r border-b border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                      Third Slot Date 21st to 30th Capacity 35%
                    </th>
                    <th className="border-r border-b border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                      3rd Slot Confirmed GG Vise Orders Minute
                    </th>
                    <th className="border-b border-border/80 bg-sky-50 px-2 py-2 text-center font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
                      Third Lot Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row, index) => (
                    <tr
                      key={`${row.gg}-${index}`}
                      className={cn(
                        "bg-background/80",
                        row.gg === "G.T" && "bg-slate-100 font-bold dark:bg-slate-900/80"
                      )}
                    >
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                        {row.gg}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {row.firstSlotCapacity}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                        {row.firstSlotConfirmedMinutes}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                        {row.firstLotReceived}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {row.secondSlotCapacity}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                        {row.secondSlotConfirmedMinutes}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                        {row.secondLotReceived}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {row.thirdSlotCapacity}
                      </td>
                      <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                        {row.thirdSlotConfirmedMinutes}
                      </td>
                      <td className="border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                        {row.thirdLotReceived}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm mt-16">
            <div className="border-b border-border/80 bg-slate-50 px-4 py-4 dark:bg-slate-900/80">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Merchandise Pre-booking Register
                </p>
                <h2 className="text-xl font-black tracking-wide text-slate-900 dark:text-slate-100">
                  Buyer / GG Wise Pre-booking Overview
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full w-full border-separate border-spacing-0 text-xs">
                <thead>
                  <tr className="bg-white dark:bg-slate-950">
                    <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      SL
                    </th>
                    <th className="border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                      Buyer Name
                    </th>
                    <th className="border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      GG
                    </th>
                    <th className="border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                      Order Qnty
                    </th>
                    <th className="border-b border-r border-border/80 bg-indigo-50 px-2 py-2 text-center font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200">
                      Inspection Date
                    </th>
                    <th className="border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                      Remarks
                    </th>
                    <th className="border-b border-r border-border/80 bg-fuchsia-50 px-2 py-2 text-center font-semibold text-fuchsia-700 dark:bg-fuchsia-950/30 dark:text-fuchsia-200">
                      Total GG Wise
                    </th>
                    <th className="border-b border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSections.map((section) => (
                    <Fragment key={section.gg}>
                      <tr className="bg-slate-50 dark:bg-slate-900/80">
                        <td
                          colSpan={tableColumnCount}
                          className="border-b border-border/80 px-3 py-2 text-left font-bold tracking-wide text-slate-900 dark:text-slate-100"
                        >
                          {section.gg} GG Section
                        </td>
                      </tr>
                      {section.rows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={index % 2 === 0 ? "bg-background/80" : "bg-card"}
                        >
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-violet-700 dark:text-violet-300">
                            {index + 1}
                          </td>
                          <td className="border-r border-b border-border/70 px-2 py-2 font-medium text-slate-900 dark:text-slate-100">
                            {row.buyerName}
                          </td>
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                            {row.gg}
                          </td>
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                            {row.orderQty.toLocaleString()} Pcs
                          </td>
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">
                            {row.inspectionDate}
                          </td>
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center text-slate-700 dark:text-slate-300">
                            {row.remarks || "-"}
                          </td>
                          <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                            {index === 0 ? `${section.gg} GG` : ""}
                          </td>
                          <td className="border-b border-border/70 px-2 py-2">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 cursor-pointer rounded-lg px-0"
                                onClick={() => openEditModal(row)}
                                aria-label="Edit pre-booking"
                                title="Edit"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 cursor-pointer rounded-lg px-0 text-destructive hover:text-destructive"
                                onClick={() => setRecordPendingDelete(row)}
                                aria-label="Delete pre-booking"
                                title="Delete"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 dark:bg-slate-900/80">
                        <td className="border-r border-b-[3px] border-border/80 px-3 py-2 font-bold text-slate-900 dark:text-slate-100" colSpan={3}>
                          {section.gg} GG Summary
                        </td>
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                          {section.totalQty.toLocaleString()} Pcs
                        </td>
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2" colSpan={2} />
                        <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-black text-slate-900 dark:text-slate-100">
                          {section.totalQty.toLocaleString()}
                        </td>
                        <td className="border-b-[3px] border-border/80 px-2 py-2" />
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <RecordFormModal
        open={isModalOpen}
        title={editingRecord ? "Edit Pre-booking" : "Add Pre-booking"}
        description="Add a merchandise pre-booking line. GG-wise subtotal rows update automatically."
        fields={formFields}
        register={register}
        onClose={handleCloseModal}
        onReset={() => {
          if (editingRecord) {
            reset(getFormValues(editingRecord))
            return
          }

          reset(getDefaultFormValues())
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={editingRecord ? "Update Pre-booking" : "Add Pre-booking"}
        maxWidthClassName="max-w-4xl"
      />

      {recordPendingDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Delete pre-booking row?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will remove the selected pre-booking row from the table.
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
                  setRecords((current) =>
                    current.filter((record) => record.id !== recordPendingDelete.id)
                  )
                  toast.success("Pre-booking deleted.")
                  setRecordPendingDelete(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}




