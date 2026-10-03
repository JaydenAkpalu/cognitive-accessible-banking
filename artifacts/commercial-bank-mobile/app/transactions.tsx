import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BankingShell, BackButton, SectionHeader, useBankingStyles } from '@/components/banking-ui';
import { BankingTransaction, useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

export default function TransactionsScreen() {
  const colors = useColors();
  const styles = useBankingStyles();
  const { transactions } = useBanking();

  return (
    <BankingShell step="Transaction history">
      <BackButton label="Back" />
      <Text style={styles.pageTitle}>Transaction history</Text>
      <Text style={[styles.subtitle, { marginTop: 8 }]}>
        Review payments, transfers, and deposits across your accounts.
      </Text>

      <View style={screenStyles.summary}>
        <View>
          <Text style={screenStyles.summaryLabel}>All activity</Text>
          <Text style={screenStyles.summaryValue}>{transactions.length} transactions</Text>
        </View>
        <View style={screenStyles.summaryIcon}>
          <Ionicons name="list-outline" size={21} color={colors.primary} />
        </View>
      </View>

      <View style={screenStyles.listCard}>
        <SectionHeader title="All activity" meta="Most recent first" />
        {transactions.map((transaction) => (
          <TransactionHistoryRow key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </BankingShell>
  );
}

function TransactionHistoryRow({ transaction }: { transaction: BankingTransaction }) {
  const colors = useColors();
  return (
    <Pressable style={screenStyles.row} accessibilityRole="button">
      <View style={screenStyles.icon}>
        <Ionicons name={transactionIcon(transaction.kind)} size={18} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={screenStyles.name}>{transaction.name}</Text>
        <Text style={screenStyles.date}>{transaction.date}</Text>
      </View>
      <View style={screenStyles.amountBlock}>
        <Text style={[screenStyles.amount, transaction.positive && { color: colors.success }]}>
          {formatTransactionAmount(transaction.amount)}
        </Text>
        <Text style={screenStyles.status}>{transaction.positive ? 'Incoming' : 'Completed'}</Text>
      </View>
    </Pressable>
  );
}

function formatTransactionAmount(amount: number) {
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${prefix}AED ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function transactionIcon(kind: BankingTransaction['kind']) {
  if (kind === 'card') return 'card-outline' as const;
  if (kind === 'deposit') return 'swap-horizontal-outline' as const;
  if (kind === 'bill') return 'receipt-outline' as const;
  return 'send-outline' as const;
}

const screenStyles = StyleSheet.create({
  summary: { marginTop: 24, padding: 17, borderRadius: 16, borderWidth: 1, borderColor: '#dfe4ec', backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: '#6f7d8f', fontFamily: 'Inter_400Regular', fontSize: 12 },
  summaryValue: { color: '#172b4d', fontFamily: 'Inter_700Bold', fontSize: 19, marginTop: 5 },
  summaryIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#eaf1f9', alignItems: 'center', justifyContent: 'center' },
  listCard: { marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: '#dfe4ec', backgroundColor: '#ffffff', overflow: 'hidden' },
  row: { minHeight: 78, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#dfe4ec', flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f4f8', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#172b4d', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  date: { color: '#6f7d8f', fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  amountBlock: { alignItems: 'flex-end', gap: 3 },
  amount: { color: '#172b4d', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  status: { color: '#6f7d8f', fontFamily: 'Inter_400Regular', fontSize: 10 },
});