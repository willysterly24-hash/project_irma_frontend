const badgeMap: Record<string, string> = {
  "Actif":        "bg-green-100 text-green-800",
  "Bloqué":       "bg-red-100 text-red-800",
  "Maintenance":  "bg-yellow-100 text-yellow-800",
  "Confirmé":     "bg-blue-100 text-blue-800",
  "En attente":   "bg-yellow-100 text-yellow-800",
  "Annulé":       "bg-red-100 text-red-800",
  "Disponible":   "bg-green-100 text-green-800",
  "Indisponible": "bg-red-100 text-red-800",
  "Admin":        "bg-purple-100 text-purple-800",
  "Client":       "bg-sky-100 text-sky-800",
  "Fermé":        "bg-gray-100 text-gray-600",
}

export default function Badge({ label }: { label: string }) {
  const cls = badgeMap[label] ?? "bg-gray-100 text-gray-500"
  return (
    <span className={`${cls} text-xs font-semibold px-3 py-1 rounded-full`}>
      {label}
    </span>
  )
}