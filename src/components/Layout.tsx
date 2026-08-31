import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-colors hover:text-clay-600 ${isActive ? 'text-clay-600 font-bold' : 'text-ink-700'}`

export function Layout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white text-ink-900">
      <a
        href="#main-content"
        className="sr-only rounded bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Zum Inhalt springen
      </a>

      {/* Weißer Hintergrund geht über die volle Fensterbreite, der Inhalt bleibt auf
          Container-Breite begrenzt. Höhe schrumpft beim Scrollen (transition-all). */}
      <header
        className={`sticky top-0 z-10 w-full bg-white transition-shadow ${scrolled ? 'shadow-sm' : ''}`}
      >
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 transition-[padding] duration-200 ${
            scrolled ? 'py-2' : 'py-5'
          }`}
        >
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
              <button onClick={() => signOut()} className="text-ink-700 transition-colors hover:text-clay-600">
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

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Schmale, dunkle Fußzeile über die volle Fensterbreite. */}
      <footer className="w-full bg-brown-1 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 py-4 text-sm sm:flex-row sm:justify-between">
          <p>Project by Dev On Wheels | Powered by Claude AI</p>
          <div className="flex gap-4 text-ink-300">
            <Link to="/impressum" className="transition-colors hover:text-clay-400">
              Impressum
            </Link>
            <Link to="/datenschutz" className="transition-colors hover:text-clay-400">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
