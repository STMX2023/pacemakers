import * as SecureStore from 'expo-secure-store';

// Key constants
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  SESSION: 'auth.session',
  USER: 'auth.user',
};

/**
 * Securely saves a value to storage
 */
export async function setSecureItem(key: string, value: string | null): Promise<void> {
  if (value === null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Securely retrieves a value from storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

/**
 * Securely stores an object by serializing it to JSON
 */
export async function setSecureObject<T>(key: string, value: T | null): Promise<void> {
  if (value === null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    const jsonValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, jsonValue);
  }
}

/**
 * Retrieves and deserializes a JSON object from secure storage
 */
export async function getSecureObject<T>(key: string): Promise<T | null> {
  const jsonValue = await SecureStore.getItemAsync(key);
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
export async function removeSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

/**
 * Stores only essential authentication data securely to avoid size limits
 * This reduces the size of data stored in SecureStore by storing only
 * the minimal information needed to restore a session.
 */
export async function storeAuthData(accessToken: string, refreshToken: string, session: any, user: any): Promise<void> {
  // Store tokens directly
  await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  
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
  
  await setSecureObject(STORAGE_KEYS.USER, essentialUserData);
  await setSecureObject(STORAGE_KEYS.SESSION, essentialSessionData);
}

/**
 * Clears all authentication data
 */
export async function clearAuthData(): Promise<void> {
  await Promise.all([
    removeSecureItem(STORAGE_KEYS.ACCESS_TOKEN),
    removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN),
    removeSecureItem(STORAGE_KEYS.SESSION),
    removeSecureItem(STORAGE_KEYS.USER),
  ]);
} 