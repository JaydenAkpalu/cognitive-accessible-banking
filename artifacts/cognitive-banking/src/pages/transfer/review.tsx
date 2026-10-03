import React from 'react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DecisionLens } from '@/components/decision-lens';
import { useLocation } from 'wouter';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { CognitiveFlowProgress } from '@/components/cognitive-flow';

export default function TransferReview() {
  const { isAccessibilityMode, preferences, transferData } = useStore();
  const [, setLocation] = useLocation();

  const literal = isAccessibilityMode && preferences.literalLanguage;
  const minimal = isAccessibilityMode && preferences.minimalInformation;

  if (!transferData.amount) {
    setLocation('/transfer/amount');
    return null;
  }

  const handleConfirm = () => {
    setLocation('/transfer/confirm');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-xl mx-auto w-full pb-20">
        
        <button 
          onClick={() => setLocation('/transfer/amount')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {literal ? "Go Back" : "Back"}
        </button>

        {isAccessibilityMode && <CognitiveFlowProgress currentStep={3} />}

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {literal ? "Check the details before sending" : "Review transfer"}
          </h1>
          {!minimal && (
            <p className="text-muted-foreground mt-2">
              Please ensure all details are correct. Transfers cannot be reversed once processed.
            </p>
          )}
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0 divide-y">
            
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {literal ? "Sending to" : "Recipient"}
                </p>
                <p className="text-xl font-semibold text-foreground">{transferData.recipient}</p>
              </div>
               <Button variant="ghost" size={isAccessibilityMode ? 'sm' : 'icon'} onClick={() => setLocation('/transfer/recipient')} className={isAccessibilityMode ? 'gap-1' : undefined}>
                <Edit2 className="h-4 w-4" />
                 {isAccessibilityMode && <span>Edit</span>}
              </Button>
            </div>

            <div className="p-6 flex items-center justify-between bg-primary/5">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {literal ? "Amount to send" : "Amount"}
                </p>
                <p className="text-3xl font-bold text-primary">{transferData.amount} AED</p>
              </div>
               <Button variant="ghost" size={isAccessibilityMode ? 'sm' : 'icon'} onClick={() => setLocation('/transfer/amount')} className={isAccessibilityMode ? 'gap-1' : undefined}>
                <Edit2 className="h-4 w-4" />
                 {isAccessibilityMode && <span>Edit</span>}
              </Button>
            </div>

            {!minimal && (
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">{transferData.fee}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timing</p>
                  <p className="font-medium">{transferData.timing}</p>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {isAccessibilityMode ? (
          <DecisionLens 
            onConfirm={handleConfirm} 
            actionLabel={literal ? "Continue to confirmation" : "Continue"}
          />
        ) : (
          <div className="pt-6">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg"
              onClick={handleConfirm}
            >
              Confirm Transfer
            </Button>
          </div>
        )}

      </div>
    </Layout>
  );
}
