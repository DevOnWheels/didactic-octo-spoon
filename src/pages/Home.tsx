import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Post } from '../types/database'
import { NewsletterSignupForm } from '../components/NewsletterSignupForm'

const services = [
  {
    title: 'Handarbeit',
    text: 'Jedes Stück wird einzeln an der Scheibe gedreht — kein Guss, keine Massenware.',
  },
  {
    title: 'Töpferkurse',
    text: 'Für Einsteiger und Fortgeschrittene, in kleinen Gruppen von bis zu sechs Personen.',
  },
  {
    title: 'Regionale Glasuren',
    text: 'Wir mischen unsere Glasuren selbst und brennen im eigenen Elektroofen.',
  },
]

export function Home() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts(data ?? []))
  }, [])

  return (
    <div className="flex flex-col">
      <section
        className="relative -mx-4 -mt-10 flex min-h-[520px] items-center overflow-hidden bg-ink-900 bg-cover bg-center px-4 sm:-mx-0"
        style={{ backgroundImage: "url('/images/hero-pottery.jpg')" }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-ink-900/60" />
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
              className="bg-clay-700 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-clay-800"
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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 py-16">
        <section className="grid gap-6 sm:grid-cols-3">
          {services.map((service, index) => (
            <div key={service.title} className="border-2 border-ink-100 p-6">
              <span className="text-2xl font-bold text-clay-600">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="mt-2 mb-2 text-lg font-bold text-ink-900">{service.title}</h2>
              <p className="text-sm text-ink-700">{service.text}</p>
            </div>
          ))}
        </section>

        <section className="bg-ink-50 px-6 py-12 text-center sm:px-16">
          <h2 className="mb-4 text-3xl font-bold text-ink-900">Über uns</h2>
          <span aria-hidden="true" className="mx-auto mb-6 block h-1 w-16 bg-clay-600" />
          <p className="mx-auto max-w-2xl text-ink-700">
            Lehmglück ist eine kleine Keramikwerkstatt. Wir verkaufen unsere Stücke im Online-Shop, auf
            Märkten und geben regelmäßig Töpferkurse für alle, die selbst mit Ton arbeiten möchten.
          </p>
        </section>

        {posts.length > 0 && (
          <section>
            <h2 className="mb-6 text-3xl font-bold text-ink-900">Neuigkeiten</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group border-2 border-ink-100 p-5 transition-colors hover:border-clay-400"
                >
                  <h3 className="mb-1 font-bold text-ink-900 group-hover:text-clay-700">{post.title}</h3>
                  <p className="text-sm text-ink-700">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-clay-50 px-6 py-12 sm:px-10">
          <h2 className="mb-1 text-3xl font-bold text-ink-900">Newsletter</h2>
          <p className="mb-5 text-ink-700">
            Neue Stücke, Markttermine und freie Plätze in Töpferkursen — ein- bis zweimal im Monat.
          </p>
          <NewsletterSignupForm />
        </section>
      </div>
    </div>
  )
}
