import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { publicImageUrl } from '../lib/storage'
import { formatPrice } from '../lib/format'
import type { Product } from '../types/database'

export function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-stone-500">Lädt…</p>

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">Shop</h1>
      {products.length === 0 && <p className="text-stone-500">Aktuell sind keine Produkte verfügbar.</p>}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => {
          const imageUrl = publicImageUrl(product.image_path)
          return (
            <Link
              key={product.id}
              to={`/shop/${product.slug}`}
              className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white hover:border-amber-600"
            >
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-stone-100 text-stone-400">
                  Kein Bild
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h2 className="font-medium text-stone-900">{product.name}</h2>
                <p className="text-sm text-amber-700">{formatPrice(product.price_cents)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
