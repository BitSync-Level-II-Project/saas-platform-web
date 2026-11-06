export type ReviewStatus =
  | 'pending'
  | 'approved'
  | 'recheck-requested'
  | 'rejected'

export type CollectedRecordSummary = {
  id: string
  taskId: string
  templateId: string
  templateVersion: number
  templateName: string
  warehouse: string
  location: string
  submittedBy: string
  source: 'worker' | 'stationed'
  submittedAt: string
  receivedAt: string
  reviewStatus: ReviewStatus
}