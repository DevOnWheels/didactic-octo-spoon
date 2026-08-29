import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-amber-700 text-white' : 'text-stone-700 hover:bg-stone-100'}`

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-2 border-b border-stone-200 pb-4">
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
      </nav>
      <Outlet />
    </div>
  )
}
