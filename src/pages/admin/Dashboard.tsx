import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export function Dashboard() {
  const [stats, setStats] = useState<{ subscribers: number; posts: number; products: number } | null>(
    null,
  )

  useEffect(() => {
    async function loadStats() {
      const [{ count: subscribers }, { count: posts }, { count: products }] = await Promise.all([
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('confirmed', true),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ])
      setStats({ subscribers: subscribers ?? 0, posts: posts ?? 0, products: products ?? 0 })
    }
    loadStats()
  }, [])

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { label: 'Bestätigte Abonnenten', value: stats?.subscribers },
        { label: 'Beiträge', value: stats?.posts },
        { label: 'Produkte', value: stats?.products },
      ].map((stat) => (
        <div key={stat.label} className="border-2 border-ink-100 bg-white p-6">
          <p className="text-sm text-ink-600">{stat.label}</p>
          <p className="text-3xl font-bold text-ink-900">{stat.value ?? '…'}</p>
        </div>
      ))}
    </div>
  )
}
