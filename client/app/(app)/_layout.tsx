import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Home' }} />
      <Stack.Screen name="settings" options={{ headerTitle: 'Settings' }} />
    </Stack>
  );
} 