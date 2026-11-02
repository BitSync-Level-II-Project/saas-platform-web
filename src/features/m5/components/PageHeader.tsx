import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, subtitle, actions, crumb }: {
  title: string
  subtitle?: string
  actions?: ReactNode
  /** Small blue link above the title, as on the Figma Audit log screen. */
  crumb?: { label: string; to: string }
}) {
  return (
    <div className="m5-pagehead">
      <div>
        {crumb && <Link to={crumb.to} className="m5-crumb">{crumb.label}</Link>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="m5-pagehead-actions">{actions}</div>}
    </div>
  )
}
