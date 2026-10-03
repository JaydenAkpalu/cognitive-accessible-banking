import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BankingShell, BackButton, CognitiveFlowProgress, PrimaryButton, useBankingStyles } from '@/components/banking-ui';
import { useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

export default function TransferConfirmScreen() {
  const colors = useColors();
  const styles = useBankingStyles();
  const { transfer, resetTransfer, completeTransfer, isCognitiveMode, preferences } = useBanking();
  const [confirmed, setConfirmed] = useState(false);
  const literal = isCognitiveMode && preferences.literalLanguage;
  const textScale = preferences.textSize === 'extraLarge' ? 1.16 : preferences.textSize === 'large' ? 1.08 : 1;
  const amount = parseMoney(transfer.amount);
  const fee = parseMoney(transfer.fee);
  const total = amount + fee;
  const guidedCognitive = isCognitiveMode && preferences.stepByStep;

  useEffect(() => {
    if (confirmed && transfer.amount && transfer.recipient) {
      completeTransfer();
    }
  }, [completeTransfer, confirmed, transfer.amount, transfer.recipient]);

  if (!transfer.amount) {
    router.replace('/');
    return null;
  }

  if (!confirmed) {
    return (
      <BankingShell step="Confirm transfer">
        <BackButton />
        {guidedCognitive && <CognitiveFlowProgress currentStep={4} />}
        <Text style={styles.pageTitle}>{isCognitiveMode ? 'Ready to send?' : 'Confirm transfer'}</Text>
        <Text style={[styles.subtitle, { marginTop: 8 }]}>
          {isCognitiveMode ? 'Nothing will be sent until you confirm.' : 'Check the details one more time before sending.'}
        </Text>
        <View style={[styles.reviewCard, { marginTop: 24 }]}>
          <View style={styles.reviewRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewLabel}>Sending to</Text>
              <Text style={styles.reviewValue}>{transfer.recipient}</Text>
            </View>
          </View>
          <View style={styles.reviewDivider} />
          <View style={[styles.reviewRow, { backgroundColor: colors.blueSoft }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewLabel}>Amount</Text>
              <Text style={[styles.reviewValue, { color: colors.primary, fontSize: 24 * textScale }]}>
                {isCognitiveMode ? `AED ${formatMoney(amount)}` : `${transfer.amount} AED`}
              </Text>
            </View>
          </View>
          {!isCognitiveMode && (
            <>
              <View style={styles.reviewDivider} />
              <View style={styles.confirmMetaRow}>
                <ConfirmDetail label="Bank" value={transfer.bank} />
                <ConfirmDetail label="Purpose" value={transfer.purpose} />
              </View>
              <View style={styles.reviewDivider} />
              <View style={styles.confirmMetaRow}>
                <ConfirmDetail label="Fee" value={transfer.fee} />
                <ConfirmDetail label="Total" value={`${formatMoney(total)} AED`} />
                <ConfirmDetail label="Arrives" value={transfer.timing} />
              </View>
              <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>
                <Text style={styles.reviewLabel}>IBAN</Text>
                <Text style={styles.reviewValue}>{maskIban(transfer.iban)}</Text>
              </View>
            </>
          )}
          {isCognitiveMode && (
            <>
              <View style={styles.reviewDivider} />
              <View style={styles.confirmDetails}>
                <ConfirmDetail label="Fee" value={`AED ${formatMoney(fee)}`} />
                <ConfirmDetail label="Total" value={`AED ${formatMoney(total)}`} />
                <ConfirmDetail label="Arrival" value={transfer.timing} />
              </View>
            </>
          )}
        </View>
        <View style={{ marginTop: 24 }}>
          <PrimaryButton label="Confirm transfer" onPress={() => setConfirmed(true)} />
        </View>
      </BankingShell>
    );
  }

  return (
    <BankingShell step="Transfer confirmation">
      <View style={styles.successScreen}>
        <View style={styles.successIcon}><Ionicons name="checkmark" size={56} color={colors.success} /></View>
        <Text style={styles.successTitle}>{literal ? 'Transfer complete' : 'Transfer successful'}</Text>
        <Text style={styles.successSubtitle}>
          {literal ? `${transfer.amount} AED sent to ${transfer.recipient}.` : `${transfer.amount} AED has been sent to ${transfer.recipient}.`}
        </Text>
        {isCognitiveMode && (
          <View style={styles.referenceCard}>
            <View>
              <Text style={styles.reviewLabel}>Fee</Text>
              <Text style={styles.reviewValue}>{transfer.fee}</Text>
            </View>
            <View>
              <Text style={styles.reviewLabel}>Total</Text>
              <Text style={styles.reviewValue}>{formatMoney(total)} AED</Text>
            </View>
          </View>
        )}
        <View style={[styles.referenceCard, { marginTop: isCognitiveMode ? 10 : 28 }]}>
          <View>
            <Text style={styles.reviewLabel}>Reference number</Text>
            <Text style={styles.reviewValue}>TRX-548291</Text>
          </View>
          <View>
            <Text style={styles.reviewLabel}>Date</Text>
            <Text style={styles.reviewValue}>23 Sep 2026</Text>
          </View>
        </View>
        <View style={{ width: '100%', marginTop: 20 }}>
          <PrimaryButton label={literal ? 'Done' : 'Return to dashboard'} onPress={() => { resetTransfer(); router.replace('/'); }} />
        </View>
      </View>
    </BankingShell>
  );
}

function ConfirmDetail({ label, value }: { label: string; value: string }) {
  const styles = useBankingStyles();
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
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
