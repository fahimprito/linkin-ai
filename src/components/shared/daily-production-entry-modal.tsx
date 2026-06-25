import type { FieldValues, UseFormRegister } from "react-hook-form"

import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"

type DailyProductionEntryModalProps<T extends FieldValues> = {
  open: boolean
  title: string
  description: string
  register: UseFormRegister<T>
  onClose: () => void
  onReset: () => void
  onSubmit: React.FormEventHandler<HTMLFormElement>
  submitLabel: string
}

const dailyProductionFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number (read-only)", placeholder: "LK-2099" },
  { name: "entryDate", label: "Entry Date", type: "date" },
  {
    name: "plannedQty",
    label: "Planned Qty (pcs)",
    type: "number",
    placeholder: "1200",
  },
  {
    name: "producedQty",
    label: "Produced Qty (pcs)",
    type: "number",
    placeholder: "1150",
  },
  {
    name: "finishedOutputWeight",
    label: "Finished Output Weight (kg)",
    type: "number",
    placeholder: "1085",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Production notes and shift remarks.",
  },
]

export function DailyProductionEntryModal<T extends FieldValues>({
  open,
  title,
  description,
  register,
  onClose,
  onReset,
  onSubmit,
  submitLabel,
}: DailyProductionEntryModalProps<T>) {
  return (
    <RecordFormModal
      open={open}
      title={title}
      description={description}
      fields={dailyProductionFields}
      register={register}
      onClose={onClose}
      onReset={onReset}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      maxWidthClassName="max-w-3xl"
    />
  )
}
