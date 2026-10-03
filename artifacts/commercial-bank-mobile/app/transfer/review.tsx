import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BankingShell, BackButton, CognitiveFlowProgress, PrimaryButton, SecondaryButton, useBankingStyles } from '@/components/banking-ui';
import { useBanking, useBankingOptional } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

export default function TransferReviewScreen() {
  const colors = useColors();
  const styles = useBankingStyles();
  const reviewStyles = getReviewStyles(colors);
  const { transfer, isCognitiveMode, preferences } = useBanking();
  const [showMoreDetails, setShowMoreDetails] = useState(!preferences.minimalInformation);
  const feeAmount = parseMoney(transfer.fee);
  const total = parseMoney(transfer.amount) + feeAmount;

  if (!transfer.amount) {
    router.replace('/transfer/recipient');
    return null;
  }

  return (
    <BankingShell step="Review transfer">
      {(!isCognitiveMode || !preferences.reducedDistractions) && (
        <BackButton label={isCognitiveMode && preferences.stepByStep ? 'Back to amount' : undefined} />
      )}
      {isCognitiveMode && preferences.stepByStep && <CognitiveFlowProgress currentStep={3} />}
      <Text style={styles.pageTitle}>Review transfer</Text>
      {!preferences.minimalInformation && (
        <Text style={[styles.subtitle, { marginTop: 8 }]}>
          Please ensure all details are correct. Transfers cannot be reversed once processed.
        </Text>
      )}

      <View style={[styles.reviewCard, { marginTop: 24 }]}>
        <ReviewRow
          label={isCognitiveMode ? 'To' : 'Recipient'}
          value={transfer.recipient}
          showEdit={!isCognitiveMode || !preferences.reducedDistractions}
          onEdit={() => router.push('/transfer/recipient')}
        />
        <View style={styles.reviewDivider} />
        <ReviewRow
          label="Amount"
          value={isCognitiveMode ? `AED ${formatMoney(parseMoney(transfer.amount))}` : `${transfer.amount} AED`}
          highlight
          showEdit={!isCognitiveMode || !preferences.reducedDistractions}
          onEdit={() => router.push(isCognitiveMode && preferences.stepByStep ? '/transfer/recipient?step=amount' : '/transfer/recipient')}
        />
        {!isCognitiveMode && (
          <>
            <View style={styles.reviewDivider} />
            <View style={reviewStyles.normalDetailsBlock}>
              <TransferDetail label="Bank" value={transfer.bank} />
              <TransferDetail label="IBAN" value={maskIban(transfer.iban)} />
              <TransferDetail label="Fee" value={transfer.fee} />
              <TransferDetail label="Total" value={`${formatMoney(total)} AED`} />
              <TransferDetail label="Expected arrival" value={transfer.timing} />
              <TransferDetail label="Purpose" value={transfer.purpose} />
            </View>
          </>
        )}
        {isCognitiveMode && (
          <>
            <View style={styles.reviewDivider} />
            <View style={reviewStyles.coreMetaRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewLabel}>Fee</Text>
                <Text style={styles.reviewValue}>AED {formatMoney(feeAmount)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewLabel}>Total</Text>
                <Text style={styles.reviewValue}>AED {formatMoney(total)}</Text>
              </View>
            </View>
            <View style={reviewStyles.arrivalRow}>
              <Text style={styles.reviewLabel}>Arrival</Text>
              <Text style={styles.reviewValue}>{transfer.timing}</Text>
            </View>
          </>
        )}
        {isCognitiveMode && preferences.minimalInformation && (
          <Pressable
            onPress={() => setShowMoreDetails((visible) => !visible)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showMoreDetails }}
            accessibilityLabel={showMoreDetails ? 'Hide additional transfer details' : 'Learn more about this transfer'}
            accessibilityHint="Shows bank, account, purpose, and other transfer details."
            style={({ pressed }) => [reviewStyles.detailsButton, pressed && { opacity: 0.7 }]}
            testID="transfer-learn-more"
          >
            <Text style={reviewStyles.detailsText}>{showMoreDetails ? 'Hide details' : 'Learn more'}</Text>
            <Ionicons name={showMoreDetails ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
          </Pressable>
        )}
        {isCognitiveMode && (!preferences.minimalInformation || showMoreDetails) && (
          <View style={reviewStyles.detailsBlock}>
            <TransferDetail label="Bank" value={transfer.bank} />
            <TransferDetail label="IBAN" value={maskIban(transfer.iban)} />
            <TransferDetail label="Purpose" value={transfer.purpose} />
            <TransferDetail label="Transfer type" value={transfer.transferType} />
            <TransferDetail label="Currency" value="AED" />
            <TransferDetail label="Exchange rate" value={transfer.exchangeRate} />
            {transfer.warning.trim() && transfer.warning.toLowerCase() !== 'none' && (
              <TransferDetail label="Important warning" value={transfer.warning} />
            )}
          </View>
        )}
      </View>

      {isCognitiveMode && (
        <View style={styles.lensCard}>
          <Text style={styles.lensTitle}>Before you continue</Text>
          <LensRow question="What happens next?" answer="The bank will process the transfer after you confirm." />
          <LensRow question="Can you cancel it?" answer={cancellationText(transfer.cancellable)} />
        </View>
      )}

      <View style={{ gap: 10, marginTop: 24 }}>
        <PrimaryButton label={isCognitiveMode ? 'Continue' : 'Confirm Transfer'} onPress={() => router.push('/transfer/confirm')} />
        <SecondaryButton
          label={isCognitiveMode ? 'Back' : 'Edit details'}
          onPress={() => router.push(isCognitiveMode && preferences.stepByStep ? '/transfer/recipient?step=amount' : '/transfer/recipient')}
        />
      </View>
      {isCognitiveMode && preferences.stepByStep && !preferences.minimalInformation && !preferences.reducedDistractions && (
        <Text style={[styles.helper, { marginTop: 10 }]}>Next: confirm the transfer when you are ready.</Text>
      )}
    </BankingShell>
  );
}

function ReviewRow({
  label,
  value,
  highlight = false,
  showEdit = true,
  onEdit,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  showEdit?: boolean;
  onEdit: () => void;
}) {
  const styles = useBankingStyles();
  const colors = useColors();
  const banking = useBankingOptional();
  const cognitive = banking?.isCognitiveMode ?? false;
  const textScale = banking?.preferences.textSize === 'extraLarge' ? 1.16 : banking?.preferences.textSize === 'large' ? 1.08 : 1;
  return (
    <View style={[styles.reviewRow, highlight && { backgroundColor: colors.blueSoft }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={[styles.reviewValue, highlight && { color: colors.primary, fontSize: 24 * textScale }]}>{value}</Text>
      </View>
      {showEdit && (
        <Pressable onPress={onEdit} style={cognitive ? styles.editButtonLabeled : styles.editButton} accessibilityLabel={`Edit ${label}`}>
          <Ionicons name="create-outline" size={18} color={cognitive ? colors.primary : colors.navyDeep} />
          {cognitive && <Text style={styles.editButtonText}>Edit</Text>}
        </Pressable>
      )}
    </View>
  );
}

function TransferDetail({ label, value }: { label: string; value: string }) {
  const styles = useBankingStyles();
  return (
    <View style={{ gap: 3 }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

function LensRow({ question, answer }: { question: string; answer: string }) {
  const colors = useColors();
  const styles = useBankingStyles();
  return (
    <View style={[lensRowStyle, { borderTopColor: colors.border }]}>
      <Text style={styles.lensTitle}>{question}</Text>
      <Text style={styles.lensText}>{answer}</Text>
    </View>
  );
}

function parseMoney(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskIban(value: string) {
  const normalized = value.replace(/\s/g, '').toUpperCase();
  if (normalized.length < 8) return normalized;
  return `${normalized.slice(0, 4)} •••• •••• ${normalized.slice(-4)}`;
}

function cancellationText(cancellable: string) {
  const normalized = cancellable.toLowerCase();
  if (normalized === 'none' || normalized === 'not cancellable') return 'This transfer cannot be cancelled after confirmation.';
  if (normalized === 'until received') return 'You can cancel this transfer until it is received.';
  return `This transfer can be cancelled ${cancellable}.`;
}

const lensRowStyle = {
  paddingVertical: 10,
  borderTopWidth: 1,
} as const;

const getReviewStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    coreMetaRow: {
      padding: 18,
      flexDirection: 'row',
      gap: 16,
    },
    detailsButton: {
      minHeight: 48,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    detailsText: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
    },
    detailsBlock: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 18,
      gap: 14,
    },
    cognitiveDetailsBlock: {
      paddingHorizontal: 18,
      paddingBottom: 18,
      gap: 14,
    },
    arrivalRow: {
      minHeight: 50,
      paddingHorizontal: 18,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    normalDetailsBlock: {
      padding: 18,
      gap: 14,
    },
  });