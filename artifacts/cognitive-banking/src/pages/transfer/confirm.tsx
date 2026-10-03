import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { CheckCircle2, Home } from 'lucide-react';
import { CognitiveFlowProgress } from '@/components/cognitive-flow';

export default function TransferConfirm() {
  const { isAccessibilityMode, preferences, transferData, resetTransfer, completeTransfer } = useStore();
  const [, setLocation] = useLocation();
  const [confirmed, setConfirmed] = React.useState(false);

  const literal = isAccessibilityMode && preferences.literalLanguage;

  useEffect(() => {
    if (confirmed && transferData.amount && transferData.recipient) {
      completeTransfer();
    }
  }, [completeTransfer, confirmed, transferData.amount, transferData.recipient]);

  if (!transferData.amount) {
    setLocation('/');
    return null;
  }

  const handleDone = () => {
    resetTransfer();
    setLocation('/');
  };

  if (!confirmed) {
    return (
      <Layout>
        <div className="space-y-6 max-w-xl mx-auto w-full pb-20">
          <button
            onClick={() => setLocation('/transfer/review')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <span aria-hidden="true">←</span>
            {literal ? 'Go back' : 'Back'}
          </button>
          {isAccessibilityMode && <CognitiveFlowProgress currentStep={4} />}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {literal ? 'Are you ready to send this money?' : 'Confirm transfer'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {literal ? `You are sending ${transferData.amount} AED to ${transferData.recipient}.` : 'Check the details one more time before sending.'}
            </p>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Sending to</p>
                <p className="mt-1 text-lg font-semibold">{transferData.recipient}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="mt-1 text-2xl font-bold text-primary">{transferData.amount} AED</p>
              </div>
            </CardContent>
          </Card>
          <Button
            size="lg"
            className="h-14 w-full text-lg"
            onClick={() => setConfirmed(true)}
          >
            {literal ? 'Confirm and send' : 'Confirm transfer'}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in zoom-in-95 duration-500 max-w-xl mx-auto w-full">
        
        {isAccessibilityMode && <CognitiveFlowProgress currentStep={4} />}
        <div className="relative">
          {!isAccessibilityMode && <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full"></div>}
          <CheckCircle2 className="h-32 w-32 text-emerald-500 relative z-10" />
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {literal ? "The money was sent." : "Transfer Successful"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {literal 
              ? `You sent ${transferData.amount} AED to ${transferData.recipient}.` 
              : `${transferData.amount} AED has been sent to ${transferData.recipient}.`}
          </p>
        </div>

        <Card className="w-full border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-6 text-left">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p className="font-mono font-medium mt-1">TRX-{Math.floor(Math.random() * 1000000)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium mt-1">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          size="lg" 
          className="w-full h-14 text-lg mt-8"
          onClick={handleDone}
        >
          <Home className="mr-2 h-5 w-5" />
          {literal ? "Go Back to Home" : "Return to Dashboard"}
        </Button>

      </div>
    </Layout>
  );
}
