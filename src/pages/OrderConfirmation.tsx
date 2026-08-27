import { Link } from 'react-router-dom'

export function OrderConfirmation() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold text-stone-900">Danke für deine Bestellung!</h1>
      <p className="text-stone-600">
        Wir haben deine Bestellung erhalten. Da dies ein Demo-Shop ohne echte Zahlungsabwicklung ist,
        melden wir uns persönlich bei dir, um die weiteren Schritte zu klären.
      </p>
      <Link to="/shop" className="text-amber-700 hover:underline">
        Zurück zum Shop
      </Link>
    </div>
  )
}
