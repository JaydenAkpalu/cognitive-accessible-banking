import React from 'react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Send, ArrowRightLeft, CreditCard, ChevronRight, Bell, ShieldCheck, QrCode, ArrowUpRight, WalletCards } from 'lucide-react';

export default function Home() {
  const { isAccessibilityMode, preferences, resetTransfer, balance, transactions } = useStore();
  const [, setLocation] = useLocation();

  const literal = isAccessibilityMode && preferences.literalLanguage;
  const minimal = isAccessibilityMode && preferences.minimalInformation;

  return (
    <Layout>
      {!isAccessibilityMode ? (
          <NormalBankingHome
            onStartTransfer={() => { resetTransfer(); setLocation('/transfer/recipient'); }}
            balance={balance}
            transactions={transactions}
          />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Balance Card */}
        <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
          <CardContent className="p-6 relative z-10">
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              {literal ? "Money in account" : "Available Balance"}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">{formatBalance(balance)}</h1>
            <p className="text-primary-foreground/60 text-sm mt-2 font-mono">
              •••• 8829
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => { resetTransfer(); setLocation('/transfer/recipient'); }}
            className="block group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                resetTransfer();
                setLocation('/transfer/recipient');
              }
            }}
          >
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group-hover:shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Send className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {literal ? "Send Money" : "Transfer Funds"}
                    </h3>
                    {!minimal && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Send money to anyone instantly.
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </div>

          {!minimal && (
            <>
              <Card className="opacity-70 cursor-not-allowed">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Pay Bills</h3>
                    <p className="text-sm text-muted-foreground mt-1">Utility and phone bills.</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Transactions - Simplified in minimal mode */}
        <Card>
          <CardHeader>
            <CardTitle>{literal ? "Past Payments" : "Recent Transactions"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map((tx) => {
                const Icon = transactionIcon(tx.kind);
                return (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.name}</p>
                      {!minimal && <p className="text-sm text-muted-foreground">{tx.date}</p>}
                    </div>
                  </div>
                  <p className={`font-medium ${tx.positive ? 'text-emerald-600' : 'text-foreground'}`}>
                    {formatTransactionAmount(tx.amount)}
                  </p>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </Layout>
  );
}

function NormalBankingHome({ onStartTransfer, balance, transactions }: { onStartTransfer: () => void; balance: number; transactions: ReturnType<typeof useStore>['transactions'] }) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8 sm:space-y-7 sm:pb-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#76004f]">Good morning, Alex</p>
          <h1 className="mt-1 text-[23px] font-semibold tracking-tight text-[#172b4d] sm:text-2xl">Your financial overview</h1>
        </div>
        <button className="hidden rounded-full border border-[#dfe4ec] bg-white p-2.5 text-[#4d5b6e] shadow-sm transition hover:border-[#92005c] hover:text-[#92005c] sm:block" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="relative overflow-hidden border-0 bg-[#0b3b78] text-white shadow-[0_18px_40px_-20px_rgba(11,59,120,0.65)]">
          <div className="absolute inset-y-0 right-0 w-2/5 bg-gradient-to-l from-[#174e93]/80 to-transparent" />
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[22px] border-[#92005c]/50" />
          <div className="absolute -right-24 -top-3 h-48 w-48 rounded-full border-[22px] border-[#92005c]/30" />
          <CardContent className="relative z-10 p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/75">Available balance</p>
              <ShieldCheck className="h-5 w-5 text-white/70" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[34px] font-semibold tracking-tight sm:text-4xl">{formatBalance(balance)}</p>
            <div className="mt-6 flex items-center justify-between text-xs sm:mt-7 sm:text-sm">
              <span className="text-white/65">Current account · •••• 8829</span>
              <span className="font-medium text-white/85">View details <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#dfe4ec] bg-white shadow-sm">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-[#f7eaf2] p-3 text-[#92005c]"><WalletCards className="h-5 w-5" /></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6f7d8f]">Your card</span>
            </div>
            <div className="mt-6">
              <p className="text-sm text-[#6f7d8f]">Platinum Debit Card</p>
              <p className="mt-1 font-medium text-[#172b4d]">•••• 4618</p>
            </div>
            <button className="mt-5 text-left text-sm font-semibold text-[#92005c] hover:underline">Manage card <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#172b4d]">Quick actions</h2>
          <span className="text-xs font-medium text-[#6f7d8f]">Personal banking</span>
        </div>
        <div className="grid gap-3">
          <button onClick={onStartTransfer} className="group flex items-center gap-4 rounded-xl border border-[#dfe4ec] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#92005c] hover:shadow-md">
            <span className="rounded-xl bg-[#f7eaf2] p-3 text-[#92005c]"><Send className="h-5 w-5" /></span>
            <span><span className="block font-semibold text-[#172b4d]">Transfer money</span><span className="mt-0.5 block text-xs text-[#6f7d8f]">Send to a beneficiary</span></span>
            <ChevronRight className="ml-auto h-4 w-4 text-[#9ba6b5] transition group-hover:text-[#92005c]" />
          </button>
          <button className="group flex items-center gap-4 rounded-xl border border-[#dfe4ec] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b3b78] hover:shadow-md">
            <span className="rounded-xl bg-[#eaf1f9] p-3 text-[#0b3b78]"><QrCode className="h-5 w-5" /></span>
            <span><span className="block font-semibold text-[#172b4d]">Pay with QR</span><span className="mt-0.5 block text-xs text-[#6f7d8f]">Scan and pay securely</span></span>
            <ChevronRight className="ml-auto h-4 w-4 text-[#9ba6b5] transition group-hover:text-[#0b3b78]" />
          </button>
          <button className="group flex items-center gap-4 rounded-xl border border-[#dfe4ec] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b3b78] hover:shadow-md">
            <span className="rounded-xl bg-[#eaf1f9] p-3 text-[#0b3b78]"><CreditCard className="h-5 w-5" /></span>
            <span><span className="block font-semibold text-[#172b4d]">Pay a bill</span><span className="mt-0.5 block text-xs text-[#6f7d8f]">Utilities and services</span></span>
            <ChevronRight className="ml-auto h-4 w-4 text-[#9ba6b5] transition group-hover:text-[#0b3b78]" />
          </button>
        </div>
      </section>

      <Card className="border-[#dfe4ec] bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#eef1f5] px-6 py-4">
          <CardTitle className="text-lg text-[#172b4d]">Recent activity</CardTitle>
          <button className="text-sm font-semibold text-[#92005c] hover:underline">View all</button>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.map((tx) => {
            const Icon = transactionIcon(tx.kind);
            return (
            <div key={tx.id} className="flex min-h-16 items-center justify-between border-b border-[#eef1f5] p-4 last:border-0 hover:bg-[#fbfcfe]">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-[#f1f4f8] p-2.5 text-[#4d5b6e]"><Icon className="h-4 w-4" /></div>
                <div><p className="font-medium text-[#172b4d]">{tx.name}</p><p className="mt-0.5 text-xs text-[#7a8797]">{tx.date}</p></div>
              </div>
              <p className={`text-sm font-semibold ${tx.positive ? 'text-[#15805c]' : 'text-[#26364b]'}`}>{formatTransactionAmount(tx.amount)}</p>
            </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function formatBalance(balance: number) {
  return `${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`;
}

function formatTransactionAmount(amount: number) {
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`;
}

function transactionIcon(kind: 'card' | 'deposit' | 'bill' | 'transfer') {
  if (kind === 'card') return CreditCard;
  if (kind === 'deposit') return ArrowRightLeft;
  return Send;
}

