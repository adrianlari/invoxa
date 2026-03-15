import { AmazonOrderDetail, AmazonOrderItem, AmazonOrderPreview, AmazonOrdersProvider } from "./types.ts";

export class MockAmazonOrdersProvider implements AmazonOrdersProvider {
  async fetchRecentOrders(params: { marketplaceId: string; createdAfter?: string; limit?: number }): Promise<AmazonOrderPreview[]> {
    const limit = params.limit ?? 5;
    return Array.from({ length: limit }).map((_, index) => ({
      externalOrderId: `405-9999999-${String(1000000 + index)}`,
      orderDate: new Date(Date.now() - index * 15 * 60_000).toISOString(),
      status: index % 3 === 0 ? "Unshipped" : "Shipped",
      amount: (49.9 + index * 10).toFixed(2),
      currency: "EUR",
      buyerName: `Mock Buyer ${index + 1}`,
      marketplaceId: params.marketplaceId,
    }));
  }

  async fetchOrderDetail(orderId: string): Promise<AmazonOrderDetail> {
    return {
      externalOrderId: orderId,
      orderDate: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
      status: "Shipped",
      amount: "149.90",
      currency: "EUR",
      buyerName: "Max Mustermann",
      buyerEmail: "max@example.de",
      marketplaceId: "A1PA6795UKMFR9",
      fulfillmentChannel: "MFN",
      shipServiceLevel: "Std DE Dom",
      numberOfItemsShipped: 2,
      numberOfItemsUnshipped: 0,
      shippingAddress: {
        name: "Max Mustermann",
        addressLine1: "Musterstraße 42",
        city: "Berlin",
        stateOrRegion: "Berlin",
        postalCode: "10115",
        countryCode: "DE",
        phone: "+49 30 12345678",
      },
    };
  }

  async fetchOrderItems(orderId: string): Promise<AmazonOrderItem[]> {
    return [
      {
        orderItemId: "item_001",
        asin: "B09V3KXJPB",
        sellerSku: "SPK-100-BLK",
        title: "Premium Bluetooth Speaker - Waterproof Portable",
        quantityOrdered: 1,
        quantityShipped: 1,
        itemPrice: "89.90",
        itemTax: "17.08",
        currency: "EUR",
        isGift: false,
      },
      {
        orderItemId: "item_002",
        asin: "B0BSHF7WHN",
        sellerSku: "CBL-USB-C-2M",
        title: "USB-C Charging Cable 2m Braided Nylon",
        quantityOrdered: 2,
        quantityShipped: 2,
        itemPrice: "29.99",
        itemTax: "5.70",
        currency: "EUR",
        isGift: false,
      },
    ];
  }
}
