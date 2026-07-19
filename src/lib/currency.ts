/**
 * Utility for formatting currency across the application based on ISO 4217 standards.
 * Dynamically renders the correct currency symbol (e.g. ₹ for INR, $ for USD).
 */
export const formatCurrency = (amount: number, currencyCode: string = "INR") => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid or missing
    return `₹${amount.toFixed(2)}`;
  }
};
