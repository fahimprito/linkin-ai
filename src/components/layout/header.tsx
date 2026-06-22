import { Bell, Menu, Moon, Search, Sun } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useAppDispatch } from "@/store/hooks"
import { toggleSidebar } from "@/store/slices/ui-slice"

type HeaderSearchFormValues = {
  query: string
}

export function Header() {
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()
  const { register, handleSubmit, reset } = useForm<HeaderSearchFormValues>({
    defaultValues: {
      query: "",
    },
  })

  const isDark = theme === "dark"

  const onSubmit = ({ query }: HeaderSearchFormValues) => {
    if (!query.trim()) {
      toast.info("Type something to search the dashboard.")
      return
    }

    toast.success(`Search ready for: ${query}`)
    reset()
  }

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur md:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="size-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Linkin AI Admin
        </p>
        <h1 className="truncate text-lg font-semibold">Dashboard Overview</h1>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="hidden items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2 shadow-sm md:flex"
      >
        <Search className="size-4 text-muted-foreground" />
        <input
          {...register("query")}
          placeholder="Search reports, users, tasks"
          className="w-52 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </form>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <Button type="button" variant="outline" size="icon">
        <Bell className="size-4" />
      </Button>
    </header>
  )
}
