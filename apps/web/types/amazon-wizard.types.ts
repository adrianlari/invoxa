export type WizardStep =
  | 'intro'
  | 'marketplace'
  | 'permissions'
  | 'oauth'
  | 'syncing'
  | 'preview'
  | 'complete';

export type AmazonMarketplace = 'DE' | 'FR' | 'IT' | 'ES' | 'UK' | 'US' | 'JP';

export interface WizardState {
  step: WizardStep;
  selectedMarketplace: AmazonMarketplace | null;
  integrationId: string | null;
  syncJobId: string | null;
  syncedOrderCount: number;
  error: string | null;
}

export type StepProps = {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
};
