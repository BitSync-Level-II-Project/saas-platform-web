import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AlertActionName, RuleInput } from '../types'
import { useSessionUser } from '../session'
import {
  actOnAlert, createRule, deleteRule, getAlert, getReference, getRule, getUnreadCount, getUrgentAlerts,
  ingestEvent, listAlerts, listAuditLogs, listNotifications, listRules, markAllRead, markRead,
  setRuleEnabled, updateRule, type AlertQuery, type AuditQuery, type RuleQuery,
} from './alertsApi'

const POLL_MS = 15_000

// Mutations touch several lists at once (an alert changes the bell, the audit trail and the banner),
// so after any write we refresh everything. Cheap here; narrow it down if the real API gets heavy.
function useRefreshAll() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries()
}

// ----- reference data -----
export const useReference = () => useQuery({ queryKey: ['reference'], queryFn: getReference, staleTime: Infinity })

/** Name lookups for ids (site, location, device, template). Falls back to the id while loading. */
export function useLookups() {
  const { data } = useReference()
  const find = (list: { id: string; name: string }[] | undefined, id?: string) =>
    id ? (list?.find((x) => x.id === id)?.name ?? id) : '—'
  return {
    ref: data,
    site: (id?: string) => find(data?.sites, id),
    location: (id?: string) => find(data?.locations, id),
    device: (id?: string) => find(data?.devices, id),
    template: (id?: string) => find(data?.templates, id),
  }
}

// ----- rules -----
export const useRules = (q: RuleQuery) =>
  useQuery({ queryKey: ['rules', q], queryFn: () => listRules(q), placeholderData: keepPreviousData })

export const useRule = (id?: string) =>
  useQuery({ queryKey: ['rule', id], queryFn: () => getRule(id as string), enabled: !!id })

export function useSaveRule() {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (v: { id?: string; input: RuleInput }) => (v.id ? updateRule(v.id, v.input) : createRule(v.input)),
    onSuccess: refresh,
  })
}

export function useToggleRule() {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (v: { id: string; enabled: boolean }) => setRuleEnabled(v.id, v.enabled),
    onSuccess: refresh,
  })
}

export function useDeleteRule() {
  const refresh = useRefreshAll()
  return useMutation({ mutationFn: (v: { id: string; reason: string }) => deleteRule(v.id, v.reason), onSuccess: refresh })
}

// ----- events -----
export function useIngestEvent() {
  const refresh = useRefreshAll()
  return useMutation({ mutationFn: ingestEvent, onSuccess: refresh })
}

// ----- alerts -----
export const useAlerts = (q: AlertQuery) =>
  useQuery({
    queryKey: ['alerts', q], queryFn: () => listAlerts(q), refetchInterval: POLL_MS, placeholderData: keepPreviousData,
  })

export const useAlert = (id?: string) =>
  useQuery({ queryKey: ['alert', id], queryFn: () => getAlert(id as string), enabled: !!id, refetchInterval: POLL_MS })

export const useUrgentAlerts = () =>
  useQuery({ queryKey: ['alerts-urgent'], queryFn: getUrgentAlerts, refetchInterval: POLL_MS })

export function useAlertAction() {
  const refresh = useRefreshAll()
  return useMutation({
    mutationFn: (v: { id: string; action: AlertActionName; note?: string }) => actOnAlert(v.id, v.action, v.note),
    onSuccess: refresh,
  })
}

// ----- notifications (scoped to the signed-in user, so the user id is part of the key) -----
export function useUnreadCount() {
  const user = useSessionUser()
  return useQuery({ queryKey: ['unread', user.id], queryFn: getUnreadCount, refetchInterval: POLL_MS })
}

export function useNotifications(limit: number, enabled = true) {
  const user = useSessionUser()
  return useQuery({ queryKey: ['notifications', user.id, limit], queryFn: () => listNotifications(limit), enabled })
}

export function useMarkRead() {
  const refresh = useRefreshAll()
  return useMutation({ mutationFn: markRead, onSuccess: refresh })
}

export function useMarkAllRead() {
  const refresh = useRefreshAll()
  return useMutation({ mutationFn: markAllRead, onSuccess: refresh })
}

// ----- audit -----
export const useAuditLogs = (q: AuditQuery, enabled = true) =>
  useQuery({ queryKey: ['audit', q], queryFn: () => listAuditLogs(q), enabled })
