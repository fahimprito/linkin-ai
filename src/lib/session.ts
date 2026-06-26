import { appModuleKeys, userRoles, type Session } from "@/types/auth"

const SESSION_STORAGE_KEY = "linkin-ai-admin-session"

function isValidSession(session: unknown): session is Session {
  if (typeof session !== "object" || session === null) {
    return false
  }

  const candidate = session as Session

  if (
    typeof candidate.accessToken !== "string" ||
    typeof candidate.refreshToken !== "string" ||
    typeof candidate.expiresAt !== "string" ||
    typeof candidate.user !== "object" ||
    candidate.user === null
  ) {
    return false
  }

  return (
    userRoles.includes(candidate.user.role) &&
    Array.isArray(candidate.user.permissions) &&
    candidate.user.permissions.every((permission) =>
      appModuleKeys.includes(permission)
    )
  )
}

export function loadSession() {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const parsedSession = JSON.parse(rawSession)

    if (!isValidSession(parsedSession)) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    return parsedSession
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
