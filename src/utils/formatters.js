export const CATEGORIES = [
  { value: 'vidange', label: 'Entretien / Vidange', color: '#FF6A1A' },
  { value: 'pneus', label: 'Pneus', color: '#2AC3FF' },
  { value: 'freins', label: 'Freins', color: '#F43F5E' },
  { value: 'distribution', label: 'Distribution', color: '#A855F7' },
  { value: 'autre', label: 'Autre', color: '#94A3B5' }
]

export const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'fr-FR' },
  { value: 'CHF', label: 'Franc suisse (CHF)', symbol: 'CHF', locale: 'fr-CH' }
]

export function currencyMeta(code) {
  return CURRENCIES.find((c) => c.value === code) || CURRENCIES[0]
}

export function categoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1]
}

export function formatCurrency(value, currency = 'EUR') {
  const n = Number(value) || 0
  const meta = currencyMeta(currency)
  return n.toLocaleString(meta.locale, { style: 'currency', currency: meta.value, maximumFractionDigits: 2 })
}

export function formatDate(dateStr, lang = 'fr') {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatMileage(value, lang = 'fr') {
  const n = Number(value) || 0
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  return `${n.toLocaleString(locale)} km`
}

// Format compact pour les axes de graphiques : 850 000 -> "850k", 1 200 000 -> "1,2M"
// (toLocaleString classique devient illisible sur un axe étroit dès 6-7 chiffres)
export function compactMileage(value, lang = 'fr') {
  const n = Number(value) || 0
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

// Retourne le libellé traduit d'une catégorie d'entretien à partir du t() du LanguageContext
export function categoryLabel(value, t) {
  return t(`categories.${value}`) || categoryMeta(value).label
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const due = new Date(dateStr)
  const diff = Math.ceil((due.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
  return diff
}

export function reminderStatus(reminder, currentMileage) {
  const dDays = daysUntil(reminder.due_date)
  const kmLeft = reminder.due_mileage != null && currentMileage != null
    ? reminder.due_mileage - currentMileage
    : null

  const overdue = (dDays !== null && dDays < 0) || (kmLeft !== null && kmLeft < 0)
  const soon = (dDays !== null && dDays <= 30 && dDays >= 0) || (kmLeft !== null && kmLeft <= 1000 && kmLeft >= 0)

  if (overdue) return 'overdue'
  if (soon) return 'soon'
  return 'ok'
}
