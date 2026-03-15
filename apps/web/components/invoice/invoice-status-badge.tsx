import { Badge } from '@/components/ui/badge';

export function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'secondary' | 'default' | 'success' | 'danger'> = {
    DRAFT: 'secondary',
    SENT: 'default',
    PAID: 'success',
    OVERDUE: 'danger'
  };

  return <Badge variant={map[status] ?? map.DRAFT}>{status}</Badge>;
}
