import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Post } from '../types/database'
import { NewsletterSignupForm } from '../components/NewsletterSignupForm'

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
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-4 py-8">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
          Handgemachte Keramik aus der Werkstatt am Fluss
        </h1>
        <p className="max-w-2xl text-lg text-stone-600">
          Wir drehen, glasieren und brennen jedes Stück von Hand — vom Frühstücksgeschirr bis zur
          Einzelvase. Schau in unserem Shop vorbei oder komm zu einem unserer Töpferkurse.
        </p>
        <div className="flex gap-3">
          <Link
            to="/shop"
            className="rounded-md bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            Zum Shop
          </Link>
          <Link
            to="/blog"
            className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Neuigkeiten lesen
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3">
        {[
          { title: 'Handarbeit', text: 'Jedes Stück wird einzeln an der Scheibe gedreht — kein Guss, keine Massenware.' },
          { title: 'Töpferkurse', text: 'Für Einsteiger und Fortgeschrittene, in kleinen Gruppen von bis zu sechs Personen.' },
          { title: 'Regionale Glasuren', text: 'Wir mischen unsere Glasuren selbst und brennen im eigenen Elektroofen.' },
        ].map((service) => (
          <div key={service.title} className="rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="mb-2 font-medium text-stone-900">{service.title}</h3>
            <p className="text-sm text-stone-600">{service.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="mb-2 text-xl font-medium text-stone-900">Über uns</h2>
        <p className="text-sm text-stone-600">
          Lehmglück ist eine kleine Keramikwerkstatt. Wir verkaufen unsere Stücke im Online-Shop, auf
          Märkten und geben regelmäßig Töpferkurse für alle, die selbst mit Ton arbeiten möchten.
        </p>
      </section>

      {posts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-medium text-stone-900">Neuigkeiten</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="rounded-lg border border-stone-200 bg-white p-4 hover:border-amber-600"
              >
                <h3 className="mb-1 font-medium text-stone-900">{post.title}</h3>
                <p className="text-sm text-stone-600">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="mb-1 text-xl font-medium text-stone-900">Newsletter</h2>
        <p className="mb-4 text-sm text-stone-600">
          Neue Stücke, Markttermine und freie Plätze in Töpferkursen — ein- bis zweimal im Monat.
        </p>
        <NewsletterSignupForm />
      </section>
    </div>
  )
}
