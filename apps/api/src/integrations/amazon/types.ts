export type AmazonCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  sellerId?: string;
};

export type AmazonOrderPreview = {
  externalOrderId: string;
  orderDate: string;
  status: string;
  amount: string;
  currency: string;
  buyerName?: string;
  marketplaceId: string;
};

export type AmazonOrderDetail = {
  externalOrderId: string;
  orderDate: string;
  status: string;
  amount: string;
  currency: string;
  buyerName?: string;
  buyerEmail?: string;
  marketplaceId?: string;
  fulfillmentChannel?: string;
  shipServiceLevel?: string;
  numberOfItemsShipped?: number;
  numberOfItemsUnshipped?: number;
  shippingAddress?: {
    name?: string;
    addressLine1?: string;
    city?: string;
    stateOrRegion?: string;
    postalCode?: string;
    countryCode?: string;
    phone?: string;
  };
};

export type AmazonOrderItem = {
  orderItemId: string;
  asin: string;
  sellerSku?: string;
  title: string;
  quantityOrdered: number;
  quantityShipped: number;
  itemPrice: string;
  itemTax: string;
  currency: string;
  isGift?: boolean;
};

export interface AmazonOrdersProvider {
  fetchRecentOrders(params: { marketplaceId: string; createdAfter?: string; limit?: number }): Promise<AmazonOrderPreview[]>;
  fetchOrderDetail(orderId: string): Promise<AmazonOrderDetail>;
  fetchOrderItems(orderId: string): Promise<AmazonOrderItem[]>;
}
