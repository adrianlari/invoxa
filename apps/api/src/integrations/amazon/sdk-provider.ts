import type { AmazonCredentials, AmazonOrderPreview, AmazonOrderDetail, AmazonOrderItem, AmazonOrdersProvider } from "./types.ts";
import { SellingPartner } from "amazon-sp-api";
export class AmazonSdkProvider implements AmazonOrdersProvider {
  constructor(private readonly credentials: AmazonCredentials) {}

  private async createClient() {
    const useSandbox = process.env.AMAZON_USE_SANDBOX === "true";

    return {
      client: new SellingPartner({
        region: "eu",
        refresh_token: this.credentials.refreshToken,
        credentials: {
          SELLING_PARTNER_APP_CLIENT_ID: this.credentials.clientId,
          SELLING_PARTNER_APP_CLIENT_SECRET: this.credentials.clientSecret,
        },
        options: { use_sandbox: useSandbox },
      }),
      useSandbox,
    };
  }

  async fetchRecentOrders(params: { marketplaceId: string; createdAfter?: string; limit?: number }): Promise<AmazonOrderPreview[]> {
    const { client, useSandbox } = await this.createClient();

    const query = useSandbox
      ? { MarketplaceIds: ["ATVPDKIKX0DER"], CreatedAfter: "TEST_CASE_200" }
      : {
          MarketplaceIds: [params.marketplaceId],
          CreatedAfter: params.createdAfter ?? new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString(),
          MaxResultsPerPage: params.limit ?? 20,
          OrderStatuses: ["Shipped", "Unshipped"],
        };

    const result = await client.callAPI({
      operation: "getOrders",
      endpoint: "orders",
      query,
    });

    const orders = (result?.payload?.Orders ?? []) as Array<any>;
    return orders.map((order: any) => ({
      externalOrderId: order.AmazonOrderId,
      orderDate: order.PurchaseDate,
      status: order.OrderStatus,
      amount: String(order.OrderTotal?.Amount ?? "0.00"),
      currency: String(order.OrderTotal?.CurrencyCode ?? "EUR"),
      marketplaceId: order.MarketplaceId,
      buyerName: undefined,
    }));
  }

  async fetchOrderDetail(orderId: string): Promise<AmazonOrderDetail> {
    const { client, useSandbox } = await this.createClient();

    const path = useSandbox ? { orderId: "TEST_CASE_200" } : { orderId };

    const result = await client.callAPI({
      operation: "getOrder",
      endpoint: "orders",
      path,
    });

    const order = result.payload;
    if (!order) {
      throw new Error("Order not found");
    }

    return {
      externalOrderId: order.AmazonOrderId,
      orderDate: order.PurchaseDate,
      status: order.OrderStatus,
      amount: String(order.OrderTotal?.Amount ?? "0.00"),
      currency: String(order.OrderTotal?.CurrencyCode ?? "EUR"),
      marketplaceId: order.MarketplaceId,
      fulfillmentChannel: order.FulfillmentChannel,
      shipServiceLevel: order.ShipServiceLevel,
      numberOfItemsShipped: order.NumberOfItemsShipped,
      numberOfItemsUnshipped: order.NumberOfItemsUnshipped,
    };
  }

  async fetchOrderItems(orderId: string): Promise<AmazonOrderItem[]> {
    const { client, useSandbox } = await this.createClient();

    const path = useSandbox ? { orderId: "TEST_CASE_200" } : { orderId };

    const result = await client.callAPI({
      operation: "getOrderItems",
      endpoint: "orders",
      path,
    });

    const items = (result?.OrderItems ?? []) as Array<any>;
    return items.map((item: any) => ({
      orderItemId: item.OrderItemId,
      asin: item.ASIN,
      sellerSku: item.SellerSKU,
      title: item.Title ?? "Unknown product",
      quantityOrdered: item.QuantityOrdered ?? 0,
      quantityShipped: item.QuantityShipped ?? 0,
      itemPrice: String(item.ItemPrice?.Amount ?? "0.00"),
      itemTax: String(item.ItemTax?.Amount ?? "0.00"),
      currency: String(item.ItemPrice?.CurrencyCode ?? "EUR"),
      isGift: item.IsGift ?? false,
    }));
  }
}
