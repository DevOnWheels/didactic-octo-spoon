import { Link } from 'react-router-dom'

export function OrderConfirmation() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Danke für deine Bestellung!</h1>
      <p className="text-ink-600">
        Wir haben deine Bestellung erhalten. Da dies ein Demo-Shop ohne echte Zahlungsabwicklung ist,
        melden wir uns persönlich bei dir, um die weiteren Schritte zu klären.
      </p>
      <Link to="/shop" className="text-clay-700 hover:underline">
        Zurück zum Shop
      </Link>
    </div>
  )
}
