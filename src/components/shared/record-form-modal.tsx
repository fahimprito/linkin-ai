import type { FieldValues, Path, UseFormRegister } from "react-hook-form"

import { Button } from "@/components/ui/button"

export type ModalFormField = {
  name: string
  label: string
  type?: "text" | "number" | "date" | "textarea" | "select"
  placeholder?: string
  options?: string[]
  disabled?: boolean
  readOnly?: boolean
}

type RecordFormModalProps<T extends FieldValues> = {
  open: boolean
  title: string
  description: string
  fields: ModalFormField[]
  register: UseFormRegister<T>
  onClose: () => void
  onReset: () => void
  onSubmit: React.FormEventHandler<HTMLFormElement>
  submitLabel: string
  maxWidthClassName?: string
}

export function RecordFormModal<T extends FieldValues>({
  open,
  title,
  description,
  fields,
  register,
  onClose,
  onReset,
  onSubmit,
  submitLabel,
  maxWidthClassName = "max-w-4xl",
}: RecordFormModalProps<T>) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl ${maxWidthClassName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
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
                    {...register(field.name as Path<T>, { required: true })}
                    placeholder={field.placeholder}
                    className={`${commonClassName} ${
                      field.disabled || field.readOnly
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : ""
                    }`}
                    rows={4}
                    disabled={field.disabled}
                    readOnly={field.readOnly}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    {...register(field.name as Path<T>, { required: true })}
                    className={`${commonClassName} ${
                      field.disabled || field.readOnly
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : ""
                    }`}
                    defaultValue=""
                    disabled={field.disabled}
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
                    {...register(field.name as Path<T>, { required: true })}
                    placeholder={field.placeholder}
                    className={`${commonClassName} ${
                      field.disabled || field.readOnly
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : ""
                    }`}
                    disabled={field.disabled}
                    readOnly={field.readOnly}
                  />
                )}
              </div>
            )
          })}
          <div className="flex items-center justify-end gap-3 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={onReset}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-2xl">
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
