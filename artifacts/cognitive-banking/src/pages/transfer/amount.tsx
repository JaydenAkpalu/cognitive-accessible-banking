import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { CognitiveFlowProgress } from '@/components/cognitive-flow';

export default function TransferAmount() {
  const { isAccessibilityMode, preferences, transferData, updateTransferData, balance } = useStore();
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState(transferData.amount);

  const literal = isAccessibilityMode && preferences.literalLanguage;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > 0) {
      updateTransferData({ amount });
      setLocation('/transfer/review');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(val);
  };

  if (!transferData.recipient) {
    setLocation('/transfer/recipient');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-xl mx-auto w-full">
        
        <button 
          onClick={() => setLocation('/transfer/recipient')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {literal ? "Go Back" : "Back"}
        </button>

        {isAccessibilityMode && <CognitiveFlowProgress currentStep={2} />}

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {literal ? `How much money are you sending to ${transferData.recipient}?` : "Enter amount"}
          </h1>
          {!preferences.minimalInformation && (
            <p className="text-muted-foreground mt-2">
              Available Balance: {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
            </p>
          )}
        </div>

        <form onSubmit={handleNext} className="space-y-8 mt-8">
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-lg">
              {literal ? "Amount in AED" : "Transfer Amount (AED)"}
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-medium text-muted-foreground">
                AED
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="pl-16 h-20 text-3xl font-bold"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000].map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                className="h-14 text-lg"
                onClick={() => setAmount(String(quickAmount))}
              >
                +{quickAmount}
              </Button>
            ))}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg"
            disabled={!amount || Number(amount) <= 0}
          >
            {literal ? "Review details" : "Continue"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
