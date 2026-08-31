import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { publicImageUrl } from '../lib/storage'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
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

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-ink-500">Lädt…</p>
  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-ink-600">Dieses Produkt gibt es nicht (mehr).</p>
        <Link to="/shop" className="text-clay-700 hover:underline">
          Zurück zum Shop
        </Link>
      </div>
    )
  }

  const imageUrl = publicImageUrl(product.image_path)

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
      {imageUrl ? (
        <img src={imageUrl} alt={product.name} />
      ) : (
        <ImagePlaceholder className="aspect-square" />
      )}
      <div className="flex flex-col gap-4">
        <Link to="/shop" className="text-sm text-clay-700 hover:underline">
          &larr; Zurück zum Shop
        </Link>
        <h1 className="text-3xl font-bold text-ink-900">{product.name}</h1>
        <p className="text-lg text-clay-700">{formatPrice(product.price_cents)}</p>
        <p className="text-ink-600">{product.description}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              addItem(product)
              setAdded(true)
            }}
            className="bg-clay-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-clay-500"
          >
            In den Warenkorb
          </button>
          {added && (
            <button onClick={() => navigate('/warenkorb')} className="text-sm text-clay-700 hover:underline">
              Zum Warenkorb &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
