import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { publicImageUrl } from '../lib/storage'
import { formatPrice } from '../lib/format'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { NewsletterSignupForm } from '../components/NewsletterSignupForm'
import type { Post, Product } from '../types/database'

const services = [
  {
    title: 'Handarbeit',
    text: 'Jedes Stück wird einzeln an der Scheibe gedreht — kein Guss, keine Massenware.',
    bg: 'bg-brown-1',
  },
  {
    title: 'Töpferkurse',
    text: 'Für Einsteiger und Fortgeschrittene, in kleinen Gruppen von bis zu sechs Personen.',
    bg: 'bg-brown-2',
  },
  {
    title: 'Regionale Glasuren',
    text: 'Wir mischen unsere Glasuren selbst und brennen im eigenen Elektroofen.',
    bg: 'bg-brown-3',
  },
]

export function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts(data ?? []))

    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data ?? []))
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero: Hintergrundbild geht über die volle Fensterbreite, Inhalt bleibt auf Containerbreite. */}
      <section
        className="relative flex min-h-[520px] items-center overflow-hidden bg-brown-1 bg-cover bg-center px-4"
        style={{ backgroundImage: "url('/images/hero-pottery.jpg')" }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-brown-1/60" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-5 py-20">
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Handgemachte Keramik aus der Werkstatt am Fluss
          </h1>
          <p className="max-w-xl text-lg text-ink-100">
            Wir drehen, glasieren und brennen jedes Stück von Hand — vom Frühstücksgeschirr bis zur
            Einzelvase. Schau in unserem Shop vorbei oder komm zu einem unserer Töpferkurse.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/shop"
              className="bg-clay-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-clay-500"
            >
              Zum Shop
            </Link>
            <Link
              to="/blog"
              className="border-2 border-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-ink-900"
            >
              Neuigkeiten lesen
            </Link>
          </div>
        </div>
      </section>

      {/* Handarbeit / Töpferkurse / Regionale Glasuren — je ein Drittel der Fensterbreite,
          drei unterschiedliche Brauntöne von der Referenzseite. */}
      <section className="grid grid-cols-1 sm:grid-cols-3">
        {services.map((service, index) => (
          <div key={service.title} className={`${service.bg} px-8 py-14 sm:px-10`}>
            <span className="text-3xl font-bold text-clay-400">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="mt-3 mb-2 text-lg font-bold text-white">{service.title}</h2>
            <p className="text-sm text-white/80">{service.text}</p>
          </div>
        ))}
      </section>

      {/* Shop: Überschrift, Einleitung, Trennstrich, dann Produktkarten — 3 pro Zeile. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-ink-900">Shop</h2>
          <p className="mt-3 text-ink-700">
            Handgedrehte Unikate für den Alltag — vom Frühstücksgeschirr bis zur Einzelvase.
          </p>
          <span aria-hidden="true" className="mx-auto mt-6 block h-1 w-16 bg-clay-400" />
        </div>

        {products.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => {
              const imageUrl = publicImageUrl(product.image_path)
              return (
                <Link
                  key={product.id}
                  to={`/shop/${product.slug}`}
                  className="group flex flex-col overflow-hidden border-2 border-ink-100 bg-white transition-colors hover:border-clay-400"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <ImagePlaceholder className="aspect-square w-full" />
                  )}
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="font-bold text-ink-900 group-hover:text-clay-700">{product.name}</h3>
                    <p className="text-sm text-clay-700">{formatPrice(product.price_cents)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Newsletter + Neuigkeiten: durchgängige Fläche über die volle Fensterbreite,
          Inhalt zweispaltig auf Containerbreite begrenzt. */}
      <section className="w-full bg-brown-1">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-2">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-white">Newsletter</h2>
            <span aria-hidden="true" className="mx-auto mt-4 mb-5 block h-1 w-16 bg-clay-400" />
            <p className="mb-6 max-w-sm text-white/80">
              Neue Stücke, Markttermine und freie Plätze in Töpferkursen — ein- bis zweimal im Monat.
            </p>
            <div className="w-full max-w-sm">
              <NewsletterSignupForm stacked />
            </div>
          </div>

          <div>
            <h2 className="text-left text-3xl font-bold text-white">Neuigkeiten</h2>
            <span aria-hidden="true" className="mt-4 mb-6 block h-1 w-16 bg-clay-400" />
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group border-2 border-ink-100 bg-white p-5 transition-colors hover:border-clay-400"
                >
                  <h3 className="mb-1 font-bold text-ink-900 group-hover:text-clay-700">{post.title}</h3>
                  <p className="text-sm text-ink-700">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
