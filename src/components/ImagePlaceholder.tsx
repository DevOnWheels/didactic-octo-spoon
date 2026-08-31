// Ersetzt den grauen "Kein Bild"-Kasten durch ein zur Marke passendes Platzhalter-Icon
// (Gefäß-Silhouette), solange für ein Produkt noch kein Foto hochgeladen wurde.
export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-clay-50 ${className ?? ''}`}>
      <svg viewBox="0 0 64 64" className="h-10 w-10 text-clay-300" fill="none" aria-hidden="true">
        <path
          d="M24 10h16l2 10-3 5v27a4 4 0 0 1-4 4H29a4 4 0 0 1-4-4V25l-3-5 2-10Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M22 25h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
