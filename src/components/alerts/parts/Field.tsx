import { useId, type ReactNode } from 'react'

interface ControlProps {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

/** Label, control, hint and error in the shared `.field` layout. The control gets its props from the render function. */
export function Field({ label, hint, error, wide, children }: {
  label: string
  hint?: string
  error?: string
  wide?: boolean
  children: (props: ControlProps) => ReactNode
}) {
  const id = useId()
  const hasNote = !!(hint || error)
  return (
    <div className={wide ? 'field al-wide' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': hasNote ? `${id}-note` : undefined })}
      {error ? <small id={`${id}-note`} className="al-error">{error}</small>
        : hint ? <small id={`${id}-note`} className="al-hint">{hint}</small> : null}
    </div>
  )
}
