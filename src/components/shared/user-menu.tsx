import { CircleUserRound, LogOut, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { roleLabels } from "@/lib/permissions"
import { useAppDispatch } from "@/store/hooks"
import { logout } from "@/features/auth/auth-slice"
import type { User } from "@/types/auth"

type UserMenuProps = {
  className?: string
  dropdownClassName?: string
  inlineDropdown?: boolean
  showDetailsOnMobile?: boolean
  triggerClassName?: string
  user: User
}

export function UserMenu({
  className,
  dropdownClassName,
  inlineDropdown = false,
  showDetailsOnMobile = false,
  triggerClassName,
  user,
}: UserMenuProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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

  const dropdownContent = (
    <div
      className={cn(
        inlineDropdown
          ? "mb-2 w-full rounded-[1.5rem] border border-border/70 bg-card p-3 shadow-lg"
          : "absolute right-0 top-13 z-50 w-72 rounded-[1.5rem] border border-border/70 bg-card p-3 shadow-xl",
        dropdownClassName
      )}
    >
      <div className="rounded-[1.25rem] bg-secondary/60 p-4">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {roleLabels[user.role]} | {user.department}
        </p>
      </div>
      <div className="mt-3 space-y-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-2xl"
          onClick={() => {
            setIsOpen(false)
            navigate("/profile")
          }}
        >
          <CircleUserRound className="size-4" />
          My Profile
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-2xl"
          onClick={() => {
            setIsOpen(false)
            toast.info("Settings page can be added next.")
          }}
        >
          <Settings className="size-4" />
          Settings
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            setIsOpen(false)
            dispatch(logout())
            navigate("/login")
          }}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {isOpen && inlineDropdown ? dropdownContent : null}
      <Button
        type="button"
        variant="outline"
        className={cn("h-11 rounded-lg border-transparent px-2.5", triggerClassName)}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {user.avatar}
        </div>
        <div
          className={cn(
            "min-w-0 text-left",
            showDetailsOnMobile ? "block flex-1" : "hidden md:block"
          )}
        >
          <p className="max-w-32 truncate text-sm font-semibold">{user.name}</p>
          <p className="max-w-32 truncate text-xs text-muted-foreground">
            {roleLabels[user.role]}
          </p>
        </div>
      </Button>
      {isOpen && !inlineDropdown ? dropdownContent : null}
    </div>
  )
}
