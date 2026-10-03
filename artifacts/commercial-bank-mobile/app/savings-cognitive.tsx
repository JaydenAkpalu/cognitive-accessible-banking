import React, { useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExplainBankingContext } from '@workspace/api-client-react';
import { BackButton, PrimaryButton, SecondaryButton, useBankingStyles } from '@/components/banking-ui';
import { InvestmentProduct, SavingsProduct, investmentProducts, savingsProducts } from '@/app/savings-normal';
import { SavingsHolding, useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

type CognitiveView =
  | 'menu'
  | 'savings-menu'
  | 'money-summary'
  | 'investment-menu'
  | 'investment-discovery'
  | 'investment-learn'
  | 'overview'
  | 'portfolio'
  | 'investment-details'
  | 'investment-flow'
  | 'investment-success'
  | 'savings-details'
  | 'savings-products'
  | 'savings-product'
  | 'savings-amount'
  | 'savings-review'
  | 'savings-confirm'
  | 'savings-success';

type InvestmentResult = { name: string; amount: number; fee: number };
type SavingsResult = { name: string; amount: number };
type CognitiveTask = 'save' | 'invest' | 'money';

export default function CognitiveSavingsFlow() {
  const colors = useColors();
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(colors);
  const { savings, preferences, completeSavingsInvestment, completeFixedDeposit } = useBanking();
  const [view, setView] = useState<CognitiveView>('menu');
  const [savingsProductsReturnView, setSavingsProductsReturnView] = useState<CognitiveView>('savings-menu');
  const [savingsAmountReturnView, setSavingsAmountReturnView] = useState<CognitiveView>('savings-product');
  const [savingsDetailsReturnView, setSavingsDetailsReturnView] = useState<CognitiveView>('money-summary');
  const [investmentDetailsReturnView, setInvestmentDetailsReturnView] = useState<CognitiveView>('investment-discovery');
  const [portfolioReturnView, setPortfolioReturnView] = useState<CognitiveView>('money-summary');
  const [savingsOpenIntent, setSavingsOpenIntent] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('global-equity');
  const [selectedSavingsId, setSelectedSavingsId] = useState(savingsProducts[0].id);
  const [investmentStep, setInvestmentStep] = useState(1);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [investmentActionId, setInvestmentActionId] = useState(`cognitive-investment-${Date.now()}`);
  const [savingsActionId, setSavingsActionId] = useState(`cognitive-savings-${Date.now()}`);
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
  const [savingsResult, setSavingsResult] = useState<SavingsResult | null>(null);
  const actionSequence = useRef(0);

  const selectedInvestment = investmentProducts.find((product) => product.id === selectedInvestmentId) ?? investmentProducts[0];
  const selectedSavings = savingsProducts.find((product) => product.id === selectedSavingsId) ?? savingsProducts[0];

  const openInvestmentDetails = (id = selectedInvestmentId, returnView: CognitiveView = 'investment-discovery') => {
    setSelectedInvestmentId(id);
    setInvestmentDetailsReturnView(returnView);
    setShowFullDetails(false);
    setView('investment-details');
  };

  const beginInvestment = () => {
    actionSequence.current += 1;
    setInvestmentActionId(`cognitive-investment-${Date.now()}-${actionSequence.current}`);
    setInvestmentAmount('');
    setInvestmentStep(1);
    setView('investment-flow');
  };

  const beginSavingsProduct = (id = selectedSavingsId, returnView: CognitiveView = 'savings-product') => {
    setSelectedSavingsId(id);
    setSavingsAmount('');
    setSavingsAmountReturnView(returnView);
    actionSequence.current += 1;
    setSavingsActionId(`cognitive-savings-${Date.now()}-${actionSequence.current}`);
    setView('savings-amount');
  };

  const showSavingsProduct = (id = selectedSavingsId) => {
    setSelectedSavingsId(id);
    setView('savings-product');
  };

  const openPortfolio = (returnView: CognitiveView) => {
    setPortfolioReturnView(returnView);
    setView('portfolio');
  };

  const openTask = (task: CognitiveTask) => {
    if (task === 'save') {
      setView('savings-menu');
    } else if (task === 'invest') {
      setView('investment-menu');
    } else {
      setView('money-summary');
    }
  };

  const totalSavings = savings.savingsBalance + savings.fixedDepositBalance;
  const totalValue = totalSavings + savings.investmentValue;
  const investmentGain = savings.investmentValue - savings.totalInvested;
  const investmentGainPercent = savings.totalInvested > 0 ? (investmentGain / savings.totalInvested) * 100 : 0;

  if (view === 'menu') {
    return <CognitiveTaskMenu preferences={preferences} onSelect={openTask} />;
  }

  if (view === 'savings-menu') {
    return (
      <CognitiveSavingsTaskMenu
        preferences={preferences}
        onBack={() => setView('menu')}
        onExplore={() => {
          setSavingsProductsReturnView('savings-menu');
          setSavingsOpenIntent(false);
          setView('savings-products');
        }}
        onOpen={() => {
          setSavingsProductsReturnView('savings-menu');
          setSavingsOpenIntent(true);
          setView('savings-products');
        }}
        onSavings={() => {
          setSavingsDetailsReturnView('savings-menu');
          setView('savings-details');
        }}
      />
    );
  }

  if (view === 'money-summary') {
    return (
      <CognitiveMoneySummary
        total={totalValue}
        savings={totalSavings}
        investments={savings.investmentValue}
        onBack={() => setView('menu')}
        onSavings={() => {
          setSavingsDetailsReturnView('money-summary');
          setView('savings-details');
        }}
        onInvestments={() => openPortfolio('money-summary')}
      />
    );
  }

  if (view === 'investment-menu') {
    return (
      <CognitiveInvestmentMenu
        preferences={preferences}
        onBack={() => setView('menu')}
        onExplore={() => setView('investment-discovery')}
        onPortfolio={() => openPortfolio('investment-menu')}
        onLearn={() => setView('investment-learn')}
      />
    );
  }

  if (view === 'investment-discovery') {
    return (
      <CognitiveInvestmentDiscovery
        product={selectedInvestment}
        productIndex={Math.max(0, investmentProducts.findIndex((product) => product.id === selectedInvestment.id))}
        onBack={() => setView('investment-menu')}
        onNext={() => {
          const currentIndex = investmentProducts.findIndex((product) => product.id === selectedInvestment.id);
          const nextProduct = investmentProducts[(currentIndex + 1) % investmentProducts.length];
          setSelectedInvestmentId(nextProduct.id);
        }}
        onUnderstand={() => openInvestmentDetails(selectedInvestment.id, 'investment-discovery')}
      />
    );
  }

  if (view === 'investment-learn') {
    return <CognitiveLearnInvesting preferences={preferences} onBack={() => setView('investment-menu')} />;
  }

  if (view === 'portfolio') {
    return (
      <CognitivePortfolio
        holdings={savings.holdings}
        value={savings.investmentValue}
        invested={savings.totalInvested}
        gain={investmentGain}
        gainPercent={investmentGainPercent}
        onBack={() => setView(portfolioReturnView)}
        onSelectHolding={(holding) => openInvestmentDetails(productIdForHolding(holding), 'portfolio')}
      />
    );
  }

  if (view === 'investment-details') {
    return (
      <CognitiveInvestmentDetails
        product={selectedInvestment}
        preferences={preferences}
        showFullDetails={showFullDetails}
        onToggleDetails={() => setShowFullDetails((visible) => !visible)}
        onBack={() => setView(investmentDetailsReturnView)}
        onInvest={beginInvestment}
      />
    );
  }

  if (view === 'investment-flow') {
    return (
      <CognitiveInvestmentFlow
        product={selectedInvestment}
        preferences={preferences}
        step={investmentStep}
        amount={investmentAmount}
        available={savings.savingsBalance}
        onAmountChange={setInvestmentAmount}
        onStepChange={setInvestmentStep}
        onBack={() => setView('investment-details')}
        onConfirm={() => {
          const amount = parseMoney(investmentAmount);
          const fee = amount * selectedInvestment.feeRate;
          completeSavingsInvestment({
            actionId: investmentActionId,
            productId: selectedInvestment.id,
            productName: selectedInvestment.name,
            amount,
            fee,
          });
          setInvestmentResult({ name: selectedInvestment.name, amount, fee });
          setView('investment-success');
        }}
      />
    );
  }

  if (view === 'investment-success' && investmentResult) {
    return (
      <CognitiveSuccess
        title="Investment confirmed"
        description={`${formatMoney(investmentResult.amount)} invested in ${investmentResult.name}.`}
        details={[['Fee', formatMoney(investmentResult.fee)], ['Status', 'Added to your portfolio']]}
        primaryLabel="View updated portfolio"
        onPrimary={() => openPortfolio('investment-success')}
        onSecondary={() => setView('menu')}
      />
    );
  }

  if (view === 'savings-details') {
    return (
      <CognitiveSavingsDetails
        balance={savings.savingsBalance}
        additionalBalance={savings.fixedDepositBalance}
        additionalName={savings.additionalSavingsName}
        rate={savings.fixedDepositBalance > 0 ? savings.fixedDepositRate : 0.02}
        access={savings.additionalSavingsAccess || 'You can use the savings balance when you need it.'}
        onBack={() => setView(savingsDetailsReturnView)}
        onExplore={() => {
          setSavingsProductsReturnView('savings-details');
          setSavingsOpenIntent(false);
          setView('savings-products');
        }}
      />
    );
  }

  if (view === 'savings-products') {
    return (
      <CognitiveSavingsProducts
        preferences={preferences}
        product={selectedSavings}
        productIndex={Math.max(0, savingsProducts.findIndex((product) => product.id === selectedSavings.id))}
        openIntent={savingsOpenIntent}
        onBack={() => setView(savingsProductsReturnView)}
        onNext={() => {
          const currentIndex = savingsProducts.findIndex((product) => product.id === selectedSavings.id);
          const nextProduct = savingsProducts[(currentIndex + 1) % savingsProducts.length];
          setSelectedSavingsId(nextProduct.id);
        }}
        onLearn={() => showSavingsProduct(selectedSavings.id)}
        onOpen={() => beginSavingsProduct(selectedSavings.id, 'savings-products')}
      />
    );
  }

  if (view === 'savings-product') {
    return (
      <CognitiveSavingsProductDetails
        product={selectedSavings}
        preferences={preferences}
        onBack={() => setView('savings-products')}
        onOpen={() => beginSavingsProduct(selectedSavings.id, 'savings-product')}
      />
    );
  }

  if (view === 'savings-amount') {
    return (
      <CognitiveSavingsAmount
        product={selectedSavings}
        amount={savingsAmount}
        available={savings.savingsBalance}
        preferences={preferences}
        onChange={setSavingsAmount}
        onBack={() => setView(savingsAmountReturnView)}
        onContinue={() => setView('savings-review')}
      />
    );
  }

  if (view === 'savings-review') {
    return (
      <CognitiveSavingsReview
        product={selectedSavings}
        amount={parseMoney(savingsAmount)}
        preferences={preferences}
        onBack={() => setView('savings-amount')}
        onContinue={() => setView('savings-confirm')}
      />
    );
  }

  if (view === 'savings-confirm') {
    const amount = parseMoney(savingsAmount);
    return (
      <CognitiveSavingsConfirmation
        product={selectedSavings}
        amount={amount}
        preferences={preferences}
        onBack={() => setView('savings-review')}
        onConfirm={() => {
          completeFixedDeposit({
            actionId: savingsActionId,
            amount,
            productName: selectedSavings.name,
            access: selectedSavings.access,
            rate: selectedSavings.rate,
            termMonths: termInMonths(selectedSavings.term),
          });
          setSavingsResult({ name: selectedSavings.name, amount });
          setView('savings-success');
        }}
      />
    );
  }

  if (view === 'savings-success' && savingsResult) {
    return (
      <CognitiveSuccess
        title="Savings product opened"
        description={`${formatMoney(savingsResult.amount)} added to ${savingsResult.name}.`}
        details={[['Account', savingsResult.name], ['Amount', formatMoney(savingsResult.amount)], ['Status', 'Active']]}
        primaryLabel="Back to overview"
        onPrimary={() => setView('menu')}
      />
    );
  }

  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(24) }}>
      <CognitiveOverview
        totalValue={totalValue}
        savingsValue={totalSavings}
        investmentValue={savings.investmentValue}
        totalInvested={savings.totalInvested}
        investmentGain={investmentGain}
        investmentGainPercent={investmentGainPercent}
        savingsBalance={savings.savingsBalance}
        additionalSavingsBalance={savings.fixedDepositBalance}
        additionalSavingsName={savings.additionalSavingsName}
        preferences={preferences}
        onSavings={() => setView('savings-details')}
        onSavingsProducts={() => setView('savings-products')}
        onPortfolio={() => setView('portfolio')}
        onInvestment={() => openInvestmentDetails()}
        onExploreInvestments={() => openInvestmentDetails()}
      />
      {!preferences.reducedDistractions && (
        <View style={localStyles.contextNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={localStyles.contextNoteText}>This page explains your options. It does not recommend an investment.</Text>
        </View>
      )}
      <Text style={styles.helper}>Values and products are fictional examples for this prototype.</Text>
    </View>
  );
}

function CognitiveTaskMenu({
  preferences,
  onSelect,
}: {
  preferences: ReturnType<typeof useBanking>['preferences'];
  onSelect: (task: CognitiveTask) => void;
}) {
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(22) }}>
      <BackButton label={preferences.literalLanguage ? 'Go back' : 'Back'} />
      <Text style={styles.pageTitle}>Savings &amp; Investments</Text>
      <View style={localStyles.taskIntro}>
        <Text style={localStyles.taskQuestion}>What would you like to do?</Text>
      </View>
      <View style={{ gap: localStyles.spacing(12) }}>
        <CognitiveTaskAction
          icon="wallet-outline"
          title="Save money"
          description="Put money aside and earn interest."
          preferences={preferences}
          onPress={() => onSelect('save')}
        />
        <CognitiveTaskAction
          icon="trending-up-outline"
          title="Invest money"
          description="Put money into investments that can increase or decrease in value."
          preferences={preferences}
          onPress={() => onSelect('invest')}
        />
        <CognitiveTaskAction
          icon="eye-outline"
          title="See my money"
          description="See what you currently have in savings and investments."
          preferences={preferences}
          onPress={() => onSelect('money')}
        />
      </View>
    </View>
  );
}

function CognitiveSavingsTaskMenu({
  preferences,
  onBack,
  onExplore,
  onOpen,
  onSavings,
}: {
  preferences: ReturnType<typeof useBanking>['preferences'];
  onBack: () => void;
  onExplore: () => void;
  onOpen: () => void;
  onSavings: () => void;
}) {
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(useColors());

  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>Save money</Text>
        <Text style={[localStyles.taskQuestion, { marginTop: localStyles.spacing(8) }]}>What would you like to do?</Text>
      </View>
      <View style={{ gap: localStyles.spacing(12) }}>
        <CognitiveTaskAction icon="search-outline" title="Explore savings" description="Compare savings options one at a time." preferences={preferences} onPress={onExplore} />
        <CognitiveTaskAction icon="wallet-outline" title="Open a savings account" description="Choose an account and amount to start saving." preferences={preferences} onPress={onOpen} />
        <CognitiveTaskAction icon="eye-outline" title="See my savings" description="View your savings balance and access details." preferences={preferences} onPress={onSavings} />
      </View>
    </View>
  );
}

function CognitiveTaskAction({
  icon,
  title,
  description,
  preferences,
  selected = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  preferences: ReturnType<typeof useBanking>['preferences'];
  selected?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [localStyles.taskAction, selected && localStyles.taskActionSelected, pressed && { opacity: 0.78 }]}
    >
      {!preferences.reducedDistractions && (
        <View style={localStyles.taskActionIcon}>
          <Ionicons name={icon} size={23} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={localStyles.taskActionTitle}>{title}</Text>
        <Text style={localStyles.taskActionDescription}>{description}</Text>
      </View>
      <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={22} color={selected ? colors.primary : colors.mutedForeground} />
    </Pressable>
  );
}

function CognitiveBackLink({ label = 'Back', onPress }: { label?: string; onPress: () => void }) {
  const colors = useColors();
  const styles = useBankingStyles();
  return (
    <Pressable onPress={onPress} style={styles.backButton} accessibilityRole="button">
      <Ionicons name="arrow-back" size={20} color={colors.navyDeep} />
      <Text style={styles.backText}>{label}</Text>
    </Pressable>
  );
}

function CognitiveTextAction({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingVertical: 8 }, pressed && { opacity: 0.72 }]}
      accessibilityRole="button"
    >
      <Text style={localStyles.disclosureText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
    </Pressable>
  );
}

function CognitiveMoneySummary({
  total,
  savings,
  investments,
  onBack,
  onSavings,
  onInvestments,
}: {
  total: number;
  savings: number;
  investments: number;
  onBack: () => void;
  onSavings: () => void;
  onInvestments: () => void;
}) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <View style={localStyles.moneyCard}>
        <Text style={localStyles.moneyEyebrow}>Your money</Text>
        <Text style={localStyles.moneyValue}>{formatMoney(total)}</Text>
        <Text style={localStyles.moneyLabel}>Total savings &amp; investments</Text>
      </View>
      <View style={localStyles.moneySummaryCard}>
        <CognitiveMetric label="Savings" value={formatMoney(savings)} />
        <CognitiveMetric label="Investments" value={formatMoney(investments)} />
      </View>
      <View style={{ gap: localStyles.spacing(12) }}>
        <PrimaryButton label="View savings" onPress={onSavings} />
        <SecondaryButton label="View investments" onPress={onInvestments} />
      </View>
      <Text style={styles.helper}>Choose a category to see more details.</Text>
    </View>
  );
}

function CognitiveInvestmentMenu({
  preferences,
  onBack,
  onExplore,
  onPortfolio,
  onLearn,
}: {
  preferences: ReturnType<typeof useBanking>['preferences'];
  onBack: () => void;
  onExplore: () => void;
  onPortfolio: () => void;
  onLearn: () => void;
}) {
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>Invest money</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Investments can increase or decrease in value.</Text>
      </View>
      <Text style={localStyles.taskQuestion}>What would you like to do?</Text>
      <View style={{ gap: localStyles.spacing(12) }}>
        <CognitiveTaskAction icon="search-outline" title="Explore investments" description="Look at available investment products." preferences={preferences} onPress={onExplore} />
        <CognitiveTaskAction icon="briefcase-outline" title="See my investments" description="View investments you already own." preferences={preferences} onPress={onPortfolio} />
        <CognitiveTaskAction icon="help-circle-outline" title="Learn about investing" description="Understand how investing works." preferences={preferences} onPress={onLearn} />
      </View>
    </View>
  );
}

function CognitiveInvestmentDiscovery({
  product,
  productIndex,
  onBack,
  onNext,
  onUnderstand,
}: {
  product: InvestmentProduct;
  productIndex: number;
  onBack: () => void;
  onNext: () => void;
  onUnderstand: () => void;
}) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink label="Back to investment options" onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>Explore investments</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>One investment at a time. The choice remains yours.</Text>
      </View>
      <View style={localStyles.surfaceCard}>
        <Text style={localStyles.cardEyebrow}>Investment {productIndex + 1} of {investmentProducts.length}</Text>
        <Text style={localStyles.cardTitle}>{product.name}</Text>
        <Text style={localStyles.cardDescription}>{product.description.replace('A diversified fund investing in ', 'A fund that invests in ')}</Text>
        <CognitiveFact label="Risk" value={product.risk} />
        <CognitiveFact label="Minimum" value={formatMoney(product.minimum)} />
        <CognitiveFact label="Could I lose money?" value="Yes. The value can go up or down." />
        <CognitiveFact label="Yearly fee" value={product.fees} />
        <PrimaryButton label="Learn about this" onPress={onUnderstand} />
      </View>
      <CognitiveTextAction label="See another option" onPress={onNext} />
    </View>
  );
}

function CognitiveLearnInvesting({
  preferences,
  onBack,
}: {
  preferences: ReturnType<typeof useBanking>['preferences'];
  onBack: () => void;
}) {
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(useColors());
  const plain = preferences.literalLanguage;
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink label="Back to investment options" onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>Learn about investing</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Investing means putting money into something that can change in value.</Text>
      </View>
      <View style={localStyles.surfaceCard}>
        <CognitiveFact label={plain ? 'Value' : 'What can happen'} value="The value can increase or decrease." />
        <CognitiveFact label={plain ? 'Risk' : 'What could go wrong'} value="You could receive less money than you invested." />
        <CognitiveFact label={plain ? 'Time' : 'Why time matters'} value="Investments are usually considered over a longer period." />
        <CognitiveFact label={plain ? 'Choice' : 'Your decision'} value="Review the product information and decide for yourself. This page does not recommend an investment." />
      </View>
    </View>
  );
}

function CognitiveOverview({
  totalValue,
  savingsValue,
  investmentValue,
  totalInvested,
  investmentGain,
  investmentGainPercent,
  savingsBalance,
  additionalSavingsBalance,
  additionalSavingsName,
  preferences,
  onSavings,
  onSavingsProducts,
  onPortfolio,
  onInvestment,
  onExploreInvestments,
}: {
  totalValue: number;
  savingsValue: number;
  investmentValue: number;
  totalInvested: number;
  investmentGain: number;
  investmentGainPercent: number;
  savingsBalance: number;
  additionalSavingsBalance: number;
  additionalSavingsName: string;
  preferences: ReturnType<typeof useBanking>['preferences'];
  onSavings: () => void;
  onSavingsProducts: () => void;
  onPortfolio: () => void;
  onInvestment: () => void;
  onExploreInvestments: () => void;
}) {
  const colors = useColors();
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(colors);
  const plain = preferences.literalLanguage;
  return (
    <View style={{ gap: localStyles.spacing(22) }}>
      <View style={localStyles.moneyCard}>
        <Text style={localStyles.moneyEyebrow}>{plain ? 'Your money' : 'Portfolio overview'}</Text>
        <Text style={localStyles.moneyValue}>{formatMoney(totalValue)}</Text>
        <Text style={localStyles.moneyLabel}>{plain ? 'Total savings & investments' : 'Total portfolio value'}</Text>
        <View style={localStyles.moneyBreakdown}>
          <CognitiveMetric label="Savings" value={formatMoney(savingsValue)} light />
          <CognitiveMetric label="Investments" value={formatMoney(investmentValue)} light />
        </View>
      </View>

      <View style={{ gap: localStyles.spacing(10) }}>
        <CognitiveSectionTitle title="Savings" action={plain ? 'Explore options' : 'Browse savings products'} onAction={onSavingsProducts} />
        <Pressable onPress={onSavings} style={({ pressed }) => [localStyles.surfaceCard, pressed && { opacity: 0.78 }]} accessibilityRole="button">
          <View style={localStyles.cardHeader}>
            {!preferences.reducedDistractions && <View style={localStyles.iconCircle}><Ionicons name="wallet-outline" size={21} color={colors.primary} /></View>}
            <View style={{ flex: 1 }}>
              <Text style={localStyles.cardTitle}>{plain ? 'Savings account' : 'Savings account balance'}</Text>
              <Text style={localStyles.cardDescription}>{additionalSavingsBalance > 0 ? `${formatMoney(additionalSavingsBalance)} in ${additionalSavingsName || 'an additional savings product'}` : 'Money available when you need it.'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </View>
          <Text style={localStyles.cardAmount}>{formatMoney(savingsBalance)}</Text>
          {!preferences.minimalInformation && (
            <View style={localStyles.detailGrid}>
              <CognitiveMetric label={plain ? 'Interest rate' : 'Annual interest rate'} value="2.00% p.a." />
              <CognitiveMetric label={plain ? 'Access' : 'Liquidity'} value={plain ? 'When needed' : 'On demand'} />
            </View>
          )}
          <Text style={localStyles.cardLink}>{plain ? 'View savings details' : 'View account details'}</Text>
        </Pressable>
      </View>

      <View style={{ gap: localStyles.spacing(10) }}>
        <CognitiveSectionTitle title="Investments" action={plain ? 'Explore investments' : 'Browse investment products'} onAction={onExploreInvestments} />
        <Pressable onPress={onPortfolio} style={({ pressed }) => [localStyles.surfaceCard, pressed && { opacity: 0.78 }]} accessibilityRole="button">
          <View style={localStyles.cardHeader}>
            {!preferences.reducedDistractions && <View style={localStyles.iconCircle}><Ionicons name="trending-up-outline" size={21} color={colors.primary} /></View>}
            <View style={{ flex: 1 }}>
              <Text style={localStyles.cardTitle}>{plain ? 'Investment portfolio' : 'Investment portfolio value'}</Text>
              <Text style={localStyles.cardDescription}>{plain ? 'The value can go up or down.' : 'Market-linked holdings with variable value.'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </View>
          <Text style={localStyles.cardAmount}>{formatMoney(investmentValue)}</Text>
            <View style={localStyles.detailGrid}>
            <CognitiveMetric label={plain ? 'Amount invested' : 'Cost basis'} value={formatMoney(totalInvested)} />
            {!preferences.minimalInformation && (
              <CognitiveMetric label={plain ? 'Gain / loss' : 'Unrealized return'} value={`${formatSignedMoney(investmentGain)} · ${formatSignedPercent(investmentGainPercent)}`} valueColor={investmentGain >= 0 ? colors.success : colors.magentaDeep} />
            )}
          </View>
          <Text style={localStyles.cardLink}>{plain ? 'View portfolio details' : 'View holdings and performance'}</Text>
        </Pressable>
      </View>

      <View style={localStyles.decisionNote}>
        <Text style={localStyles.decisionNoteTitle}>{plain ? 'Important' : 'Investment information'}</Text>
        <Text style={localStyles.decisionNoteText}>{plain ? 'Investments can lose value. You could receive less money than you invested.' : 'Capital is at risk. Historical performance does not predict future returns.'}</Text>
      </View>
    </View>
  );
}

function CognitiveSectionTitle({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAction} accessibilityRole="button"><Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{action}</Text></Pressable>
    </View>
  );
}

function CognitiveInvestmentDetails({
  product,
  preferences,
  showFullDetails,
  onToggleDetails,
  onBack,
  onInvest,
}: {
  product: InvestmentProduct;
  preferences: ReturnType<typeof useBanking>['preferences'];
  showFullDetails: boolean;
  onToggleDetails: () => void;
  onBack: () => void;
  onInvest: () => void;
}) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  const plain = preferences.literalLanguage;
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>{product.name}</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>{plain ? product.description.replace('A diversified fund investing in ', 'A fund that invests in ') : product.description}</Text>
      </View>
      <View style={localStyles.surfaceCard}>
        <Text style={localStyles.cardEyebrow}>Investment details</Text>
        <CognitiveFact label="What is it?" value={product.description.replace('A diversified fund investing in ', 'A fund that invests in ')} />
        <CognitiveFact label="Risk" value={product.risk} />
        <CognitiveFact label="Could I lose money?" value="Yes. The value can go down, so you could receive less than you invested." />
        <CognitiveFact label="Minimum investment" value={formatMoney(product.minimum)} />
        <CognitiveFact label="Yearly fee" value={product.fees} />
        <View style={localStyles.warningCard}>
          <Text style={localStyles.warningTitle}>Risk and access</Text>
          <Text style={localStyles.warningText}>{product.risks}</Text>
          <Text style={localStyles.warningText}>Access: {product.withdrawal}</Text>
        </View>
        <Pressable onPress={onToggleDetails} style={localStyles.disclosureButton} accessibilityRole="button" accessibilityState={{ expanded: showFullDetails }}>
          <Text style={localStyles.disclosureText}>{showFullDetails ? 'Hide details' : 'Learn more'}</Text>
          <Ionicons name={showFullDetails ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
        </Pressable>
        {showFullDetails && (
          <View style={localStyles.fullDetails}>
            <CognitiveFact label="Investment objective" value={product.objective} />
            <CognitiveFact label="Past performance" value={`${product.performance} (historical only; it does not predict future returns).`} />
            <CognitiveFact label="How the fund works" value="Your money is spread across the fund holdings. The value changes as those holdings change in value." />
          </View>
        )}
      </View>
      <CognitiveUnderstanding product={product} preferences={preferences} />
      <PrimaryButton label="Explore this investment" onPress={onInvest} />
    </View>
  );
}

function CognitiveInvestmentFlow({
  product,
  preferences,
  step,
  amount,
  available,
  onAmountChange,
  onStepChange,
  onBack,
  onConfirm,
}: {
  product: InvestmentProduct;
  preferences: ReturnType<typeof useBanking>['preferences'];
  step: number;
  amount: string;
  available: number;
  onAmountChange: (value: string) => void;
  onStepChange: (value: number) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  const plain = preferences.literalLanguage;
  const value = parseMoney(amount);
  const fee = value * product.feeRate;
  const valid = value >= product.minimum && value + fee <= available;
  const error = amount.length > 0 && !valid;
  const stepTitle = step === 1 ? 'How much would you like to invest?' : step === 2 ? 'Review your investment' : 'Ready to invest?';
  const back = step === 1 ? onBack : () => onStepChange(step - 1);

  return (
    <CognitiveFlowLayout
      title={stepTitle}
      onBack={back}
      progress={preferences.stepByStep}
      step={step}
      stepTitle={stepTitle}
    >
      {step === 1 && (
        <>
          <View style={localStyles.compactProduct}>
            <Text style={localStyles.cardEyebrow}>{plain ? 'Investment' : 'Selected investment'}</Text>
            <Text style={localStyles.cardTitle}>{product.name}</Text>
          </View>
          <View>
            <Text style={styles.inputLabel}>{plain ? 'Amount to invest' : 'Investment amount'}</Text>
            <View style={{ position: 'relative' }}>
              <Text style={localStyles.currencyPrefix}>AED</Text>
              <TextInput
                value={amount}
                onChangeText={(next) => onAmountChange(next.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                style={[styles.input, localStyles.amountInput]}
              />
            </View>
            <Text style={styles.helper}>{`Available: ${formatMoney(available)} · Minimum: ${formatMoney(product.minimum)}`}</Text>
            {error && <Text style={localStyles.errorText}>{value < product.minimum ? `Enter at least ${formatMoney(product.minimum)}.` : 'This amount and fee exceed your available balance.'}</Text>}
          </View>
          <PrimaryButton label="Continue to review" onPress={() => onStepChange(2)} disabled={!valid} />
        </>
      )}
      {step === 2 && (
        <>
          <View style={localStyles.surfaceCard}>
            <CognitiveFact label="Investment" value={product.name} />
            <CognitiveFact label="Amount" value={formatMoney(value)} />
            <CognitiveFact label="Risk" value={product.risk} />
            <CognitiveFact label="Yearly fee" value={product.fees} />
            <CognitiveFact label="Estimated fee" value={formatMoney(fee)} />
          </View>
          <View style={localStyles.warningCard}>
            <Text style={localStyles.warningTitle}>Could I lose money?</Text>
            <Text style={localStyles.warningText}>Yes. The value can go down, so you could receive less than you invested. Past performance does not predict future returns.</Text>
          </View>
          <PrimaryButton label="Continue to confirmation" onPress={() => onStepChange(3)} disabled={!valid} />
        </>
      )}
      {step === 3 && (
        <>
          <View style={localStyles.surfaceCard}>
            <CognitiveFact label="Investment" value={product.name} />
            <CognitiveFact label="Amount" value={formatMoney(value)} />
            <CognitiveFact label="Estimated fee" value={formatMoney(fee)} />
            <CognitiveFact label="Total taken from savings" value={formatMoney(value + fee)} />
          </View>
          <View style={localStyles.warningCard}>
            <Text style={localStyles.warningTitle}>Before you confirm</Text>
            <Text style={localStyles.warningText}>Investments can go down as well as up. You could receive less money than you invested.</Text>
          </View>
          <PrimaryButton label={plain ? 'Confirm investment' : 'Confirm and invest'} onPress={onConfirm} disabled={!valid} />
        </>
      )}
    </CognitiveFlowLayout>
  );
}

function CognitiveFlowLayout({ title, onBack, progress, step, stepTitle, flowLabel = 'Investment', children }: { title: string; onBack: () => void; progress: boolean; step?: number; stepTitle?: string; flowLabel?: string; children: React.ReactNode }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      {progress && step && stepTitle && <CognitiveProgress step={step} title={stepTitle} flowLabel={flowLabel} />}
      <Text style={styles.pageTitle}>{title}</Text>
      {children}
    </View>
  );
}

function CognitiveProgress({ step, title, flowLabel = 'Investment' }: { step: number; title: string; flowLabel?: string }) {
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  const labels = ['Amount', 'Review', 'Confirm'];
  return (
    <View style={localStyles.progressCard} accessibilityLabel={`${flowLabel} step ${step} of 3: ${title}`}>
      <View style={localStyles.progressHeader}><Text style={localStyles.progressEyebrow}>Step {step} of 3</Text><Text style={localStyles.progressMeta}>{title}</Text></View>
      <View style={localStyles.progressTrack}>{labels.map((label, index) => <View key={label} style={[localStyles.progressSegment, index + 1 <= step && { backgroundColor: colors.primary }]} />)}</View>
      <View style={localStyles.progressLabels}>{labels.map((label, index) => <Text key={label} style={[localStyles.progressLabel, index + 1 === step && { color: colors.primary }]}>{label}</Text>)}</View>
    </View>
  );
}

function CognitiveUnderstanding({ product, preferences }: { product: InvestmentProduct | SavingsProduct; preferences: ReturnType<typeof useBanking>['preferences'] }) {
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  const assistant = useExplainBankingContext();
  const { savings } = useBanking();
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const plain = preferences.literalLanguage;
  const isInvestment = 'feeRate' in product;
  const suggestions = preferences.reducedDistractions
    ? (isInvestment
      ? (plain ? ['What is this investment?', 'Could I lose money?', 'What is the yearly fee?'] : ['What does this investment do?', 'What are the risks?', 'What is the annual fee?'])
      : (plain ? ['How does this savings option work?', 'When can I access my money?', 'What does the interest rate mean?'] : ['How does this savings option work?', 'When can I access the money?', 'How is interest calculated?']))
    : (isInvestment
      ? (plain ? ['What is this investment?', 'Could I lose money?', 'What is the yearly fee?', 'What does the risk level mean?'] : ['What does this investment do?', 'What are the risks?', 'What is the annual fee?', 'What does the risk level mean?'])
      : (plain ? ['How does this savings option work?', 'When can I access my money?', 'What does the interest rate mean?', 'What are the conditions?'] : ['How does this savings option work?', 'When can I access the money?', 'How is interest calculated?', 'What are the product conditions?']));
  const ask = (prompt: string) => {
    setQuestion(prompt);
    setAnswer('');
    if (__DEV__) {
      console.info('[AI] Question submitted', { page: 'savings', endpoint: '/api/assistant/explain' });
    }
    assistant.mutate({
      data: {
        question: prompt,
        context: {
          page: 'savings',
          mode: 'cognitive',
          step: `Savings & Investments · ${product.name}`,
          settings: {
            minimalInformation: preferences.minimalInformation,
            literalLanguage: preferences.literalLanguage,
            stepByStep: preferences.stepByStep,
          },
          savings: {
            savingsBalance: formatMoney(savings.savingsBalance),
            fixedDepositBalance: formatMoney(savings.fixedDepositBalance),
            investmentValue: formatMoney(savings.investmentValue),
            totalInvested: formatMoney(savings.totalInvested),
            selectedProduct: {
              name: product.name,
              productType: isInvestment ? 'investment' : 'savings',
              description: product.description,
              risk: isInvestment ? product.risk : 'Not listed for this savings product',
              minimum: formatMoney(product.minimum),
              performance: isInvestment ? product.performance : undefined,
              fees: product.fees,
              access: isInvestment ? product.withdrawal : product.access,
              term: 'term' in product ? product.term : undefined,
              interest: 'interest' in product ? product.interest : undefined,
              conditions: isInvestment ? product.withdrawal : product.conditions,
              withdrawal: isInvestment ? product.withdrawal : product.access,
              objective: isInvestment ? product.objective : undefined,
              risks: isInvestment ? product.risks : undefined,
            },
          },
        },
        preferences: {
          minimalInformation: preferences.minimalInformation,
          literalLanguage: preferences.literalLanguage,
          stepByStep: preferences.stepByStep,
        },
      },
    }, {
      onSuccess: (result) => {
        if (__DEV__) console.info('[AI] Answer received', { page: 'savings', answerLength: result.answer.length });
        setAnswer(result.answer);
      },
      onError: (error) => {
        const diagnostic = error as Error & { status?: number; statusText?: string };
        console.error('[AI] Product explanation request failed', {
          page: 'savings',
          errorType: diagnostic.name || 'UnknownError',
          message: diagnostic.message || String(error),
          status: diagnostic.status,
          statusText: diagnostic.statusText,
        });
        setAnswer('The explanation is not available right now. Please use the information shown on this page.');
      },
    });
  };
  return (
    <View style={localStyles.aiCard}>
      <Pressable
        onPress={() => setExpanded((isExpanded) => !isExpanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Hide product questions' : isInvestment ? 'Ask about this investment' : 'Ask about this savings option'}
      >
        <View style={localStyles.aiHeading}>
          <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={localStyles.aiTitle}>{isInvestment ? 'Ask about this investment' : 'Ask about this savings option'}</Text>
            <Text style={localStyles.aiSubtitle}>Answers use the details on this page.</Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
        </View>
      </Pressable>
      {expanded && (
        <>
          {answer ? <View style={localStyles.aiAnswer}><Text style={localStyles.aiAnswerText}>{answer}</Text></View> : null}
          {assistant.isPending && <ActivityIndicator color={colors.primary} style={{ marginTop: 14 }} />}
          <View style={localStyles.questionList}>
            {suggestions.map((suggestion) => (
              <Pressable key={suggestion} onPress={() => ask(suggestion)} style={localStyles.questionChip} accessibilityRole="button">
                <Text style={localStyles.questionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
          {!preferences.reducedDistractions && (
            <View style={localStyles.askRow}>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                onSubmitEditing={() => { if (question.trim()) { Keyboard.dismiss(); ask(question.trim()); } }}
                placeholder={plain ? 'Ask a question' : isInvestment ? 'Ask about this investment' : 'Ask about this savings option'}
                placeholderTextColor={colors.mutedForeground}
                style={localStyles.askInput}
              />
              <Pressable
                onPress={() => { if (question.trim()) { Keyboard.dismiss(); ask(question.trim()); } }}
                style={localStyles.askButton}
                accessibilityRole="button"
                accessibilityLabel={isInvestment ? 'Ask about this investment' : 'Ask about this savings option'}
              >
                <Ionicons name="arrow-up" size={19} color={colors.white} />
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function CognitivePortfolio({ holdings, value, invested, gain, gainPercent, onBack, onSelectHolding }: { holdings: SavingsHolding[]; value: number; invested: number; gain: number; gainPercent: number; onBack: () => void; onSelectHolding: (holding: SavingsHolding) => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <Text style={styles.pageTitle}>Investment portfolio</Text>
      <View style={localStyles.surfaceCard}>
        <CognitiveFact label="Portfolio value" value={formatMoney(value)} />
        <CognitiveFact label="Amount invested" value={formatMoney(invested)} />
        <CognitiveFact label="Gain / loss" value={`${formatSignedMoney(gain)} · ${formatSignedPercent(gainPercent)}`} />
      </View>
      <Text style={styles.sectionTitle}>What you own</Text>
      <View style={{ gap: localStyles.spacing(10) }}>{holdings.map((holding) => <Pressable key={holding.id} onPress={() => onSelectHolding(holding)} style={localStyles.holdingRow} accessibilityRole="button"><View style={{ flex: 1 }}><Text style={localStyles.cardTitle}>{holding.name}</Text><Text style={localStyles.cardDescription}>Invested {formatMoney(holding.invested)}</Text></View><Text style={localStyles.metricValue}>{formatMoney(holding.value)}</Text><Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /></Pressable>)}</View>
      <Text style={styles.helper}>The value of an investment can change. Historical performance does not predict future returns.</Text>
    </View>
  );
}

function CognitiveSavingsDetails({ balance, additionalBalance, additionalName, rate, access, onBack, onExplore }: { balance: number; additionalBalance: number; additionalName: string; rate: number; access: string; onBack: () => void; onExplore: () => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <Text style={styles.pageTitle}>Savings</Text>
      <View style={localStyles.surfaceCard}><CognitiveFact label="Available savings balance" value={formatMoney(balance)} /><CognitiveFact label="Interest rate" value={`${formatPercent(rate)} per year`} /><CognitiveFact label="Access" value={access} />{additionalBalance > 0 && <CognitiveFact label={additionalName || 'Additional savings'} value={formatMoney(additionalBalance)} />}</View>
      <View style={localStyles.decisionNote}><Text style={localStyles.decisionNoteTitle}>What this means</Text><Text style={localStyles.decisionNoteText}>Savings keep your money accessible. The interest rate can depend on the product terms.</Text></View>
      <PrimaryButton label="Explore savings products" onPress={onExplore} />
    </View>
  );
}

function CognitiveSavingsProducts({ preferences, product, productIndex, openIntent, onBack, onNext, onLearn, onOpen }: {
  preferences: ReturnType<typeof useBanking>['preferences'];
  product: SavingsProduct;
  productIndex: number;
  openIntent: boolean;
  onBack: () => void;
  onNext: () => void;
  onLearn: () => void;
  onOpen: () => void;
}) {
  const styles = useBankingStyles();
  const localStyles = getCognitiveSavingsStyles(useColors());
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink onPress={onBack} />
      <View>
        <Text style={styles.pageTitle}>{openIntent ? 'Open a savings account' : 'Explore savings'}</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>
          {preferences.literalLanguage ? 'Review one option at a time.' : 'Choose a savings option. You see one option at a time.'}
        </Text>
      </View>
      <View style={localStyles.surfaceCard}>
        <Text style={localStyles.cardEyebrow}>Option {productIndex + 1} of {savingsProducts.length}</Text>
        <Text style={localStyles.cardTitle}>{product.name}</Text>
        <Text style={localStyles.cardDescription}>{product.description}</Text>
        <CognitiveFact label="Interest rate" value={`${formatPercent(product.rate)} per year`} />
        <CognitiveFact label="Minimum amount" value={formatMoney(product.minimum)} />
        <CognitiveFact label="Access" value={product.access} />
        <PrimaryButton label={openIntent ? 'Open this account' : 'Learn about this'} onPress={openIntent ? onOpen : onLearn} />
        {openIntent && <CognitiveTextAction label="Learn more about this account" onPress={onLearn} />}
        <CognitiveTextAction label="See another option" onPress={onNext} />
      </View>
    </View>
  );
}

function CognitiveSavingsProductDetails({ product, preferences, onBack, onOpen }: { product: SavingsProduct; preferences: ReturnType<typeof useBanking>['preferences']; onBack: () => void; onOpen: () => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  const plain = preferences.literalLanguage;
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <CognitiveBackLink label="Back to savings options" onPress={onBack} />
      <View><Text style={styles.pageTitle}>{product.name}</Text><Text style={[styles.subtitle, { marginTop: 8 }]}>{product.description}</Text></View>
      <View style={localStyles.surfaceCard}>
        <CognitiveFact label="Interest rate" value={`${formatPercent(product.rate)} per year`} />
        <CognitiveFact label="Minimum amount" value={formatMoney(product.minimum)} />
        <CognitiveFact label="Access" value={product.access} />
        <View style={localStyles.warningCard}>
          <Text style={localStyles.warningTitle}>Important information</Text>
          <Text style={localStyles.warningText}>{product.conditions}</Text>
        </View>
        <Pressable onPress={() => setShowMoreDetails((visible) => !visible)} style={localStyles.disclosureButton} accessibilityRole="button" accessibilityState={{ expanded: showMoreDetails }}>
          <Text style={localStyles.disclosureText}>{showMoreDetails ? 'Hide details' : 'Learn more'}</Text>
          <Ionicons name={showMoreDetails ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
        </Pressable>
        {showMoreDetails && (
          <View style={localStyles.fullDetails}>
            <CognitiveFact label={plain ? 'Time period' : 'Term'} value={product.term} />
            <CognitiveFact label={plain ? 'How interest works' : 'Interest calculation'} value={product.interest} />
            <CognitiveFact label={plain ? 'Fees' : 'Product fees'} value={product.fees} />
          </View>
        )}
      </View>
      <CognitiveUnderstanding product={product} preferences={preferences} />
      <PrimaryButton label="Open this account" onPress={onOpen} />
    </View>
  );
}

function CognitiveSavingsAmount({ product, amount, available, preferences, onChange, onBack, onContinue }: { product: SavingsProduct; amount: string; available: number; preferences: ReturnType<typeof useBanking>['preferences']; onChange: (value: string) => void; onBack: () => void; onContinue: () => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  const value = parseMoney(amount);
  const valid = value >= product.minimum && value <= available;
  return (
    <CognitiveFlowLayout
      title="How much would you like to save?"
      onBack={onBack}
      progress={preferences.stepByStep}
      step={1}
      stepTitle="Amount"
      flowLabel="Savings account"
    >
      <View style={localStyles.compactProduct}>
        <Text style={localStyles.cardEyebrow}>Account</Text>
        <Text style={localStyles.cardTitle}>{product.name}</Text>
      </View>
      <View>
        <Text style={styles.inputLabel}>{preferences.literalLanguage ? 'Amount to save' : 'Savings amount'}</Text>
        <View style={{ position: 'relative' }}>
          <Text style={localStyles.currencyPrefix}>AED</Text>
          <TextInput
            value={amount}
            onChangeText={(next) => onChange(next.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, localStyles.amountInput]}
          />
        </View>
        <Text style={styles.helper}>{`Available: ${formatMoney(available)} · Minimum: ${formatMoney(product.minimum)}`}</Text>
        {amount.length > 0 && !valid && <Text style={localStyles.errorText}>{value < product.minimum ? `Enter at least ${formatMoney(product.minimum)}.` : 'This amount exceeds your available balance.'}</Text>}
      </View>
      <PrimaryButton label="Continue to review" onPress={onContinue} disabled={!valid} />
    </CognitiveFlowLayout>
  );
}

function CognitiveSavingsReview({ product, amount, preferences, onBack, onContinue }: { product: SavingsProduct; amount: number; preferences: ReturnType<typeof useBanking>['preferences']; onBack: () => void; onContinue: () => void }) {
  const localStyles = getCognitiveSavingsStyles(useColors());
  return (
    <CognitiveFlowLayout
      title={preferences.literalLanguage ? 'Review your account' : 'Review savings details'}
      onBack={onBack}
      progress={preferences.stepByStep}
      step={2}
      stepTitle="Review"
      flowLabel="Savings account"
    >
      <View style={localStyles.surfaceCard}>
        <CognitiveFact label="Account" value={product.name} />
        <CognitiveFact label="Amount" value={formatMoney(amount)} />
        <CognitiveFact label="Interest rate" value={`${formatPercent(product.rate)} per year`} />
        <CognitiveFact label="Access" value={product.access} />
      </View>
      <PrimaryButton label="Continue to confirmation" onPress={onContinue} />
    </CognitiveFlowLayout>
  );
}

function CognitiveSavingsConfirmation({ product, amount, preferences, onBack, onConfirm }: { product: SavingsProduct; amount: number; preferences: ReturnType<typeof useBanking>['preferences']; onBack: () => void; onConfirm: () => void }) {
  const localStyles = getCognitiveSavingsStyles(useColors());
  return (
    <CognitiveFlowLayout
      title="Ready to open this account?"
      onBack={onBack}
      progress={preferences.stepByStep}
      step={3}
      stepTitle="Confirm"
      flowLabel="Savings account"
    >
      <View style={localStyles.surfaceCard}>
        <CognitiveFact label="Account" value={product.name} />
        <CognitiveFact label="Amount" value={formatMoney(amount)} />
        <CognitiveFact label="Interest rate" value={`${formatPercent(product.rate)} per year`} />
        <CognitiveFact label="Access" value={product.access} />
        <CognitiveFact label="Fees" value={product.fees} />
      </View>
      <View style={localStyles.warningCard}>
        <Text style={localStyles.warningTitle}>Important information</Text>
        <Text style={localStyles.warningText}>{product.conditions}</Text>
      </View>
      <PrimaryButton label={preferences.literalLanguage ? 'Open savings account' : 'Confirm and open account'} onPress={onConfirm} />
    </CognitiveFlowLayout>
  );
}

function CognitiveSuccess({ title, description, details, primaryLabel, onPrimary, onSecondary }: { title: string; description: string; details: Array<[string, string]>; primaryLabel: string; onPrimary: () => void; onSecondary?: () => void }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return (
    <View style={{ marginTop: 24, gap: localStyles.spacing(18) }}>
      <View style={styles.successScreen}><View style={styles.successIcon}><Ionicons name="checkmark" size={52} color={colors.success} /></View><Text style={styles.successTitle}>{title}</Text><Text style={styles.successSubtitle}>{description}</Text><View style={[styles.referenceCard, { marginTop: 24 }]}>{details.map(([label, value]) => <CognitiveMetric key={label} label={label} value={value} />)}</View></View>
      <PrimaryButton label={primaryLabel} onPress={onPrimary} />
      {onSecondary && <SecondaryButton label="Back to your money" onPress={onSecondary} />}
    </View>
  );
}

function CognitiveFact({ label, value }: { label: string; value: string }) {
  const localStyles = getCognitiveSavingsStyles(useColors());
  return <View style={localStyles.fact}><Text style={localStyles.factLabel}>{label}</Text><Text style={localStyles.factValue}>{value}</Text></View>;
}

function CognitiveMetric({ label, value, valueColor, light = false }: { label: string; value: string; valueColor?: string; light?: boolean }) {
  const colors = useColors();
  const localStyles = getCognitiveSavingsStyles(colors);
  return <View style={{ flex: 1, minWidth: '44%', gap: 3 }}><Text style={[localStyles.metricLabel, light && { color: colors.white, opacity: 0.68 }]}>{label}</Text><Text style={[localStyles.metricValue, light && { color: colors.white }, valueColor ? { color: valueColor } : null]}>{value}</Text></View>;
}

function productIdForHolding(holding: SavingsHolding) {
  return investmentProducts.some((product) => product.id === holding.id) ? holding.id : investmentProducts[0].id;
}

function termInMonths(term: string) {
  const match = term.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
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

const getCognitiveSavingsStyles = (colors: ReturnType<typeof useColors>) => {
  const { preferences } = useBanking();
  const textScale = preferences.textSize === 'extraLarge' ? 1.16 : preferences.textSize === 'large' ? 1.08 : 1;
  const spacingScale = preferences.spacing === 'spacious' ? 1.18 : preferences.spacing === 'comfortable' ? 1.08 : 1;
  const styles = StyleSheet.create({
    taskIntro: { gap: 8 * spacingScale },
    taskQuestion: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 25 * textScale, lineHeight: 31 * textScale },
    taskDescription: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15 * textScale, lineHeight: 22 * textScale },
    taskAction: { minHeight: 92 * spacingScale, padding: 18 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 13 },
    taskActionSelected: { borderColor: colors.primary, backgroundColor: colors.accent },
    taskActionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
    taskActionTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 17 * textScale },
    taskActionDescription: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 19 * textScale, marginTop: 4 },
    moneySummaryCard: { padding: 18 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', gap: 18 * spacingScale },
    moneyCard: { padding: 20 * spacingScale, borderRadius: 18, backgroundColor: colors.primary } as const,
    moneyEyebrow: { color: colors.white, opacity: 0.78, fontFamily: 'Inter_500Medium', fontSize: 13 * textScale } as const,
    moneyValue: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: 30 * textScale, marginTop: 7 } as const,
    moneyLabel: { color: colors.white, opacity: 0.82, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, marginTop: 4 } as const,
    moneyBreakdown: { flexDirection: 'row', gap: 24 * spacingScale, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.22)', marginTop: 18 * spacingScale, paddingTop: 16 * spacingScale } as const,
    surfaceCard: { padding: 18 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 12 * spacingScale } as const,
    compactProduct: { padding: 16 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 7 * spacingScale } as const,
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 } as const,
    iconCircle: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent } as const,
    cardEyebrow: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 * textScale, letterSpacing: 0.8, textTransform: 'uppercase' as const },
    cardTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 17 * textScale } as const,
    cardDescription: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 19 * textScale, marginTop: 3 } as const,
    cardAmount: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 26 * textScale } as const,
    detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 * spacingScale } as const,
    metricLabel: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 * textScale, lineHeight: 16 * textScale } as const,
    metricValue: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 * textScale, lineHeight: 19 * textScale } as const,
    cardLink: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 * textScale, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 * spacingScale } as const,
    decisionNote: { padding: 16 * spacingScale, borderRadius: 14, backgroundColor: colors.accent, gap: 5 * spacingScale } as const,
    decisionNoteTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 * textScale } as const,
    decisionNoteText: { color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 20 * textScale } as const,
    contextNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 14 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card } as const,
    contextNoteText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 * textScale, lineHeight: 18 * textScale } as const,
    stepQuestion: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 22 * textScale, lineHeight: 28 * textScale } as const,
    currencyPrefix: { position: 'absolute' as const, left: 16, top: 19, zIndex: 1, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15 * textScale },
    amountInput: { paddingLeft: 64, minHeight: 70 * spacingScale, fontSize: 26 * textScale, fontFamily: 'Inter_700Bold' },
    errorText: { color: colors.magentaDeep, fontFamily: 'Inter_500Medium', fontSize: 12 * textScale, lineHeight: 18 * textScale, marginTop: 7 },
    miniSummary: { padding: 15 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', gap: 14 },
    warningCard: { padding: 16 * spacingScale, borderRadius: 14, backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.border, gap: 5 },
    warningTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 * textScale },
    warningText: { color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 20 * textScale },
    lensCard: { padding: 17 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 10 * spacingScale },
    lensTitle: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 17 * textScale },
    fact: { gap: 4 },
    factLabel: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12 * textScale, lineHeight: 17 * textScale },
    factValue: { color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 15 * textScale, lineHeight: 22 * textScale },
    disclosureButton: { minHeight: 44 * spacingScale, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 * spacingScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    disclosureText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 * textScale },
    fullDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 * spacingScale, gap: 14 * spacingScale },
    aiCard: { padding: 17 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 10 * spacingScale },
    aiHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
    aiTitle: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 * textScale },
    aiSubtitle: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 19 * textScale, marginTop: 3 },
    aiAnswer: { padding: 13 * spacingScale, borderRadius: 12, backgroundColor: colors.accent },
    aiAnswerText: { color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 14 * textScale, lineHeight: 21 * textScale },
    questionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    questionChip: { minHeight: 40 * spacingScale, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', backgroundColor: colors.white },
    questionText: { color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 12 * textScale },
    askRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
    askInput: { flex: 1, minHeight: 46 * spacingScale, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 13, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale },
    askButton: { width: 46 * spacingScale, height: 46 * spacingScale, borderRadius: 23 * spacingScale, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    progressCard: { padding: 16 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.card, gap: 10 * spacingScale },
    progressHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    progressEyebrow: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 * textScale, letterSpacing: 1, textTransform: 'uppercase' as const },
    progressMeta: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12 * textScale, textAlign: 'right' as const },
    progressTrack: { flexDirection: 'row', gap: 4 },
    progressSegment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.muted },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10 * textScale },
    holdingRow: { padding: 16 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 10 },
  });
  return { ...styles, spacing: (value: number) => value * spacingScale } as any;
};