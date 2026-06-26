import { Pencil, Trash2 } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { Button } from "@/components/ui/button"
import type { StoredFormRecord } from "@/lib/form-submissions"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  addFormSubmission,
  deleteFormSubmission,
  updateFormSubmission,
} from "@/store/slices/form-submissions-slice"

type ModuleFormPageProps = {
  title: string
  description: string
  storageKey: string
  fields: ModalFormField[]
  summaryCards?:
  | Array<{
    label: string
    value: string
    tone?: "default" | "success" | "warning" | "danger"
  }>
  | ((records: StoredFormRecord[]) => Array<{
    label: string
    value: string
    tone?: "default" | "success" | "warning" | "danger"
  }>)
}

type FormValues = Record<string, string>

function createSubmissionRecordId() {
  return `frm-${Date.now()}`
}

export function ModuleFormPage({
  title,
  description,
  storageKey,
  fields,
  summaryCards = [],
}: ModuleFormPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<StoredFormRecord | null>(null)
  const [recordPendingDelete, setRecordPendingDelete] = useState<StoredFormRecord | null>(null)
  const dispatch = useAppDispatch()
  const records = useAppSelector(
    (state) => state.formSubmissions.recordsByKey[storageKey] ?? []
  )
  const defaultFormValues = useMemo(
    () =>
      Object.fromEntries(fields.map((field) => [field.name, ""])) as FormValues,
    [fields]
  )
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: defaultFormValues,
  })
  const resolvedSummaryCards = useMemo(
    () =>
      typeof summaryCards === "function" ? summaryCards(records) : summaryCards,
    [records, summaryCards]
  )

  const getRecordFormValues = useCallback(
    (record: StoredFormRecord) =>
      Object.fromEntries(
        fields.map((field) => [field.name, record[field.name] ?? ""])
      ) as FormValues,
    [fields]
  )

  const openCreateModal = useCallback(() => {
    setEditingRecord(null)
    reset(defaultFormValues)
    setIsCreateModalOpen(true)
  }, [defaultFormValues, reset])

  const openEditModal = useCallback(
    (record: StoredFormRecord) => {
      reset(getRecordFormValues(record))
      setEditingRecord(record)
      setIsCreateModalOpen(true)
    },
    [getRecordFormValues, reset]
  )

  const tableColumns = useMemo(() => {
    const visibleFields = fields.slice(0, 5)

    return [
      ...visibleFields.map((field) => ({
        key: field.name,
        header: field.label,
      })),
      {
        key: "submittedAt",
        header: "Submitted",
      },
      {
        key: "actions",
        header: "Actions",
        className: "w-[150px]",
        render: (row: StoredFormRecord) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-xl"
              onClick={() => openEditModal(row)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-xl text-destructive hover:text-destructive"
              onClick={() => setRecordPendingDelete(row)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        ),
      },
    ]
  }, [fields, openEditModal])

  const closeModal = useCallback(() => {
    setIsCreateModalOpen(false)
    setEditingRecord(null)
    reset(defaultFormValues)
  }, [defaultFormValues, reset])

  const onSubmit = (values: FormValues) => {
    const submittedAtIso = new Date().toISOString()
    const nextRecord: StoredFormRecord = {
      id: editingRecord?.id ?? createSubmissionRecordId(),
      submittedAt: new Date(submittedAtIso).toLocaleString(),
      submittedAtIso,
      ...Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, String(value)])
      ),
    }

    if (editingRecord) {
      dispatch(
        updateFormSubmission({
          storageKey,
          recordId: editingRecord.id,
          updates: {
            submittedAt: nextRecord.submittedAt,
            submittedAtIso,
            ...Object.fromEntries(
              Object.entries(values).map(([key, value]) => [key, String(value)])
            ),
          },
        })
      )
      toast.success(`${title} updated successfully.`)
    } else {
      dispatch(
        addFormSubmission({
          storageKey,
          record: nextRecord,
        })
      )
      toast.success(`${title} submitted successfully.`)
    }

    reset(defaultFormValues)
    setEditingRecord(null)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        actions={
          <Button
            type="button"
            className="rounded-2xl"
            onClick={openCreateModal}
          >
            {title}
          </Button>
        }
      />
      {resolvedSummaryCards?.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resolvedSummaryCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              tone={card.tone ?? "default"}
            />
          ))}
        </section>
      ) : null}
      {records.length ? (
        <DataTable columns={tableColumns} data={records} />
      ) : (
        <EmptyState
          title="No submissions yet"
          description="Start using the form above to create the first record for this workflow."
        />
      )}
      <RecordFormModal
        open={isCreateModalOpen}
        title={title}
        description={description}
        fields={fields}
        register={register}
        onClose={closeModal}
        onReset={() => {
          if (editingRecord) {
            reset(getRecordFormValues(editingRecord))
            return
          }

          reset(defaultFormValues)
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={editingRecord ? "Update Record" : "Submit Record"}
      />
      {recordPendingDelete ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Delete record?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This action will permanently remove the selected record from the list.
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
                  dispatch(
                    deleteFormSubmission({
                      storageKey,
                      recordId: recordPendingDelete.id,
                    })
                  )
                  toast.success("Record deleted successfully.")
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
