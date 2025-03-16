import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import * as authService from '@/services/auth.service';
import { clearAuthData, getSecureItem, getSecureObject, STORAGE_KEYS, storeAuthData } from '@/services/secure-storage.service';

// Use our custom User type that extends SupabaseUser
type User = SupabaseUser & {
  name?: string;
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAuthenticated: (isAuthenticated: boolean, user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  // Directly set authentication state - useful for testing and direct manipulation
  setAuthenticated: (isAuthenticated, user) => {
    set({ isAuthenticated, user });
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // First check if we have a valid session in Supabase
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        set({ isAuthenticated: true, user });
        console.log('Auth checked: User is authenticated', user?.email);
      } else {
        // If no valid session in Supabase, check secure storage as a fallback
        const accessToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        const user = await getSecureObject<User>(STORAGE_KEYS.USER);
        
        if (accessToken && user) {
          // We have stored credentials, try to restore the session
          try {
            // Try to set the session with the stored tokens
            const refreshToken = await getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              await authService.setOAuthSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              set({ isAuthenticated: true, user });
              console.log('Auth restored from secure storage', user?.email);
            } else {
              // Missing refresh token, cannot restore session
              await clearAuthData();
              set({ isAuthenticated: false, user: null });
            }
          } catch (e) {
            // Session restoration failed, tokens may be expired
            console.error('Failed to restore session:', e);
            await clearAuthData();
            set({ isAuthenticated: false, user: null });
          }
        } else {
          set({ isAuthenticated: false, user: null });
          console.log('Auth checked: User is not authenticated');
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user, session } = await authService.signInWithEmail(email, password);
      
      // Store auth data securely
      if (session && user) {
        await storeAuthData(
          session.access_token,
          session.refresh_token,
          session,
          user
        );
      }
      
      set({ isAuthenticated: true, user });
      console.log('Login successful:', user?.email);
    } catch (error) {
      console.error('Login error:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user, session } = await authService.signUpWithEmail(email, password);
      
      // Store auth data securely if we have a session
      if (session && user) {
        await storeAuthData(
          session.access_token,
          session.refresh_token,
          session,
          user
        );
      }
      
      set({ isAuthenticated: !!user, user });
      console.log('Signup successful:', user?.email);
    } catch (error) {
      console.error('Sign up error:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('Starting Google login in store...');
      const { user, session } = await authService.signInWithGoogle();
      console.log('Google login successful in store');
      
      // Double check we got a valid user
      if (!user) {
        throw new Error('No user returned from Google login');
      }
      
      // We don't need to explicitly store the session here as it's already
      // handled in the setOAuthSession function (in supabase.service.ts)
      
      set({ isAuthenticated: true, user });
      
      // Double check the state was updated
      const state = get();
      console.log('Auth state after Google login:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        userEmail: state.user?.email,
      });
    } catch (error) {
      console.error('Google login error in store:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authService.signOut();
      
      // Clear secure storage
      await clearAuthData();
      
      set({ isAuthenticated: false, user: null });
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
