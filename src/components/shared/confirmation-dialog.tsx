import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { closeConfirmationDialog } from "@/store/slices/ui-slice"

export function ConfirmationDialog() {
  const dispatch = useAppDispatch()
  const dialog = useAppSelector((state) => state.ui.confirmationDialog)

  if (!dialog.open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">{dialog.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {dialog.description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(closeConfirmationDialog())}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => dispatch(closeConfirmationDialog())}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
