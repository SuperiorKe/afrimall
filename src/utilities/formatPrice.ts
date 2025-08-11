export function formatPrice(
  price: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency, locale)
  }

  return `${formatPrice(minPrice, currency, locale)} - ${formatPrice(maxPrice, currency, locale)}`
}
