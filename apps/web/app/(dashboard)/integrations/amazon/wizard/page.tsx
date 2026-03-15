import { AmazonWizard } from '@/components/onboarding/AmazonWizard';
import type { WizardStep } from '@/types/amazon-wizard.types';

export default function AmazonWizardPage({ searchParams }: { searchParams: { step?: string; jobId?: string; integrationId?: string } }) {
  const step = (searchParams.step as WizardStep | undefined) ?? 'intro';
  return <AmazonWizard initialStep={step} jobId={searchParams.jobId} integrationId={searchParams.integrationId} />;
}
