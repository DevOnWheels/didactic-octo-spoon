import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export function Cart() {
  const { items, setQuantity, removeItem, clear, totalCents } = useCart()
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleCheckout() {
    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('orders').insert({
      user_id: user?.id ?? null,
      items,
      total_cents: totalCents,
    })

    setSubmitting(false)

    if (insertError) {
      setError('Bestellung konnte nicht gespeichert werden. Bitte versuch es erneut.')
      return
    }

    clear()
    navigate('/bestellung-bestaetigt')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-ink-900">Warenkorb</h1>
        <p className="text-ink-600">Dein Warenkorb ist leer.</p>
        <Link to="/shop" className="text-clay-700 hover:underline">
          Zum Shop &rarr;
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink-900">Warenkorb</h1>
      <div className="flex flex-col divide-y divide-ink-100 border-2 border-ink-100 bg-white">
        {items.map((item) => (
          <div key={item.product_id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-bold text-ink-900">{item.name}</p>
              <p className="text-sm text-ink-500">{formatPrice(item.price_cents)} / Stück</p>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor={`qty-${item.product_id}`} className="sr-only">
                Menge für {item.name}
              </label>
              <input
                id={`qty-${item.product_id}`}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQuantity(item.product_id, Number(e.target.value))}
                className="w-16 border-2 border-ink-300 px-2 py-1 text-sm focus:border-clay-600 focus:outline-none"
              />
              <p className="w-20 text-right text-sm text-ink-700">
                {formatPrice(item.price_cents * item.quantity)}
              </p>
              <button
                onClick={() => removeItem(item.product_id)}
                className="text-sm font-bold text-ink-500 hover:text-red-700"
              >
                Entfernen
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-2 border-ink-100 bg-white p-4">
        <p className="font-bold text-ink-900">Gesamt</p>
        <p className="text-lg font-bold text-clay-700">{formatPrice(totalCents)}</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={submitting}
        className="self-start bg-clay-700 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-clay-800 disabled:opacity-60"
      >
        {submitting ? 'Wird verarbeitet…' : 'Kaufen'}
      </button>
      <p className="text-xs text-ink-500">
        Demo-Shop: es findet keine echte Zahlungsabwicklung statt.
      </p>
    </div>
  )
}
