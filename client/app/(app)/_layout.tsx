import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';
import { View, ActivityIndicator, Text } from 'react-native';

// Set this to tell expo-router what the initial route in this navigator should be
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 15, fontSize: 16 }}>Loading app...</Text>
      </View>
    );
  }

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f4f4f4',
        },
        headerTintColor: '#333',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerTitle: 'Home',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerTitle: 'Settings',
        }} 
      />
    </Stack>
  );
} 