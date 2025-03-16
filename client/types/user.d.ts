import { User as SupabaseUser } from '@supabase/supabase-js';

declare global {
  // Extend the Supabase User type to include additional properties
  interface User extends SupabaseUser {
    name?: string;
  }
} 