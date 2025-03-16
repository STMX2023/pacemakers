import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  APP_REDIRECT_URI, 
  EXPO_REDIRECT_SCHEME,
  IOS_BUNDLE_IDENTIFIER,
  ANDROID_PACKAGE,
  EXPO_DEV_REDIRECT
} from '@env';
import { SecureStorageAdapter } from './secure-storage-adapter';
import { storeAuthData } from './secure-storage.service';

// Initialize Supabase
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a secure storage adapter for Supabase auth
const secureStorageAdapter = new SecureStorageAdapter();

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Get custom redirect URI
// This will be used for the OAuth flow
export const getRedirectUri = () => {
  // Determine the best redirect URI based on environment
  const isExpoGo = Constants.appOwnership === 'expo';
  const scheme = EXPO_REDIRECT_SCHEME;
  
  if (isExpoGo) {
    // For development in Expo Go
    return EXPO_DEV_REDIRECT || makeRedirectUri({
      path: 'auth/callback',
      preferLocalhost: true,
    });
  } else if (Platform.OS === 'ios') {
    // For iOS standalone apps
    return `${IOS_BUNDLE_IDENTIFIER}://auth/callback`;
  } else if (Platform.OS === 'android') {
    // For Android standalone apps
    return `${ANDROID_PACKAGE}://auth/callback`;
  }
  
  // Fallback
  return APP_REDIRECT_URI;
};

// Get Google OAuth URL
export const getGoogleOAuthUrl = async () => {
  // Always use the Supabase callback URL for Google OAuth
  // This is required because Google only accepts http/https schemes
  const redirectUri = `${supabaseUrl}/auth/v1/callback`;
  
  console.log('Using Supabase redirect URI for Google OAuth:', redirectUri);
  
  const appRedirectUri = getRedirectUri();
  console.log('App will handle redirect at:', appRedirectUri);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appRedirectUri, // This is where Supabase will redirect after Google auth
      queryParams: {
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error getting Google OAuth URL:', error);
    return null;
  }

  return data.url;
};

// Export the setOAuthSession function so it can be used by other services
export const setOAuthSession = async (sessionData: { 
  access_token: string; 
  refresh_token: string; 
}): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
    });
    
    if (error) {
      console.error('Error setting session:', error);
      throw error;
    }
    
    // Also store the session data in our secure storage for easier access
    if (data.session) {
      await storeAuthData(
        sessionData.access_token,
        sessionData.refresh_token,
        data.session,
        data.user
      );
    }
    
    console.log('Session set successfully');
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
};

// Extract params from URL after OAuth redirect
export const extractParamsFromUrl = (url: string) => {
  console.log('Extracting params from URL:', url);
  
  // Handle both hash and query parameters
  const hasHash = url.includes('#');
  const hasQuery = url.includes('?');
  
  let params: URLSearchParams;
  
  if (hasHash) {
    // For hash-based parameters
    params = new URLSearchParams(url.split('#')[1]);
  } else if (hasQuery) {
    // For query-based parameters
    params = new URLSearchParams(url.split('?')[1]);
  } else {
    params = new URLSearchParams();
  }
  
  const result = {
    access_token: params.get('access_token'),
    expires_in: parseInt(params.get('expires_in') || '0'),
    refresh_token: params.get('refresh_token'),
    token_type: params.get('token_type'),
    provider_token: params.get('provider_token'),
  };
  
  console.log('Extracted params:', JSON.stringify(result, null, 2));
  
  return result;
};

// Initialize WebBrowser
export const initializeWebBrowser = () => {
  WebBrowser.maybeCompleteAuthSession();
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Get the Google OAuth URL from Supabase
    const url = await getGoogleOAuthUrl();
    if (!url) {
      throw new Error('Failed to get Google OAuth URL');
    }

    console.log('Opening auth session with URL:', url);
    
    // Open the browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(
      url,
      getRedirectUri(),
      {
        showInRecents: true,
        createTask: Platform.OS === 'android', // Create a new task on Android
      }
    );

    console.log('Auth session result type:', result.type);
    
    if (result.type === 'success' && result.url) {
      console.log('Auth successful, processing redirect URL');
      const params = extractParamsFromUrl(result.url);
      
      if (!params.access_token || !params.refresh_token) {
        console.error('Missing tokens in OAuth response', params);
        throw new Error('No access token or refresh token found in the response');
      }

      console.log('Setting OAuth session with tokens');
      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      
      if (error) {
        console.error('Error setting session:', error);
        throw error;
      }
      
      console.log('Session set successfully, user info:', data.user?.email);
      
      // Store tokens in secure storage
      if (data.session) {
        await storeAuthData(
          params.access_token,
          params.refresh_token,
          data.session,
          data.user
        );
      }
      
      // Return the user and session from the setSession response
      return { 
        user: data.user, 
        session: data.session 
      };
      
    } else if (result.type === 'cancel') {
      console.log('Authentication was cancelled by user');
      throw new Error('Authentication was cancelled');
    } else {
      console.error('Authentication failed with result type:', result.type);
      throw new Error(`Authentication failed: ${result.type}`);
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Add a function to handle token refresh
export const refreshSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
    
    if (data.session) {
      // Store the refreshed tokens
      await storeAuthData(
        data.session.access_token,
        data.session.refresh_token,
        data.session,
        data.user
      );
      console.log('Session refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error during session refresh:', error);
    return false;
  }
};
