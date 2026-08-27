import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { publicImageUrl } from '../../lib/storage'
import { slugify } from '../../lib/slug'
import type { Post } from '../../types/database'

const emptyForm = { title: '', slug: '', excerpt: '', body: '', published: true }

export function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let imagePath: string | null = null

      if (file) {
        const path = `posts/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
        if (uploadError) throw uploadError
        imagePath = path
      }

      const { error: insertError } = await supabase.from('posts').insert({
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        body: form.body,
        published: form.published,
        image_path: imagePath,
      })

      if (insertError) throw insertError

      setForm(emptyForm)
      setFile(null)
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beitrag konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`"${post.title}" wirklich löschen?`)) return
    await supabase.from('posts').delete().eq('id', post.id)
    await loadPosts()
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="font-medium text-stone-900">Neuen Beitrag anlegen</h2>
        <input
          type="text"
          required
          placeholder="Titel"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder="Kurzbeschreibung (Vorschau in der Liste)"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          rows={2}
        />
        <textarea
          required
          placeholder="Inhalt"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          rows={6}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Sofort veröffentlichen
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {saving ? 'Speichert…' : 'Beitrag speichern'}
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-medium text-stone-900">Alle Beiträge</h2>
        {loading ? (
          <p className="text-stone-500">Lädt…</p>
        ) : (
          <div className="flex flex-col divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {posts.map((post) => {
              const imageUrl = publicImageUrl(post.image_path)
              return (
                <div key={post.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    {imageUrl && (
                      <img src={imageUrl} alt="" className="h-12 w-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-stone-900">
                        {post.title}{' '}
                        {!post.published && (
                          <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600">
                            Entwurf
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500">/{post.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(post)}
                    className="text-sm text-stone-400 hover:text-red-600"
                  >
                    Löschen
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
