import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  BankingShell,
  BackButton,
  PrimaryButton,
  SecondaryButton,
  useBankingStyles,
} from '@/components/banking-ui';
import { useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';
import NormalSavingsFlow from '@/app/savings-normal';
import CognitiveSavingsExperience from '@/app/savings-cognitive';

type ProductKey = 'savings' | 'fixed' | 'investments';

type Product = {
  key: ProductKey;
  icon: keyof typeof Ionicons.glyphMap;
  normalName: string;
  cognitiveName: string;
  description: string;
  returnValue: string;
  risk: string;
  access: string;
  period: string;
  conditions: string;
};

const products: Product[] = [
  {
    key: 'savings',
    icon: 'wallet-outline',
    normalName: 'Savings Account',
    cognitiveName: 'Save money',
    description: 'Keep your money accessible while earning interest.',
    returnValue: '2.25% interest per year',
    risk: 'Low',
    access: 'Anytime',
    period: 'No fixed period',
    conditions: 'Minimum balance: AED 1,000.',
  },
  {
    key: 'fixed',
    icon: 'lock-closed-outline',
    normalName: 'Fixed Deposit',
    cognitiveName: 'Lock money away',
    description: 'Keep money for a fixed period in exchange for a predetermined return.',
    returnValue: 'Up to 4.50% interest per year',
    risk: 'Low',
    access: 'At maturity',
    period: '6 or 12 months',
    conditions: 'Early withdrawal may reduce the interest you receive.',
  },
  {
    key: 'investments',
    icon: 'trending-up-outline',
    normalName: 'Investments',
    cognitiveName: 'Invest money',
    description: 'Your money can increase or decrease in value.',
    returnValue: 'Variable',
    risk: 'Medium to high',
    access: 'Usually within 3–5 business days',
    period: 'No fixed period',
    conditions: 'You could receive less money than you invested.',
  },
];

export default function SavingsInvestmentsScreen() {
  const styles = useBankingStyles();
  const { isCognitiveMode, preferences } = useBanking();
  const literal = isCognitiveMode && preferences.literalLanguage;

  return (
    <BankingShell step="Savings and investments">
      {!isCognitiveMode && <BackButton label={literal ? 'Go back' : 'Back'} />}
      {!isCognitiveMode && (
        <>
          <Text style={styles.pageTitle}>Savings &amp; Investments</Text>
          <Text style={[styles.subtitle, { marginTop: 8 }]}>Explore ways to save or invest your money.</Text>
        </>
      )}

      {isCognitiveMode ? (
        <CognitiveSavingsExperience />
      ) : (
        <NormalSavingsFlow />
      )}
    </BankingShell>
  );
}

function CognitiveSavingsFlow({ products }: { products: Product[] }) {
  const styles = useBankingStyles();
  const colors = useColors();
  const [step, setStep] = useState(1);
  const [selectedKey, setSelectedKey] = useState<ProductKey | null>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const selectedProduct = products.find((product) => product.key === selectedKey) ?? null;
  const cognitiveStyles = getSavingsStyles(colors, true);

  const chooseAnotherOption = () => {
    setSelectedKey(null);
    setShowMoreDetails(false);
    setStep(1);
  };

  return (
    <View style={{ marginTop: 28, gap: 18 }}>
      <SavingsProgress currentStep={step} />

      {step === 1 && (
        <>
          <View>
            <Text style={cognitiveStyles.guidedQuestion}>How would you like your money to work for you?</Text>
            <Text style={[styles.subtitle, { marginTop: 8 }]}>Choose one option to understand it more clearly.</Text>
          </View>
          <View style={{ gap: 12 }}>
            {products.map((product) => (
              <CognitiveOptionCard
                key={product.key}
                product={product}
                selected={selectedKey === product.key}
                onPress={() => setSelectedKey(product.key)}
              />
            ))}
          </View>
          <PrimaryButton
            label="Continue"
            onPress={() => setStep(2)}
            disabled={!selectedProduct}
          />
        </>
      )}

      {step === 2 && selectedProduct && (
        <>
          <View>
            <Text style={cognitiveStyles.guidedQuestion}>Understand your choice</Text>
            <Text style={[styles.subtitle, { marginTop: 8 }]}>Here are the details that matter most.</Text>
          </View>
          <View style={cognitiveStyles.summaryCard}>
            <Text style={cognitiveStyles.summaryEyebrow}>You chose</Text>
            <Text style={cognitiveStyles.summaryTitle}>{selectedProduct.cognitiveName}</Text>
            <Text style={cognitiveStyles.summaryDescription}>{selectedProduct.description}</Text>
            <View style={cognitiveStyles.coreDetails}>
              <Detail label="Potential return" value={selectedProduct.returnValue} />
              <Detail label="Risk" value={selectedProduct.risk} />
              <Detail label="Access to your money" value={selectedProduct.access} />
            </View>
            <Pressable
              onPress={() => setShowMoreDetails((visible) => !visible)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showMoreDetails }}
              style={cognitiveStyles.moreDetailsButton}
            >
              <Text style={cognitiveStyles.moreDetailsText}>{showMoreDetails ? 'Hide details' : 'More details'}</Text>
              <Ionicons name={showMoreDetails ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
            </Pressable>
            {showMoreDetails && (
              <View style={cognitiveStyles.additionalDetails}>
                <Detail label="Time period" value={selectedProduct.period} />
                <View style={cognitiveStyles.conditionBlock}>
                  <Text style={cognitiveStyles.conditionLabel}>Important conditions</Text>
                  <Text style={cognitiveStyles.conditionText}>{selectedProduct.conditions}</Text>
                </View>
              </View>
            )}
          </View>
          <PrimaryButton label="Continue to Decision Lens" onPress={() => setStep(3)} />
          <SecondaryButton label="Choose another option" onPress={chooseAnotherOption} />
        </>
      )}

      {step === 3 && selectedProduct && (
        <DecisionLens product={selectedProduct} onChooseAnother={chooseAnotherOption} />
      )}
    </View>
  );
}

function SavingsProgress({ currentStep }: { currentStep: number }) {
  const colors = useColors();
  const styles = getSavingsStyles(colors, true);
  const labels = ['Choose', 'Understand', 'Continue'];
  return (
    <View
      style={styles.progressCard}
      accessibilityLabel={`Savings and investments step ${currentStep} of 3: ${labels[currentStep - 1]}`}
    >
      <View style={styles.progressHeader}>
        <Text style={styles.progressEyebrow}>Step {currentStep} of 3</Text>
        <Text style={styles.progressMeta}>{labels[currentStep - 1]}</Text>
      </View>
      <View style={styles.progressTrack}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View style={[styles.progressDot, step <= currentStep && { backgroundColor: colors.primary }]} />
            {step < 3 && <View style={[styles.progressLine, step < currentStep && { backgroundColor: colors.primary }]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {labels.map((label, index) => <Text key={label} style={[styles.progressLabel, index + 1 === currentStep && { color: colors.primary }]}>{label}</Text>)}
      </View>
    </View>
  );
}

function CognitiveOptionCard({ product, selected, onPress }: { product: Product; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  const styles = getSavingsStyles(colors, true);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${product.cognitiveName}. ${product.description}`}
      style={({ pressed }) => [styles.optionCard, selected && styles.optionCardSelected, pressed && { opacity: 0.82 }]}
    >
      <View style={styles.productIcon}>
        <Ionicons name={product.icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{product.cognitiveName}</Text>
        <Text style={styles.optionDescription}>{product.description}</Text>
      </View>
      <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={22} color={selected ? colors.primary : colors.mutedForeground} />
    </Pressable>
  );
}

function ProductCard({
  product,
  cognitiveMode,
  selected,
  onPress,
}: {
  product: Product;
  cognitiveMode: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const cardStyles = getSavingsStyles(colors, cognitiveMode);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${cognitiveMode ? product.cognitiveName : product.normalName}. ${product.description}`}
      style={({ pressed }) => [
        cardStyles.productCard,
        selected && cardStyles.productCardSelected,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={cardStyles.productHeader}>
        <View style={cardStyles.productIcon}>
          <Ionicons name={product.icon} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.productName}>
            {cognitiveMode ? product.cognitiveName : product.normalName}
          </Text>
          <Text style={cardStyles.productDescription}>{product.description}</Text>
        </View>
        <Ionicons
          name={selected ? 'checkmark-circle' : 'chevron-forward'}
          size={22}
          color={selected ? colors.primary : colors.mutedForeground}
        />
      </View>

      <View style={cardStyles.detailsGrid}>
        <Detail label={cognitiveMode ? 'Potential return' : 'Return / interest'} value={product.returnValue} />
        <Detail label="Risk" value={product.risk} />
        <Detail label="Access to money" value={product.access} />
        <Detail label="Time period" value={product.period} />
      </View>
      <View style={cardStyles.conditions}>
        <Text style={cardStyles.conditionsLabel}>Important conditions</Text>
        <Text style={cardStyles.conditionsText}>{product.conditions}</Text>
      </View>
      {cognitiveMode && (
        <Text style={cardStyles.selectHint}>{selected ? 'Selected for review' : 'Select to understand this option'}</Text>
      )}
    </Pressable>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const styles = useBankingStyles();
  return (
    <View style={{ flex: 1, minWidth: '46%' }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

function DecisionLens({ product, onChooseAnother }: { product: Product; onChooseAnother: () => void }) {
  const colors = useColors();
  const styles = useBankingStyles();
  const lensStyles = getSavingsStyles(colors, true);

  return (
    <View style={styles.lensCard}>
      <View style={styles.lensHeading}>
        <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.lensTitle}>Decision Lens</Text>
      </View>
      <Text style={[styles.lensText, { marginBottom: 8 }]}>
        This explains the option. It does not recommend a product.
      </Text>
      <LensRow question="What are you doing?" answer={`${product.cognitiveName}: ${product.description}`} />
      <LensRow
        question="What will happen?"
        answer={
          product.key === 'investments'
            ? 'The value can go up or down. You could receive less money than you invested.'
            : product.key === 'fixed'
              ? 'Your money will stay in the deposit for the selected period and earn a predetermined return.'
              : 'Your money will stay in the account and earn interest while remaining accessible.'
        }
      />
      <LensRow question="Will it cost you anything?" answer="No fee is shown in this prototype. Check the product terms before applying." />
      <LensRow question="Can you withdraw the money?" answer={product.access} />
      <LensRow question="What happens next?" answer="Read the full terms and decide whether to apply. This prototype does not open a product." />
      <View style={lensStyles.lensActions}>
        <PrimaryButton label="Choose another option" onPress={onChooseAnother} />
        <SecondaryButton label="Back to accounts" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}

function LensRow({ question, answer }: { question: string; answer: string }) {
  const colors = useColors();
  const styles = useBankingStyles();
  return (
    <View style={[stylesLensRow, { borderTopColor: colors.border }]}>
      <Text style={styles.lensTitle}>{question}</Text>
      <Text style={styles.lensText}>{answer}</Text>
    </View>
  );
}

const stylesLensRow = {
  paddingVertical: 10,
  borderTopWidth: 1,
} as const;

const getSavingsStyles = (colors: ReturnType<typeof useColors>, cognitiveMode: boolean) =>
  StyleSheet.create({
    productCard: {
      padding: cognitiveMode ? 18 : 16,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: cognitiveMode ? 14 : 12,
    },
    productCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.accent,
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    productIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    productName: {
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: cognitiveMode ? 17 : 16,
    },
    productDescription: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      paddingTop: 4,
    },
    conditions: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    conditionsLabel: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    conditionsText: {
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    selectHint: {
      color: colors.primary,
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    lensActions: {
      gap: 10,
      marginTop: 14,
    },
    optionCard: {
      minHeight: 88,
      padding: 18,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.accent,
    },
    optionTitle: {
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 17,
    },
    optionDescription: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    guidedQuestion: {
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 23,
      lineHeight: 29,
    },
    progressCard: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 10,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressEyebrow: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 11,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    progressMeta: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    progressTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.muted,
    },
    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.muted,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressLabel: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 10,
    },
    summaryCard: {
      padding: 18,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 10,
    },
    summaryEyebrow: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 11,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    summaryTitle: {
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 22,
    },
    summaryDescription: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 21,
    },
    coreDetails: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14,
      gap: 14,
    },
    moreDetailsButton: {
      minHeight: 44,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    moreDetailsText: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
    },
    additionalDetails: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14,
      gap: 14,
    },
    conditionBlock: {
      gap: 4,
    },
    conditionLabel: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
    },
    conditionText: {
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
    },
  });