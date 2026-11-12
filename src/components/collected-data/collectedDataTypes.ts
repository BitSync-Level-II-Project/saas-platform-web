export type ReviewStatus =
  "pending" | "approved" | "recheck-requested" | "rejected";

export type CollectedRecordSummary = {
  id: string;
  taskId: string;
  templateId: string;
  templateVersion: number;
  templateName: string;
  warehouse: string;
  location: string;
  submittedBy: string;
  source: "worker" | "stationed";
  submittedAt: string;
  receivedAt: string;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
  answers?: CollectedAnswer[];
  evidence?: RecordEvidence[];
};

export type CollectedAnswer = {
  fieldId: string;
  label: string;
  value: string;
};

export type RecordEvidence = {
  id: string;
  label: string;
  url: string;
};

export const reviewLabels: Record<ReviewStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  "recheck-requested": "Recheck requested",
  rejected: "Rejected",
};
