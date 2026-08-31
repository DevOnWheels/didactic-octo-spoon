import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { publicImageUrl } from '../lib/storage'
import type { Post } from '../types/database'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-ink-500">Lädt…</p>
  if (!post) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-ink-600">Diesen Beitrag gibt es nicht (mehr).</p>
        <Link to="/blog" className="text-clay-700 hover:underline">
          Zurück zu allen Neuigkeiten
        </Link>
      </div>
    )
  }

  const imageUrl = publicImageUrl(post.image_path)

  return (
    <article className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10">
      <Link to="/blog" className="text-sm text-clay-700 hover:underline">
        &larr; Zurück zu allen Neuigkeiten
      </Link>
      <h1 className="text-4xl font-semibold text-ink-900">{post.title}</h1>
      {imageUrl && <img src={imageUrl} alt={post.title} />}
      <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-ink-700">
        {post.body}
      </p>
    </article>
  )
}
