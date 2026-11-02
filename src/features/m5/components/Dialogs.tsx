import { useEffect, useRef, useState, type ReactNode } from 'react'

// These dialogs are mounted only while open, so their state resets every time.

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog
      ref={ref} className="m5-dialog" aria-label={title}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <h2>{title}</h2>
      {children}
    </dialog>
  )
}

interface ConfirmProps {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, danger, busy, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="m5-dialog-actions">
        <button type="button" className="m5-btn" onClick={onCancel}>Cancel</button>
        <button type="button" className={danger ? 'm5-btn danger' : 'm5-btn primary'} disabled={busy} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

interface ReasonProps {
  title: string
  label: string
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onConfirm: (note: string) => void
  onCancel: () => void
}

/** A text box that must be filled in. Used for resolve, escalate and delete. */
export function ReasonDialog({ title, label, confirmLabel, danger, busy, onConfirm, onCancel }: ReasonProps) {
  const [note, setNote] = useState('')
  const [tried, setTried] = useState(false)
  const empty = note.trim().length === 0

  return (
    <Modal title={title} onClose={onCancel}>
      <label className="m5-field">
        <span>{label}</span>
        <textarea
          rows={4} value={note} autoFocus aria-invalid={tried && empty}
          onChange={(e) => setNote(e.target.value)}
        />
        {tried && empty && <small className="m5-error">This field is required.</small>}
      </label>
      <div className="m5-dialog-actions">
        <button type="button" className="m5-btn" onClick={onCancel}>Cancel</button>
        <button
          type="button" className={danger ? 'm5-btn danger' : 'm5-btn primary'} disabled={busy}
          onClick={() => (empty ? setTried(true) : onConfirm(note.trim()))}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
