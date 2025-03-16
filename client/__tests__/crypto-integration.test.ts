import {
  setCryptoItem,
  getCryptoItem,
  setCryptoObject,
  getCryptoObject,
  removeCryptoItem
} from '../services/crypto-storage.service';

// For integration testing, we'll use the real implementations
// but we'll still mock the actual storage to avoid side effects
jest.mock('@react-native-async-storage/async-storage', () => {
  const asyncStorage = new Map();
  return {
    setItem: jest.fn((key, value) => {
      asyncStorage.set(key, value);
      return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
      return Promise.resolve(asyncStorage.get(key));
    }),
    removeItem: jest.fn((key) => {
      asyncStorage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      asyncStorage.clear();
      return Promise.resolve();
    })
  };
});

jest.mock('expo-secure-store', () => {
  const secureStore = new Map();
  return {
    setItemAsync: jest.fn((key, value) => {
      secureStore.set(key, value);
      return Promise.resolve();
    }),
    getItemAsync: jest.fn((key) => {
      return Promise.resolve(secureStore.get(key));
    }),
    deleteItemAsync: jest.fn((key) => {
      secureStore.delete(key);
      return Promise.resolve();
    })
  };
});

describe('CryptoStorage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mocked storage
    require('@react-native-async-storage/async-storage').clear();
  });

  test('String data should survive full encryption-decryption cycle', async () => {
    const testKey = 'test-integration-key';
    const testValue = 'This is a test value that should be encrypted and decrypted properly!';
    
    // Store the value
    await setCryptoItem(testKey, testValue);
    
    // Retrieve the value
    const retrievedValue = await getCryptoItem(testKey);
    
    // Verify the original and retrieved values match
    expect(retrievedValue).toBe(testValue);
  });

  test('JSON objects should survive full encryption-decryption cycle', async () => {
    const testKey = 'test-integration-object';
    const testObject = {
      id: 123,
      name: 'Test Object',
      nested: {
        property: 'This is a nested property',
        array: [1, 2, 3, 4, 5]
      },
      date: new Date().toISOString()
    };
    
    // Store the object
    await setCryptoObject(testKey, testObject);
    
    // Retrieve the object
    const retrievedObject = await getCryptoObject(testKey);
    
    // Verify the original and retrieved objects match
    expect(retrievedObject).toEqual(testObject);
  });

  test('Large access tokens should survive encryption-decryption cycle', async () => {
    // Sample large token (1500+ characters)
    const largeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${'A'.repeat(1500)}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
    const tokenKey = 'large-token-test';
    
    // Store the large token
    await setCryptoItem(tokenKey, largeToken);
    
    // Retrieve the token
    const retrievedToken = await getCryptoItem(tokenKey);
    
    // Verify the original and retrieved tokens match
    expect(retrievedToken).toBe(largeToken);
    expect(retrievedToken?.length).toBeGreaterThan(1500); // Ensure we got the full token back
  });

  test('Removing items should make them irretrievable', async () => {
    const testKey = 'test-remove-key';
    const testValue = 'Value to be removed';
    
    // Store then remove
    await setCryptoItem(testKey, testValue);
    await removeCryptoItem(testKey);
    
    // Try to retrieve
    const retrievedValue = await getCryptoItem(testKey);
    
    // Should be null after removal
    expect(retrievedValue).toBeNull();
  });
}); 