import { MarketplaceConnectCard } from '@/components/ui/marketplace-connect-card';
import { CsvImportDropzone } from '@/components/ui/csv-import-dropzone';
import { AmazonOrdersPreview } from '@/components/integrations/amazon-orders-preview';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IntegrationsPage() {
  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Marketplace integrations</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Connect channels and control sync reliability from one place.</p>
          </div>
          <Badge variant="secondary">3 providers</Badge>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <MarketplaceConnectCard title="Amazon" type="amazon" />
        <MarketplaceConnectCard title="Shopify" type="shopify" />
        <MarketplaceConnectCard title="Temu" type="temu" />
      </div>
      <AmazonOrdersPreview />
      <CsvImportDropzone />
    </section>
  );
}
