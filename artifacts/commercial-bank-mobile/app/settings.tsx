import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BankingShell, BackButton, useBankingStyles } from '@/components/banking-ui';
import { Preferences, Spacing, TextSize, useBanking } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

const togglePreferences: Array<{
  key: 'minimalInformation' | 'literalLanguage' | 'stepByStep' | 'reducedDistractions';
  label: string;
  detail: string;
}> = [
  {
    key: 'minimalInformation',
    label: 'Simpler information',
    detail: 'See the most important information first.',
  },
  {
    key: 'literalLanguage',
    label: 'Plain language',
    detail: 'Use clear words instead of banking jargon.',
  },
  {
    key: 'stepByStep',
    label: 'Step-by-step guidance',
    detail: 'Break complex tasks into smaller steps.',
  },
  {
    key: 'reducedDistractions',
    label: 'Reduced distractions',
    detail: 'Reduce visual elements that are not needed.',
  },
];

const textSizeOptions: Array<{ value: TextSize; label: string }> = [
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
  { value: 'extraLarge', label: 'Extra Large' },
];

const spacingOptions: Array<{ value: Spacing; label: string }> = [
  { value: 'standard', label: 'Standard' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export default function SettingsScreen() {
  const colors = useColors();
  const styles = useBankingStyles();
  const localStyles = getSettingsStyles(colors);
  const { isCognitiveMode, setIsCognitiveMode, preferences, updatePreference } = useBanking();

  return (
    <BankingShell step="Settings">
      <BackButton label="Back" />
      <Text style={styles.pageTitle}>Cognitive Mode Settings</Text>
      <Text style={[styles.subtitle, { marginTop: 8 }]}>Choose how you want your banking experience to work.</Text>

      <View style={[styles.settingsCard, { marginTop: 24 }]}>
        <View style={styles.settingsHeading}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.sectionTitle}>Cognitive Mode</Text>
            <Text style={[styles.preferenceDetail, { marginTop: 5 }]}>A calmer, more explicit way to use your banking app.</Text>
          </View>
          <Switch
            value={isCognitiveMode}
            onValueChange={setIsCognitiveMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Cognitive Mode"
            testID="settings-cognitive-mode-toggle"
          />
        </View>
      </View>

      <View style={{ marginTop: 26 }}>
        <Text style={styles.sectionTitle}>Your preferences</Text>
        <View style={[styles.settingsCard, { marginTop: 12 }]}>
          {togglePreferences.map((preference, index) => (
            <PreferenceToggle
              key={preference.key}
              preference={preference}
              value={preferences[preference.key]}
              onChange={(value) => updatePreference(preference.key, value)}
              showDivider={index > 0}
              colors={colors}
            />
          ))}
          <PreferenceChoice
            label="Text size"
            detail="Choose a comfortable size for reading."
            value={preferences.textSize}
            options={textSizeOptions}
            onChange={(value) => updatePreference('textSize', value)}
            showDivider
            colors={colors}
          />
          <PreferenceChoice
            label="Spacing"
            detail="Choose how much room controls have around them."
            value={preferences.spacing}
            options={spacingOptions}
            onChange={(value) => updatePreference('spacing', value)}
            showDivider
            colors={colors}
          />
        </View>
      </View>

      <View style={{ marginTop: 26 }}>
        <View style={localStyles.previewHeading}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Text style={[styles.preferenceDetail, { marginTop: 5 }]}>See how your choices can change a banking step.</Text>
          </View>
          <Ionicons name="eye-outline" size={22} color={colors.primary} />
        </View>
        <TransferPreview preferences={preferences} colors={colors} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.settingsLink, pressed && { opacity: 0.65 }]}
        onPress={() => router.replace('/')}
        accessibilityRole="button"
      >
        <Ionicons name="home-outline" size={20} color={colors.primary} />
        <Text style={[styles.settingsLinkText, { color: colors.primary }]}>Return to accounts</Text>
      </Pressable>
    </BankingShell>
  );
}

function PreferenceToggle({
  preference,
  value,
  onChange,
  showDivider,
  colors,
}: {
  preference: (typeof togglePreferences)[number];
  value: boolean;
  onChange: (value: boolean) => void;
  showDivider: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const styles = useBankingStyles();
  return (
    <View style={[styles.preferenceRow, showDivider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.preferenceLabel}>{preference.label}</Text>
        <Text style={styles.preferenceDetail}>{preference.detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        accessibilityLabel={preference.label}
        testID={`preference-${preference.key}`}
      />
    </View>
  );
}

function PreferenceChoice<Value extends string>({
  label,
  detail,
  value,
  options,
  onChange,
  showDivider,
  colors,
}: {
  label: string;
  detail: string;
  value: Value;
  options: Array<{ value: Value; label: string }>;
  onChange: (value: Value) => void;
  showDivider: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const styles = useBankingStyles();
  return (
    <View style={[styles.preferenceChoice, showDivider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Text style={styles.preferenceDetail}>{detail}</Text>
      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}: ${option.label}`}
              testID={`${label.toLowerCase().replace(' ', '-')}-${option.value}`}
              style={({ pressed }) => [
                styles.segment,
                selected && styles.segmentSelected,
                pressed && { opacity: 0.72 },
              ]}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TransferPreview({
  preferences,
  colors,
}: {
  preferences: Preferences;
  colors: ReturnType<typeof useColors>;
}) {
  const previewTextScale = preferences.textSize === 'extraLarge' ? 1.18 : preferences.textSize === 'large' ? 1.08 : 1;
  const previewSpacing = preferences.spacing === 'spacious' ? 1.18 : preferences.spacing === 'comfortable' ? 1.08 : 1;
  const plainLanguage = preferences.literalLanguage;
  const styles = getPreviewStyles(colors, previewTextScale, previewSpacing);

  return (
    <View style={styles.previewCard}>
      {!preferences.reducedDistractions && (
        <View style={styles.previewIcon}>
          <Ionicons name="send-outline" size={19} color={colors.primary} />
        </View>
      )}
      <View style={styles.previewTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.previewEyebrow}>Preview</Text>
          <Text style={styles.previewTitle}>{plainLanguage ? 'Send money' : 'Transfer money'}</Text>
        </View>
        {preferences.stepByStep && <Text style={styles.previewProgress}>2 of 4</Text>}
      </View>
      <View style={styles.previewRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.previewLabel}>{plainLanguage ? 'To' : 'Recipient'}</Text>
          <Text style={styles.previewValue}>Sarah Ahmed</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.previewLabel}>{plainLanguage ? 'Amount' : 'Transfer amount'}</Text>
          <Text style={styles.previewValue}>AED 2,500</Text>
        </View>
      </View>
      {!preferences.minimalInformation && (
        <Text style={styles.previewMeta}>{plainLanguage ? 'Fee: AED 25 · Arrives instantly' : 'Fee: AED 25 · Timing: Instant'}</Text>
      )}
      {preferences.minimalInformation && <Text style={styles.previewMore}>More details</Text>}
      <View style={styles.previewButton}>
        <Text style={styles.previewButtonText}>{plainLanguage ? 'Continue' : 'Continue transfer'}</Text>
      </View>
    </View>
  );
}

const getSettingsStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    previewHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

const getPreviewStyles = (colors: ReturnType<typeof useColors>, textScale: number, spacingScale: number) =>
  StyleSheet.create({
    previewCard: {
      marginTop: 12,
      padding: 18 * spacingScale,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.card,
      gap: 12 * spacingScale,
    },
    previewIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    previewTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    previewEyebrow: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 10 * textScale,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    previewTitle: {
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 20 * textScale,
      marginTop: 4,
    },
    previewProgress: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12 * textScale,
    },
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 14 * spacingScale,
      paddingVertical: 4 * spacingScale,
    },
    previewLabel: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 11 * textScale,
      marginBottom: 4,
    },
    previewValue: {
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 15 * textScale,
    },
    previewMeta: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 12 * textScale,
      lineHeight: 18 * textScale,
    },
    previewMore: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12 * textScale,
    },
    previewButton: {
      minHeight: 42 * spacingScale,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    previewButtonText: {
      color: colors.white,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13 * textScale,
    },
  });