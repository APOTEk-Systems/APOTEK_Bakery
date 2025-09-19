// Format number with commas
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'TSH',  minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

