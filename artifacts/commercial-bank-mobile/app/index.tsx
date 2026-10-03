import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BankingShell, SectionHeader, useBankingStyles } from '@/components/banking-ui';
import { BankingTransaction, Preferences, SavingsState, useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const { resetTransfer, balance, transactions, savings, isCognitiveMode, preferences } = useBanking();

  return (
    <BankingShell step="Home">
      {isCognitiveMode ? (
        <CognitiveHome
          balance={balance}
          transactions={transactions}
          savings={savings}
          preferences={preferences}
          resetTransfer={resetTransfer}
        />
      ) : (
        <NormalHome
          balance={balance}
          transactions={transactions}
          savings={savings}
          preferences={preferences}
          resetTransfer={resetTransfer}
        />
      )}
    </BankingShell>
  );
}

function NormalHome({
  balance,
  transactions,
  savings,
  preferences,
  resetTransfer,
}: {
  balance: number;
  transactions: BankingTransaction[];
  savings: SavingsState;
  preferences: Preferences;
  resetTransfer: () => void;
}) {
  const colors = useColors();
  const styles = useBankingStyles();
  const homeStyles = getHomeStyles(colors, false, preferences);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<'current' | 'savings' | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [notice, setNotice] = useState('');
  const totalSavings = savings.savingsBalance + savings.fixedDepositBalance;
  const recentTransactions = showAllActivity ? transactions : transactions.slice(0, 3);

  return (
    <>
      <View style={homeStyles.homeTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Good morning, Jayden</Text>
          <Text style={styles.title}>Your financial overview</Text>
        </View>
        <View style={homeStyles.headerActions}>
          <Pressable style={homeStyles.avatar} accessibilityLabel="Profile">
            <Text style={homeStyles.avatarText}>JD</Text>
          </Pressable>
          <Pressable style={homeStyles.iconCircle} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={21} color={colors.navyDeep} />
          </Pressable>
        </View>
      </View>

      <LinearGradient
        colors={[colors.navy, colors.navyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={homeStyles.balanceCard}
      >
        <View style={homeStyles.balanceRow}>
          <Text style={homeStyles.balanceLabel}>Total available balance</Text>
          <Pressable onPress={() => setShowBalance((visible) => !visible)} accessibilityRole="button" accessibilityLabel={showBalance ? 'Hide balance' : 'Show balance'}>
            <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={21} color="rgba(255,255,255,0.86)" />
          </Pressable>
        </View>
        <Text style={homeStyles.balanceAmount}>{showBalance ? formatAed(balance) : '••••••'}</Text>
        <Text style={homeStyles.balanceSupporting}>Across your accounts</Text>
        <View style={homeStyles.balanceFooter}>
          <Text style={homeStyles.balanceMeta}>Available to spend</Text>
          <Text style={homeStyles.balanceLink}>Current account · •••• 8829</Text>
        </View>
      </LinearGradient>

      <View style={homeStyles.sectionBlock}>
        <SectionHeader title="Accounts" meta="2 accounts" />
        <AccountCard
          title="Main Account"
          amount={balance}
          detail="Checking · everyday spending"
          selected={selectedAccount === 'current'}
          onPress={() => setSelectedAccount((current) => current === 'current' ? null : 'current')}
          homeStyles={homeStyles}
        />
        <AccountCard
          title="Savings Account"
          amount={totalSavings}
          detail={savings.fixedDepositBalance > 0 ? 'Savings · includes fixed deposit' : 'Savings · accessible when needed'}
          selected={selectedAccount === 'savings'}
          onPress={() => setSelectedAccount((current) => current === 'savings' ? null : 'savings')}
          homeStyles={homeStyles}
        />
        {selectedAccount && (
          <View style={homeStyles.accountDetailPanel}>
            <Text style={homeStyles.accountDetailTitle}>{selectedAccount === 'current' ? 'Main Account details' : 'Savings Account details'}</Text>
            <Text style={homeStyles.accountDetailText}>
              {selectedAccount === 'current'
                ? 'Available for everyday spending and transfers.'
                : savings.fixedDepositBalance > 0
                  ? `${formatAed(savings.savingsBalance)} flexible savings · ${formatAed(savings.fixedDepositBalance)} fixed deposit.`
                  : 'Your savings balance is available when you need it.'}
            </Text>
          </View>
        )}
      </View>

      <View style={homeStyles.sectionBlock}>
        <SectionHeader title="Quick actions" meta="Personal banking" />
        <View style={homeStyles.quickActionGrid}>
          <QuickAction icon="send-outline" label="Transfer" detail="Send money" accent="magenta" onPress={() => { resetTransfer(); router.push('/transfer/recipient'); }} testID="start-transfer" homeStyles={homeStyles} />
          <QuickAction icon="qr-code-outline" label="Pay" detail="Scan or pay a bill" accent="blue" onPress={() => setNotice('Payments are not available in this prototype yet.')} homeStyles={homeStyles} />
          <QuickAction icon="add-circle-outline" label="Add money" detail="Top up your account" accent="blue" onPress={() => setNotice('Add money is not available in this prototype yet.')} homeStyles={homeStyles} />
          <QuickAction icon="card-outline" label="Cards" detail="Manage your cards" accent="blue" onPress={() => setNotice('Card controls are represented in the dashboard card below.')} homeStyles={homeStyles} />
        </View>
      </View>

      <View style={homeStyles.sectionBlock}>
        <SectionHeader title="My cards" meta="1 active card" />
        <LinearGradient colors={[colors.navyDeep, colors.navy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={homeStyles.bankCard}>
          <View style={homeStyles.bankCardTop}>
            <Text style={homeStyles.bankCardLabel}>CBI</Text>
            <MaterialCommunityIcons name="contactless-payment" size={23} color="rgba(255,255,255,0.82)" />
          </View>
          <Text style={homeStyles.bankCardName}>Platinum Debit Card</Text>
          <Text style={homeStyles.bankCardNumber}>•••• 4618</Text>
          <View style={homeStyles.bankCardBottom}>
            <Text style={homeStyles.bankCardMeta}>Available balance</Text>
            <Text style={homeStyles.bankCardBalance}>{formatAed(balance)}</Text>
          </View>
        </LinearGradient>
        <View style={homeStyles.cardActions}>
          <Pressable onPress={() => setNotice('Card details are available in this prototype preview.')} style={homeStyles.cardAction} accessibilityRole="button"><Text style={homeStyles.cardActionText}>View card</Text></Pressable>
          <Pressable onPress={() => setNotice('Your card remains active in this prototype.')} style={homeStyles.cardAction} accessibilityRole="button"><Text style={homeStyles.cardActionText}>Freeze card</Text></Pressable>
          <Pressable onPress={() => setNotice('Card settings are not available in this prototype yet.')} style={homeStyles.cardAction} accessibilityRole="button"><Text style={homeStyles.cardActionText}>Card settings</Text></Pressable>
        </View>
      </View>

      <View style={homeStyles.activityCard}>
        <View style={homeStyles.activityHeading}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={() => router.push('/transactions')} accessibilityRole="button"><Text style={homeStyles.activityMeta}>View all</Text></Pressable>
        </View>
        {recentTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} showDate homeStyles={homeStyles} />)}
        <Pressable onPress={() => setShowAllActivity((visible) => !visible)} style={homeStyles.moreButton} accessibilityRole="button" accessibilityState={{ expanded: showAllActivity }}>
          <Text style={homeStyles.moreButtonText}>{showAllActivity ? 'Show less activity' : `View ${transactions.length} transactions`}</Text>
          <Ionicons name={showAllActivity ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={homeStyles.sectionBlock}>
        <SectionHeader title="Savings & investments" meta="Portfolio snapshot" />
        <Pressable onPress={() => router.push('/savings')} style={homeStyles.snapshotCard} accessibilityRole="button">
          <View style={homeStyles.snapshotHeader}>
            <View>
              <Text style={homeStyles.snapshotTotal}>{formatAed(totalSavings + savings.investmentValue)}</Text>
              <Text style={homeStyles.snapshotCaption}>Total savings &amp; investments</Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={21} color={colors.primary} />
          </View>
          <View style={homeStyles.snapshotBars}>
            <View style={{ flex: Math.max(totalSavings, 1), gap: 5 }}><View style={[homeStyles.snapshotBar, { backgroundColor: colors.primary }]} /><Text style={homeStyles.snapshotLabel}>Savings {formatAed(totalSavings)}</Text></View>
            <View style={{ flex: Math.max(savings.investmentValue, 1), gap: 5 }}><View style={[homeStyles.snapshotBar, { backgroundColor: colors.magenta }]} /><Text style={homeStyles.snapshotLabel}>Investments {formatAed(savings.investmentValue)}</Text></View>
          </View>
          <Text style={homeStyles.snapshotLink}>View savings &amp; investments →</Text>
        </Pressable>
      </View>

      <View style={homeStyles.insightCard}>
        <View style={homeStyles.insightHeader}><Ionicons name="analytics-outline" size={21} color={colors.primary} /><Text style={homeStyles.insightTitle}>This month</Text></View>
        <View style={homeStyles.insightMetrics}>
          <InsightMetric label="Spending" value="AED 4,280" homeStyles={homeStyles} />
          <InsightMetric label="Income" value="AED 12,000" homeStyles={homeStyles} />
          <InsightMetric label="Saved" value="AED 2,500" homeStyles={homeStyles} />
        </View>
        <Text style={homeStyles.insightText}>Your spending is 8% higher than last month.</Text>
      </View>

      <View style={homeStyles.sectionBlock}>
        <SectionHeader title="Needs your attention" meta="3 items" />
        <AttentionItem icon="card-outline" title="Your debit card expires soon" detail="Update your card details before October 15." tone="warning" homeStyles={homeStyles} />
        <AttentionItem icon="document-text-outline" title="New statement available" detail="Your August account statement is ready." tone="neutral" homeStyles={homeStyles} />
        <AttentionItem icon="checkmark-circle-outline" title="Transfer completed" detail="Your recent transfer was completed." tone="success" homeStyles={homeStyles} />
      </View>

      <View style={homeStyles.offerCard}>
        <Text style={homeStyles.offerEyebrow}>OFFERS FOR YOU</Text>
        <Text style={homeStyles.offerTitle}>Earn up to 3.5% on eligible savings</Text>
        <Text style={homeStyles.offerText}>Explore rates and terms for selected savings products.</Text>
        <Pressable onPress={() => router.push('/savings')} accessibilityRole="button"><Text style={homeStyles.offerLink}>Learn more →</Text></Pressable>
      </View>

      <View style={homeStyles.sectionBlock}>
        <SectionHeader title="Explore more" meta="More services" />
        <View style={homeStyles.servicesGrid}>
          {[
            ['card-outline', 'Cards'],
            ['receipt-outline', 'Payments'],
            ['trending-up-outline', 'Investments'],
            ['document-text-outline', 'Activity'],
            ['help-circle-outline', 'Support'],
            ['settings-outline', 'Cognitive Mode'],
          ].map(([icon, label]) => (
            <Pressable
              key={label}
              onPress={() => label === 'Investments' ? router.push('/savings') : label === 'Activity' ? router.push('/transactions') : label === 'Cognitive Mode' ? router.push('/settings') : setNotice(`${label} is represented in this prototype.`)}
              style={homeStyles.serviceTile}
              accessibilityRole="button"
            >
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
              <Text style={homeStyles.serviceText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {notice ? <Pressable onPress={() => setNotice('')} style={homeStyles.notice} accessibilityRole="button"><Ionicons name="information-circle-outline" size={19} color={colors.primary} /><Text style={homeStyles.noticeText}>{notice}</Text><Ionicons name="close-outline" size={19} color={colors.mutedForeground} /></Pressable> : null}
    </>
  );
}

function CognitiveHome({
  balance,
  transactions,
  savings,
  preferences,
  resetTransfer,
}: {
  balance: number;
  transactions: BankingTransaction[];
  savings: SavingsState;
  preferences: Preferences;
  resetTransfer: () => void;
}) {
  const colors = useColors();
  const styles = useBankingStyles();
  const homeStyles = getHomeStyles(colors, true, preferences);
  const [showAccountDetails, setShowAccountDetails] = useState(!preferences.minimalInformation);
  const [showActivity, setShowActivity] = useState(!preferences.minimalInformation);
  const [showMore, setShowMore] = useState(false);
  const [notice, setNotice] = useState('');
  const literal = preferences.literalLanguage;
  const visibleTransactions = transactions.slice(0, 2);
  const totalSavings = savings.savingsBalance + savings.fixedDepositBalance;
  const primaryActionDetail = preferences.stepByStep
    ? literal ? "We'll guide you through each step." : "We'll guide you through the transfer."
    : literal ? 'Send money to a person or company.' : 'Transfer money to a person or company.';

  useEffect(() => {
    setShowAccountDetails(!preferences.minimalInformation);
    setShowActivity(!preferences.minimalInformation);
    setShowMore(false);
  }, [preferences.minimalInformation]);

  return (
    <>
      <View style={homeStyles.homeTop}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.greeting}>Good morning, Jayden</Text>
          <Text style={styles.title}>{literal ? 'Your account' : 'Your money at a glance'}</Text>
        </View>
        {!preferences.reducedDistractions && (
          <Pressable style={homeStyles.iconCircle} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={21} color={colors.navyDeep} />
          </Pressable>
        )}
      </View>

      <View style={homeStyles.balanceCard}>
        <View style={homeStyles.balanceRow}>
          <Text style={homeStyles.balanceLabel}>{literal ? 'Money available' : 'Available balance'}</Text>
          {!preferences.reducedDistractions && <Ionicons name="shield-checkmark-outline" size={20} color="rgba(255,255,255,0.8)" />}
        </View>
        <Text style={homeStyles.balanceAmount}>{formatAed(balance)}</Text>
        <View style={homeStyles.balanceFooter}>
          <Text style={homeStyles.balanceMeta}>{literal ? 'Account ending 8829' : 'Current account · •••• 8829'}</Text>
          {!preferences.minimalInformation && <Text style={homeStyles.balanceLink}>{literal ? 'Money available to use' : 'Available to spend'}</Text>}
        </View>
      </View>

      <View style={homeStyles.cognitiveSection}>
        <Text style={homeStyles.cognitiveQuestion}>{literal ? 'What would you like to do?' : 'Choose an action'}</Text>
        <CognitiveAction
          icon="send-outline"
          label={literal ? 'Send money' : 'Transfer money'}
          detail={primaryActionDetail}
          showIcon={!preferences.reducedDistractions}
          onPress={() => {
            resetTransfer();
            router.push('/transfer/recipient');
          }}
          homeStyles={homeStyles}
          testID="cognitive-start-transfer"
        />
        <CognitiveAction
          icon="receipt-outline"
          label={literal ? 'Pay' : 'Pay a bill'}
          detail={literal ? 'Make a payment.' : 'Pay a service or utility bill.'}
          showIcon={!preferences.reducedDistractions}
          onPress={() => setNotice('Payments are not available in this prototype yet.')}
          homeStyles={homeStyles}
        />
        <CognitiveAction
          icon="save-outline"
          label={literal ? 'Save' : 'Save money'}
          detail={literal ? 'Put money aside.' : 'Move money into savings.'}
          showIcon={!preferences.reducedDistractions}
          onPress={() => router.push('/savings')}
          homeStyles={homeStyles}
        />
        <CognitiveAction
          icon="list-outline"
          label={literal ? 'View activity' : 'View recent activity'}
          detail={literal ? 'See your recent transactions.' : 'Review recent payments and transfers.'}
          showIcon={!preferences.reducedDistractions}
          onPress={() => router.push('/transactions')}
          homeStyles={homeStyles}
        />
      </View>

      {!preferences.minimalInformation && (
        <View style={homeStyles.cognitiveLinks}>
        <CognitiveSecondaryLink
          icon="wallet-outline"
          label={literal ? 'See my accounts' : 'View accounts'}
          detail={literal ? 'See your current and savings accounts.' : 'View accounts and cards.'}
          expanded={showAccountDetails}
          showIcon={!preferences.reducedDistractions}
          onPress={() => setShowAccountDetails((visible) => !visible)}
          homeStyles={homeStyles}
        />
        {showAccountDetails && (
          <View style={homeStyles.cognitiveRevealCard}>
            <CognitiveValue label={literal ? 'Main account' : 'Main Account'} value={formatAed(balance)} homeStyles={homeStyles} />
            <CognitiveValue label={literal ? 'Savings' : 'Savings Account'} value={formatAed(totalSavings)} homeStyles={homeStyles} />
          </View>
        )}
        <CognitiveSecondaryLink
          icon="list-outline"
          label={literal ? 'See recent activity' : 'Recent activity'}
          detail={literal ? 'See what happened with your money.' : 'Review your latest transactions.'}
          expanded={showActivity}
          showIcon={!preferences.reducedDistractions}
          onPress={() => setShowActivity((visible) => !visible)}
          homeStyles={homeStyles}
        />
        {showActivity && (
          <View style={homeStyles.cognitiveRevealCard}>
            {visibleTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} showDate homeStyles={homeStyles} />
            ))}
            <Pressable onPress={() => router.push('/transactions')} style={homeStyles.revealLink} accessibilityRole="button">
              <Text style={homeStyles.revealLinkText}>{literal ? 'See all activity' : 'View all activity'}</Text>
              <Ionicons name="arrow-forward-outline" size={17} color={colors.primary} />
            </Pressable>
          </View>
        )}
        <CognitiveSecondaryLink
          icon="trending-up-outline"
          label={literal ? 'Savings & investments' : 'Savings & Investments'}
          detail={literal ? 'See your savings and investments.' : 'Review your savings and investment value.'}
          showIcon={!preferences.reducedDistractions}
          onPress={() => router.push('/savings')}
          homeStyles={homeStyles}
        />
        <CognitiveSecondaryLink
          icon="ellipsis-horizontal-circle-outline"
          label={literal ? 'More' : 'More banking information'}
          detail={literal ? 'See important updates and account details.' : 'See other banking information.'}
          expanded={showMore}
          showIcon={!preferences.reducedDistractions}
          onPress={() => setShowMore((visible) => !visible)}
          homeStyles={homeStyles}
        />
        {showMore && (
          <View style={homeStyles.cognitiveRevealCard}>
            <View style={homeStyles.cognitiveUpdate}>
              <View style={homeStyles.cognitiveUpdateIcon}>
                <Ionicons name="card-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={homeStyles.cognitiveUpdateTitle}>{literal ? 'Your card expires soon' : 'Your debit card expires soon'}</Text>
                <Text style={homeStyles.cognitiveUpdateText}>Update your card details before October 15.</Text>
              </View>
            </View>
            <Text style={homeStyles.accountDetailValue}>Platinum Debit Card · •••• 4618</Text>
          </View>
        )}
        </View>
      )}

      {notice ? (
        <Pressable onPress={() => setNotice('')} style={homeStyles.notice} accessibilityRole="button">
          <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
          <Text style={homeStyles.noticeText}>{notice}</Text>
          <Ionicons name="close-outline" size={19} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </>
  );
}

function ActivityCard({
  transactions,
  minimalInformation,
  homeStyles,
}: {
  transactions: BankingTransaction[];
  minimalInformation: boolean;
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  return (
    <View style={[homeStyles.activityCard, { marginTop: 20 }]}>
      <SectionHeader title="Recent activity" meta="View all" />
      {transactions.map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} showDate={!minimalInformation} homeStyles={homeStyles} />
      ))}
    </View>
  );
}

function TransactionRow({
  transaction,
  showDate,
  homeStyles,
}: {
  transaction: BankingTransaction;
  showDate: boolean;
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  const colors = useColors();
  return (
    <View style={homeStyles.transactionRow}>
      <View style={homeStyles.transactionIcon}>
        <Ionicons name={transactionIcon(transaction.kind)} size={17} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={homeStyles.actionTitle}>{transaction.name}</Text>
        {showDate && <Text style={homeStyles.actionSubtitle}>{transaction.date}</Text>}
      </View>
      <Text style={[homeStyles.transactionAmount, transaction.positive && { color: colors.success }]}>
        {formatTransactionAmount(transaction.amount)}
      </Text>
    </View>
  );
}

function formatBalance(balance: number) {
  return `${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`;
}

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTransactionAmount(amount: number) {
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${prefix}${formatAed(Math.abs(amount))}`;
}

function transactionIcon(kind: BankingTransaction['kind']) {
  if (kind === 'card') return 'card-outline' as const;
  if (kind === 'deposit') return 'swap-horizontal-outline' as const;
  return 'send-outline' as const;
}

function AccountCard({
  title,
  amount,
  detail,
  selected,
  onPress,
  homeStyles,
}: {
  title: string;
  amount: number;
  detail: string;
  selected: boolean;
  onPress: () => void;
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [homeStyles.accountCard, selected && homeStyles.accountCardSelected, pressed && { opacity: 0.78 }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={homeStyles.accountIcon}>
        <Ionicons name={title === 'Main Account' ? 'wallet-outline' : 'save-outline'} size={19} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={homeStyles.accountTitle}>{title}</Text>
        <Text style={homeStyles.accountDetail}>{detail}</Text>
      </View>
      <View style={homeStyles.accountAmountBlock}>
        <Text style={homeStyles.accountAmount}>{formatAed(amount)}</Text>
        <Ionicons name={selected ? 'chevron-up' : 'chevron-forward'} size={18} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  detail,
  accent,
  onPress,
  testID,
  homeStyles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  accent: 'blue' | 'magenta';
  onPress: () => void;
  testID?: string;
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [homeStyles.quickAction, pressed && { opacity: 0.76 }]}
      accessibilityRole="button"
    >
      <View style={accent === 'magenta' ? homeStyles.quickActionIconMagenta : homeStyles.quickActionIconBlue}>
        <Ionicons name={icon} size={21} color={accent === 'magenta' ? colors.magenta : colors.primary} />
      </View>
      <Text style={homeStyles.quickActionLabel}>{label}</Text>
      <Text style={homeStyles.quickActionDetail}>{detail}</Text>
    </Pressable>
  );
}

function InsightMetric({
  label,
  value,
  homeStyles,
}: {
  label: string;
  value: string;
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  return (
    <View style={homeStyles.insightMetric}>
      <Text style={homeStyles.insightMetricLabel}>{label}</Text>
      <Text style={homeStyles.insightMetricValue}>{value}</Text>
    </View>
  );
}

function AttentionItem({
  icon,
  title,
  detail,
  tone,
  homeStyles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  tone: 'warning' | 'neutral' | 'success';
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  const colors = useColors();
  const toneColor = tone === 'warning' ? '#b56a00' : tone === 'success' ? colors.success : colors.primary;
  const toneBackground = tone === 'warning' ? '#fff4df' : tone === 'success' ? '#e6f5ee' : colors.blueSoft;
  return (
    <View style={homeStyles.attentionItem}>
      <View style={[homeStyles.attentionIcon, { backgroundColor: toneBackground }]}>
        <Ionicons name={icon} size={19} color={toneColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={homeStyles.attentionTitle}>{title}</Text>
        <Text style={homeStyles.attentionDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.mutedForeground} />
    </View>
  );
}

function CognitiveAction({
  icon,
  label,
  detail,
  onPress,
  homeStyles,
  testID,
  showIcon = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  onPress: () => void;
  homeStyles: ReturnType<typeof getHomeStyles>;
  testID?: string;
  showIcon?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [homeStyles.cognitiveAction, pressed && { opacity: 0.78 }]}
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
    >
      {showIcon && <View style={homeStyles.cognitiveActionIcon}><Ionicons name={icon} size={22} color={colors.primary} /></View>}
      <View style={{ flex: 1 }}>
        <Text style={homeStyles.cognitiveActionTitle}>{label}</Text>
        <Text style={homeStyles.cognitiveActionDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

function CognitiveSecondaryLink({
  icon,
  label,
  detail,
  expanded,
  onPress,
  homeStyles,
  showIcon = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  expanded?: boolean;
  onPress: () => void;
  homeStyles: ReturnType<typeof getHomeStyles>;
  showIcon?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [homeStyles.cognitiveLink, pressed && { opacity: 0.72 }]}
      accessibilityRole="button"
      accessibilityState={expanded === undefined ? undefined : { expanded }}
    >
      {showIcon && <View style={homeStyles.cognitiveLinkIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>}
      <View style={{ flex: 1 }}>
        <Text style={homeStyles.cognitiveLinkTitle}>{label}</Text>
        <Text style={homeStyles.cognitiveLinkDetail}>{detail}</Text>
      </View>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-forward'} size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function CognitiveValue({
  label,
  value,
  homeStyles,
}: {
  label: string;
  value: string;
  homeStyles: ReturnType<typeof getHomeStyles>;
}) {
  return (
    <View style={homeStyles.cognitiveValueRow}>
      <Text style={homeStyles.cognitiveValueLabel}>{label}</Text>
      <Text style={homeStyles.cognitiveValue}>{value}</Text>
    </View>
  );
}

const getHomeStyles = (
  colors: ReturnType<typeof useColors>,
  cognitiveMode = false,
  preferences: Preferences,
) => {
  const textScale = cognitiveMode
    ? preferences.textSize === 'extraLarge'
      ? 1.16
      : preferences.textSize === 'large'
        ? 1.08
        : 1
    : 1;
  const spacingScale = cognitiveMode
    ? preferences.spacing === 'spacious'
      ? 1.18
      : preferences.spacing === 'comfortable'
        ? 1.08
        : 1
    : 1;

  return StyleSheet.create({
    homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: cognitiveMode ? 24 * spacingScale : 18 },
     headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
     avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.magentaSoft },
     avatarText: { color: colors.magenta, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.4 },
    iconCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
    balanceCard: { borderRadius: cognitiveMode ? 14 : 18, padding: cognitiveMode ? 24 * spacingScale : 22, minHeight: cognitiveMode ? 177 * spacingScale : 177, overflow: 'hidden', marginBottom: cognitiveMode ? 22 * spacingScale : 14, backgroundColor: cognitiveMode ? colors.primary : undefined },
    balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    balanceLabel: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Inter_500Medium', fontSize: 13 * textScale },
    balanceAmount: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: (cognitiveMode ? 34 : 33) * textScale, letterSpacing: -1.1, marginTop: 14 * spacingScale },
     balanceSupporting: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
    balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 27 * spacingScale },
    balanceMeta: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_400Regular', fontSize: 12 * textScale },
    balanceLink: { color: 'rgba(255,255,255,0.92)', fontFamily: 'Inter_500Medium', fontSize: 12 * textScale },
     sectionBlock: { marginTop: 22, gap: 10 },
     accountCard: { minHeight: 78, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
     accountCardSelected: { borderColor: colors.primary, backgroundColor: colors.blueSoft },
     accountIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
     accountTitle: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
     accountDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
     accountAmountBlock: { alignItems: 'flex-end', gap: 3 },
     accountAmount: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 14 },
     accountDetailPanel: { padding: 14, borderRadius: 14, backgroundColor: colors.blueSoft, gap: 5 },
     accountDetailTitle: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
     accountDetailText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
     quickActionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
     quickAction: { width: '48.5%', minHeight: 106, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 12 },
     quickActionIconMagenta: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.magentaSoft },
     quickActionIconBlue: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blueSoft },
     quickActionLabel: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 9 },
     quickActionDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 3 },
     bankCard: { minHeight: 184, borderRadius: 18, padding: 20, justifyContent: 'space-between' },
     bankCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
     bankCardLabel: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 1.4 },
     bankCardName: { color: 'rgba(255,255,255,0.88)', fontFamily: 'Inter_500Medium', fontSize: 14, marginTop: 22 },
     bankCardNumber: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 17, letterSpacing: 2, marginTop: 7 },
     bankCardBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18 },
     bankCardMeta: { color: 'rgba(255,255,255,0.64)', fontFamily: 'Inter_400Regular', fontSize: 10 },
     bankCardBalance: { color: colors.white, fontFamily: 'Inter_700Bold', fontSize: 15 },
     cardActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
     cardAction: { minHeight: 38, paddingHorizontal: 11, borderRadius: 11, justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
     cardActionText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
    cardSummary: { minHeight: 114, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    cardSummaryIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.magentaSoft, alignItems: 'center', justifyContent: 'center' },
    cardEyebrow: { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.2 },
    cardName: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 14, marginTop: 7 },
    cardNumber: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 3 },
    linkText: { color: colors.magenta, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    actionRow: { minHeight: 68, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    actionIconMagenta: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.magentaSoft, alignItems: 'center', justifyContent: 'center' },
    actionIconBlue: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
    actionTitle: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 14 * textScale },
    actionSubtitle: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 * textScale, marginTop: 3 },
    activityCard: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingTop: cognitiveMode ? 17 * spacingScale : 17, overflow: 'hidden' },
    transactionRow: { minHeight: cognitiveMode ? 68 * spacingScale : 68, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: cognitiveMode ? 16 * spacingScale : 16, paddingVertical: cognitiveMode ? 3 * spacingScale : 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
    transactionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
    transactionAmount: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 12 * textScale },
    modeIndicator: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 * textScale, letterSpacing: 0.6, marginTop: 9 },
    cognitiveSection: { gap: 10 * spacingScale },
     cognitiveQuestion: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20 * textScale, lineHeight: 26 * textScale, marginBottom: 4 * spacingScale },
    cognitiveAction: { minHeight: 82 * spacingScale, padding: 16 * spacingScale, borderRadius: 15, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 12 },
    cognitiveActionIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    cognitiveActionTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 16 * textScale },
    cognitiveActionDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 * textScale, lineHeight: 19 * textScale, marginTop: 4 },
     cognitiveLinks: { marginTop: 22 * spacingScale, gap: 10 * spacingScale },
     cognitiveLink: { minHeight: 68 * spacingScale, paddingHorizontal: 13 * spacingScale, paddingVertical: 10 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 11 },
     cognitiveLinkIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
     cognitiveLinkTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 * textScale },
     cognitiveLinkDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 * textScale, lineHeight: 17 * textScale, marginTop: 3 },
     cognitiveRevealCard: { borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
     cognitiveValueRow: { minHeight: 48 * spacingScale, paddingHorizontal: 14 * spacingScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
     cognitiveValueLabel: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 * textScale },
     cognitiveValue: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 * textScale },
     revealLink: { minHeight: 46 * spacingScale, paddingHorizontal: 14 * spacingScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
     revealLinkText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 * textScale },
     cognitiveUpdate: { padding: 14 * spacingScale, flexDirection: 'row', alignItems: 'center', gap: 10 },
     cognitiveUpdateIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
     cognitiveUpdateTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 * textScale },
     cognitiveUpdateText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 * textScale, lineHeight: 16 * textScale, marginTop: 3 },
    secondaryAction: { minHeight: 66 * spacingScale, paddingHorizontal: 14 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 12 },
    secondaryActionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    activityHeading: { minHeight: 44 * spacingScale, paddingHorizontal: 17 * spacingScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    activityMeta: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 * textScale },
    moreButton: { minHeight: 48 * spacingScale, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 17 * spacingScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    moreButtonText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 * textScale },
     snapshotCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, gap: 15 },
     snapshotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
     snapshotTotal: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 23 },
     snapshotCaption: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
     snapshotBars: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
     snapshotBar: { minHeight: 8, height: 8, borderRadius: 4 },
     snapshotLabel: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 10 },
     snapshotLink: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
     insightCard: { marginTop: 22, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, gap: 14 },
     insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
     insightTitle: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 16 },
     insightMetrics: { flexDirection: 'row', gap: 9 },
     insightMetric: { flex: 1, padding: 10, borderRadius: 11, backgroundColor: colors.background },
     insightMetricLabel: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10 },
     insightMetricValue: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 12, marginTop: 5 },
     insightText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
     attentionItem: { minHeight: 72, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 10 },
     attentionIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
     attentionTitle: { color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
     attentionDetail: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, marginTop: 3 },
     offerCard: { marginTop: 22, padding: 18, borderRadius: 17, backgroundColor: colors.magentaSoft, borderWidth: 1, borderColor: '#efd6e4' },
     offerEyebrow: { color: colors.magentaDeep, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
     offerTitle: { color: colors.navyDeep, fontFamily: 'Inter_700Bold', fontSize: 17, lineHeight: 22, marginTop: 10 },
     offerText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 6 },
     offerLink: { color: colors.magentaDeep, fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 13 },
     servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
     serviceTile: { width: '31.5%', minHeight: 72, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 7 },
     serviceText: { color: colors.navyDeep, fontFamily: 'Inter_500Medium', fontSize: 11 },
     notice: { marginTop: 16, padding: 12, borderRadius: 13, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.blueSoft, flexDirection: 'row', alignItems: 'center', gap: 8 },
     noticeText: { flex: 1, color: colors.navyDeep, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
    accountDetailsButton: { minHeight: 52 * spacingScale, marginTop: 14 * spacingScale, paddingHorizontal: 17 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    accountDetailsCard: { marginTop: 10 * spacingScale, padding: 17 * spacingScale, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 8 },
    accountDetailLabel: { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11 * textScale, textTransform: 'uppercase', letterSpacing: 0.8 },
    accountDetailValue: { color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 13 * textScale },
  });
};