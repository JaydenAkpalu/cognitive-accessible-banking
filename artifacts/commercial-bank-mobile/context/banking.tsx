import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TextSize = 'standard' | 'large' | 'extraLarge';
export type Spacing = 'standard' | 'comfortable' | 'spacious';

export type Preferences = {
  minimalInformation: boolean;
  literalLanguage: boolean;
  stepByStep: boolean;
  reducedDistractions: boolean;
  textSize: TextSize;
  spacing: Spacing;
};

export type Transfer = {
  id: string;
  recipient: string;
  iban: string;
  bank: string;
  purpose: string;
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

export type SavingsHolding = {
  id: string;
  name: string;
  value: number;
  invested: number;
};

export type SavingsState = {
  savingsBalance: number;
  fixedDepositBalance: number;
  additionalSavingsName: string;
  additionalSavingsAccess: string;
  fixedDepositRate: number;
  fixedDepositTermMonths: number;
  investmentValue: number;
  totalInvested: number;
  holdings: SavingsHolding[];
};

const initialPreferences: Preferences = {
  minimalInformation: true,
  literalLanguage: true,
  stepByStep: true,
  reducedDistractions: true,
  textSize: 'large',
  spacing: 'comfortable',
};

const PREFERENCES_STORAGE_KEY = '@cbi/cognitive-preferences';

let transferSequence = 0;

const createTransfer = (): Transfer => ({
  id: `transfer-${++transferSequence}`,
  recipient: '',
  iban: '',
  bank: '',
  purpose: '',
  amount: '',
  transferType: 'Standard Transfer',
  fee: '25.00 AED',
  exchangeRate: '1 AED = 0.27 USD',
  timing: 'Instant',
  cancellable: 'Until received',
  warning: 'None',
  nextStep: 'Confirm to send',
});

const initialTransactions: BankingTransaction[] = [
  { id: 'coffee-roasters', name: 'Coffee Roasters', date: 'Today · Card purchase', amount: -45, fee: 0, total: -45, kind: 'card' },
  { id: 'salary-deposit', name: 'Salary Deposit', date: 'Yesterday · Incoming transfer', amount: 12500, fee: 0, total: 12500, kind: 'deposit', positive: true },
  { id: 'electric-bill', name: 'Electric Bill', date: '12 Mar · Direct debit', amount: -320, fee: 0, total: -320, kind: 'bill' },
];

const initialSavingsState: SavingsState = {
  savingsBalance: 15000,
  fixedDepositBalance: 0,
  additionalSavingsName: '',
  additionalSavingsAccess: '',
  fixedDepositRate: 0.0325,
  fixedDepositTermMonths: 12,
  investmentValue: 9850,
  totalInvested: 10000,
  holdings: [
    { id: 'global-equity', name: 'Global Equity Fund', value: 4500, invested: 4700 },
    { id: 'uae-bond', name: 'UAE Bond Fund', value: 3000, invested: 3000 },
    { id: 'global-technology', name: 'Global Technology Fund', value: 2350, invested: 2300 },
  ],
};

const parseMoney = (value: string) => {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

type BankingContextValue = {
  isCognitiveMode: boolean;
  setIsCognitiveMode: (value: boolean) => void;
  preferences: Preferences;
  updatePreference: <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => void;
  transfer: Transfer;
  updateTransfer: (value: Partial<Transfer>) => void;
  resetTransfer: () => void;
  balance: number;
  transactions: BankingTransaction[];
  completeTransfer: () => void;
  savings: SavingsState;
  completeSavingsInvestment: (input: { actionId: string; productId: string; productName: string; amount: number; fee: number }) => void;
  completeFixedDeposit: (input: { actionId: string; amount: number; productName: string; access: string; rate: number; termMonths: number }) => void;
};

const BankingContext = createContext<BankingContextValue | null>(null);

export function BankingProvider({ children }: { children: React.ReactNode }) {
  const [isCognitiveMode, setIsCognitiveMode] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [transfer, setTransfer] = useState<Transfer>(createTransfer);
  const [balance, setBalance] = useState(10000);
  const [transactions, setTransactions] = useState<BankingTransaction[]>(initialTransactions);
  const [savings, setSavings] = useState<SavingsState>(initialSavingsState);
  const completedTransferIds = useRef(new Set<string>());
  const completedSavingsActionIds = useRef(new Set<string>());

  React.useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const parsed = JSON.parse(stored) as Partial<Preferences>;
        setPreferences((current) => ({
          ...current,
          ...parsed,
        }));
      })
      .catch(() => {
        // Keep the accessible defaults if storage is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePreference = useCallback(<Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next)).catch(() => {
        // The in-memory setting still applies if storage is unavailable.
      });
      return next;
    });
  }, []);

  const resetTransfer = useCallback(() => setTransfer(createTransfer()), []);

  const completeTransfer = useCallback(() => {
    const amount = parseMoney(transfer.amount);
    const fee = parseMoney(transfer.fee);
    if (!transfer.recipient || amount <= 0 || completedTransferIds.current.has(transfer.id)) return;

    completedTransferIds.current.add(transfer.id);
    const total = amount + fee;
    setBalance((currentBalance) => currentBalance - total);
    setTransactions((currentTransactions) => [{
      id: transfer.id,
      name: transfer.recipient,
      date: 'Just now · Transfer',
      amount: -amount,
      fee,
      total: -total,
      kind: 'transfer',
    }, ...currentTransactions]);
  }, [transfer]);

  const completeSavingsInvestment = useCallback((input: { actionId: string; productId: string; productName: string; amount: number; fee: number }) => {
    if (completedSavingsActionIds.current.has(input.actionId) || input.amount <= 0 || input.amount + input.fee > savings.savingsBalance) return;
    completedSavingsActionIds.current.add(input.actionId);
    setSavings((currentSavings) => {
      const existingHolding = currentSavings.holdings.find((holding) => holding.id === input.productId);
      const holdings = existingHolding
        ? currentSavings.holdings.map((holding) => holding.id === input.productId
          ? { ...holding, value: holding.value + input.amount, invested: holding.invested + input.amount }
          : holding)
        : [...currentSavings.holdings, { id: input.productId, name: input.productName, value: input.amount, invested: input.amount }];
      return {
        ...currentSavings,
        savingsBalance: currentSavings.savingsBalance - input.amount - input.fee,
        investmentValue: currentSavings.investmentValue + input.amount,
        totalInvested: currentSavings.totalInvested + input.amount,
        holdings,
      };
    });
    setTransactions((currentTransactions) => [{
      id: input.actionId,
      name: `Investment: ${input.productName}`,
      date: 'Just now · Investment',
      amount: -input.amount,
      fee: input.fee,
      total: -(input.amount + input.fee),
      kind: 'transfer',
    }, ...currentTransactions]);
  }, [savings.savingsBalance]);

  const completeFixedDeposit = useCallback((input: { actionId: string; amount: number; productName: string; access: string; rate: number; termMonths: number }) => {
    if (completedSavingsActionIds.current.has(input.actionId) || input.amount <= 0 || input.amount > savings.savingsBalance) return;
    completedSavingsActionIds.current.add(input.actionId);
    setSavings((currentSavings) => ({
      ...currentSavings,
      savingsBalance: currentSavings.savingsBalance - input.amount,
      fixedDepositBalance: currentSavings.fixedDepositBalance + input.amount,
      additionalSavingsName: input.productName,
      additionalSavingsAccess: input.access,
      fixedDepositRate: input.rate,
      fixedDepositTermMonths: input.termMonths,
    }));
    setTransactions((currentTransactions) => [{
      id: input.actionId,
      name: input.productName,
      date: 'Just now · Savings',
      amount: -input.amount,
      fee: 0,
      total: -input.amount,
      kind: 'deposit',
    }, ...currentTransactions]);
  }, [savings.savingsBalance]);

  const value = useMemo<BankingContextValue>(() => ({
    isCognitiveMode,
    setIsCognitiveMode,
    preferences,
    updatePreference,
    transfer,
    updateTransfer: (nextValue) => setTransfer((current) => ({ ...current, ...nextValue })),
    resetTransfer,
    balance,
    transactions,
    completeTransfer,
    savings,
    completeSavingsInvestment,
    completeFixedDeposit,
  }), [isCognitiveMode, preferences, updatePreference, transfer, resetTransfer, balance, transactions, completeTransfer, savings, completeSavingsInvestment, completeFixedDeposit]);

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>;
}

export function useBanking() {
  const context = useContext(BankingContext);
  if (!context) throw new Error('useBanking must be used inside BankingProvider');
  return context;
}

export function useBankingOptional() {
  return useContext(BankingContext);
}