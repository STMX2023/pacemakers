import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as SupabaseUser } from '@supabase/supabase-js';
import * as authService from '@/services/auth.service';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
          const isAuthenticated = await authService.isAuthenticated();
          
          if (isAuthenticated) {
            const user = await authService.getCurrentUser();
            set({ isAuthenticated: true, user });
            console.log('Auth checked: User is authenticated', user?.email);
          } else {
            set({ isAuthenticated: false, user: null });
            console.log('Auth checked: User is not authenticated');
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
          const { user } = await authService.signInWithEmail(email, password);
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
          const { user } = await authService.signUpWithEmail(email, password);
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
          const { user } = await authService.signInWithGoogle();
          console.log('Google login successful in store');
          
          // Double check we got a valid user
          if (!user) {
            throw new Error('No user returned from Google login');
          }
          
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
