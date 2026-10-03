import React from 'react';
import { Check } from 'lucide-react';

const steps = ['Recipient', 'Amount', 'Review', 'Confirm'];

export function CognitiveFlowProgress({ currentStep }: { currentStep: number }) {
  const safeStep = Math.min(Math.max(currentStep, 1), steps.length);

  return (
    <section
      aria-label={`Transfer step ${safeStep} of ${steps.length}: ${steps[safeStep - 1]}`}
      className="rounded-2xl border border-primary/20 bg-card px-4 py-4 shadow-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Step {safeStep} of {steps.length}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">{steps[safeStep - 1]}</p>
        </div>
        <span className="text-right text-xs font-medium text-muted-foreground">
          {safeStep === 1 ? 'Start here' : safeStep === steps.length ? 'Last step' : 'You can go back'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {steps.map((step, index) => {
          const complete = index + 1 < safeStep;
          const active = index + 1 === safeStep;
          return (
            <div key={step} className="space-y-1">
              <div className={`h-1.5 rounded-full ${index + 1 <= safeStep ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex items-center gap-1 text-[10px] ${active ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                {complete && <Check className="h-3 w-3" />}
                <span>{step}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}