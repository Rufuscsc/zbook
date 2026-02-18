// lib/formatPrice.ts

export function formatPrice(
  cents: number | null | undefined,
  currency: string | null | undefined = "NGN"
) {
  // 1. Check if free or missing
  if (cents == null || cents === 0) return "Free";

  // 2. Ensure we have a valid currency code
  const validCurrency = currency || "NGN";

  const amount = cents / 100;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: validCurrency,
      currencyDisplay: "symbol",
     
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for invalid currency codes
    return `${validCurrency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    })}`;
  }
}