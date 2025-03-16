import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, useColorScheme } from 'react-native';
import { User } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UserProfileCardProps {
  user: User | null;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get user info from user or user_metadata
  const avatarUrl = user?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const name = user?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'User';
  const email = user?.email || user?.user_metadata?.email || 'No email';
  const isVerified = user?.email_verified || user?.user_metadata?.email_verified;
  
  // Apply color scheme
  const cardBg = isDark ? '#2C2C2E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#ADADAD' : '#666666';
  const accentColor = '#007AFF'; // iOS blue
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, shadowColor }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {name.substring(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: textColor }]}>{name}</Text>
            {isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={accentColor} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={[styles.email, { color: secondaryTextColor }]}>{email}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: isVerified ? '#34C759' : '#FF9500' }]}>
              <Text style={styles.statusText}>
                {isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
            {user?.app_metadata?.provider && (
              <View style={[styles.providerBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.statusText}>
                  {user.app_metadata.provider}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 