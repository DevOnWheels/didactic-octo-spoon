import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Post } from '../types/database'

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-ink-500">Lädt…</p>

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">Neuigkeiten</h1>
      {posts.length === 0 && <p className="text-ink-500">Noch keine Beiträge veröffentlicht.</p>}
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group border-2 border-ink-100 bg-white p-5 transition-colors hover:border-clay-400"
          >
            <h2 className="mb-1 font-bold text-ink-900 group-hover:text-clay-700">
              {post.title}
            </h2>
            <p className="text-sm text-ink-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
