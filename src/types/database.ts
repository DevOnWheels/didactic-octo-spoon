export type Profile = {
  id: string
  display_name: string
  role: 'user' | 'admin'
  created_at: string
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  image_path: string | null
  published: boolean
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price_cents: number
  image_path: string | null
  active: boolean
  created_at: string
}

export type Subscriber = {
  id: string
  email: string
  confirmed: boolean
  confirm_token: string
  created_at: string
}

export type Newsletter = {
  id: string
  subject: string
  body: string
  sent_at: string | null
  recipient_count: number | null
  created_by: string | null
  created_at: string
}

export type CartItem = {
  product_id: string
  name: string
  price_cents: number
  quantity: number
}

export type Order = {
  id: string
  user_id: string | null
  items: CartItem[]
  total_cents: number
  created_at: string
}
