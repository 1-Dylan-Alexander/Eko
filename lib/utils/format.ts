export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Custom pricing'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPricingModel(model: string): string {
  const labels: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
    enterprise: 'Enterprise',
  }
  return labels[model] ?? model
}

export function formatStartingPrice(
  model: string,
  price: number | null
): string {
  if (model === 'free') return 'Free'
  if (model === 'enterprise' || price === null) return 'Custom pricing'
  return `From ${formatCurrency(price)}/mo`
}
