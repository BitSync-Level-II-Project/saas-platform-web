export type NavIconName = 'home' | 'user' | 'building' | 'doc' | 'tasks' | 'chart' | 'bell' | 'clock'

const PATHS: Record<NavIconName, string[]> = {
  home: ['M3 11l9-8 9 8', 'M5 10v10h14V10', 'M10 20v-6h4v6'],
  user: ['M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M4 21c0-4 4-6 8-6s8 2 8 6'],
  building: ['M5 3h14v18H5z', 'M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2'],
  doc: ['M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M9 8h6M9 12h6M9 16h4'],
  tasks: ['M7 5h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'M9 3h6v3H9z', 'M9 13l2 2 4-4'],
  chart: ['M4 4v16h16', 'M8 16v-5M12 16V8M16 16v-3'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
}

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  )
}
