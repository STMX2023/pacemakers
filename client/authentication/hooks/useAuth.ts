import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/zustand/auth.store';
import { initializeWebBrowser } from '@/services/supabase.service';

export const useAuth = () => {
  const { 
    isAuthenticated: storeIsAuthenticated, 
    user, 
    isLoading: storeIsLoading,
    error,
    login, 
    signUp,
    loginWithGoogle,
    logout,
    checkAuth
  } = useAuthStore();
  
  // Local state to prevent flickering during transitions
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(storeIsAuthenticated);

  // Initialize WebBrowser for OAuth
  useEffect(() => {
    initializeWebBrowser();
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await checkAuth();
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  // Update local state when store changes
  useEffect(() => {
    setIsAuthenticated(storeIsAuthenticated);
    // When not loading anymore in the store, update local loading state too
    if (!storeIsLoading) {
      setIsLoading(false);
    }
  }, [storeIsAuthenticated, storeIsLoading]);

  // Enhanced login with Google that updates local state
  const handleLoginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    signUp,
    loginWithGoogle: handleLoginWithGoogle,
    logout,
  };
}; 