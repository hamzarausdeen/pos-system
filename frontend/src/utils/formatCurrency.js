export default function formatCurrency(value) {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(amount);
  } catch (err) {
    return `LKR ${amount.toFixed(2)}`;
  }
}
