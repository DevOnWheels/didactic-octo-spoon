import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Layout } from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/BlogPost'
import { Shop } from './pages/Shop'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { OrderConfirmation } from './pages/OrderConfirmation'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Impressum } from './pages/Impressum'
import { Datenschutz } from './pages/Datenschutz'
import { NewsletterBestaetigung } from './pages/NewsletterBestaetigung'
import { NewsletterAbmeldung } from './pages/NewsletterAbmeldung'
import { Dashboard } from './pages/admin/Dashboard'
import { AdminPosts } from './pages/admin/Posts'
import { AdminProducts } from './pages/admin/Products'
import { AdminNewsletter } from './pages/admin/Newsletter'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/:slug" element={<ProductDetail />} />
              <Route path="warenkorb" element={<Cart />} />
              <Route path="bestellung-bestaetigt" element={<OrderConfirmation />} />
              <Route path="login" element={<Login />} />
              <Route path="registrieren" element={<Register />} />
              <Route path="impressum" element={<Impressum />} />
              <Route path="datenschutz" element={<Datenschutz />} />
              <Route path="newsletter-bestaetigung" element={<NewsletterBestaetigung />} />
              <Route path="newsletter-abmeldung" element={<NewsletterAbmeldung />} />

              <Route path="admin" element={<ProtectedAdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="beitraege" element={<AdminPosts />} />
                  <Route path="produkte" element={<AdminProducts />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
