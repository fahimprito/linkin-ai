export type StoredFormRecord = Record<string, string> & {
  id: string
  submittedAt: string
}

export function getStoredFormRecords(storageKey: string) {
  if (typeof window === "undefined") {
    return [] as StoredFormRecord[]
  }

  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    return [] as StoredFormRecord[]
  }

  try {
    return JSON.parse(rawValue) as StoredFormRecord[]
  } catch {
    window.localStorage.removeItem(storageKey)
    return [] as StoredFormRecord[]
  }
}

export function saveStoredFormRecords(
  storageKey: string,
  records: StoredFormRecord[]
) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(records))
}
