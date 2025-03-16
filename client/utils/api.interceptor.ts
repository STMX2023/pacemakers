/**
 * API Interceptor
 * 
 * This utility provides a way to intercept API calls and handle token refresh
 * when authentication tokens expire. It wraps fetch calls and automatically
 * refreshes tokens when a 401 response is received.
 */

import { refreshSession } from '@/services/supabase.service';

// Keep track of refresh attempts to prevent infinite loops
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

/**
 * Creates a fetch wrapper that handles token refresh
 * @param originalFetch The original fetch function to wrap
 * @returns A wrapped fetch function that handles token refresh
 */
export const createAuthFetch = (originalFetch = fetch): typeof fetch => {
  return async (input, init) => {
    try {
      // Make the initial request
      const response = await originalFetch(input, init);
      
      // If unauthorized and haven't exceeded max attempts, try to refresh token
      if (response.status === 401 && refreshAttempts < MAX_REFRESH_ATTEMPTS && !isRefreshing) {
        console.log('Received 401, attempting to refresh token');
        
        try {
          isRefreshing = true;
          refreshAttempts++;
          
          // Try to refresh the token
          const refreshed = await refreshSession();
          isRefreshing = false;
          
          if (refreshed) {
            console.log('Token refreshed, retrying request');
            // Retry the original request with the new token
            return originalFetch(input, init);
          } else {
            console.log('Token refresh failed');
            // If refresh failed, return the original 401 response
            return response;
          }
        } catch (error) {
          isRefreshing = false;
          console.error('Error during token refresh:', error);
          return response;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in fetch request:', error);
      throw error;
    } finally {
      // Reset refresh attempts counter after some time
      if (refreshAttempts > 0) {
        setTimeout(() => {
          refreshAttempts = 0;
        }, 60000); // Reset after 1 minute
      }
    }
  };
};

/**
 * Installs the interceptor by replacing the global fetch function
 */
export const installAuthInterceptor = () => {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = createAuthFetch(originalFetch);
    console.log('Auth interceptor installed');
  }
}; 