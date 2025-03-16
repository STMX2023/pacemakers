import type { SupportedStorage } from '@supabase/supabase-js';
import { setCryptoItem, getCryptoItem, removeCryptoItem } from './crypto-storage.service';

/**
 * CryptoStorageAdapter implements the StorageAdapter interface required by Supabase
 * but uses our crypto-based storage (which uses AsyncStorage + Expo Crypto)
 */
export class CryptoStorageAdapter implements SupportedStorage {
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
    return await getCryptoItem(this.getKey(key));
  }

  async setItem(key: string, value: string): Promise<void> {
    await setCryptoItem(this.getKey(key), value);
  }

  async removeItem(key: string): Promise<void> {
    await removeCryptoItem(this.getKey(key));
  }
} 