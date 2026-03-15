import { AmazonSdkProvider } from "./sdk-provider.ts";
import { MockAmazonOrdersProvider } from "./mock-provider.ts";
import type { AmazonCredentials, AmazonOrdersProvider } from "./types.ts";

export function createAmazonProvider(credentials?: AmazonCredentials): AmazonOrdersProvider {
  if (credentials?.clientId && credentials?.clientSecret && credentials?.refreshToken) {
    return new AmazonSdkProvider(credentials);
  }

  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    return new AmazonSdkProvider({
      clientId,
      clientSecret,
      refreshToken,
      sellerId: process.env.AMAZON_SELLER_ID,
    });
  }

  return new MockAmazonOrdersProvider();
}
