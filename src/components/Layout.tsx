import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `hover:text-amber-700 ${isActive ? 'text-amber-700 font-medium' : 'text-stone-700'}`

export function Layout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Keramikwerkstatt Lehmglück
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <NavLink to="/" className={navLinkClass} end>
              Start
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Blog
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
            <NavLink to="/warenkorb" className={navLinkClass}>
              Warenkorb{itemCount > 0 ? ` (${itemCount})` : ''}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
            {user ? (
              <button onClick={() => signOut()} className="text-stone-700 hover:text-amber-700">
                Abmelden ({profile?.display_name ?? '…'})
              </button>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Anmelden
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 text-sm text-stone-500 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Keramikwerkstatt Lehmglück</p>
          <div className="flex gap-4">
            <Link to="/impressum" className="hover:text-amber-700">
              Impressum
            </Link>
            <Link to="/datenschutz" className="hover:text-amber-700">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
