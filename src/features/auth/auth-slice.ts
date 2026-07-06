import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { clearSession, loadSession, saveSession } from "@/lib/session"
import type { Session, User } from "@/types/auth"

type AuthState = {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
}

const initialSession = loadSession()

const initialState: AuthState = {
  session: initialSession,
  user: initialSession?.user ?? null,
  isAuthenticated: Boolean(initialSession),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session>) => {
      state.session = action.payload
      state.user = action.payload.user
      state.isAuthenticated = true
      saveSession(action.payload)
    },
    logout: (state) => {
      state.session = null
      state.user = null
      state.isAuthenticated = false
      clearSession()
    },
  },
})

export const { logout, setSession } = authSlice.actions

export default authSlice.reducer


