import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Initialize Supabase
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
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

// Set OAuth session from redirect
export const setOAuthSession = async (tokens: {
  access_token: string;
  refresh_token: string;
}) => {
  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  if (error) {
    console.error('Error setting session:', error);
    throw error;
  }

  return data;
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

    console.log('Auth session result:', JSON.stringify(result, null, 2));

    // Handle the result
    if (result.type === 'success') {
      const params = extractParamsFromUrl(result.url);
      
      if (!params.access_token || !params.refresh_token) {
        throw new Error('No access token or refresh token found in the response');
      }

      // Set the session in Supabase
      return await setOAuthSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
    } else if (result.type === 'cancel') {
      throw new Error('Authentication was cancelled');
    } else {
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
