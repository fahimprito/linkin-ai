import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"
import { store } from "@/store"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </Provider>
  )
}
