import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useExplainBankingContext } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Sparkles, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

export function Assistant() {
  const { isAccessibilityMode, preferences, transferData } = useStore();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const { mutate, isPending } = useExplainBankingContext();

  const isDistractionFree = isAccessibilityMode && preferences.reducedDistractions;

  const currentStepMap: Record<string, string> = {
    '/': 'Home Dashboard',
    '/transfer/recipient': 'Entering Recipient',
    '/transfer/amount': 'Entering Amount',
    '/transfer/review': 'Reviewing Transfer',
    '/transfer/confirm': 'Transfer Confirmed',
    '/settings': 'Settings',
  };

  const currentStep = currentStepMap[location] || 'Unknown Step';

  const askQuestion = (question: string) => {
    setIsOpen(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    const context = {
      step: currentStep,
      recipient: transferData.recipient || 'Not selected',
      amount: transferData.amount ? `${transferData.amount} AED` : 'Not selected',
      transferType: transferData.transferType,
      fee: transferData.fee,
      timing: transferData.timing,
      cancellable: transferData.cancellable,
      warning: transferData.warning,
      nextStep: transferData.nextStep,
    };

    mutate(
      {
        data: {
          question,
          context,
          preferences: {
            minimalInformation: isAccessibilityMode ? preferences.minimalInformation : false,
            literalLanguage: isAccessibilityMode ? preferences.literalLanguage : false,
            stepByStep: isAccessibilityMode ? preferences.stepByStep : false,
          },
        },
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'I am sorry, I am having trouble connecting right now. Please try again later.' },
          ]);
        },
      }
    );
  };

  const suggestedQuestions = [
    "What am I agreeing to?",
    "Will I be charged?",
    "What happens next?",
    "Can I undo this?",
    "Explain this simply"
  ];

  if (!isOpen) {
    return (
      <Button
        data-testid="button-open-assistant"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          isDistractionFree ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground"
        )}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border shadow-xl rounded-2xl flex flex-col overflow-hidden z-50 transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Bot className="h-5 w-5" />
          <span>Cognitive Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-4 text-center mt-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              I can help explain what is happening on this page and what to do next.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "px-4 py-2.5 rounded-2xl max-w-[85%] text-sm",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground self-end rounded-tr-sm"
                    : "bg-muted text-foreground self-start rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isPending && (
              <div className="bg-muted text-foreground self-start rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              className="text-xs rounded-full h-auto py-1.5"
              onClick={() => askQuestion(q)}
              disabled={isPending}
            >
              {q}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
