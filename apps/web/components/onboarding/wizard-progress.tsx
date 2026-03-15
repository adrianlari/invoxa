import type { WizardStep } from '@/types/amazon-wizard.types';

export function WizardProgressBar({ currentStep, steps }: { currentStep: WizardStep; steps: WizardStep[] }) {
  const current = steps.indexOf(currentStep);
  const percent = Math.max(0, ((current + 1) / steps.length) * 100);

  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-between text-xs text-slate-500">
        <span>Setup progress</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
