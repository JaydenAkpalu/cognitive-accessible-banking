import React from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, HelpCircle, ArrowRight, RotateCcw, DollarSign } from 'lucide-react';
import { useExplainBankingContext } from '@workspace/api-client-react';

export function DecisionLens({ onConfirm, actionLabel }: { onConfirm: () => void, actionLabel: string }) {
  const { isAccessibilityMode, transferData, preferences } = useStore();
  const { mutate, isPending } = useExplainBankingContext();

  if (!isAccessibilityMode) return null;

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-none overflow-hidden mb-6">
      <div className="bg-primary/10 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-primary">Decision Lens</h3>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-primary/10">
          <LensRow 
            icon={<ArrowRight className="h-4 w-4 text-blue-600" />}
            question="What are you doing?"
            answer={`You are sending money to ${transferData.recipient}.`}
          />
          <LensRow 
            icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
            question="What will happen?"
            answer="The money will leave your account instantly."
          />
          <LensRow 
            icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
            question="What is the cost?"
            answer={`You will send exactly ${transferData.amount} AED. There is no extra fee.`}
          />
          <LensRow 
            icon={<RotateCcw className="h-4 w-4 text-purple-600" />}
            question="Can you undo this?"
             answer="You can go back before the final confirmation. After you confirm, the money cannot be recalled."
          />
        </div>
        <div className="p-4 bg-background/50 border-t border-primary/10">
          <p className="text-sm font-medium text-foreground mb-4">
            {preferences.literalLanguage ? "You are making the decision." : "The choice is yours to proceed."}
          </p>
          <button 
            onClick={onConfirm}
            data-testid="button-decision-confirm"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {actionLabel}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function LensRow({ icon, question, answer }: { icon: React.ReactNode, question: string, answer: string }) {
  return (
    <div className="px-4 py-3 flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{question}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{answer}</p>
      </div>
    </div>
  );
}
