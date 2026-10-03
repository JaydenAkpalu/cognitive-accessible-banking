import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useExplainBankingContext } from '@workspace/api-client-react';
import { Preferences, useBanking, useBankingOptional } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

type Palette = ReturnType<typeof useColors>;

const getStyles = (colors: Palette, cognitiveMode = false, preferences?: Preferences) => {
  const textScale = cognitiveMode
    ? preferences?.textSize === 'extraLarge'
      ? 1.16
      : preferences?.textSize === 'large'
        ? 1.08
        : 1
    : 1;
  const spacingScale = cognitiveMode
    ? preferences?.spacing === 'spacious'
      ? 1.18
      : preferences?.spacing === 'comfortable'
        ? 1.08
        : 1
    : 1;

  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 72, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
  menuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  brandName: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 14, maxWidth: 108 },
  headerRight: { alignItems: 'flex-end', gap: 5 },
  modeLabel: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 10 },
  modePill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  content: { paddingHorizontal: 16, paddingTop: cognitiveMode ? 28 : 20, paddingBottom: cognitiveMode ? 48 * spacingScale : 36 },
  drawerOverlay: { flex: 1, backgroundColor: colors.background },
  drawer: { flex: 1, width: '100%', backgroundColor: colors.background, paddingHorizontal: 20, paddingBottom: 24 },
  drawerTop: { paddingTop: 16, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  drawerHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  drawerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  drawerBrandName: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 17, maxWidth: 190 },
  drawerCloseButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  drawerEyebrow: { color: colors.magentaDeep, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  drawerBank: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 20, marginTop: 8 },
  drawerItem: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  drawerItemText: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 15 },
  greeting: { color: colors.magentaDeep, fontFamily: 'Inter_500Medium', fontSize: 14 * textScale },
  title: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 26 * textScale, lineHeight: 32 * textScale, marginTop: 5 },
  subtitle: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 * textScale, lineHeight: 21 * textScale },
  sectionTitle: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 18 * textScale },
  sectionMeta: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 * textScale },
  section: { gap: cognitiveMode ? 12 * spacingScale : 9 },
  card: { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  primaryButton: { minHeight: cognitiveMode ? 58 * spacingScale : 54, borderRadius: cognitiveMode ? 12 : 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 16 * textScale },
  secondaryButton: { minHeight: cognitiveMode ? 54 * spacingScale : 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  secondaryButtonText: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 16 * textScale },
  backButton: { minHeight: cognitiveMode ? 44 * spacingScale : 44, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: cognitiveMode ? 24 * spacingScale : 18 },
  backText: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 14 * textScale },
  pageTitle: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 28 * textScale, lineHeight: 34 * textScale },
  inputLabel: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 15 * textScale, marginBottom: 9 * spacingScale },
  input: { minHeight: 56 * spacingScale, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.white, paddingHorizontal: 16, color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 16 * textScale },
  helper: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 19 * textScale, marginTop: 8 * spacingScale },
  assistantButton: { position: 'absolute', right: 18, bottom: 20, width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, shadowColor: colors.navyDeep, shadowOpacity: cognitiveMode ? 0.08 : 0.2, shadowRadius: cognitiveMode ? 4 : 8, elevation: cognitiveMode ? 3 : 7 },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23,43,77,0.3)' },
  assistantSheet: { maxHeight: '82%', backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sheetTitle: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 20 },
  sheetText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  answer: { marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: colors.blueSoft },
  answerText: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 21 },
  suggestion: { alignSelf: 'flex-start', minHeight: 42, paddingHorizontal: 13, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 21, marginRight: 8 },
  suggestionText: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 12 },
  chatRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 14, paddingBottom: 10 },
  chatInput: { flex: 1, minHeight: 48, maxHeight: 100, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, color: colors.navyDeep, fontFamily: 'Inter_400Regular', fontSize: 14 },
  sendButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.magenta },
  contactRow: { minHeight: 64 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 14 * spacingScale, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.magentaSoft, alignItems: 'center', justifyContent: 'center' },
  contactInitial: { color: colors.magenta, fontFamily: 'Inter_700Bold', fontSize: 16 * textScale },
  contactName: { flex: 1, color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 14 * textScale },
  quickAmount: { flex: 1, minHeight: 50 * spacingScale, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  quickAmountText: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 14 * textScale },
  reviewCard: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, overflow: 'hidden' },
  reviewRow: { minHeight: cognitiveMode ? 100 * spacingScale : 92, padding: cognitiveMode ? 20 * spacingScale : 18, flexDirection: 'row', alignItems: 'center' },
  reviewDivider: { height: 1, backgroundColor: colors.border },
  reviewLabel: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 * textScale, marginBottom: 5 },
  reviewValue: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 17 * textScale },
  reviewMetaRow: { padding: 18 * spacingScale, flexDirection: 'row', gap: 60 * spacingScale },
  confirmMetaRow: { padding: 18 * spacingScale, flexDirection: 'row', gap: 14 },
  editButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.muted },
  editButtonLabeled: { minWidth: 70, height: 38, paddingHorizontal: 10, borderRadius: 19, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  editButtonText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  lensCard: { marginTop: 16 * spacingScale, padding: 17 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.magentaSoft, backgroundColor: colors.magentaSoft, gap: 8 * spacingScale },
  lensHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lensTitle: { color: colors.magentaDeep, fontFamily: 'Inter_600SemiBold', fontSize: 15 * textScale },
  lensText: { color: colors.navyDeep, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 20 * textScale },
  successScreen: { minHeight: 580, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  successIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#e3f5ed', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  successTitle: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 28 * textScale, textAlign: 'center' },
  successSubtitle: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15 * textScale, lineHeight: 22 * textScale, textAlign: 'center', marginTop: 10 * spacingScale, maxWidth: 310 },
  referenceCard: { width: '100%', marginTop: 28 * spacingScale, padding: 18 * spacingScale, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'space-between' },
  settingsCard: { padding: 17, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  settingsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preferenceRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  preferenceLabel: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 14 },
  preferenceDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, marginTop: 4 },
  preferenceChoice: { paddingVertical: 16 * spacingScale },
  segmentedControl: { flexDirection: 'row', gap: 6, marginTop: 12 },
  segment: { flex: 1, minHeight: 42 * spacingScale, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { borderColor: colors.primary, backgroundColor: colors.accent },
  segmentText: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 * textScale, textAlign: 'center' },
  segmentTextSelected: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  settingsLink: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  settingsLinkText: { color: colors.magenta, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  flowProgress: { paddingVertical: 10 * spacingScale, gap: 9 * spacingScale, borderBottomWidth: 1, borderBottomColor: colors.border },
  flowProgressEyebrow: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 13 * textScale },
  flowProgressTrack: { flexDirection: 'row', gap: 4 },
  flowProgressSegment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.muted },
  flowProgressSegmentActive: { backgroundColor: colors.primary },
  confirmDetails: { padding: 18 * spacingScale, gap: 14 * spacingScale },
  });
};

export function BankingShell({ children, step }: { children: React.ReactNode; step: string }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const banking = useBanking();
  const styles = getStyles(colors, banking.isCognitiveMode, banking.preferences);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (!banking.isCognitiveMode) setAssistantOpen(false);
  }, [banking.isCognitiveMode]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 8 : 0, minHeight: 72 + (Platform.OS === 'web' ? 67 : 0) }]}>
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen((open) => !open)} accessibilityRole="button" accessibilityLabel={menuOpen ? 'Close banking menu' : 'Open banking menu'} accessibilityState={{ expanded: menuOpen }} testID="open-menu">
          <Ionicons name={menuOpen ? 'close-outline' : 'menu-outline'} size={26} color={colors.navyDeep} />
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>CBI</Text></View>
          <Text style={styles.brandName}>Commercial Bank International</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.modeLabel}>Cognitive Mode — {banking.isCognitiveMode ? 'ON' : 'OFF'}</Text>
          <View style={styles.modePill}>
            <Switch
              value={banking.isCognitiveMode}
              onValueChange={banking.setIsCognitiveMode}
              trackColor={{ false: colors.border, true: colors.magenta }}
              thumbColor={colors.white}
              accessibilityLabel="Cognitive Mode"
              testID="cognitive-mode-toggle"
            />
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (banking.isCognitiveMode ? 96 : 36) }]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {banking.isCognitiveMode && (
        <>
          <Pressable style={styles.assistantButton} onPress={() => setAssistantOpen(true)} accessibilityRole="button" accessibilityLabel="Open contextual assistant" testID="open-assistant">
            <MaterialCommunityIcons name="message-text-outline" size={23} color={colors.white} />
          </Pressable>
          <AssistantSheet open={assistantOpen} close={() => setAssistantOpen(false)} step={step} />
        </>
      )}
      <Drawer open={menuOpen} close={() => setMenuOpen(false)} />
    </View>
  );
}

function Drawer({ open, close }: { open: boolean; close: () => void }) {
  const colors = useColors();
  const banking = useBankingOptional();
  const styles = getStyles(colors, banking?.isCognitiveMode ?? false, banking?.preferences);
  const insets = useSafeAreaInsets();
  const items = [
    { label: 'Home', icon: 'home-outline' as const, action: () => router.replace('/') },
    { label: 'Accounts', icon: 'business-outline' as const, action: () => router.replace('/') },
    { label: 'Transfers', icon: 'swap-horizontal-outline' as const, action: () => router.push('/transfer/recipient') },
    { label: 'Payments', icon: 'card-outline' as const },
    { label: 'Savings & Investments', icon: 'trending-up-outline' as const, action: () => router.push('/savings') },
    { label: 'Cards', icon: 'wallet-outline' as const },
    { label: 'Transaction History', icon: 'document-text-outline' as const, action: () => router.push('/transactions') },
    { label: 'Support', icon: 'help-circle-outline' as const },
    { label: 'Cognitive Mode', icon: 'settings-outline' as const, action: () => router.push('/settings') },
  ];

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.drawerOverlay} onPress={close}>
        <Pressable style={[styles.drawer, { paddingTop: insets.top }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.drawerTop}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrand}>
                <View style={styles.brandMark}><Text style={styles.brandMarkText}>CBI</Text></View>
                <Text style={styles.drawerBrandName}>Commercial Bank International</Text>
              </View>
              <Pressable style={styles.drawerCloseButton} onPress={close} accessibilityRole="button" accessibilityLabel="Close banking menu" accessibilityState={{ expanded: true }} testID="close-menu">
                <Ionicons name="close-outline" size={27} color={colors.navyDeep} />
              </Pressable>
            </View>
            <Text style={styles.drawerEyebrow}>Main menu</Text>
          </View>
          {items.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.drawerItem, pressed && { opacity: 0.65 }]}
              onPress={() => {
                close();
                item.action?.();
              }}
              accessibilityRole="button"
            >
              <Ionicons name={item.icon} size={21} color={item.action ? colors.magenta : colors.navy} />
              <Text style={styles.drawerItemText}>{item.label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AssistantSheet({ open, close, step }: { open: boolean; close: () => void; step: string }) {
  const colors = useColors();
  const banking = useBankingOptional();
  const styles = getStyles(colors, banking?.isCognitiveMode ?? false, banking?.preferences);
  const { transfer, balance, transactions, savings, preferences, isCognitiveMode } = useBanking();
  const assistant = useExplainBankingContext();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const page = assistantPageForStep(step);
  const suggestions = assistantSuggestions(page, step, preferences.literalLanguage);
  const isTransferPage = page === 'transfers';
  const context = {
    page,
    mode: isCognitiveMode ? 'cognitive' : 'normal',
    step,
    settings: {
      minimalInformation: preferences.minimalInformation,
      literalLanguage: preferences.literalLanguage,
      stepByStep: preferences.stepByStep,
    },
    home: page === 'home'
      ? {
          availableBalance: formatAssistantMoney(balance),
          accountLabel: 'Current account',
          transactionCount: transactions.length,
        }
      : undefined,
    transfer: isTransferPage
      ? {
          step,
          recipient: transfer.recipient || 'Not entered yet',
          bank: transfer.bank || 'Not selected yet',
          amount: transfer.amount ? formatAssistantMoney(parseAssistantMoney(transfer.amount)) : 'Not entered yet',
          fee: transfer.fee || 'Not calculated yet',
          total: transfer.amount ? formatAssistantMoney(parseAssistantMoney(transfer.amount) + parseAssistantMoney(transfer.fee)) : 'Not calculated yet',
          expectedArrival: transfer.timing || 'Not calculated yet',
          purpose: transfer.purpose || 'Not selected yet',
          cancellable: transfer.cancellable || 'Not available yet',
          warning: transfer.warning || 'None',
          nextStep: transfer.nextStep || 'Continue to the next step',
        }
      : undefined,
    savings: page === 'savings'
      ? {
          savingsBalance: formatAssistantMoney(savings.savingsBalance),
          fixedDepositBalance: formatAssistantMoney(savings.fixedDepositBalance),
          investmentValue: formatAssistantMoney(savings.investmentValue),
          totalInvested: formatAssistantMoney(savings.totalInvested),
        }
      : undefined,
  };

  const ask = (prompt: string) => {
    setQuestion(prompt);
    setAnswer('');
    if (__DEV__) {
      console.info('[AI] Question submitted', { page, endpoint: '/api/assistant/explain' });
    }
    assistant.mutate({
      data: {
        question: prompt,
        context,
        preferences: {
          minimalInformation: preferences.minimalInformation,
          literalLanguage: preferences.literalLanguage,
          stepByStep: preferences.stepByStep,
        },
      },
    }, {
      onSuccess: (result) => {
        if (__DEV__) console.info('[AI] Answer received', { page, answerLength: result.answer.length });
        setAnswer(result.answer);
      },
      onError: (error) => {
        const diagnostic = error as Error & { status?: number; statusText?: string };
        console.error('[AI] Assistant request failed', {
          page,
          errorType: diagnostic.name || 'UnknownError',
          message: diagnostic.message || String(error),
          status: diagnostic.status,
          statusText: diagnostic.statusText,
        });
        setAnswer("I couldn't answer that right now.\nTry again, or ask about the information currently shown on this page.");
      },
    });
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.sheetBackdrop} behavior="padding">
        <Pressable style={styles.assistantSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View><Text style={styles.sheetTitle}>Ask about this screen</Text><Text style={styles.sheetText}>Short answers about your current banking step.</Text></View>
            <Pressable onPress={close} accessibilityLabel="Close assistant"><Ionicons name="close" size={24} color={colors.navyDeep} /></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {answer ? <View style={styles.answer}><Text style={styles.answerText}>{answer}</Text></View> : null}
            {assistant.isPending ? <ActivityIndicator color={colors.magenta} style={{ marginTop: 18 }} /> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }} contentContainerStyle={{ paddingRight: 10 }}>
              {suggestions.map((item) => <Pressable key={item} style={styles.suggestion} onPress={() => ask(item)}><Text style={styles.suggestionText}>{item}</Text></Pressable>)}
            </ScrollView>
            <View style={styles.chatRow}>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Ask a question"
                placeholderTextColor={colors.mutedForeground}
                style={styles.chatInput}
                multiline
                onSubmitEditing={() => { if (question.trim()) { Keyboard.dismiss(); ask(question.trim()); } }}
              />
              <Pressable style={styles.sendButton} onPress={() => { if (question.trim()) { Keyboard.dismiss(); ask(question.trim()); } }} accessibilityLabel="Send question">
                <Ionicons name="arrow-up" size={21} color={colors.white} />
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function assistantPageForStep(step: string) {
  const normalized = step.toLowerCase();
  if (normalized.includes('setting')) return 'settings' as const;
  if (normalized.includes('saving') || normalized.includes('investment')) return 'savings' as const;
  if (normalized.includes('transaction')) return 'transactions' as const;
  if (
    normalized.includes('recipient') ||
    normalized.includes('amount') ||
    normalized.includes('transfer') ||
    normalized.includes('confirm')
  ) return 'transfers' as const;
  return 'home' as const;
}

function assistantSuggestions(
  page: ReturnType<typeof assistantPageForStep>,
  step: string,
  plainLanguage: boolean,
) {
  if (page === 'home') {
    return plainLanguage
      ? ['What can I do here?', 'How much money can I use?', 'Where can I see transactions?']
      : ['What can I do from this page?', 'Explain my available balance', 'Where can I see my transactions?'];
  }

  if (page === 'settings') {
    return [
      'What does Cognitive Mode change?',
      'What does simpler information mean?',
      'What does Plain Language change?',
      'What does Step-by-Step Guidance do?',
      'How does Text Size work?',
      'What does Reduced Distractions do?',
    ];
  }

  if (page === 'savings') {
    return plainLanguage
      ? ['What is saving?', 'What do I have in savings?', 'What do I have invested?']
      : ['What is the difference between saving and investing?', 'What do I currently have in savings?', 'What do I currently have invested?'];
  }

  if (page === 'transactions') {
    return plainLanguage
      ? ['What is this transaction?', 'Why did my balance change?', 'What can I do here?']
      : ['Explain this transaction', 'Why did my balance change?', 'How can I find a transaction?'];
  }

  const normalized = step.toLowerCase();
  if (normalized.includes('review') || normalized.includes('confirm')) {
    return plainLanguage
      ? ['What am I agreeing to?', 'How much will leave my account?', 'When will the recipient get the money?', 'Can I cancel it?']
      : ['What am I agreeing to?', 'How much will leave my account?', 'When will the recipient get the money?', 'Can I cancel this transfer?'];
  }
  if (normalized.includes('amount') || normalized === 'transfer') {
    return plainLanguage
      ? ['What happens next?', 'Will I be charged?', 'When will the money arrive?', 'Can I cancel this transfer?']
      : ['What happens next?', 'Will I be charged for this transfer?', 'When will the money arrive?', 'Can I cancel this transfer?'];
  }
  return plainLanguage
    ? ['What information do I need to send money?', 'What happens when I send money?', 'Will I be charged?']
    : ['What information do I need to send money?', 'What happens when I send money?', 'Will I be charged for this transfer?'];
}

function parseAssistantMoney(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAssistantMoney(value: number) {
  return `AED ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function useBankingStyles() {
  const banking = useBankingOptional();
  return getStyles(useColors(), banking?.isCognitiveMode ?? false, banking?.preferences);
}

export function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  const styles = useBankingStyles();
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><Text style={styles.sectionTitle}>{title}</Text>{meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}</View>;
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  const colors = useColors();
  const banking = useBankingOptional();
  const styles = getStyles(colors, banking?.isCognitiveMode ?? false, banking?.preferences);
  return <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.primaryButton, disabled && { opacity: 0.45 }, pressed && !disabled && { opacity: 0.78 }]}><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useBankingStyles();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}><Text style={styles.secondaryButtonText}>{label}</Text></Pressable>;
}

export function BackButton({ label = 'Back' }: { label?: string }) {
  const colors = useColors();
  const banking = useBankingOptional();
  const styles = getStyles(colors, banking?.isCognitiveMode ?? false, banking?.preferences);
  return <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button"><Ionicons name="arrow-back" size={20} color={colors.navyDeep} /><Text style={styles.backText}>{label}</Text></Pressable>;
}

const flowSteps = ['Recipient', 'Amount', 'Review', 'Confirm'];

export function CognitiveFlowProgress({ currentStep }: { currentStep: number }) {
  const styles = useBankingStyles();
  const safeStep = Math.min(Math.max(currentStep, 1), flowSteps.length);
  return (
    <View
      style={styles.flowProgress}
      accessibilityLabel={`Step ${safeStep} of ${flowSteps.length}: ${flowSteps[safeStep - 1]}`}
      testID="transfer-step-progress"
    >
      <Text style={styles.flowProgressEyebrow}>Step {safeStep} of {flowSteps.length}</Text>
      <View style={styles.flowProgressTrack}>
        {flowSteps.map((step, index) => <View key={step} style={[styles.flowProgressSegment, index + 1 <= safeStep && styles.flowProgressSegmentActive]} />)}
      </View>
    </View>
  );
}