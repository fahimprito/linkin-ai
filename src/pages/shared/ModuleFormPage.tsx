import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  getStoredFormRecords,
  saveStoredFormRecords,
  type StoredFormRecord,
} from "@/lib/form-submissions"

type FormFieldConfig = {
  name: string
  label: string
  type?: "text" | "number" | "date" | "textarea" | "select"
  placeholder?: string
  options?: string[]
}

type ModuleFormPageProps = {
  title: string
  description: string
  storageKey: string
  fields: FormFieldConfig[]
  summaryCards?: Array<{
    label: string
    value: string
    delta: string
    tone?: "default" | "success" | "warning" | "danger"
  }>
}

type FormValues = Record<string, string>

export function ModuleFormPage({
  title,
  description,
  storageKey,
  fields,
  summaryCards = [],
}: ModuleFormPageProps) {
  const [records, setRecords] = useState<StoredFormRecord[]>(
    getStoredFormRecords(storageKey)
  )
  const { register, handleSubmit, reset } = useForm<FormValues>()

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
    ]
  }, [fields])

  const onSubmit = (values: FormValues) => {
    const nextRecord: StoredFormRecord = {
      id: `frm-${Date.now()}`,
      submittedAt: new Date().toLocaleString(),
      ...Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, String(value)])
      ),
    }

    const nextRecords = [nextRecord, ...records]
    setRecords(nextRecords)
    saveStoredFormRecords(storageKey, nextRecords)
    toast.success(`${title} submitted successfully.`)
    reset()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => reset()}
          >
            Reset Form
          </Button>
        }
      />
      {summaryCards.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              delta={card.delta}
              tone={card.tone ?? "default"}
            />
          ))}
        </section>
      ) : null}
      <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Standardized Data Entry</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use this form to capture structured module data. Submissions are stored locally for now and can later be connected to REST APIs.
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          {fields.map((field) => {
            const commonClassName =
              "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"

            return (
              <div
                key={field.name}
                className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}
              >
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    {...register(field.name, { required: true })}
                    placeholder={field.placeholder}
                    className={commonClassName}
                    rows={4}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    {...register(field.name, { required: true })}
                    className={commonClassName}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type={field.type ?? "text"}
                    {...register(field.name, { required: true })}
                    placeholder={field.placeholder}
                    className={commonClassName}
                  />
                )}
              </div>
            )
          })}
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" className="rounded-2xl">
              Submit Record
            </Button>
          </div>
        </form>
      </section>
      {records.length ? (
        <DataTable columns={tableColumns} data={records} />
      ) : (
        <EmptyState
          title="No submissions yet"
          description="Start using the form above to create the first record for this workflow."
        />
      )}
    </div>
  )
}
