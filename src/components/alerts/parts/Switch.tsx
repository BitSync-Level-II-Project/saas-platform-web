export function Switch({ checked, onChange, label, disabled }: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
      className="al-switch" onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}
