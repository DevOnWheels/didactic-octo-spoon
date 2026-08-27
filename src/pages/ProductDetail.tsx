import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { publicImageUrl } from '../lib/storage'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import type { Product } from '../types/database'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!slug) return
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <p className="text-stone-500">Lädt…</p>
  if (!product) {
    return (
      <div>
        <p className="text-stone-600">Dieses Produkt gibt es nicht (mehr).</p>
        <Link to="/shop" className="text-amber-700 hover:underline">
          Zurück zum Shop
        </Link>
      </div>
    )
  }

  const imageUrl = publicImageUrl(product.image_path)

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {imageUrl ? (
        <img src={imageUrl} alt={product.name} className="rounded-lg" />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-lg bg-stone-100 text-stone-400">
          Kein Bild
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Link to="/shop" className="text-sm text-amber-700 hover:underline">
          &larr; Zurück zum Shop
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">{product.name}</h1>
        <p className="text-lg text-amber-700">{formatPrice(product.price_cents)}</p>
        <p className="text-stone-600">{product.description}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              addItem(product)
              setAdded(true)
            }}
            className="rounded-md bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            In den Warenkorb
          </button>
          {added && (
            <button onClick={() => navigate('/warenkorb')} className="text-sm text-amber-700 hover:underline">
              Zum Warenkorb &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
