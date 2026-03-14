import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider } from '../src/context/AppContext';
import { cssInterop } from 'nativewind';
import "../global.css";

cssInterop(SafeAreaProvider, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });

export default function RootLayout() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0A6640',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShadowVisible: false,
            headerShown: false
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="expenses" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="suppliers" />
        </Stack>
      </SafeAreaProvider>
    </AppProvider>
  );
}
