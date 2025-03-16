import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';
import { View, ActivityIndicator, Text } from 'react-native';

// Set this to tell expo-router what the initial route in this navigator should be
export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 15, fontSize: 16 }}>Checking authentication...</Text>
      </View>
    );
  }

  // If user is authenticated, redirect to app home
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
    </Stack>
  );
} 