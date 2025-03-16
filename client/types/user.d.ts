import { User as SupabaseUser } from '@supabase/supabase-js';

declare global {
  // Extend the Supabase User type to include additional properties
  interface User extends SupabaseUser {
    name?: string;
    // Google OAuth specific fields that might be in user_metadata
    avatar_url?: string;
    email_verified?: boolean;
    full_name?: string;
    picture?: string;
  }
} 