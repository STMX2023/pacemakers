import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import { 
  STORAGE_KEYS,
  setCryptoItem,
  setCryptoObject,
  getCryptoItem
} from './crypto-storage.service';

/**
 * Migrates data from SecureStore to our new CryptoStorage
 * This should be called once when the app initializes after updating
 * from the SecureStore implementation to the CryptoStorage implementation
 */
export async function migrateFromSecureStore(): Promise<boolean> {
  try {
    // Check if we've already migrated by looking for a flag in CryptoStorage
    const alreadyMigrated = await getCryptoItem('storage.migrated');
    if (alreadyMigrated === 'true') {
      console.log('Storage already migrated, skipping migration');
      return true;
    }

    console.log('Starting storage migration from SecureStore to CryptoStorage...');
    
    // Migrate each auth-related key
    const keys = Object.values(STORAGE_KEYS);
    
    let anyMigrated = false;
    
    for (const key of keys) {
      // Try to get the value from SecureStore
      const value = await SecureStore.getItemAsync(key);
      
      if (value) {
        console.log(`Migrating key: ${key}`);
        
        // If it's a JSON object, parse and store as object
        if (key === STORAGE_KEYS.USER || key === STORAGE_KEYS.SESSION) {
          try {
            const parsed = JSON.parse(value);
            await setCryptoObject(key, parsed);
          } catch (e) {
            console.error(`Error parsing JSON for key ${key}:`, e);
            // Store as string if parsing fails
            await setCryptoItem(key, value);
          }
        } else {
          // Otherwise store as string
          await setCryptoItem(key, value);
        }
        
        anyMigrated = true;
      }
    }
    
    // Also migrate Supabase auth keys (they might have a different prefix)
    const supabasePrefix = 'supabase.auth.';
    const supabaseKeys = [
      `${supabasePrefix}access_token`,
      `${supabasePrefix}refresh_token`,
      `${supabasePrefix}expires_at`,
      `${supabasePrefix}provider_token`,
      `${supabasePrefix}provider_refresh_token`,
    ];
    
    for (const key of supabaseKeys) {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        console.log(`Migrating Supabase key: ${key}`);
        await setCryptoItem(key, value);
        anyMigrated = true;
      }
    }
    
    // Set the migration flag to prevent future migrations
    await setCryptoItem('storage.migrated', 'true');
    
    if (anyMigrated) {
      console.log('Storage migration completed successfully');
    } else {
      console.log('No data found in SecureStore to migrate');
    }
    
    return true;
  } catch (error) {
    console.error('Error migrating from SecureStore:', error);
    return false;
  }
}

/**
 * Cleans up old data from SecureStore after migration is confirmed
 * This is optional and can be called after ensuring the app works
 * correctly with the new CryptoStorage implementation
 */
export async function cleanupSecureStoreAfterMigration(): Promise<void> {
  try {
    // Only cleanup if we've already migrated
    const alreadyMigrated = await getCryptoItem('storage.migrated');
    if (alreadyMigrated !== 'true') {
      console.log('Migration not completed yet, skipping cleanup');
      return;
    }
    
    console.log('Cleaning up old SecureStore data...');
    
    // Delete each auth-related key from SecureStore
    const keys = Object.values(STORAGE_KEYS);
    
    for (const key of keys) {
      await SecureStore.deleteItemAsync(key);
    }
    
    // Also delete Supabase auth keys
    const supabasePrefix = 'supabase.auth.';
    const supabaseKeys = [
      `${supabasePrefix}access_token`,
      `${supabasePrefix}refresh_token`,
      `${supabasePrefix}expires_at`,
      `${supabasePrefix}provider_token`,
      `${supabasePrefix}provider_refresh_token`,
    ];
    
    for (const key of supabaseKeys) {
      await SecureStore.deleteItemAsync(key);
    }
    
    console.log('SecureStore cleanup completed');
  } catch (error) {
    console.error('Error cleaning up SecureStore:', error);
  }
} 