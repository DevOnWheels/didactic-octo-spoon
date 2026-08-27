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

  if (loading) return <p className="text-stone-500">Lädt…</p>

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Neuigkeiten</h1>
      {posts.length === 0 && <p className="text-stone-500">Noch keine Beiträge veröffentlicht.</p>}
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="rounded-lg border border-stone-200 bg-white p-5 hover:border-amber-600"
          >
            <h2 className="mb-1 font-medium text-stone-900">{post.title}</h2>
            <p className="text-sm text-stone-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
