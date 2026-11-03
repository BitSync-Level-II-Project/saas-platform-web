export function PageHeader({ title, subtitle, back, crumb }: {
  title: string
  subtitle?: string
  /** "← Back to alerts" style link, as on the task pages. */
  back?: { label: string; onClick: () => void }
  /** Small blue label above the title (used on the audit log). */
  crumb?: { label: string; onClick: () => void }
}) {
  return (
    <>
      {back && <button type="button" className="back-link" onClick={back.onClick}>← {back.label}</button>}
      {crumb && <button type="button" className="al-crumb" onClick={crumb.onClick}>{crumb.label}</button>}
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-sub">{subtitle}</p> : <div className="al-gap" />}
    </>
  )
}
