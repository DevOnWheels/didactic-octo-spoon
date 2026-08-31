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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null)
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

  function startEdit(post: Post) {
    setEditingId(post.id)
    setExistingImagePath(post.image_path)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      published: post.published,
    })
    setFile(null)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setExistingImagePath(null)
    setForm(emptyForm)
    setFile(null)
    setError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let imagePath = existingImagePath

      if (file) {
        const path = `posts/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
        if (uploadError) throw uploadError
        imagePath = path
      }

      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        body: form.body,
        published: form.published,
        image_path: imagePath,
      }

      const { error: saveError } = editingId
        ? await supabase.from('posts').update(payload).eq('id', editingId)
        : await supabase.from('posts').insert(payload)

      if (saveError) throw saveError

      cancelEdit()
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
    if (editingId === post.id) cancelEdit()
    await loadPosts()
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-2 border-ink-100 bg-white p-5">
        <h2 className="font-bold text-ink-900">
          {editingId ? 'Beitrag bearbeiten' : 'Neuen Beitrag anlegen'}
        </h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="post-title" className="text-sm font-bold text-ink-800">
            Titel
          </label>
          <input
            id="post-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="post-slug" className="text-sm font-bold text-ink-800">
            Slug (URL)
          </label>
          <input
            id="post-slug"
            type="text"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="post-excerpt" className="text-sm font-bold text-ink-800">
            Kurzbeschreibung (Vorschau in der Liste)
          </label>
          <textarea
            id="post-excerpt"
            required
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="post-body" className="text-sm font-bold text-ink-800">
            Inhalt
          </label>
          <textarea
            id="post-body"
            required
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
            rows={6}
          />
        </div>
        {editingId && existingImagePath && !file && (
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <img src={publicImageUrl(existingImagePath) ?? undefined} alt="" className="h-12 w-12 object-cover" />
            Aktuelles Bild (Datei wählen, um es zu ersetzen)
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor="post-image" className="text-sm font-bold text-ink-800">
            Bild {editingId ? '(optional)' : ''}
          </label>
          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Sofort veröffentlichen
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="self-start bg-clay-400 px-4 py-2 text-sm font-semibold uppercase tracking-[2px] text-white hover:bg-clay-500 border-2 border-clay-400 hover:border-clay-500 disabled:opacity-60"
          >
            {saving ? 'Speichert…' : editingId ? 'Änderungen speichern' : 'Beitrag speichern'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="self-start border-2 border-ink-300 px-4 py-2 text-sm font-bold text-ink-700 hover:bg-ink-100"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="mb-3 font-bold text-ink-900">Alle Beiträge</h2>
        {loading ? (
          <p className="text-ink-500">Lädt…</p>
        ) : (
          <div className="flex flex-col divide-y divide-ink-100 border-2 border-ink-100 bg-white">
            {posts.map((post) => {
              const imageUrl = publicImageUrl(post.image_path)
              return (
                <div key={post.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    {imageUrl && <img src={imageUrl} alt="" className="h-12 w-12 object-cover" />}
                    <div>
                      <p className="font-bold text-ink-900">
                        {post.title}{' '}
                        {!post.published && (
                          <span className="ml-1 bg-ink-200 px-1.5 py-0.5 text-xs font-bold text-ink-700">
                            Entwurf
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-ink-500">/{post.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(post)} className="text-sm font-bold text-clay-700 hover:underline">
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="text-sm font-bold text-ink-500 hover:text-red-700"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
