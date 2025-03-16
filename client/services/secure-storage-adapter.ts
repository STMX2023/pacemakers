import { StorageAdapter } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

/**
 * SecureStorageAdapter implements the StorageAdapter interface required by Supabase
 * but uses expo-secure-store for secure storage of authentication tokens
 */
export class SecureStorageAdapter implements StorageAdapter {
  private prefix = 'supabase.auth.';

  constructor(prefix?: string) {
    if (prefix) {
      this.prefix = prefix;
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem(key: string): Promise<string | null> {
    const result = await SecureStore.getItemAsync(this.getKey(key));
    return result;
  }

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(this.getKey(key), value);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(this.getKey(key));
  }
} 