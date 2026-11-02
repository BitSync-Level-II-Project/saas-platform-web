import type { AutomationRule, Operator } from '../types'

export const OPERATORS: Operator[] = ['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ', 'BETWEEN']

export const OPERATOR_SYMBOL: Record<Operator, string> = {
  GT: '>', GTE: '>=', LT: '<', LTE: '<=', EQ: '=', NEQ: '!=', BETWEEN: 'between',
}

type Condition = Pick<AutomationRule, 'operator' | 'thresholdValue' | 'thresholdMax'>

/** Pure comparison used by the rule engine (guide C6). 80 with GT 80 is false. */
export function evaluate(rule: Condition, value: number): boolean {
  const t = rule.thresholdValue ?? 0
  const m = rule.thresholdMax ?? t
  switch (rule.operator) {
    case 'GT': return value > t
    case 'GTE': return value >= t
    case 'LT': return value < t
    case 'LTE': return value <= t
    case 'EQ': return value === t
    case 'NEQ': return value !== t
    case 'BETWEEN': return value >= t && value <= m
    default: return false
  }
}

/** Reads payload values by key or nested path, for example "machine.temperature". */
export function getByPath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj)
}

/** Short condition text for tables, for example "temperature > 80". */
export function conditionText(r: Partial<AutomationRule>): string {
  const op = OPERATOR_SYMBOL[r.operator ?? 'GT']
  const range =
    r.operator === 'BETWEEN' ? `${r.thresholdValue ?? '?'} and ${r.thresholdMax ?? '?'}` : (r.thresholdValue ?? '?')
  return `${r.fieldKey || '[field]'} ${op} ${range}`
}

/** The live sentence under the rule editor form. */
export function ruleSentence(r: Partial<AutomationRule>): string {
  const op = OPERATOR_SYMBOL[r.operator ?? 'GT']
  const value = r.thresholdValue ?? '[value]'
  const range = r.operator === 'BETWEEN' ? ` and ${r.thresholdMax ?? '[max]'}` : ''
  return `If ${r.fieldKey || '[field]'} ${op} ${value}${range} then raise a ${r.severity || '[severity]'} alert (repeat after ${r.cooldownMinutes ?? 0} min).`
}

export function alertMessage(rule: AutomationRule, value: number): string {
  return `${rule.fieldKey} = ${value} (rule: ${conditionText(rule)})`
}
