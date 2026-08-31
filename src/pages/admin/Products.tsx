import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { publicImageUrl } from '../../lib/storage'
import { slugify } from '../../lib/slug'
import { formatPrice } from '../../lib/format'
import type { Product } from '../../types/database'

const emptyForm = { name: '', slug: '', description: '', price: '', active: true }

function centsToEuroInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

function euroInputToCents(value: string): number {
  return Math.round(parseFloat(value.replace(',', '.')) * 100)
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function startEdit(product: Product) {
    setEditingId(product.id)
    setExistingImagePath(product.image_path)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: centsToEuroInput(product.price_cents),
      active: product.active,
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

    const priceCents = euroInputToCents(form.price)
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError('Bitte einen gültigen Preis eingeben (z.B. 18,90).')
      return
    }

    setSaving(true)
    setError(null)

    try {
      let imagePath = existingImagePath

      if (file) {
        const path = `products/${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
        if (uploadError) throw uploadError
        imagePath = path
      }

      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        price_cents: priceCents,
        active: form.active,
        image_path: imagePath,
      }

      const { error: saveError } = editingId
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert(payload)

      if (saveError) throw saveError

      cancelEdit()
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Produkt konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`"${product.name}" wirklich löschen?`)) return
    await supabase.from('products').delete().eq('id', product.id)
    if (editingId === product.id) cancelEdit()
    await loadProducts()
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-2 border-ink-100 bg-white p-5">
        <h2 className="font-bold text-ink-900">
          {editingId ? 'Produkt bearbeiten' : 'Neues Produkt anlegen'}
        </h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="product-name" className="text-sm font-bold text-ink-800">
            Name
          </label>
          <input
            id="product-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="product-slug" className="text-sm font-bold text-ink-800">
            Slug (URL)
          </label>
          <input
            id="product-slug"
            type="text"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="product-description" className="text-sm font-bold text-ink-800">
            Beschreibung
          </label>
          <textarea
            id="product-description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="product-price" className="text-sm font-bold text-ink-800">
            Preis in € (z.B. 18,90)
          </label>
          <input
            id="product-price"
            type="text"
            required
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border-2 border-ink-300 px-3 py-2 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        {editingId && existingImagePath && !file && (
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <img src={publicImageUrl(existingImagePath) ?? undefined} alt="" className="h-12 w-12 object-cover" />
            Aktuelles Bild (Datei wählen, um es zu ersetzen)
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor="product-image" className="text-sm font-bold text-ink-800">
            Bild {editingId ? '(optional)' : ''}
          </label>
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Im Shop sichtbar
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
            {saving ? 'Speichert…' : editingId ? 'Änderungen speichern' : 'Produkt speichern'}
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
        <h2 className="mb-3 font-bold text-ink-900">Alle Produkte</h2>
        {loading ? (
          <p className="text-ink-500">Lädt…</p>
        ) : (
          <div className="flex flex-col divide-y divide-ink-100 border-2 border-ink-100 bg-white">
            {products.map((product) => {
              const imageUrl = publicImageUrl(product.image_path)
              return (
                <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    {imageUrl && <img src={imageUrl} alt="" className="h-12 w-12 object-cover" />}
                    <div>
                      <p className="font-bold text-ink-900">
                        {product.name}{' '}
                        {!product.active && (
                          <span className="ml-1 bg-ink-200 px-1.5 py-0.5 text-xs font-bold text-ink-700">
                            Ausgeblendet
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-ink-500">
                        /{product.slug} · {formatPrice(product.price_cents)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-sm font-bold text-clay-700 hover:underline"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
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
