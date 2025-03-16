import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, redirect to the app
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
} 