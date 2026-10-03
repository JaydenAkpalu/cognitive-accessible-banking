import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { ArrowLeft, User, Search } from 'lucide-react';
import { CognitiveFlowProgress } from '@/components/cognitive-flow';

export default function TransferRecipient() {
  const { isAccessibilityMode, preferences, transferData, updateTransferData } = useStore();
  const [, setLocation] = useLocation();
  const [recipient, setRecipient] = useState(transferData.recipient);

  const literal = isAccessibilityMode && preferences.literalLanguage;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipient.trim()) {
      updateTransferData({ recipient });
      setLocation('/transfer/amount');
    }
  };

  const selectContact = (name: string) => {
    setRecipient(name);
    updateTransferData({ recipient: name });
    if (!isAccessibilityMode) {
      setLocation('/transfer/amount');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-xl mx-auto w-full">
        
        <button 
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {literal ? "Go Back" : "Back to Home"}
        </button>

        {isAccessibilityMode && <CognitiveFlowProgress currentStep={1} />}

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {literal ? "Who are you sending money to?" : "Select recipient"}
          </h1>
          {!preferences.minimalInformation && (
            <p className="text-muted-foreground mt-2">
              Enter a new name or select from your recent contacts.
            </p>
          )}
        </div>

        <form onSubmit={handleNext} className="space-y-6 mt-8">
          <div className="space-y-3">
            <Label htmlFor="recipient" className="text-lg">
              {literal ? "Name of person or company" : "Recipient Name"}
            </Label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sarah Smith"
                className="pl-11 h-14 text-lg"
                autoFocus
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg"
            disabled={!recipient.trim()}
          >
            {literal ? "Next Step" : "Continue"}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-foreground">
            {literal ? "People you sent money to before" : "Recent Contacts"}
          </h3>
          <div className="grid gap-3">
            {['Alex Johnson', 'Property Management LLC', 'Mom'].map((name) => (
              <Card 
                key={name} 
                className={`cursor-pointer transition-colors ${isAccessibilityMode && recipient === name ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => selectContact(name)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') selectContact(name);
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {name.charAt(0)}
                  </div>
                  <span className="font-medium text-lg">{name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          {isAccessibilityMode && (
            <p className="mt-3 text-sm text-muted-foreground">
              Choose a name, then select Continue when you are ready.
            </p>
          )}
        </div>

      </div>
    </Layout>
  );
}
