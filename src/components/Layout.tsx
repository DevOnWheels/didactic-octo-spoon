import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-colors hover:text-clay-700 ${isActive ? 'text-clay-700 font-bold' : 'text-ink-700'}`

export function Layout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink-900">
      <a
        href="#main-content"
        className="sr-only rounded bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Zum Inhalt springen
      </a>

      <header className="sticky top-0 z-10 border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-ink-900">
            Lehmglück
          </Link>
          <nav aria-label="Hauptnavigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
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
              <button onClick={() => signOut()} className="text-ink-700 transition-colors hover:text-clay-700">
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

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="bg-ink-900 text-ink-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-sm sm:flex-row sm:justify-between">
          <p className="font-bold text-white">&copy; {new Date().getFullYear()} Lehmglück</p>
          <div className="flex gap-4">
            <Link to="/impressum" className="transition-colors hover:text-clay-300">
              Impressum
            </Link>
            <Link to="/datenschutz" className="transition-colors hover:text-clay-300">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
