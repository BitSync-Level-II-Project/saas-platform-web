import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

/** Holds the menu item and route for screens that are planned but not built yet. */
export function PlaceholderPage({ title, planned }: { title: string; planned: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState title="Not built yet" hint={planned} />
    </>
  )
}
