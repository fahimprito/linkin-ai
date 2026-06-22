import { BellRing } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { markAllRead } from "@/store/slices/notification-slice"

export function NotificationDropdown() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((state) => state.notifications.items)
  const unreadCount = notifications.filter((item) => !item.read).length
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-expanded={isOpen}
        aria-label="Toggle notifications"
        onClick={() => setIsOpen((current) => !current)}
      >
        <BellRing className="size-4" />
      </Button>
      {unreadCount > 0 ? (
        <span className="absolute -top-2 -right-2 inline-flex min-w-6 justify-center rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
          {unreadCount}
        </span>
      ) : null}
      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[22rem] rounded-[1.5rem] border border-border/70 bg-card p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BellRing className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => dispatch(markAllRead())}
            >
              Mark all read
            </Button>
          </div>
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-background px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  {!item.read ? (
                    <span className="size-2 rounded-full bg-primary" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {item.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
