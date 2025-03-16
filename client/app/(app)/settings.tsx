import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '@/authentication/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProfileCard } from '@/components/UserProfileCard';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isDarkMode, setIsDarkMode] = React.useState(isDark);

  const handleLogout = () => {
    logout();
    // The redirect will happen automatically in the app layout
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would update the color scheme here
  };

  // Set up theme-specific colors
  const bgColor = isDark ? '#121212' : '#F2F2F7';
  const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#ADADAD' : '#666666';
  const dividerColor = isDark ? '#2C2C2E' : '#E5E5EA';
  const accentColor = '#007AFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <UserProfileCard user={user} />

        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: accentColor }]}>Appearance</Text>
          
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: accentColor }]}>About</Text>
          
          <View style={[styles.settingRow, { borderBottomColor: dividerColor }]}>
            <Text style={[styles.settingLabel, { color: textColor }]}>Version</Text>
            <Text style={[styles.settingValue, { color: secondaryTextColor }]}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
