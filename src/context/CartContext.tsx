import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types/database'

const STORAGE_KEY = 'lehmglueck.cart'

type CartContextValue = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  totalCents: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function readInitialCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product: Product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [
        ...prev,
        { product_id: product.id, name: product.name, price_cents: product.price_cents, quantity },
      ]
    })
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((item) => (item.product_id === productId ? { ...item, quantity } : item)))
  }

  function clear() {
    setItems([])
  }

  const totalCents = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clear, totalCents }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart muss innerhalb von <CartProvider> verwendet werden.')
  return ctx
}
