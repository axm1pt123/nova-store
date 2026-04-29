export function fmtPrice(decimal: number, currency = 'BOB'): string {
  const amount = decimal.toFixed(2);
  return currency === 'BOB' ? `Bs ${amount}` : `$${amount}`;
}
