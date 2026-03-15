import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingPage() {
  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Guided onboarding</CardTitle>
        </CardHeader>
      </Card>
      <OnboardingWizard />
    </section>
  );
}
