import { DatevExportPanel } from '@/components/ui/datev-export-panel';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExportsPage() {
  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Exports & accounting handoff</CardTitle>
        </CardHeader>
      </Card>
      <DatevExportPanel />
    </section>
  );
}
