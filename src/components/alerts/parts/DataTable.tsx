import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  empty: ReactNode
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string
  skeletonRows?: number
  /** Shown inside the card under the rows (record count, pager). */
  footer?: ReactNode
}

export function DataTable<T>({
  columns, rows, rowKey, loading, error, onRetry, empty, onRowClick, rowClassName, skeletonRows = 6, footer,
}: Props<T>) {
  if (error) {
    return (
      <div className="card al-empty" role="alert">
        <h3>Could not load this list</h3>
        <p>{error}</p>
        {onRetry && <button type="button" className="secondary-btn" onClick={onRetry}>Try again</button>}
      </div>
    )
  }
  if (!loading && rows && rows.length === 0) return <>{empty}</>

  return (
    <div className="card">
      <div className="al-scroll">
        <table className="data-table" aria-busy={loading}>
          <thead>
            <tr>{columns.map((c) => <th key={c.key} scope="col" className={c.className}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {loading || !rows
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={i} className="al-skeleton">
                    {columns.map((c) => <td key={c.key}><span /></td>)}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className={`${onRowClick ? 'al-click ' : ''}${rowClassName?.(row) ?? ''}`}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick && (() => onRowClick(row))}
                    onKeyDown={onRowClick && ((e) => { if (e.key === 'Enter') onRowClick(row) })}
                  >
                    {columns.map((c) => <td key={c.key} className={c.className}>{c.render(row)}</td>)}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && footer}
    </div>
  )
}

/** Card footer: "11 records" on the left, Previous and Next on the right when there is more than one page. */
export function Pager({ page, pageSize, total, onPage, noun = 'record' }: {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
  noun?: string
}) {
  if (total === 0) return null
  const pages = Math.ceil(total / pageSize)
  return (
    <div className="table-footer al-footer">
      <span>{total} {noun}{total === 1 ? '' : 's'}</span>
      {pages > 1 && (
        <div>
          <span>Page {page} of {pages}</span>
          <button type="button" className="secondary-btn al-small" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
          <button type="button" className="secondary-btn al-small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
