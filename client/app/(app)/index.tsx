import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/authentication/hooks/useAuth';
import { UserProfileCard } from '@/components/UserProfileCard';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    logout();
    // The redirect will happen automatically in the app layout
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  // Set up theme-specific colors
  const bgColor = isDark ? '#121212' : '#F2F2F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtitleColor = isDark ? '#ADADAD' : '#666666';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <UserProfileCard user={user} />
        
        <Text style={[styles.title, { color: textColor }]}>Welcome!</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>You are now logged in to your account.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={navigateToSettings}>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
