import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

// Key constants - reusing the same keys from secure-storage.service.ts for compatibility
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  SESSION: 'auth.session',
  USER: 'auth.user',
};

// Constants for crypto operations
const ENCRYPTION_KEY_PREFIX = 'crypto_key_';
const CRYPTO_ALGORITHM = Crypto.CryptoDigestAlgorithm.SHA256;

// Helper function to convert Uint8Array to Hex string without using Buffer
function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper function to convert Hex string to Uint8Array without using Buffer
function hexToUint8Array(hex: string): Uint8Array {
  const len = hex.length;
  const result = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return result;
}

// Base64 encoding and decoding without Buffer
function uint8ArrayToBase64(arr: Uint8Array): string {
  // We still need to use Buffer for base64 conversion as it's complex to implement
  return Buffer.from(arr).toString('base64');
}

function base64ToUint8Array(base64: string): Uint8Array {
  // We still need to use Buffer for base64 conversion as it's complex to implement
  return Buffer.from(base64, 'base64');
}

function stringToUint8Array(str: string): Uint8Array {
  const result = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    result[i] = str.charCodeAt(i);
  }
  return result;
}

function uint8ArrayToString(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => String.fromCharCode(b))
    .join('');
}

/**
 * Generates a secure random encryption key
 */
async function generateEncryptionKey(): Promise<Uint8Array> {
  return Crypto.getRandomBytesAsync(32); // 256-bit key (32 bytes)
}

/**
 * Stores an encryption key in SecureStore
 */
async function storeEncryptionKey(keyId: string, encryptionKey: Uint8Array): Promise<void> {
  const keyHex = uint8ArrayToHex(encryptionKey);
  await SecureStore.setItemAsync(`${ENCRYPTION_KEY_PREFIX}${keyId}`, keyHex);
}

/**
 * Retrieves an encryption key from SecureStore
 */
async function getEncryptionKey(keyId: string): Promise<Uint8Array | null> {
  const keyHex = await SecureStore.getItemAsync(`${ENCRYPTION_KEY_PREFIX}${keyId}`);
  if (!keyHex) {
    return null;
  }
  return hexToUint8Array(keyHex);
}

/**
 * Generates a unique identifier for a storage key
 */
async function generateKeyId(key: string): Promise<string> {
  const keyHash = await Crypto.digestStringAsync(CRYPTO_ALGORITHM, key);
  return keyHash.slice(0, 10); // Use first 10 chars of hash as ID
}

/**
 * Encrypts a value with a given encryption key
 */
async function encryptValue(value: string, encryptionKey: Uint8Array): Promise<string> {
  const valueBuffer = stringToUint8Array(value);
  
  // For integrity checking
  const valueHash = await Crypto.digestStringAsync(CRYPTO_ALGORITHM, value);
  
  // Simple XOR encryption (for demonstration)
  // In a production app, you might want to use a more sophisticated encryption method
  const encryptedBytes = new Uint8Array(valueBuffer.length);
  for (let i = 0; i < valueBuffer.length; i++) {
    encryptedBytes[i] = valueBuffer[i] ^ encryptionKey[i % encryptionKey.length];
  }
  
  // Combine the encrypted data and hash
  const encryptedValue = uint8ArrayToBase64(encryptedBytes);
  return `${encryptedValue}|${valueHash}`;
}

/**
 * Decrypts a value with a given encryption key
 */
async function decryptValue(encryptedValue: string, encryptionKey: Uint8Array): Promise<string | null> {
  try {
    // Split the encrypted value and original hash
    const [encryptedBase64, originalHash] = encryptedValue.split('|');
    
    // Convert from base64 to bytes
    const encryptedBytes = base64ToUint8Array(encryptedBase64);
    
    // Decrypt using XOR (inverse operation)
    const decryptedBytes = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] = encryptedBytes[i] ^ encryptionKey[i % encryptionKey.length];
    }
    
    // Convert back to string
    const decryptedValue = uint8ArrayToString(decryptedBytes);
    
    // Verify integrity by checking the hash
    const checkHash = await Crypto.digestStringAsync(CRYPTO_ALGORITHM, decryptedValue);
    
    if (checkHash !== originalHash) {
      console.warn('Data integrity check failed during decryption!');
      return null;
    }
    
    return decryptedValue;
  } catch (error) {
    console.error('Error decrypting value:', error);
    return null;
  }
}

/**
 * Securely saves a value to storage using crypto
 */
export async function setCryptoItem(key: string, value: string | null): Promise<void> {
  const keyId = await generateKeyId(key);
  
  if (value === null) {
    // Remove both the value and the encryption key
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`${ENCRYPTION_KEY_PREFIX}${keyId}`);
    return;
  }
  
  // Get or create encryption key
  let encryptionKey = await getEncryptionKey(keyId);
  if (!encryptionKey) {
    encryptionKey = await generateEncryptionKey();
    await storeEncryptionKey(keyId, encryptionKey);
  }
  
  // Encrypt the value
  const encryptedValue = await encryptValue(value, encryptionKey);
  
  // Store in AsyncStorage
  await AsyncStorage.setItem(key, encryptedValue);
}

/**
 * Securely retrieves a value from storage using crypto
 */
export async function getCryptoItem(key: string): Promise<string | null> {
  try {
    const keyId = await generateKeyId(key);
    
    // Get the encryption key
    const encryptionKey = await getEncryptionKey(keyId);
    if (!encryptionKey) {
      // No encryption key found for this storage key
      return null;
    }
    
    // Get the encrypted value
    const encryptedValue = await AsyncStorage.getItem(key);
    if (!encryptedValue) {
      return null;
    }
    
    // Decrypt the value
    return await decryptValue(encryptedValue, encryptionKey);
  } catch (error) {
    console.error(`Error retrieving crypto item for key ${key}:`, error);
    return null;
  }
}

/**
 * Securely stores an object by serializing it to JSON and encrypting it
 */
export async function setCryptoObject<T>(key: string, value: T | null): Promise<void> {
  if (value === null) {
    await setCryptoItem(key, null);
  } else {
    const jsonValue = JSON.stringify(value);
    await setCryptoItem(key, jsonValue);
  }
}

/**
 * Retrieves and deserializes a JSON object from secure storage
 */
export async function getCryptoObject<T>(key: string): Promise<T | null> {
  const jsonValue = await getCryptoItem(key);
  if (jsonValue === null) {
    return null;
  }
  
  try {
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`Error parsing secure object for key ${key}:`, error);
    return null;
  }
}

/**
 * Removes a value from secure storage
 */
export async function removeCryptoItem(key: string): Promise<void> {
  const keyId = await generateKeyId(key);
  await AsyncStorage.removeItem(key);
  await SecureStore.deleteItemAsync(`${ENCRYPTION_KEY_PREFIX}${keyId}`);
}

/**
 * Stores only essential authentication data securely to avoid size limits
 * This reduces the size of data stored by storing only the minimal information
 * needed to restore a session.
 */
export async function storeCryptoAuthData(accessToken: string, refreshToken: string, session: any, user: any): Promise<void> {
  // Store tokens directly
  await setCryptoItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await setCryptoItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  
  // For the user, only store essential fields
  const essentialUserData = user ? {
    id: user.id,
    email: user.email,
    role: user.role,
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
  } : null;
  
  // For the session, only store expiry information and essential data
  const essentialSessionData = session ? {
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
  } : null;
  
  await setCryptoObject(STORAGE_KEYS.USER, essentialUserData);
  await setCryptoObject(STORAGE_KEYS.SESSION, essentialSessionData);
}

/**
 * Clears all authentication data
 */
export async function clearCryptoAuthData(): Promise<void> {
  await Promise.all([
    removeCryptoItem(STORAGE_KEYS.ACCESS_TOKEN),
    removeCryptoItem(STORAGE_KEYS.REFRESH_TOKEN),
    removeCryptoItem(STORAGE_KEYS.SESSION),
    removeCryptoItem(STORAGE_KEYS.USER),
  ]);
} 