// Stand-in for the logged-in user until the real login is merged.
// Replace the body of useSessionUser/getSessionUser with the team's auth hook; nothing else depends on it.
import { useSyncExternalStore } from 'react'
import { db } from './mock/db'
import type { User } from './types'

// Opens as the Manager, as in the design. For testing other roles add ?role=supervisor or ?role=admin to the address.
const ROLE_PARAMS: Record<string, string> = { admin: 'u-admin', manager: 'u-manager', supervisor: 'u-supervisor' }
let currentId = ROLE_PARAMS[new URLSearchParams(window.location.search).get('role') ?? ''] ?? 'u-manager'
const listeners = new Set<() => void>()

export const getSessionUser = (): User => db.users.find((u) => u.id === currentId) ?? db.users[0]

export function setSessionUser(id: string) {
  currentId = id
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useSessionUser = (): User => useSyncExternalStore(subscribe, getSessionUser)
