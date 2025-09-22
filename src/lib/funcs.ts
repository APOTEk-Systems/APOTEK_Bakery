// Format number with commas
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'TSH',  minimumFractionDigits: 0, maximumFractionDigits: 0 });
}


// utils/unitConversion.ts
export const toBaseUnits = (quantity: number, unit: string) => {
  switch (unit) {
    case "kg":
      return quantity * 1000; // g
    case "l":
      return quantity * 1000; // ml
    case "g":
    case "ml":
    case "pcs":
    case "pair":
    default:
      return quantity;
  }
};

export const fromBaseUnits = (quantity: number, unit: string) => {
  switch (unit) {
    case "kg":
      return quantity / 1000; // convert back to kg
    case "l":
      return quantity / 1000; // convert back to l
    case "g":
    case "ml":
    case "pcs":
    case "pair":
    default:
      return quantity;
  }
};

export const normalizeCost = (cost: number, unit: string) => {
  switch (unit) {
    case "kg":
      return cost / 1000; // per g
    case "l":
      return cost / 1000; // per ml
    case "g":
    case "ml":
    case "pcs":
    case "pair":
    default:
      return cost;
  }
};

export const denormalizeCost = (cost: number, unit: string) => {
  switch (unit) {
    case "kg":
      return cost * 1000; // cost per kg
    case "l":
      return cost * 1000; // cost per l
    case "g":
    case "ml":
    case "pcs":
    case "pair":
    default:
      return cost;
  }
};
