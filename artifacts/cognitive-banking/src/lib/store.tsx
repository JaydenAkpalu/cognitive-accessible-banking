import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';

export type AppPreferences = {
  minimalInformation: boolean;
  literalLanguage: boolean;
  stepByStep: boolean;
  reducedAnimations: boolean;
  reducedDistractions: boolean;
  largerText: boolean;
  increasedSpacing: boolean;
};

export type TransferData = {
  id: string;
  recipient: string;
  amount: string;
  transferType: string;
  fee: string;
  exchangeRate: string;
  timing: string;
  cancellable: string;
  warning: string;
  nextStep: string;
};

export type BankingTransaction = {
  id: string;
  name: string;
  date: string;
  amount: number;
  fee: number;
  total: number;
  kind: 'card' | 'deposit' | 'bill' | 'transfer';
  positive?: boolean;
};

const defaultPreferences: AppPreferences = {
  minimalInformation: true,
  literalLanguage: true,
  stepByStep: true,
  reducedAnimations: true,
  reducedDistractions: true,
  largerText: true,
  increasedSpacing: true,
};

let transferSequence = 0;

const createTransferData = (): TransferData => ({
  id: `transfer-${++transferSequence}`,
  recipient: '',
  amount: '',
  transferType: 'Standard Transfer',
  fee: '0.00 AED',
  exchangeRate: '1 AED = 0.27 USD',
  timing: 'Instant',
  cancellable: 'Until received',
  warning: 'None',
  nextStep: 'Confirm to send',
});

const defaultTransactions: BankingTransaction[] = [
  { id: 'coffee-roasters', name: 'Coffee Roasters', date: 'Today · Card purchase', amount: -45, fee: 0, total: -45, kind: 'card' },
  { id: 'salary-deposit', name: 'Salary Deposit', date: 'Yesterday · Incoming transfer', amount: 12500, fee: 0, total: 12500, kind: 'deposit', positive: true },
  { id: 'electric-bill', name: 'Electric Bill', date: '12 Mar · Direct debit', amount: -320, fee: 0, total: -320, kind: 'bill' },
];

const parseMoney = (value: string) => {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

type StoreContextType = {
  isAccessibilityMode: boolean;
  setIsAccessibilityMode: (val: boolean) => void;
  preferences: AppPreferences;
  setPreferences: (prefs: AppPreferences) => void;
  updatePreference: (key: keyof AppPreferences, val: boolean) => void;
  transferData: TransferData;
  updateTransferData: (data: Partial<TransferData>) => void;
  resetTransfer: () => void;
  balance: number;
  transactions: BankingTransaction[];
  completeTransfer: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [transferData, setTransferData] = useState<TransferData>(createTransferData);
  const [balance, setBalance] = useState(45200);
  const [transactions, setTransactions] = useState<BankingTransaction[]>(defaultTransactions);
  const completedTransferIds = useRef(new Set<string>());

  useEffect(() => {
    // Apply dataset attributes to body for global CSS overrides
    document.body.setAttribute('data-cognitive-mode', String(isAccessibilityMode));
    if (isAccessibilityMode) {
      document.body.setAttribute('data-reduced-animations', String(preferences.reducedAnimations));
      document.body.setAttribute('data-larger-text', String(preferences.largerText));
      document.body.setAttribute('data-increased-spacing', String(preferences.increasedSpacing));
    } else {
      document.body.removeAttribute('data-reduced-animations');
      document.body.removeAttribute('data-larger-text');
      document.body.removeAttribute('data-increased-spacing');
    }
  }, [isAccessibilityMode, preferences]);

  const updatePreference = (key: keyof AppPreferences, val: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: val }));
  };

  const updateTransferData = (data: Partial<TransferData>) => {
    setTransferData((prev) => ({ ...prev, ...data }));
  };

  const resetTransfer = () => setTransferData(createTransferData());

  const completeTransfer = useCallback(() => {
    const amount = parseMoney(transferData.amount);
    const fee = parseMoney(transferData.fee);
    if (!transferData.recipient || amount <= 0 || completedTransferIds.current.has(transferData.id)) return;

    completedTransferIds.current.add(transferData.id);
    const total = amount + fee;
    setBalance((currentBalance) => currentBalance - total);
    setTransactions((currentTransactions) => [{
      id: transferData.id,
      name: transferData.recipient,
      date: 'Just now · Transfer',
      amount: -amount,
      fee,
      total: -total,
      kind: 'transfer',
    }, ...currentTransactions]);
  }, [transferData]);

  return (
    <StoreContext.Provider
      value={{
        isAccessibilityMode,
        setIsAccessibilityMode,
        preferences,
        setPreferences,
        updatePreference,
        transferData,
        updateTransferData,
        resetTransfer,
        balance,
        transactions,
        completeTransfer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
