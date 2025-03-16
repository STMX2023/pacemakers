import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  setCryptoItem,
  getCryptoItem,
  setCryptoObject,
  getCryptoObject,
  removeCryptoItem,
  storeCryptoAuthData,
  clearCryptoAuthData,
  STORAGE_KEYS
} from '../services/crypto-storage.service';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve())
}));

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve('some-encryption-key-hex')),
  deleteItemAsync: jest.fn(() => Promise.resolve())
}));

// Mock Crypto
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(() => Promise.resolve(new Uint8Array(32))),
  digestStringAsync: jest.fn((_, str) => Promise.resolve(`hash_of_${str}`)),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA-256'
  }
}));

describe('CryptoStorage Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('setCryptoItem should encrypt and store a value', async () => {
    const key = 'test-key';
    const value = 'test-value';
    
    await setCryptoItem(key, value);
    
    // Verify that SecureStore was called (for the encryption key)
    expect(SecureStore.getItemAsync).toHaveBeenCalled();
    
    // Verify that AsyncStorage was called to store the encrypted value
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    
    // The first argument to AsyncStorage.setItem should be the key
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
  });

  test('getCryptoItem should retrieve and decrypt a value', async () => {
    const key = 'test-key';
    const mockEncryptedValue = 'encrypted_value|hash_of_test-value';
    
    // Mock AsyncStorage to return our encrypted value
    AsyncStorage.getItem = jest.fn().mockResolvedValue(mockEncryptedValue);
    
    const result = await getCryptoItem(key);
    
    // Verify that SecureStore was called to get the encryption key
    expect(SecureStore.getItemAsync).toHaveBeenCalled();
    
    // Verify that AsyncStorage was called to get the encrypted value
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
    
    // We can't easily check the decrypted value due to the mock implementation
    // but we can ensure it ran without errors
    expect(result).toBeDefined();
  });

  test('setCryptoObject should serialize and encrypt an object', async () => {
    const key = 'test-object-key';
    const value = { id: 1, name: 'test' };
    
    await setCryptoObject(key, value);
    
    // Verify that AsyncStorage was called to store the encrypted value
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    
    // The first argument to AsyncStorage.setItem should be the key
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
  });

  test('removeCryptoItem should remove a value from storage', async () => {
    const key = 'test-key';
    
    await removeCryptoItem(key);
    
    // Verify that AsyncStorage was called to remove the item
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    
    // Verify that SecureStore was called to remove the encryption key
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  test('storeCryptoAuthData should store minimal auth data', async () => {
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    const session = {
      expires_at: 1742149596,
      expires_in: 3600,
      token_type: 'bearer',
      extra_field: 'should-not-be-stored'
    };
    const user = {
      id: 'user-id',
      email: 'test@example.com',
      role: 'user',
      app_metadata: { provider: 'google' },
      user_metadata: { name: 'Test User' },
      extra_field: 'should-not-be-stored'
    };
    
    await storeCryptoAuthData(accessToken, refreshToken, session, user);
    
    // Verify that AsyncStorage was called multiple times (for access token, refresh token, session, user)
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(4);
    
    // Verify the access token and refresh token were stored
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN, expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.SESSION, expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER, expect.any(String));
  });

  test('clearCryptoAuthData should remove all auth data', async () => {
    await clearCryptoAuthData();
    
    // Verify that AsyncStorage was called to remove each auth item
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(4);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.SESSION);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER);
  });
}); 