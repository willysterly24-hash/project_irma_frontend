// Affiche une date au format ISO (YYYY-MM-DD) en jj/mm/aaaa
export function formatDateFr(value: string): string {
  if (!value) return ''
  const [annee, mois, jour] = value.split('-')
  if (!annee || !mois || !jour) return value
  return `${jour}/${mois}/${annee}`
}
