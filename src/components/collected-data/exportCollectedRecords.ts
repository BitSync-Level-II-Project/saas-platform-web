import {
  reviewLabels,
  type CollectedRecordSummary,
} from './collectedDataTypes'

function escapeCsvCell(value: string | number): string {
  let text = String(value)

  // Reduce spreadsheet formula interpretation of text values.
  if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) {
    text = "'" + text
  }

  return `"${text.replace(/"/g, '""')}"`
}

export function buildCollectedRecordsCsv(
  records: CollectedRecordSummary[],
): string {
  const headers = [
    'Record ID',
    'Task ID',
    'Template ID',
    'Template',
    'Version',
    'Warehouse',
    'Location',
    'Submitted by',
    'Source',
    'Submitted at (ISO 8601)',
    'Received at (ISO 8601)',
    'Review',
  ]

  const rows = records.map((record) => [
    record.id,
    record.taskId,
    record.templateId,
    record.templateName,
    record.templateVersion,
    record.warehouse,
    record.location,
    record.submittedBy,
    record.source === 'worker'
      ? 'Worker phone'
      : 'Stationed phone',
    record.submittedAt,
    record.receivedAt,
    reviewLabels[record.reviewStatus],
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n')
}

export function downloadCollectedRecordsCsv(
  records: CollectedRecordSummary[],
): void {
  if (records.length === 0) {
    return
  }

  const csv = buildCollectedRecordsCsv(records)

  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'sitetrace-collected-records.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}