import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setBaseUrl } from '@workspace/api-client-react';
import { BankingProvider } from '@/context/banking';
import { useColors } from '@/hooks/useColors';

const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
if (Platform.OS !== 'web' && apiDomain) {
  setBaseUrl(`https://${apiDomain}`);
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="transfer/recipient" />
      <Stack.Screen name="transfer/amount" />
      <Stack.Screen name="transfer/review" />
      <Stack.Screen name="transfer/confirm" />
      <Stack.Screen name="savings" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return <StartupScreen />;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BankingProvider>
            <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
            </GestureHandlerRootView>
          </BankingProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function StartupScreen() {
  const colors = useColors();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <View style={{ width: 58, height: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <Text style={{ color: colors.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>CBI</Text>
      </View>
      <Text style={{ marginTop: 18, color: colors.navyDeep, fontFamily: 'Inter_600SemiBold', fontSize: 17 }}>Commercial Bank International</Text>
      <ActivityIndicator color={colors.magenta} style={{ marginTop: 18 }} />
    </View>
  );
}
