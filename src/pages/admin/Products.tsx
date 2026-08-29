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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="font-medium text-stone-900">
          {editingId ? 'Produkt bearbeiten' : 'Neues Produkt anlegen'}
        </h2>
        <input
          type="text"
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
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
          placeholder="Beschreibung"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          rows={3}
        />
        <input
          type="text"
          required
          inputMode="decimal"
          placeholder="Preis in € (z.B. 18,90)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        {editingId && existingImagePath && !file && (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <img
              src={publicImageUrl(existingImagePath) ?? undefined}
              alt=""
              className="h-12 w-12 rounded object-cover"
            />
            Aktuelles Bild (Datei wählen, um es zu ersetzen)
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Im Shop sichtbar
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {saving ? 'Speichert…' : editingId ? 'Änderungen speichern' : 'Produkt speichern'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="self-start rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="mb-3 font-medium text-stone-900">Alle Produkte</h2>
        {loading ? (
          <p className="text-stone-500">Lädt…</p>
        ) : (
          <div className="flex flex-col divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {products.map((product) => {
              const imageUrl = publicImageUrl(product.image_path)
              return (
                <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    {imageUrl && (
                      <img src={imageUrl} alt="" className="h-12 w-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-stone-900">
                        {product.name}{' '}
                        {!product.active && (
                          <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600">
                            Ausgeblendet
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500">
                        /{product.slug} · {formatPrice(product.price_cents)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-sm text-amber-700 hover:underline"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-sm text-stone-400 hover:text-red-600"
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
