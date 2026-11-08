import { useEffect, useRef, useState } from 'react'

import {
  reviewLabels,
  type CollectedRecordSummary,
} from './collectedDataTypes'

import './RecordDetailsModal.css'

type RecordDetailsModalProps = {
  record: CollectedRecordSummary
  onClose: () => void
}

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Colombo',
})

function EvidenceImage({
  url,
  label,
}: {
  url: string
  label: string
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <p role="status">
        This evidence image could not be loaded.
      </p>
    )
  }

  return (
    <img
      src={url}
      alt={label}
      onError={() => setHasError(true)}
    />
  )
}

export function RecordDetailsModal({
  record,
  onClose,
}: RecordDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [evidenceId, setEvidenceId] = useState(
    record.evidence?.[0]?.id ?? null,
  )

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    dialog.showModal()

    return () => dialog.close()
  }, [])

  const evidence = record.evidence ?? []

  const selectedEvidence = evidence.find(
    (item) => item.id === evidenceId,
  )

  const metadata = [
    ['Task', record.taskId],
    [
      'Template',
      `${record.templateName} · v${record.templateVersion}`,
    ],
    ['Warehouse', record.warehouse],
    ['Location', record.location],
    ['Submitted by', record.submittedBy],
    [
      'Source',
      record.source === 'worker'
        ? 'Worker phone'
        : 'Stationed phone',
    ],
    [
      'Submitted',
      timeFormatter.format(new Date(record.submittedAt)),
    ],
    [
      'Received',
      timeFormatter.format(new Date(record.receivedAt)),
    ],
  ]

  return (
    <dialog
      ref={dialogRef}
      className="record-details"
      aria-labelledby="record-details-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <header className="record-details__header">
        <div>
          <h2 id="record-details-title">
            {record.templateName}
          </h2>

          <p>
            {record.id} · {reviewLabels[record.reviewStatus]}
          </p>
        </div>

        <button
          type="button"
          aria-label="Close record details"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <section aria-labelledby="record-context-title">
        <h3 id="record-context-title">Record details</h3>

        <dl className="record-details__metadata">
          {metadata.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <p className="record-details__note">
          Times shown in Asia/Colombo.
        </p>
      </section>

      <section aria-labelledby="record-answers-title">
        <h3 id="record-answers-title">Answers</h3>

        {record.answers?.length ? (
          <dl className="record-details__answers">
            {record.answers.map((answer) => (
              <div key={answer.fieldId}>
                <dt>{answer.label}</dt>
                <dd>{answer.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>No answers available.</p>
        )}
      </section>

      <section aria-labelledby="record-evidence-title">
        <h3 id="record-evidence-title">
          Evidence ({evidence.length})
        </h3>

        {evidence.length === 0 ? (
          <p>No evidence attached.</p>
        ) : (
          <>
            <div className="record-details__evidence-list">
              {evidence.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === evidenceId}
                  onClick={() => setEvidenceId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {selectedEvidence && (
              <figure className="record-details__image">
                <EvidenceImage
                  key={selectedEvidence.id}
                  url={selectedEvidence.url}
                  label={selectedEvidence.label}
                />

                <figcaption>
                  {selectedEvidence.label}
                </figcaption>
              </figure>
            )}
          </>
        )}
      </section>

      <footer className="record-details__footer">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </footer>
    </dialog>
  )
}