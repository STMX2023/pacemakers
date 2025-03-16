import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerTitle: 'Home',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerTitle: 'Settings',
          headerShown: true 
        }} 
      />
    </Stack>
  );
} 