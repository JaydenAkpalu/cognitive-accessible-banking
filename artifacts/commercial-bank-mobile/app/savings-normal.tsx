import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, SecondaryButton, useBankingStyles } from '@/components/banking-ui';
import { useBanking, SavingsHolding } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

type NormalView =
  | 'overview'
  | 'portfolio'
  | 'investment-discovery'
  | 'investment-product'
  | 'investment-amount'
  | 'investment-review'
  | 'investment-success'
  | 'savings-discovery'
  | 'savings-detail'
  | 'savings-product'
  | 'savings-amount'
  | 'savings-review'
  | 'savings-success';

export type InvestmentProduct = {
  id: string;
  name: string;
  description: string;
  risk: string;
  minimum: number;
  performance: string;
  feeRate: number;
  fees: string;
  objective: string;
  risks: string;
  withdrawal: string;
};

export type SavingsProduct = {
  id: string;
  name: string;
  description: string;
  rate: number;
  minimum: number;
  access: string;
  term: string;
  fees: string;
  interest: string;
  conditions: string;
};

export const investmentProducts: InvestmentProduct[] = [
  {
    id: 'global-equity',
    name: 'Global Equity Fund',
    description: 'A diversified fund investing in shares from established companies around the world.',
    risk: 'Medium–High',
    minimum: 500,
    performance: '+8.2% over the previous 12 months',
    feeRate: 0.0075,
    fees: '0.75% annual management fee',
    objective: 'Long-term growth through a diversified global equity portfolio.',
    risks: 'Share prices can fall, and you could receive less than you invested.',
    withdrawal: 'Usually within 3–5 business days after a sale request.',
  },
  {
    id: 'uae-bond',
    name: 'UAE Bond Fund',
    description: 'A portfolio of UAE and regional fixed-income securities.',
    risk: 'Low–Medium',
    minimum: 500,
    performance: '+3.4% over the previous 12 months',
    feeRate: 0.004,
    fees: '0.40% annual management fee',
    objective: 'Generate income with less price movement than an equity fund.',
    risks: 'Bond prices and income can change when interest rates or issuer credit quality changes.',
    withdrawal: 'Usually within 2–4 business days after a sale request.',
  },
  {
    id: 'global-technology',
    name: 'Global Technology Fund',
    description: 'A focused fund investing in technology and innovation companies.',
    risk: 'High',
    minimum: 500,
    performance: '+12.6% over the previous 12 months',
    feeRate: 0.009,
    fees: '0.90% annual management fee',
    objective: 'Seek long-term growth from companies developing technology products and services.',
    risks: 'The focused sector exposure can lead to larger gains or losses.',
    withdrawal: 'Usually within 3–5 business days after a sale request.',
  },
];

export const savingsProducts: SavingsProduct[] = [
  {
    id: 'flexible-savings',
    name: 'Flexible Savings',
    description: 'Keep your money accessible while earning interest.',
    rate: 0.02,
    minimum: 1000,
    access: 'Withdraw when you need it.',
    term: 'No fixed term',
    fees: 'No monthly fee shown in this prototype.',
    interest: 'Interest is calculated daily and paid monthly.',
    conditions: 'The rate is variable and may change according to the product terms.',
  },
  {
    id: 'fixed-deposit',
    name: 'Fixed Deposit',
    description: 'Keep money deposited for a fixed period for a predetermined return.',
    rate: 0.0325,
    minimum: 1000,
    access: 'At maturity. Early withdrawal is subject to the product conditions.',
    term: '12 months',
    fees: 'No setup fee shown in this prototype.',
    interest: 'Interest is calculated on the deposit and paid at maturity.',
    conditions: 'Early withdrawal may reduce the interest you receive.',
  },
];

export default function NormalSavingsFlow() {
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(useColors());
  const { savings, completeSavingsInvestment, completeFixedDeposit } = useBanking();
  const [view, setView] = useState<NormalView>('overview');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('global-equity');
  const [selectedSavingsId, setSelectedSavingsId] = useState('fixed-deposit');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const actionSequence = useRef(0);
  const [investmentActionId, setInvestmentActionId] = useState(() => `investment-${Date.now()}-0`);
  const [depositActionId, setDepositActionId] = useState(() => `deposit-${Date.now()}-0`);
  const [completedInvestment, setCompletedInvestment] = useState<{ name: string; amount: number; fee: number } | null>(null);
  const [completedDeposit, setCompletedDeposit] = useState<{ name: string; amount: number; maturity: number } | null>(null);

  const selectedInvestment = investmentProducts.find((product) => product.id === selectedInvestmentId) ?? investmentProducts[0];
  const selectedSavings = savingsProducts.find((product) => product.id === selectedSavingsId) ?? savingsProducts[0];
  const savingsTotal = savings.savingsBalance + savings.fixedDepositBalance;
  const totalValue = savingsTotal + savings.investmentValue;
  const investmentReturn = savings.investmentValue - savings.totalInvested;
  const investmentReturnPercent = savings.totalInvested > 0 ? (investmentReturn / savings.totalInvested) * 100 : 0;

  const showInvestmentProduct = (id: string) => {
    setSelectedInvestmentId(id);
    setView('investment-product');
  };

  const showSavingsProduct = (id: string) => {
    setSelectedSavingsId(id);
    setView('savings-product');
  };

  const backToOverview = () => setView('overview');

  if (view === 'portfolio') {
    return (
      <PortfolioView
        holdings={savings.holdings}
        value={savings.investmentValue}
        invested={savings.totalInvested}
        returnValue={investmentReturn}
        returnPercent={investmentReturnPercent}
        onBack={backToOverview}
        onHoldingPress={(holding) => showInvestmentProduct(productIdForHolding(holding))}
      />
    );
  }

  if (view === 'investment-discovery') {
    return <InvestmentDiscovery onBack={backToOverview} onSelect={showInvestmentProduct} />;
  }

  if (view === 'investment-product') {
    return (
      <InvestmentProductView
        product={selectedInvestment}
        onBack={() => setView('investment-discovery')}
        onInvest={() => {
          actionSequence.current += 1;
          setInvestmentActionId(`investment-${Date.now()}-${actionSequence.current}`);
          setInvestmentAmount('');
          setView('investment-amount');
        }}
      />
    );
  }

  if (view === 'investment-amount') {
    return (
      <InvestmentAmountView
        product={selectedInvestment}
        amount={investmentAmount}
        available={savings.savingsBalance}
        onChange={setInvestmentAmount}
        onBack={() => setView('investment-product')}
        onContinue={() => setView('investment-review')}
      />
    );
  }

  if (view === 'investment-review') {
    const amount = parseMoney(investmentAmount);
    const fee = amount * selectedInvestment.feeRate;
    return (
      <InvestmentReviewView
        product={selectedInvestment}
        amount={amount}
        fee={fee}
        onBack={() => setView('investment-amount')}
        onConfirm={() => {
          completeSavingsInvestment({
            actionId: investmentActionId,
            productId: selectedInvestment.id,
            productName: selectedInvestment.name,
            amount,
            fee,
          });
          setCompletedInvestment({ name: selectedInvestment.name, amount, fee });
          setView('investment-success');
        }}
      />
    );
  }

  if (view === 'investment-success' && completedInvestment) {
    return <InvestmentSuccessView result={completedInvestment} onOverview={backToOverview} onPortfolio={() => setView('portfolio')} />;
  }

  if (view === 'savings-discovery') {
    return <SavingsDiscovery onBack={backToOverview} onSelect={showSavingsProduct} />;
  }

  if (view === 'savings-detail') {
    return (
      <SavingsDetailView
        name={savings.additionalSavingsName || 'Savings Account'}
        balance={savings.fixedDepositBalance > 0 ? savings.fixedDepositBalance : savings.savingsBalance}
        rate={savings.fixedDepositBalance > 0 ? savings.fixedDepositRate : 0.02}
        access={savings.additionalSavingsAccess || 'Available when you need it.'}
        term={savings.fixedDepositBalance > 0 && savings.fixedDepositTermMonths > 0 ? `${savings.fixedDepositTermMonths} months` : 'No fixed term'}
        onBack={backToOverview}
        onOpen={() => {
          setSelectedSavingsId(savings.fixedDepositBalance > 0 ? 'fixed-deposit' : 'flexible-savings');
          actionSequence.current += 1;
          setDepositActionId(`deposit-${Date.now()}-${actionSequence.current}`);
          setDepositAmount('');
          setView('savings-amount');
        }}
      />
    );
  }

  if (view === 'savings-product') {
    return (
      <SavingsProductView
        product={selectedSavings}
        onBack={() => setView('savings-discovery')}
        onOpen={() => {
          actionSequence.current += 1;
          setDepositActionId(`deposit-${Date.now()}-${actionSequence.current}`);
          setDepositAmount('');
          setView('savings-amount');
        }}
      />
    );
  }

  if (view === 'savings-amount') {
    return (
      <SavingsAmountView
        product={selectedSavings}
        amount={depositAmount}
        available={savings.savingsBalance}
        onChange={setDepositAmount}
        onBack={() => setView('savings-product')}
        onContinue={() => setView('savings-review')}
      />
    );
  }

  if (view === 'savings-review') {
    const amount = parseMoney(depositAmount);
    const maturity = amount * (1 + selectedSavings.rate * termYears(selectedSavings.term));
    return (
      <SavingsReviewView
        product={selectedSavings}
        amount={amount}
        maturity={maturity}
        onBack={() => setView('savings-amount')}
        onConfirm={() => {
          completeFixedDeposit({
            actionId: depositActionId,
            amount,
            productName: selectedSavings.name,
            access: selectedSavings.access,
            rate: selectedSavings.rate,
            termMonths: termInMonths(selectedSavings.term),
          });
          setCompletedDeposit({ name: selectedSavings.name, amount, maturity });
          setView('savings-success');
        }}
      />
    );
  }

  if (view === 'savings-success' && completedDeposit) {
    return <SavingsSuccessView result={completedDeposit} onOverview={backToOverview} />;
  }

  return (
    <View style={{ marginTop: 24, gap: 24 }}>
      <View style={localStyles.overviewCard}>
        <Text style={localStyles.overviewLabel}>Total savings &amp; investments</Text>
        <Text style={localStyles.overviewValue}>{formatMoney(totalValue)}</Text>
        <View style={localStyles.breakdownRow}>
          <OverviewMetric label="Savings" value={formatMoney(savingsTotal)} />
          <OverviewMetric label="Investments" value={formatMoney(savings.investmentValue)} />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <SectionTitle title="Savings" action="Explore savings options" onAction={() => setView('savings-discovery')} />
        <SavingsAccountCard
          balance={savings.savingsBalance}
          onPress={() => setView('savings-detail')}
        />
        {savings.fixedDepositBalance > 0 && (
          <SavingsAccountCard
            name={savings.additionalSavingsName || 'Fixed Deposit'}
            balance={savings.fixedDepositBalance}
            rate={savings.fixedDepositRate}
            access={savings.additionalSavingsAccess}
            onPress={() => setView('savings-detail')}
          />
        )}
      </View>

      <View style={{ gap: 12 }}>
        <SectionTitle title="Investments" action="Explore investments" onAction={() => setView('investment-discovery')} />
        <InvestmentPortfolioCard
          value={savings.investmentValue}
          invested={savings.totalInvested}
          returnValue={investmentReturn}
          returnPercent={investmentReturnPercent}
          onPress={() => setView('portfolio')}
        />
      </View>

      <Text style={styles.helper}>Balances and performance are fictional examples for this prototype.</Text>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAction} accessibilityRole="button">
        <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{action}</Text>
      </Pressable>
    </View>
  );
}

function SavingsAccountCard({
  name = 'Savings Account',
  balance,
  rate = 0.02,
  access = 'Available balance',
  onPress,
}: {
  name?: string;
  balance: number;
  rate?: number;
  access?: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const styles = getNormalSavingsStyles(colors);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]} accessibilityRole="button" accessibilityLabel={`View details for ${name}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: colors.blueSoft }]}><Ionicons name="wallet-outline" size={21} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardDescription}>{access}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
      <Text style={styles.cardAmount}>{formatMoney(balance)}</Text>
      <View style={styles.detailGrid}>
        <Metric label="Interest rate" value={`${formatPercent(rate)} p.a.`} />
        <Metric label="Available balance" value={formatMoney(balance)} />
      </View>
      <Text style={styles.cardLink}>View details</Text>
    </Pressable>
  );
}

function InvestmentPortfolioCard({
  value,
  invested,
  returnValue,
  returnPercent,
  onPress,
}: {
  value: number;
  invested: number;
  returnValue: number;
  returnPercent: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const styles = getNormalSavingsStyles(colors);
  const isPositive = returnValue >= 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]} accessibilityRole="button" accessibilityLabel="View investment portfolio">
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}><Ionicons name="trending-up-outline" size={21} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Investment Portfolio</Text>
          <Text style={styles.cardDescription}>Value can rise or fall.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
      <Text style={styles.cardAmount}>{formatMoney(value)}</Text>
      <View style={styles.detailGrid}>
        <Metric label="Amount invested" value={formatMoney(invested)} />
        <Metric label="Return" value={`${formatSignedMoney(returnValue)} · ${formatSignedPercent(returnPercent)}`} valueColor={isPositive ? colors.success : colors.magentaDeep} />
      </View>
      <Text style={styles.cardLink}>View portfolio</Text>
    </Pressable>
  );
}

function Metric({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const styles = getNormalSavingsStyles(useColors());
  return (
    <View style={{ flex: 1, minWidth: '44%', gap: 3 }}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={{ color: colors.white, opacity: 0.62, fontFamily: 'Inter_400Regular', fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>{value}</Text>
    </View>
  );
}

function PortfolioView({
  holdings,
  value,
  invested,
  returnValue,
  returnPercent,
  onBack,
  onHoldingPress,
}: {
  holdings: SavingsHolding[];
  value: number;
  invested: number;
  returnValue: number;
  returnPercent: number;
  onBack: () => void;
  onHoldingPress: (holding: SavingsHolding) => void;
}) {
  const colors = useColors();
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to overview" onPress={onBack} />
      <Text style={styles.pageTitle}>Investment portfolio</Text>
      <View style={localStyles.summaryCard}>
        <Metric label="Portfolio value" value={formatMoney(value)} />
        <Metric label="Total invested" value={formatMoney(invested)} />
        <Metric label="Gain / loss" value={`${formatSignedMoney(returnValue)} · ${formatSignedPercent(returnPercent)}`} valueColor={returnValue >= 0 ? colors.success : colors.magentaDeep} />
      </View>
      <Text style={styles.sectionTitle}>Holdings</Text>
      <View style={{ gap: 10 }}>
        {holdings.map((holding) => (
          <HoldingRow key={holding.id} holding={holding} onPress={() => onHoldingPress(holding)} />
        ))}
      </View>
      <Text style={styles.helper}>Holdings and performance are fictional mock data.</Text>
    </View>
  );
}

function HoldingRow({ holding, onPress }: { holding: SavingsHolding; onPress: () => void }) {
  const colors = useColors();
  const styles = getNormalSavingsStyles(colors);
  const result = holding.value - holding.invested;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.rowCard, pressed && { opacity: 0.78 }]} accessibilityRole="button">
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{holding.name}</Text>
        <Text style={styles.cardDescription}>Invested {formatMoney(holding.invested)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 3 }}>
        <Text style={styles.metricValue}>{formatMoney(holding.value)}</Text>
        <Text style={[styles.metricLabel, { color: result >= 0 ? colors.success : colors.magentaDeep }]}>{formatSignedMoney(result)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function InvestmentDiscovery({ onBack, onSelect }: { onBack: () => void; onSelect: (id: string) => void }) {
  const styles = useBankingStyles();
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to overview" onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>Explore investments</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Compare fictional products before deciding.</Text>
      </View>
      {investmentProducts.map((product) => <InvestmentProductCard key={product.id} product={product} onPress={() => onSelect(product.id)} />)}
      <Text style={styles.helper}>Historical performance is not a prediction of future returns.</Text>
    </View>
  );
}

function InvestmentProductCard({ product, onPress }: { product: InvestmentProduct; onPress: () => void }) {
  const colors = useColors();
  const styles = getNormalSavingsStyles(colors);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]} accessibilityRole="button">
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{product.name}</Text>
          <Text style={styles.cardDescription}>{product.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
      <View style={styles.detailGrid}>
        <Metric label="Risk level" value={product.risk} />
        <Metric label="Minimum investment" value={formatMoney(product.minimum)} />
        <Metric label="Performance" value={product.performance} />
        <Metric label="Fees" value={product.fees} />
      </View>
      <Text style={styles.cardLink}>View details</Text>
    </Pressable>
  );
}

function InvestmentProductView({ product, onBack, onInvest }: { product: InvestmentProduct; onBack: () => void; onInvest: () => void }) {
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to investments" onPress={onBack} />
      <View style={localStyles.summaryCard}>
        <Text style={styles.sectionTitle}>{product.name}</Text>
        <Text style={styles.subtitle}>{product.description}</Text>
        <DetailList items={[
          ['Risk level', product.risk],
          ['Minimum investment', formatMoney(product.minimum)],
          ['Fees', product.fees],
          ['Historical performance', `${product.performance} (historical)`],
          ['Investment objective', product.objective],
          ['Potential risks', product.risks],
          ['How it works', 'Your money is invested across the fund holdings and its value changes with the market.'],
          ['When you can sell / withdraw', product.withdrawal],
        ]} />
      </View>
      <PrimaryButton label="Invest" onPress={onInvest} />
    </View>
  );
}

function InvestmentAmountView({
  product,
  amount,
  available,
  onChange,
  onBack,
  onContinue,
}: {
  product: InvestmentProduct;
  amount: string;
  available: number;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const colors = useColors();
  const styles = useBankingStyles();
  const value = parseMoney(amount);
  const fee = value * product.feeRate;
  const amountValid = value >= product.minimum && value <= available && value + fee <= available;
  const showError = amount.length > 0 && !amountValid;
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to product" onPress={onBack} />
      <Text style={styles.pageTitle}>How much would you like to invest?</Text>
      <View style={styles.card}>
        <Text style={styles.reviewLabel}>Investment</Text>
        <Text style={[styles.reviewValue, { marginTop: 4 }]}>{product.name}</Text>
      </View>
      <View>
        <Text style={styles.inputLabel}>Amount</Text>
        <View style={{ position: 'relative' }}>
          <Text style={{ position: 'absolute', left: 16, top: 17, zIndex: 1, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15 }}>AED</Text>
          <TextInput
            value={amount}
            onChangeText={(next) => onChange(next.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, { paddingLeft: 64, minHeight: 70, fontSize: 26, fontFamily: 'Inter_700Bold' }]}
          />
        </View>
        <Text style={styles.helper}>Available balance: {formatMoney(available)} · Minimum investment: {formatMoney(product.minimum)}</Text>
        {showError && <Text style={{ color: colors.magentaDeep, fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 7 }}>{value < product.minimum ? `Enter at least ${formatMoney(product.minimum)}.` : value + fee > available ? 'This amount and fee exceed your available balance.' : 'Enter an amount within your available balance.'}</Text>}
      </View>
      {amountValid && (
        <View style={styles.card}>
          <DetailList items={[['Fee', formatMoney(fee)], ['Total', formatMoney(value + fee)], ['Risk level', product.risk]]} />
        </View>
      )}
      <PrimaryButton label="Continue to review" onPress={onContinue} disabled={!amountValid} />
    </View>
  );
}

function InvestmentReviewView({ product, amount, fee, onBack, onConfirm }: { product: InvestmentProduct; amount: number; fee: number; onBack: () => void; onConfirm: () => void }) {
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back / Edit" onPress={onBack} />
      <Text style={styles.pageTitle}>Review investment</Text>
      <View style={localStyles.summaryCard}>
        <DetailList items={[
          ['Investment', product.name],
          ['Amount', formatMoney(amount)],
          ['Fee', formatMoney(fee)],
          ['Total', formatMoney(amount + fee)],
          ['Risk level', product.risk],
        ]} />
      </View>
      <View style={localStyles.notice}>
        <Text style={styles.reviewLabel}>Before you confirm</Text>
        <Text style={styles.helper}>Investment values can go up or down. You could receive less than you invested.</Text>
      </View>
      <PrimaryButton label="Confirm Investment" onPress={onConfirm} />
    </View>
  );
}

function InvestmentSuccessView({ result, onOverview, onPortfolio }: { result: { name: string; amount: number; fee: number }; onOverview: () => void; onPortfolio: () => void }) {
  const colors = useColors();
  const styles = useBankingStyles();
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <View style={styles.successScreen}>
        <View style={styles.successIcon}><Ionicons name="checkmark" size={52} color={colors.success} /></View>
        <Text style={styles.successTitle}>Investment complete</Text>
        <Text style={styles.successSubtitle}>{formatMoney(result.amount)} invested in {result.name}.</Text>
        <View style={[styles.referenceCard, { marginTop: 24 }]}>
          <Detail label="Fee" value={formatMoney(result.fee)} />
          <Detail label="Reference" value="INV-548291" />
        </View>
      </View>
      <PrimaryButton label="View portfolio" onPress={onPortfolio} />
      <SecondaryButton label="Back to overview" onPress={onOverview} />
    </View>
  );
}

function SavingsDiscovery({ onBack, onSelect }: { onBack: () => void; onSelect: (id: string) => void }) {
  const styles = useBankingStyles();
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to overview" onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>Explore savings options</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Compare access, rates, and terms.</Text>
      </View>
      {savingsProducts.map((product) => (
        <SavingsProductCard key={product.id} product={product} onPress={() => onSelect(product.id)} />
      ))}
    </View>
  );
}

function SavingsProductCard({ product, onPress }: { product: SavingsProduct; onPress: () => void }) {
  const colors = useColors();
  const styles = getNormalSavingsStyles(colors);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]} accessibilityRole="button">
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{product.name}</Text>
          <Text style={styles.cardDescription}>{product.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </View>
      <View style={styles.detailGrid}>
        <Metric label="Interest rate" value={`${formatPercent(product.rate)} p.a.`} />
        <Metric label="Minimum amount" value={formatMoney(product.minimum)} />
        <Metric label="Access" value={product.access} />
        <Metric label="Term" value={product.term} />
      </View>
      <Text style={styles.cardLink}>View details</Text>
    </Pressable>
  );
}

function SavingsProductView({ product, onBack, onOpen }: { product: SavingsProduct; onBack: () => void; onOpen: () => void }) {
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to savings options" onPress={onBack} />
      <View style={localStyles.summaryCard}>
        <Text style={styles.sectionTitle}>{product.name}</Text>
        <Text style={styles.subtitle}>{product.description}</Text>
        <DetailList items={[
          ['Interest rate', `${formatPercent(product.rate)} p.a.`],
          ['Minimum amount', formatMoney(product.minimum)],
          ['Access / withdrawal', product.access],
          ['Term', product.term],
          ['Fees', product.fees],
          ['How interest is calculated', product.interest],
          ['Important conditions', product.conditions],
        ]} />
      </View>
      <PrimaryButton label="Open Account" onPress={onOpen} />
    </View>
  );
}

function SavingsDetailView({ name, balance, rate, access, term, onBack, onOpen }: { name: string; balance: number; rate: number; access: string; term: string; onBack: () => void; onOpen: () => void }) {
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to overview" onPress={onBack} />
      <Text style={styles.pageTitle}>{name}</Text>
      <View style={localStyles.summaryCard}>
        <Text style={styles.reviewLabel}>Current balance</Text>
        <Text style={localStyles.largeAmount}>{formatMoney(balance)}</Text>
        <DetailList items={[
          ['Interest rate', `${formatPercent(rate)} p.a.`],
          ['Access', access],
          ['Term', term],
          ['Interest earned', formatMoney(balance * rate)],
          ['Next interest payment', term === 'No fixed term' ? 'Monthly' : 'At maturity'],
          ['Account status', 'Active'],
        ]} />
      </View>
      <PrimaryButton label="Open another savings product" onPress={onOpen} />
    </View>
  );
}

function SavingsAmountView({ product, amount, available, onChange, onBack, onContinue }: { product: SavingsProduct; amount: string; available: number; onChange: (value: string) => void; onBack: () => void; onContinue: () => void }) {
  const colors = useColors();
  const styles = useBankingStyles();
  const value = parseMoney(amount);
  const maturity = value * (1 + product.rate * termYears(product.term));
  const valid = value >= product.minimum && value <= available;
  const showError = amount.length > 0 && !valid;
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back to product" onPress={onBack} />
      <Text style={styles.pageTitle}>How much would you like to deposit?</Text>
      <View style={styles.card}>
        <Text style={styles.reviewLabel}>Product</Text>
        <Text style={[styles.reviewValue, { marginTop: 4 }]}>{product.name}</Text>
      </View>
      <View>
        <Text style={styles.inputLabel}>Deposit amount</Text>
        <View style={{ position: 'relative' }}>
          <Text style={{ position: 'absolute', left: 16, top: 17, zIndex: 1, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15 }}>AED</Text>
          <TextInput
            value={amount}
            onChangeText={(next) => onChange(next.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, { paddingLeft: 64, minHeight: 70, fontSize: 26, fontFamily: 'Inter_700Bold' }]}
          />
        </View>
        <Text style={styles.helper}>Available balance: {formatMoney(available)} · Minimum amount: {formatMoney(product.minimum)}</Text>
        {showError && <Text style={{ color: colors.magentaDeep, fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 7 }}>{value < product.minimum ? `Enter at least ${formatMoney(product.minimum)}.` : 'This amount exceeds your available balance.'}</Text>}
      </View>
      {valid && (
        <View style={styles.card}>
          <DetailList items={[
            ['Term', product.term],
            ['Interest rate', `${formatPercent(product.rate)} p.a.`],
            ['Estimated maturity amount', formatMoney(maturity)],
          ]} />
        </View>
      )}
      <PrimaryButton label="Continue to review" onPress={onContinue} disabled={!valid} />
    </View>
  );
}

function SavingsReviewView({ product, amount, maturity, onBack, onConfirm }: { product: SavingsProduct; amount: number; maturity: number; onBack: () => void; onConfirm: () => void }) {
  const styles = useBankingStyles();
  const localStyles = getNormalSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <SecondaryButton label="Back / Edit" onPress={onBack} />
      <Text style={styles.pageTitle}>Review</Text>
      <View style={localStyles.summaryCard}>
        <DetailList items={[
          ['Product', product.name],
          ['Deposit', formatMoney(amount)],
          ['Term', product.term],
          ['Interest rate', `${formatPercent(product.rate)} p.a.`],
          ['Estimated maturity amount', formatMoney(maturity)],
        ]} />
      </View>
      <Text style={styles.helper}>This is an estimate based on the fictional rate shown. Product terms may affect the amount.</Text>
      <PrimaryButton label="Confirm" onPress={onConfirm} />
    </View>
  );
}

function SavingsSuccessView({ result, onOverview }: { result: { name: string; amount: number; maturity: number }; onOverview: () => void }) {
  const colors = useColors();
  const styles = useBankingStyles();
  return (
    <View style={{ marginTop: 24, gap: 18 }}>
      <View style={styles.successScreen}>
        <View style={styles.successIcon}><Ionicons name="checkmark" size={52} color={colors.success} /></View>
        <Text style={styles.successTitle}>Savings product opened</Text>
        <Text style={styles.successSubtitle}>{formatMoney(result.amount)} deposited into {result.name}.</Text>
        <View style={[styles.referenceCard, { marginTop: 24 }]}>
          <Detail label="Estimated maturity" value={formatMoney(result.maturity)} />
          <Detail label="Reference" value="SAV-548291" />
        </View>
      </View>
      <PrimaryButton label="Back to overview" onPress={onOverview} />
    </View>
  );
}

function DetailList({ items }: { items: Array<[string, string]> }) {
  const styles = useBankingStyles();
  return (
    <View style={{ gap: 14, marginTop: 14 }}>
      {items.map(([label, value]) => (
        <View key={label} style={{ gap: 3 }}>
          <Text style={styles.reviewLabel}>{label}</Text>
          <Text style={styles.reviewValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function Detail({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const styles = useBankingStyles();
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function productIdForHolding(holding: SavingsHolding) {
  return investmentProducts.some((product) => product.id === holding.id) ? holding.id : investmentProducts[0].id;
}

function termInMonths(term: string) {
  const match = term.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function termYears(term: string) {
  return termInMonths(term) / 12;
}

function parseMoney(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return `AED ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatSignedMoney(value: number) {
  return `${value >= 0 ? '+' : '−'}${formatMoney(Math.abs(value))}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(1)}%`;
}

const getNormalSavingsStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overviewCard: {
      padding: 20,
      borderRadius: 18,
      backgroundColor: colors.navyDeep,
    },
    overviewLabel: {
      color: colors.white,
      opacity: 0.78,
      fontFamily: 'Inter_500Medium',
      fontSize: 13,
    },
    overviewValue: {
      color: colors.white,
      fontFamily: 'Inter_700Bold',
      fontSize: 30,
      marginTop: 7,
    },
    breakdownRow: {
      flexDirection: 'row',
      gap: 24,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.2)',
      marginTop: 18,
      paddingTop: 16,
    },
    card: {
      padding: 16,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 12,
    },
    rowCard: {
      padding: 16,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      color: colors.navyDeep,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
    },
    cardDescription: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    cardAmount: {
      color: colors.navyDeep,
      fontFamily: 'Inter_700Bold',
      fontSize: 25,
    },
    detailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      paddingTop: 2,
    },
    metricLabel: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      lineHeight: 16,
    },
    metricValue: {
      color: colors.navyDeep,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      lineHeight: 19,
    },
    cardLink: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    summaryCard: {
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 14,
    },
    notice: {
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.blueSoft,
      gap: 4,
    },
    largeAmount: {
      color: colors.navyDeep,
      fontFamily: 'Inter_700Bold',
      fontSize: 28,
      marginTop: 6,
    },
  });