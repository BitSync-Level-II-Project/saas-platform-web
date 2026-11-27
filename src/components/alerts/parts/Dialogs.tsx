import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Field } from './Field'

// These dialogs are mounted only while open, so their state resets every time.

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog
      ref={ref} className="al-dialog" aria-label={title}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <h2>{title}</h2>
      {children}
    </dialog>
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
      <Field label={label} error={tried && empty ? 'This field is required.' : undefined}>
        {(p) => <textarea {...p} className="input" rows={4} value={note} autoFocus onChange={(e) => setNote(e.target.value)} />}
      </Field>
      <div className="al-dialog-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
        <button
          type="button" className={danger ? 'danger-btn' : 'primary-btn'} disabled={busy}
          onClick={() => (empty ? setTried(true) : onConfirm(note.trim()))}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
