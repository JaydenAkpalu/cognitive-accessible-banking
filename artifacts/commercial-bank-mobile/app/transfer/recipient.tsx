import React, { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BankingShell, BackButton, CognitiveFlowProgress, PrimaryButton, SecondaryButton, useBankingStyles } from '@/components/banking-ui';
import { useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

const normalBanks = ['Emirates NBD', 'First Abu Dhabi Bank', 'Abu Dhabi Islamic Bank', 'Mashreq', 'Commercial Bank International'];
const normalPurposes = ['Personal transfer', 'Family support', 'Payment for goods or services', 'Other'];
const normalModePurposes = ['Personal transfer', 'Family support', 'Education', 'Rent', 'Goods and services', 'Other'];
const DEMO_TRANSFER = {
  recipient: 'Ahmed Hassan',
  iban: 'AE07 0331 2345 6789 0123 456',
  bank: 'Emirates NBD',
  amount: '2500',
  purpose: 'Personal transfer',
} as const;

export default function TransferRecipientScreen() {
  const { isCognitiveMode, preferences } = useBanking();

  if (!isCognitiveMode) {
    return <NormalTransferForm />;
  }

  return preferences.stepByStep ? <CognitiveTransferWizard /> : <CognitiveCompactTransferForm />;
}

function CognitiveTransferWizard() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  const currentStep = step === 'amount' ? 2 : 1;
  return currentStep === 1 ? <CognitiveRecipientStep /> : <CognitiveAmountStep />;
}

function CognitiveRecipientStep() {
  const colors = useColors();
  const styles = useBankingStyles();
  const { transfer, updateTransfer, preferences } = useBanking();
  const [attempted, setAttempted] = useState(false);
  const [ibanTouched, setIbanTouched] = useState(false);
  const [openBank, setOpenBank] = useState(false);
  const validIban = isValidUaeIban(transfer.iban);
  const ready = Boolean(transfer.recipient.trim()) && validIban && Boolean(transfer.bank);
  const showIbanError = (ibanTouched || attempted) && !validIban;

  const continueToAmount = () => {
    setAttempted(true);
    if (!ready) return;
    router.push('/transfer/recipient?step=amount');
  };

  const useDemoData = () => updateTransfer({
    recipient: DEMO_TRANSFER.recipient,
    iban: DEMO_TRANSFER.iban,
    bank: DEMO_TRANSFER.bank,
  });

  return (
    <BankingShell step="Recipient">
      <BackButton label="Back to home" />
      <CognitiveFlowProgress currentStep={1} />
      <Text style={styles.pageTitle}>Who are you sending money to?</Text>
      {!preferences.minimalInformation && !preferences.reducedDistractions && (
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Enter the recipient details carefully.</Text>
      )}
      <DemoDataAction onPress={useDemoData} />

      <View style={{ marginTop: 24 }}>
        <Text style={styles.inputLabel}>Full name</Text>
        <TextInput
          value={transfer.recipient}
          onChangeText={(value) => updateTransfer({ recipient: value })}
          style={styles.input}
          accessibilityLabel="Recipient full name"
        />
        {attempted && !transfer.recipient.trim() && <ValidationMessage text="Enter the recipient's full name." />}

        <Text style={[styles.inputLabel, { marginTop: 18 }]}>IBAN</Text>
        <TextInput
          value={transfer.iban}
          onChangeText={(value) => updateTransfer({ iban: value.toUpperCase().replace(/[^A-Z0-9 ]/g, '') })}
          onBlur={() => setIbanTouched(true)}
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel="Recipient IBAN"
        />
        {showIbanError && <ValidationMessage text="Enter a valid UAE IBAN." />}

        <Text style={[styles.inputLabel, { marginTop: 18 }]}>Bank</Text>
        <Pressable
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setOpenBank((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: openBank }}
        >
          <Text style={{ color: transfer.bank ? colors.navyDeep : colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 16 }}>{transfer.bank || 'Select bank'}</Text>
        </Pressable>
        {openBank && (
          <View style={[styles.card, { marginTop: 6, padding: 8 }]}>
            {normalBanks.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  updateTransfer({ bank: option });
                  setOpenBank(false);
                }}
                style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.contactName}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {attempted && !transfer.bank && <ValidationMessage text="Select the recipient's bank." />}
      </View>

      <View style={{ gap: 10, marginTop: 26 }}>
        <PrimaryButton label="Continue" onPress={continueToAmount} disabled={!ready} />
        {!preferences.minimalInformation && !preferences.reducedDistractions && (
          <Text style={styles.helper}>Next: enter the amount you want to send.</Text>
        )}
      </View>
    </BankingShell>
  );
}

function CognitiveAmountStep() {
  const colors = useColors();
  const styles = useBankingStyles();
  const { transfer, balance, updateTransfer, preferences } = useBanking();
  const [attempted, setAttempted] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [openPurpose, setOpenPurpose] = useState(false);
  const amountValue = parseMoney(transfer.amount);
  const validAmount = amountValue > 0 && amountValue <= balance;
  const ready = validAmount && Boolean(transfer.purpose);
  const fee = parseMoney(transfer.fee);
  const total = amountValue + fee;
  const showAmountError = (amountTouched || attempted) && !validAmount;

  const continueToReview = () => {
    setAttempted(true);
    if (!ready) return;
    router.push('/transfer/review');
  };

  const useDemoData = () => updateTransfer({ amount: DEMO_TRANSFER.amount });

  return (
    <BankingShell step="Amount">
      {!preferences.reducedDistractions && <BackButton label="Back to recipient" />}
      <CognitiveFlowProgress currentStep={2} />
      <Text style={styles.pageTitle}>How much are you sending?</Text>
      {!preferences.minimalInformation && !preferences.reducedDistractions && (
        <Text style={[styles.subtitle, { marginTop: 8 }]}>You can review the full transfer before it is sent.</Text>
      )}
      <DemoDataAction onPress={useDemoData} />

      <View style={{ marginTop: 24 }}>
        <Text style={styles.inputLabel}>Amount</Text>
        <View style={{ position: 'relative' }}>
          <Text style={{ position: 'absolute', left: 16, top: 17, zIndex: 1, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15 }}>AED</Text>
          <TextInput
            value={transfer.amount}
            onChangeText={(value) => updateTransfer({ amount: value.replace(/[^0-9.]/g, '') })}
            onBlur={() => setAmountTouched(true)}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, { paddingLeft: 64, minHeight: 74, fontSize: 28, fontFamily: 'Inter_700Bold' }]}
          />
        </View>
        <Text style={styles.helper}>Available balance: AED {formatMoney(balance)}</Text>
        {showAmountError && <ValidationMessage text={amountValue > balance ? "You don't have enough money in this account." : 'Enter an amount greater than AED 0.'} />}

        {validAmount && (
          <View style={[styles.card, { marginTop: 20, padding: 16, gap: 10 }]}>
            <SummaryRow label="Fee" value={`AED ${formatMoney(fee)}`} />
            <SummaryRow label="Total" value={`AED ${formatMoney(total)}`} />
          </View>
        )}

        <Text style={[styles.inputLabel, { marginTop: 22 }]}>Purpose</Text>
        <Pressable
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setOpenPurpose((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: openPurpose }}
        >
          <Text style={{ color: transfer.purpose ? colors.navyDeep : colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 16 }}>{transfer.purpose || 'Select purpose'}</Text>
        </Pressable>
        {openPurpose && (
          <View style={[styles.card, { marginTop: 6, padding: 8 }]}>
            {normalPurposes.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  updateTransfer({ purpose: option });
                  setOpenPurpose(false);
                }}
                style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.contactName}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {attempted && !transfer.purpose && <ValidationMessage text="Select a purpose for this transfer." />}
      </View>

      <View style={{ gap: 10, marginTop: 26 }}>
        <PrimaryButton label="Continue" onPress={continueToReview} disabled={!ready} />
        <SecondaryButton label="Back" onPress={() => router.replace('/transfer/recipient')} />
      </View>
    </BankingShell>
  );
}

function CognitiveCompactTransferForm() {
  const colors = useColors();
  const styles = useBankingStyles();
  const { transfer, balance, updateTransfer, preferences } = useBanking();
  const [attempted, setAttempted] = useState(false);
  const [ibanTouched, setIbanTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [openSelect, setOpenSelect] = useState<'bank' | 'purpose' | null>(null);
  const amountValue = parseMoney(transfer.amount);
  const validIban = isValidUaeIban(transfer.iban);
  const validAmount = amountValue > 0 && amountValue <= balance;
  const ready = Boolean(transfer.recipient.trim()) && validIban && Boolean(transfer.bank) && validAmount && Boolean(transfer.purpose);
  const fee = parseMoney(transfer.fee);
  const total = amountValue + fee;

  const reviewTransfer = () => {
    setAttempted(true);
    if (!ready) return;
    router.push('/transfer/review');
  };

  const useDemoData = () => updateTransfer({
    recipient: DEMO_TRANSFER.recipient,
    iban: DEMO_TRANSFER.iban,
    bank: DEMO_TRANSFER.bank,
    amount: DEMO_TRANSFER.amount,
    purpose: DEMO_TRANSFER.purpose,
  });

  return (
    <BankingShell step="Transfer">
      <BackButton label="Back to home" />
      <Text style={styles.pageTitle}>Send money</Text>
      {!preferences.minimalInformation && !preferences.reducedDistractions && (
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Enter the details, then review the transfer.</Text>
      )}
      <DemoDataAction onPress={useDemoData} />

      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Recipient</Text>
        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Full name</Text>
        <TextInput
          value={transfer.recipient}
          onChangeText={(value) => updateTransfer({ recipient: value })}
          placeholder="Enter recipient's full name"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
        />
        {attempted && !transfer.recipient.trim() && <ValidationMessage text="Enter the recipient's full name." />}

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>IBAN</Text>
        <TextInput
          value={transfer.iban}
          onChangeText={(value) => updateTransfer({ iban: value.toUpperCase().replace(/[^A-Z0-9 ]/g, '') })}
          onBlur={() => setIbanTouched(true)}
          placeholder="Enter recipient's IBAN"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {(ibanTouched || attempted) && !validIban && <ValidationMessage text="Enter a valid UAE IBAN." />}

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Bank</Text>
        <Pressable style={[styles.input, { justifyContent: 'center' }]} onPress={() => setOpenSelect(openSelect === 'bank' ? null : 'bank')} accessibilityRole="button">
          <Text style={{ color: transfer.bank ? colors.navyDeep : colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 16 }}>{transfer.bank || 'Select bank'}</Text>
        </Pressable>
        {openSelect === 'bank' && (
          <View style={[styles.card, { marginTop: 6, padding: 8 }]}>
            {normalBanks.map((option) => (
              <Pressable key={option} onPress={() => { updateTransfer({ bank: option }); setOpenSelect(null); }} style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}>
                <Text style={styles.contactName}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {attempted && !transfer.bank && <ValidationMessage text="Select the recipient's bank." />}
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Transfer details</Text>
        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Amount</Text>
        <TextInput
          value={transfer.amount}
          onChangeText={(value) => updateTransfer({ amount: value.replace(/[^0-9.]/g, '') })}
          onBlur={() => setAmountTouched(true)}
          placeholder="AED 0.00"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="decimal-pad"
          style={[styles.input, { minHeight: 68, fontSize: 24, fontFamily: 'Inter_700Bold' }]}
        />
        <Text style={styles.helper}>Available balance: AED {formatMoney(balance)}</Text>
        {(amountTouched || attempted) && !validAmount && <ValidationMessage text={amountValue > balance ? "You don't have enough money in this account." : 'Enter an amount greater than AED 0.'} />}

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Purpose</Text>
        <Pressable style={[styles.input, { justifyContent: 'center' }]} onPress={() => setOpenSelect(openSelect === 'purpose' ? null : 'purpose')} accessibilityRole="button">
          <Text style={{ color: transfer.purpose ? colors.navyDeep : colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 16 }}>{transfer.purpose || 'Select purpose'}</Text>
        </Pressable>
        {openSelect === 'purpose' && (
          <View style={[styles.card, { marginTop: 6, padding: 8 }]}>
            {normalPurposes.map((option) => (
              <Pressable key={option} onPress={() => { updateTransfer({ purpose: option }); setOpenSelect(null); }} style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}>
                <Text style={styles.contactName}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {attempted && !transfer.purpose && <ValidationMessage text="Select a purpose for this transfer." />}
      </View>

      {validAmount && (
        <View style={[styles.card, { marginTop: 24, padding: 16, gap: 10 }]}>
          <Text style={styles.sectionTitle}>Transfer summary</Text>
          <SummaryRow label="Fee" value={`AED ${formatMoney(fee)}`} />
          <SummaryRow label="Total" value={`AED ${formatMoney(total)}`} />
          <SummaryRow label="Expected arrival" value={transfer.timing} />
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="Review transfer" onPress={reviewTransfer} disabled={!ready} />
      </View>
    </BankingShell>
  );
}

function NormalTransferForm() {
  const colors = useColors();
  const styles = useBankingStyles();
  const { transfer, balance, updateTransfer, resetTransfer } = useBanking();
  const [recipient, setRecipient] = useState(transfer.recipient);
  const [iban, setIban] = useState(transfer.iban);
  const [bank, setBank] = useState(transfer.bank);
  const [amount, setAmount] = useState(transfer.amount);
  const [purpose, setPurpose] = useState(transfer.purpose);
  const [transferType, setTransferType] = useState<'Local Transfer' | 'International Transfer'>(
    transfer.transferType === 'International Transfer' ? 'International Transfer' : 'Local Transfer',
  );
  const [reference, setReference] = useState('');
  const [schedule, setSchedule] = useState<'now' | 'later'>(transfer.timing === 'Scheduled' ? 'later' : 'now');
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [notifyRecipient, setNotifyRecipient] = useState(false);
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const [openSelect, setOpenSelect] = useState<'bank' | 'purpose' | null>(null);
  const [attemptedReview, setAttemptedReview] = useState(false);
  const [ibanTouched, setIbanTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);

  const normalizedIban = normalizeUaeIban(iban);
  const amountValue = parseMoney(amount);
  const validIban = isValidUaeIban(iban);
  const validAmount = amountValue > 0 && amountValue <= balance;
  const ready = Boolean(recipient.trim()) && validIban && Boolean(bank) && validAmount && Boolean(purpose);
  const showIbanError = (ibanTouched || attemptedReview) && !validIban;
  const showAmountError = (amountTouched || attemptedReview) && !validAmount;
  const fee = parseMoney(transfer.fee);
  const total = amountValue + fee;
  const arrival = schedule === 'now' ? 'Today' : 'Scheduled';

  const reviewTransfer = () => {
    setAttemptedReview(true);
    if (!ready) return;
    updateTransfer({
      recipient: recipient.trim(),
      iban: normalizedIban,
      bank,
      amount,
      purpose,
      transferType,
      timing: arrival,
    });
    router.push('/transfer/review');
  };

  const chooseBeneficiary = () => {
    setRecipient(DEMO_TRANSFER.recipient);
    setIban(DEMO_TRANSFER.iban);
    setBank(DEMO_TRANSFER.bank);
    updateTransfer({
      recipient: DEMO_TRANSFER.recipient,
      iban: DEMO_TRANSFER.iban,
      bank: DEMO_TRANSFER.bank,
    });
  };

  const useDemoData = () => {
    setRecipient(DEMO_TRANSFER.recipient);
    setIban(DEMO_TRANSFER.iban);
    setBank(DEMO_TRANSFER.bank);
    setAmount(DEMO_TRANSFER.amount);
    setPurpose(DEMO_TRANSFER.purpose);
    setTransferType('Local Transfer');
    setSchedule('now');
    setAttemptedReview(false);
    setIbanTouched(false);
    setAmountTouched(false);
    updateTransfer({
      recipient: DEMO_TRANSFER.recipient,
      iban: DEMO_TRANSFER.iban,
      bank: DEMO_TRANSFER.bank,
      amount: DEMO_TRANSFER.amount,
      purpose: DEMO_TRANSFER.purpose,
      transferType: 'Local Transfer',
      timing: 'Today',
    });
  };

  const cancelTransfer = () => {
    resetTransfer();
    router.replace('/');
  };

  return (
    <BankingShell step="Transfer">
      <BackButton label="Back to home" />
      <Text style={styles.pageTitle}>Transfer Money</Text>
      <Text style={[styles.subtitle, { marginTop: 8 }]}>Send money to a bank account or another person.</Text>

      <View style={[styles.card, { marginTop: 20, padding: 14 }]}>
        <Text style={styles.inputLabel}>Transfer type</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {(['Local Transfer', 'International Transfer'] as const).map((option) => {
            const selected = transferType === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setTransferType(option);
                  updateTransfer({ transferType: option });
                }}
                style={({ pressed }) => [{
                  flex: 1,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: 12,
                  backgroundColor: selected ? colors.blueSoft : colors.white,
                }, pressed && { opacity: 0.75 }]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option}
                testID={`transfer-type-${option === 'Local Transfer' ? 'local' : 'international'}`}
              >
                <Text style={{ color: selected ? colors.primary : colors.navyDeep, fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: 13, textAlign: 'center' }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <DemoDataAction onPress={useDemoData} />

      <View style={[styles.card, { marginTop: 18, padding: 16 }]}>
        <Text style={styles.inputLabel}>From account</Text>
        <Text style={[styles.reviewValue, { marginTop: 6 }]}>Main Account</Text>
        <Text style={[styles.helper, { marginTop: 4 }]}>Available balance: AED {formatMoney(balance)}</Text>
      </View>

      <View style={[styles.card, { marginTop: 18, padding: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Text style={styles.sectionTitle}>Recipient</Text>
          <Pressable
            onPress={chooseBeneficiary}
            accessibilityRole="button"
            accessibilityLabel="Choose beneficiary"
            testID="choose-beneficiary"
            style={({ pressed }) => [{ paddingVertical: 6, paddingHorizontal: 2 }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Choose beneficiary</Text>
          </Pressable>
        </View>
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Recipient full name</Text>
        <TextInput
          value={recipient}
          onChangeText={(value) => {
            setRecipient(value);
            updateTransfer({ recipient: value });
          }}
          placeholder="Enter recipient's full name"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          accessibilityLabel="Recipient full name"
        />
        {attemptedReview && !recipient.trim() && <ValidationMessage text="Enter the recipient's full name." />}

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Beneficiary IBAN</Text>
        <TextInput
          value={iban}
          onChangeText={(value) => {
            const nextIban = value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
            setIban(nextIban);
            updateTransfer({ iban: nextIban });
          }}
          onBlur={() => setIbanTouched(true)}
          placeholder="Enter recipient's UAE IBAN"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel="Beneficiary IBAN"
        />
        {showIbanError && <ValidationMessage text="Enter a valid UAE IBAN." />}

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Bank</Text>
        <Pressable
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setOpenSelect(openSelect === 'bank' ? null : 'bank')}
          accessibilityRole="button"
          accessibilityState={{ expanded: openSelect === 'bank' }}
        >
          <Text style={{ color: bank ? colors.navyDeep : colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 16 }}>{bank || 'Select bank'}</Text>
        </Pressable>
        {openSelect === 'bank' && (
          <View style={[styles.card, { marginTop: 6, padding: 8 }]}>
            {normalBanks.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setBank(option);
                  updateTransfer({ bank: option });
                  setOpenSelect(null);
                }}
                style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.contactName}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {attemptedReview && !bank && <ValidationMessage text="Select the recipient's bank." />}
      </View>

      <View style={[styles.card, { marginTop: 18, padding: 16 }]}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Amount</Text>
        <View style={{ position: 'relative' }}>
          <Text style={{ position: 'absolute', left: 16, top: 17, zIndex: 1, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15 }}>AED</Text>
          <TextInput
            value={amount}
            onChangeText={(value) => {
              const nextAmount = value.replace(/[^0-9.]/g, '');
              setAmount(nextAmount);
              updateTransfer({ amount: nextAmount });
            }}
            onBlur={() => setAmountTouched(true)}
            placeholder="Enter amount"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.input, { paddingLeft: 64, minHeight: 62, fontSize: 24, fontFamily: 'Inter_700Bold' }]}
            accessibilityLabel="Transfer amount in AED"
          />
        </View>
        {showAmountError && <ValidationMessage text={amountValue > balance ? "You don't have enough money in this account." : 'Enter an amount greater than AED 0.'} />}
        <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: colors.muted, gap: 8 }}>
          <NormalSummaryRow label="Transfer fee" value={`AED ${formatMoney(fee)}`} />
          <NormalSummaryRow label="Total" value={`AED ${formatMoney(total)}`} />
          <NormalSummaryRow label="Expected arrival" value={arrival} />
        </View>
      </View>

      <View style={[styles.card, { marginTop: 18, padding: 16 }]}>
        <Text style={styles.sectionTitle}>Additional transfer information</Text>
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Purpose of transfer</Text>
        <Pressable
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setOpenSelect(openSelect === 'purpose' ? null : 'purpose')}
          accessibilityRole="button"
          accessibilityState={{ expanded: openSelect === 'purpose' }}
          testID="normal-purpose-select"
        >
          <Text style={{ color: purpose ? colors.navyDeep : colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 16 }}>{purpose || 'Select purpose'}</Text>
        </Pressable>
        {openSelect === 'purpose' && (
          <View style={[styles.card, { marginTop: 6, padding: 8 }]}>
            {normalModePurposes.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setPurpose(option);
                  updateTransfer({ purpose: option });
                  setOpenSelect(null);
                }}
                style={({ pressed }) => [{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.contactName}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {attemptedReview && !purpose && <ValidationMessage text="Select a purpose for this transfer." />}

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Transfer reference (optional)</Text>
        <TextInput
          value={reference}
          onChangeText={setReference}
          placeholder="Add a note for this transfer"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          accessibilityLabel="Transfer reference (optional)"
          testID="transfer-reference"
        />

        <Pressable
          onPress={() => setShowFeeInfo((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showFeeInfo }}
          style={({ pressed }) => [{ alignSelf: 'flex-start', marginTop: 12, paddingVertical: 4 }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>View transfer limits &amp; fees</Text>
        </Pressable>
        {showFeeInfo && (
          <View style={[styles.card, { marginTop: 8, padding: 12 }]}>
            <Text style={styles.helper}>Demo fee: AED {formatMoney(fee)}. Transfer limits are not configured in this demo.</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, { marginTop: 18, padding: 16 }]}>
        <Text style={styles.sectionTitle}>Additional banking options</Text>
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Schedule transfer</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {([{ value: 'now', label: 'Now' }, { value: 'later', label: 'Schedule for later' }] as const).map((option) => {
            const selected = schedule === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSchedule(option.value);
                  updateTransfer({ timing: option.value === 'now' ? 'Today' : 'Scheduled' });
                }}
                style={({ pressed }) => [{
                  flex: 1,
                  minHeight: 46,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: 12,
                  backgroundColor: selected ? colors.blueSoft : colors.white,
                }, pressed && { opacity: 0.75 }]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                testID={`transfer-schedule-${option.value}`}
              >
                <Text style={{ color: selected ? colors.primary : colors.navyDeep, fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_500Medium', fontSize: 13, textAlign: 'center' }}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 14 }}>
          <Text style={[styles.inputLabel, { flex: 1 }]}>Save as beneficiary</Text>
          <Switch
            value={saveBeneficiary}
            onValueChange={setSaveBeneficiary}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Save as beneficiary"
            testID="save-as-beneficiary"
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 8 }}>
          <Text style={[styles.inputLabel, { flex: 1 }]}>Send notification to recipient</Text>
          <Switch
            value={notifyRecipient}
            onValueChange={setNotifyRecipient}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Send notification to recipient"
            testID="notify-recipient"
          />
        </View>
      </View>

      <View style={[styles.card, { marginTop: 18, padding: 16, gap: 10 }]}>
        <Text style={styles.sectionTitle}>Transfer summary</Text>
        <NormalSummaryRow label="From" value="Main Account" />
        <NormalSummaryRow label="To" value={recipient.trim() || '—'} />
        <NormalSummaryRow label="Amount" value={amountValue > 0 ? `AED ${formatMoney(amountValue)}` : '—'} />
        <NormalSummaryRow label="Fee" value={`AED ${formatMoney(fee)}`} />
        <NormalSummaryRow label="Total" value={amountValue > 0 ? `AED ${formatMoney(total)}` : '—'} />
        <NormalSummaryRow label="Arrival" value={arrival} />
      </View>

      <View style={{ gap: 10, marginTop: 18 }}>
        <PrimaryButton label="Review transfer" onPress={reviewTransfer} disabled={!ready} />
        <SecondaryButton label="Cancel" onPress={cancelTransfer} />
      </View>
    </BankingShell>
  );
}

function DemoDataAction({ onPress }: { onPress: () => void }) {
  const styles = useBankingStyles();
  return (
    <View style={{ marginTop: 14, gap: 6 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.secondaryButton, { minHeight: 46 }, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel="Use demo data"
      >
        <Text style={styles.secondaryButtonText}>Use Demo Data</Text>
      </Pressable>
      <Text style={styles.helper}>Demo environment · No real transactions</Text>
    </View>
  );
}

function ValidationMessage({ text }: { text: string }) {
  const colors = useColors();
  return <Text style={{ color: colors.magentaDeep, fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 7 }}>{text}</Text>;
}

function NormalSummaryRow({ label, value }: { label: string; value: string }) {
  const styles = useBankingStyles();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, { textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

function normalizeUaeIban(value: string) {
  return value.replace(/\s/g, '').toUpperCase();
}

function isValidUaeIban(value: string) {
  return /^AE\d{21}$/.test(normalizeUaeIban(value));
}

function parseMoney(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const styles = useBankingStyles();
  return (
    <View style={{ gap: 3 }}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}