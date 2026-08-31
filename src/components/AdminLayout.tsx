import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm font-bold ${isActive ? 'bg-clay-400 text-white' : 'text-ink-700 hover:bg-ink-100'}`

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <nav aria-label="Admin-Navigation" className="flex flex-wrap gap-2 border-b-2 border-ink-100 pb-4">
        <NavLink to="/admin" className={linkClass} end>
          Übersicht
        </NavLink>
        <NavLink to="/admin/beitraege" className={linkClass}>
          Beiträge
        </NavLink>
        <NavLink to="/admin/produkte" className={linkClass}>
          Produkte
        </NavLink>
        <NavLink to="/admin/newsletter" className={linkClass}>
          Newsletter
        </NavLink>
        <NavLink to="/admin/nutzer" className={linkClass}>
          Nutzer
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
