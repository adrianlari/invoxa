import { Decimal } from "decimal.js";

const EU = new Set([
  "DE",
  "AT",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "PT",
  "PL",
  "CZ",
  "DK",
  "SE",
  "FI",
  "IE",
  "RO",
  "BG",
  "HR",
  "GR",
  "HU",
  "SK",
  "SI",
  "LT",
  "LV",
  "EE",
  "LU",
  "MT",
  "CY",
]);

export const taxService = {
  calculateVatRate(params: { sellerCountry: string; buyerCountry: string; buyerVatId?: string; isDigitalService?: boolean }) {
    if (!EU.has(params.sellerCountry) || !EU.has(params.buyerCountry)) {
      return { rate: 0, type: "zero_rated" as const, note: "Outside EU scope." };
    }

    if (params.sellerCountry !== params.buyerCountry && params.buyerVatId) {
      return { rate: 0, type: "reverse_charge" as const, note: "EU B2B reverse charge applies." };
    }

    const map: Record<string, number> = { DE: 19, AT: 20, FR: 20, IT: 22, ES: 21, NL: 21 };
    const rate = map[params.buyerCountry] ?? map[params.sellerCountry] ?? 19;
    return { rate, type: "standard" as const, note: params.isDigitalService ? "OSS digital service rate." : "Standard VAT rate." };
  },

  calculateLineItemTax(unitPrice: Decimal, quantity: Decimal, taxRate: number) {
    const netAmount = unitPrice.mul(quantity).toDecimalPlaces(2);
    const taxAmount = netAmount.mul(new Decimal(taxRate).div(100)).toDecimalPlaces(2);
    const grossAmount = netAmount.plus(taxAmount).toDecimalPlaces(2);
    return { netAmount, taxAmount, grossAmount };
  },
};
