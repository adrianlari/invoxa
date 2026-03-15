'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, MapPin, Loader2 } from 'lucide-react';

export function AmazonOrdersPreview() {
  const [enabled, setEnabled] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['amazon-preview-orders'],
    queryFn: () => apiClient.get('/integrations/amazon/orders/preview?limit=5'),
    enabled,
  });

  if (selectedOrderId) {
    return <OrderDetailView orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Amazon Orders Preview</CardTitle>
        {data?.source && <Badge variant="secondary">{data.source}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {!enabled && (
          <Button onClick={() => setEnabled(true)}>Preview Orders</Button>
        )}

        {isLoading && <p className="text-sm text-slate-500">Fetching orders from Amazon sandbox...</p>}

        {error && <p className="text-sm text-red-500">Failed to fetch orders: {(error as Error).message}</p>}

        {data?.orders && (
          <>
            <p className="text-sm text-slate-500">{data.count} order(s) returned</p>
            <div className="space-y-2 rounded-xl border p-3">
              {data.orders.map((order: any) => (
                <button
                  key={order.externalOrderId}
                  onClick={() => setSelectedOrderId(order.externalOrderId)}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
                >
                  <div>
                    <div className="text-sm font-medium">{order.externalOrderId}</div>
                    <div className="text-xs text-slate-500">{order.buyerName ?? 'Buyer'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{order.amount} {order.currency}</div>
                    <Badge variant={order.status === 'Shipped' ? 'default' : 'secondary'} className="mt-1 text-xs">
                      {order.status ?? 'Pending'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OrderDetailView({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['amazon-order-detail', orderId],
    queryFn: () => apiClient.get(`/integrations/amazon/orders/${orderId}/detail`),
  });

  const { data: itemsData, isLoading: loadingItems } = useQuery({
    queryKey: ['amazon-order-items', orderId],
    queryFn: () => apiClient.get(`/integrations/amazon/orders/${orderId}/items`),
  });

  const loading = loadingDetail || loadingItems;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <CardTitle className="text-lg">Order {orderId}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading order details...
          </div>
        )}

        {detail && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Order Info */}
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4" /> Order Information
              </h4>
              <div className="space-y-2 text-sm">
                <Row label="Status">
                  <Badge variant={detail.status === 'Shipped' ? 'default' : 'secondary'}>{detail.status}</Badge>
                </Row>
                <Row label="Date">{new Date(detail.orderDate).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Row>
                <Row label="Total">{detail.amount} {detail.currency}</Row>
                <Row label="Buyer">{detail.buyerName ?? '—'}</Row>
                {detail.buyerEmail && <Row label="Email">{detail.buyerEmail}</Row>}
                <Row label="Fulfillment">{detail.fulfillmentChannel === 'AFN' ? 'Fulfilled by Amazon (FBA)' : 'Merchant Fulfilled (FBM)'}</Row>
                {detail.shipServiceLevel && <Row label="Shipping">{detail.shipServiceLevel}</Row>}
                <Row label="Items shipped">{detail.numberOfItemsShipped ?? 0}</Row>
                <Row label="Items unshipped">{detail.numberOfItemsUnshipped ?? 0}</Row>
              </div>
            </div>

            {/* Shipping Address */}
            {detail.shippingAddress && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">{detail.shippingAddress.name}</p>
                  <p>{detail.shippingAddress.addressLine1}</p>
                  <p>{detail.shippingAddress.postalCode} {detail.shippingAddress.city}</p>
                  {detail.shippingAddress.stateOrRegion && <p>{detail.shippingAddress.stateOrRegion}</p>}
                  <p>{detail.shippingAddress.countryCode}</p>
                  {detail.shippingAddress.phone && <p className="mt-2 text-slate-400">{detail.shippingAddress.phone}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        {itemsData?.items && itemsData.items.length > 0 && (
          <div className="rounded-lg border">
            <div className="border-b bg-slate-50 px-4 py-2">
              <h4 className="text-sm font-medium">Order Items ({itemsData.items.length})</h4>
            </div>
            <div className="divide-y">
              {itemsData.items.map((item: any) => (
                <div key={item.orderItemId} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <div className="mt-1 flex gap-3 text-xs text-slate-500">
                      <span>ASIN: {item.asin}</span>
                      {item.sellerSku && <span>SKU: {item.sellerSku}</span>}
                      <span>Qty: {item.quantityOrdered}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.itemPrice} {item.currency}</p>
                    <p className="text-xs text-slate-500">Tax: {item.itemTax} {item.currency}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t bg-slate-50 px-4 py-2 text-sm font-medium">
              <span>Total</span>
              <span>{detail?.amount} {detail?.currency}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{children}</span>
    </div>
  );
}
