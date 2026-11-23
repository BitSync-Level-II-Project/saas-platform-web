import { useRef, useState } from "react";
import {
  reviewLabels,
  type CollectedRecordSummary,
  type ReviewDecision,
} from "./collectedDataTypes";

type Props = {
  record: CollectedRecordSummary;
  onReview: (status: ReviewDecision, note: string) => Promise<void>;
};

const reviewedTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Colombo",
});

export function RecordReviewPanel({ record, onReview }: Props) {
  const [decision, setDecision] = useState<ReviewDecision>(
    record.reviewStatus === "pending" ? "approved" : record.reviewStatus,
  );
  const [note, setNote] = useState(record.reviewNote ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const saveLock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canReview = record.reviewStatus === "pending";
  const needsReason = decision === "rejected";

  async function saveReview() {
    if (saveLock.current || !canReview) return;
    setError("");
    setMessage("");

    const trimmedNote = note.trim();
    if (needsReason && !trimmedNote) {
      setError("Enter a reason for rejecting this attempt.");
      return;
    }

    saveLock.current = true;
    setIsSaving(true);
    try {
      await onReview(decision, trimmedNote);
      setMessage("Review saved for this session.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Review could not be saved. Please try again.",
      );
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  }

  return (
    <section
      className="record-review"
      aria-labelledby="record-review-title"
      aria-busy={isSaving}
    >
      <h3 id="record-review-title">Review record</h3>
      <p className="record-review__hint">
        Reviews are a session preview. Refreshing the page resets these changes.
      </p>

      <p>Status: {reviewLabels[record.reviewStatus]}</p>
      {record.reviewedAt && (
        <p>
          Last reviewed: {reviewLabels[record.reviewStatus]} ·{" "}
          <time dateTime={record.reviewedAt}>
            {reviewedTimeFormatter.format(new Date(record.reviewedAt))}
          </time>{" "}
          (Asia/Colombo)
        </p>
      )}
      {record.reviewNote && (
        <p className="record-review__note">{record.reviewNote}</p>
      )}

      {canReview ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveReview();
          }}
        >
          <fieldset className="record-review__controls" disabled={isSaving}>
            <label htmlFor="review-decision">Decision</label>
            <select
              id="review-decision"
              value={decision}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (value === "approved" || value === "rejected") {
                  setDecision(value);
                  setError("");
                  setMessage("");
                }
              }}
            >
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>

            <label htmlFor="review-note">
              {needsReason ? "Reason (required)" : "Review note (optional)"}
            </label>
            <textarea
              id="review-note"
              rows={3}
              value={note}
              required={needsReason}
              aria-describedby={error ? "review-error" : undefined}
              onChange={(event) => {
                setNote(event.currentTarget.value);
                setMessage("");
              }}
            />
            <button className="tm-button tm-button--primary" type="submit">
              {isSaving ? "Saving review…" : "Save review"}
            </button>
          </fieldset>
        </form>
      ) : (
        <p>This attempt has been reviewed. Its decision is read-only.</p>
      )}

      {error && (
        <p id="review-error" className="tm-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="tm-notice" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
