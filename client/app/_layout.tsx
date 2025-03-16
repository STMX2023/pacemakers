import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { View, Text, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/authentication/hooks/useAuth';
import { installAuthInterceptor } from '@/utils/api.interceptor';
import { migrateFromSecureStore } from '@/services/storage-migration.service';

// Set explicit initial route
export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Install auth interceptor when the module loads
installAuthInterceptor();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading: authLoading } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Migrate data from SecureStore to CryptoStorage
  useEffect(() => {
    async function runMigration() {
      try {
        await migrateFromSecureStore();
        setMigrationComplete(true);
      } catch (error) {
        console.error('Error during storage migration:', error);
        // Continue app initialization even if migration fails
        setMigrationComplete(true);
      }
    }
    
    runMigration();
  }, []);

  useEffect(() => {
    if (loaded && migrationComplete) {
      // Only mark the app as ready when fonts are loaded and migration is complete
      setAppIsReady(true);
      SplashScreen.hideAsync().catch((err) => {
        console.warn('Error hiding splash screen:', err);
      });
    }
  }, [loaded, migrationComplete]);

  // Show a loading state until everything is ready
  if (!appIsReady || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
