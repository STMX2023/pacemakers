import { Session, User } from '@supabase/supabase-js';
import { 
  supabase, 
  setOAuthSession as setSupabaseOAuthSession,
  signInWithGoogle as supabaseSignInWithGoogle 
} from './supabase.service';

// Get the current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }
  return data.session;
};

// Get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }
  return data.user;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error logging in:', error);
    throw error;
  }

  return { user: data.user, session: data.session };
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }

  return { user: data.user, session: data.session };
};

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<{ user: User | null; session: Session | null }> => {
  console.log('Starting Google sign-in process...');
  
  try {
    // The actual OAuth flow happens in supabase.service.ts
    // That function now handles setting the session and returning user data
    return await supabaseSignInWithGoogle();
  } catch (error) {
    console.error('Error in Google sign-in process:', error);
    throw error;
  }
};

// Set OAuth session manually (from session storage or refresh)
export const setOAuthSession = async (sessionData: { 
  access_token: string; 
  refresh_token: string; 
}): Promise<void> => {
  await setSupabaseOAuthSession(sessionData);
};

// Sign out
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
