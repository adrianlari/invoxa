export type Address = {
  street: string;
  city: string;
  zip: string;
  country: string;
  state?: string;
};

export type NormalizedOrder = {
  externalOrderId: string;
  orderDate: Date;
  currency: string;
  buyer: {
    name: string;
    email?: string;
    company?: string;
    vatId?: string;
    address: Address;
  };
  lineItems: Array<{
    sku?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
  shippingCost?: number;
  raw: unknown;
};
