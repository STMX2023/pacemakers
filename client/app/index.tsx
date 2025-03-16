import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, error } = useAuth();

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading app...</Text>
      </View>
    );
  }

  // Redirect based on auth status
  return isAuthenticated ? 
    <Redirect href="/(app)" /> : 
    <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  }
});
