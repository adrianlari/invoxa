'use client';

import { useMemo, useState } from 'react';
import { IntroStep } from './steps/IntroStep';
import { MarketplaceStep } from './steps/MarketplaceStep';
import { PermissionsStep } from './steps/PermissionsStep';
import { OAuthStep } from './steps/OAuthStep';
import { SyncingStep } from './steps/SyncingStep';
import { PreviewStep } from './steps/PreviewStep';
import { CompleteStep } from './steps/CompleteStep';
import { WizardProgressBar } from './wizard-progress';
import type { WizardState, WizardStep } from '@/types/amazon-wizard.types';

const STEPS: WizardStep[] = ['intro', 'marketplace', 'permissions', 'oauth', 'syncing', 'preview', 'complete'];

export function AmazonWizard(props: { initialStep?: WizardStep; jobId?: string; integrationId?: string }) {
  const [state, setState] = useState<WizardState>({
    step: props.initialStep ?? 'intro',
    selectedMarketplace: 'DE',
    integrationId: props.integrationId ?? null,
    syncJobId: props.jobId ?? null,
    syncedOrderCount: 0,
    error: null
  });

  const update = (patch: Partial<WizardState>) => setState((prev) => ({ ...prev, ...patch }));
  const stepProps = useMemo(() => ({ state, update }), [state]);

  return (
    <div className="mx-auto max-w-3xl">
      <WizardProgressBar currentStep={state.step} steps={STEPS} />
      {state.step === 'intro' && <IntroStep {...stepProps} />}
      {state.step === 'marketplace' && <MarketplaceStep {...stepProps} />}
      {state.step === 'permissions' && <PermissionsStep {...stepProps} />}
      {state.step === 'oauth' && <OAuthStep />}
      {state.step === 'syncing' && <SyncingStep {...stepProps} />}
      {state.step === 'preview' && <PreviewStep {...stepProps} />}
      {state.step === 'complete' && <CompleteStep />}
    </div>
  );
}
