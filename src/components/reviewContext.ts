import { createContext } from 'react';

export interface ReviewEvent {
  at: string;
  by: string;
  action: 'Approved' | 'Rejected' | 'Reassigned';
  note: string;
}

export interface ReviewCtx {
  history: Record<string, ReviewEvent[]>;
  reassign: (submissionId: string, worker: string) => void;
}

export const ReviewContext = createContext<ReviewCtx>({ history: {}, reassign: () => {} });