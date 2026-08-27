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

  if (loading) return <p className="text-stone-500">Lädt…</p>
  if (!post) {
    return (
      <div>
        <p className="text-stone-600">Diesen Beitrag gibt es nicht (mehr).</p>
        <Link to="/blog" className="text-amber-700 hover:underline">
          Zurück zu allen Neuigkeiten
        </Link>
      </div>
    )
  }

  const imageUrl = publicImageUrl(post.image_path)

  return (
    <article className="flex flex-col gap-4">
      <Link to="/blog" className="text-sm text-amber-700 hover:underline">
        &larr; Zurück zu allen Neuigkeiten
      </Link>
      <h1 className="text-2xl font-semibold text-stone-900">{post.title}</h1>
      {imageUrl && <img src={imageUrl} alt={post.title} className="rounded-lg" />}
      <p className="whitespace-pre-line text-stone-700">{post.body}</p>
    </article>
  )
}
