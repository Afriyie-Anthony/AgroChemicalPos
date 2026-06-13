// Ghana Revenue Authority (GRA) compliant tax calculation
// Standard rates:
// VAT: 12.5%
// NHIL: 2.5%
// GetFund: 2.5%
// Note: Standard GRA calculation:
//   Levies (NHIL + GetFund) are calculated on the basic price.
//   VAT (12.5%) is calculated on the (basic price + levies).
//   Total tax multiplier (tax-exclusive) = 1 + (0.025 + 0.025) + 0.125 * (1 + 0.025 + 0.025)
//                                       = 1 + 0.05 + 0.125 * 1.05
//                                       = 1.05 + 0.13125 = 1.18125 (18.125% total tax rate)

export const DEFAULT_TAX_RATES = {
  vat: 0.125,      // 12.5%
  nhil: 0.025,     // 2.5%
  getFund: 0.025,  // 2.5%
  covidLevy: 0.00  // Optional COVID levy (0% by default now or configurable)
};

/**
 * Calculates tax breakdown for a product based on price and pricing mode
 * @param {number} price - Unit price
 * @param {boolean} isInclusive - Whether price already includes tax
 * @param {Object} rates - Custom rates if any
 * @returns {Object} Tax breakdown (basePrice, nhil, getFund, vat, totalTax, total)
 */
export const calculateTaxBreakdown = (price, isInclusive = true, rates = DEFAULT_TAX_RATES) => {
  const p = parseFloat(price) || 0;
  
  // Total levies rate (NHIL + GetFund + COVID if any)
  const leviesRate = rates.nhil + rates.getFund + (rates.covidLevy || 0);
  
  // Tax multiplier for exclusive price to inclusive price
  // Total = Base * (1 + leviesRate) * (1 + vatRate)
  const vatRate = rates.vat;
  const taxMultiplier = (1 + leviesRate) * (1 + vatRate);

  let basePrice = 0;
  let nhil = 0;
  let getFund = 0;
  let vat = 0;
  let totalTax = 0;
  let total = 0;

  if (isInclusive) {
    total = p;
    basePrice = p / taxMultiplier;
    nhil = basePrice * rates.nhil;
    getFund = basePrice * rates.getFund;
    const leviesTotal = nhil + getFund + (basePrice * (rates.covidLevy || 0));
    vat = (basePrice + leviesTotal) * rates.vat;
    totalTax = total - basePrice;
  } else {
    basePrice = p;
    nhil = p * rates.nhil;
    getFund = p * rates.getFund;
    const leviesTotal = nhil + getFund + (p * (rates.covidLevy || 0));
    vat = (basePrice + leviesTotal) * rates.vat;
    totalTax = nhil + getFund + vat;
    total = basePrice + totalTax;
  }

  return {
    basePrice: Number(basePrice.toFixed(4)),
    nhil: Number(nhil.toFixed(4)),
    getFund: Number(getFund.toFixed(4)),
    vat: Number(vat.toFixed(4)),
    totalTax: Number(totalTax.toFixed(4)),
    total: Number(total.toFixed(4))
  };
};

/**
 * Summarizes taxes for a list of items
 * @param {Array} items - Array of items with price, quantity, and taxExempt flag
 * @param {boolean} isInclusive - Whether item prices are tax inclusive
 * @returns {Object} Summary of totals (subtotal, nhil, getFund, vat, totalTax, total)
 */
export const summarizeCartTaxes = (items = [], isInclusive = true) => {
  let subtotal = 0;
  let totalNhil = 0;
  let totalGetFund = 0;
  let totalVat = 0;
  let totalTax = 0;
  let grandTotal = 0;

  items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const lineTotal = price * qty;

    if (item.taxExempt) {
      subtotal += lineTotal;
      grandTotal += lineTotal;
    } else {
      const breakdown = calculateTaxBreakdown(lineTotal, isInclusive);
      subtotal += breakdown.basePrice;
      totalNhil += breakdown.nhil;
      totalGetFund += breakdown.getFund;
      totalVat += breakdown.vat;
      totalTax += breakdown.totalTax;
      grandTotal += breakdown.total;
    }
  });

  return {
    subtotal: Number(subtotal.toFixed(2)),
    nhil: Number(totalNhil.toFixed(2)),
    getFund: Number(totalGetFund.toFixed(2)),
    vat: Number(totalVat.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    total: Number(grandTotal.toFixed(2))
  };
};
