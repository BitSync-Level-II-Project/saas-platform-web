import { useRef, useState } from "react";
import {
  reviewLabels,
  type CollectedRecordSummary,
  type ReviewStatus,
} from "./collectedDataTypes";

type Decision = Exclude<ReviewStatus, "pending">;

type Props = {
  record: CollectedRecordSummary;
  onReview: (status: ReviewStatus, note: string) => Promise<void>;
};

const reviewedTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Colombo",
});

export function RecordReviewPanel({ record, onReview }: Props) {
  const [decision, setDecision] = useState<Decision>(
    record.reviewStatus === "pending" ? "approved" : record.reviewStatus,
  );
  const [note, setNote] = useState(record.reviewNote ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const saveLock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const needsReason = decision !== "approved";

  async function saveReview() {
    if (saveLock.current) return;
    setError("");
    setMessage("");

    if (needsReason && !note.trim()) {
      setError(
        "Enter a reason when requesting a recheck or rejecting a record.",
      );
      return;
    }

    saveLock.current = true;
    setIsSaving(true);
    try {
      await onReview(decision, note.trim());
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
              if (
                value === "approved" ||
                value === "recheck-requested" ||
                value === "rejected"
              ) {
                setDecision(value);
                setError("");
                setMessage("");
              }
            }}
          >
            <option value="approved">Approve</option>
            <option value="recheck-requested">Request recheck</option>
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
