import { FileUp, X } from "lucide-react"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

type FileUploadFieldProps = {
  label: string
  value?: string
  onChange: (fileName: string) => void
  onClear: () => void
  accept?: string
  className?: string
}

export function FileUploadField({
  label,
  value,
  onChange,
  onClear,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file) return
    // Store file name only (mock — no real upload)
    onChange(file.name)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <FileUp className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="flex-1 truncate text-emerald-700 dark:text-emerald-300">
            {value}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-sm transition",
            isDragging
              ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-500/10"
              : "border-border/70 bg-background hover:border-ring hover:bg-secondary/40"
          )}
        >
          <FileUp className="size-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            Click or drag a file to upload
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
