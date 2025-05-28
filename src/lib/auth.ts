import { supabase } from '@/integrations/supabase/client';
import type { AuthChangeEvent, Session, User, SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

export const signUp = async (credentials: SignUpWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signUp(credentials);
  return { data, error };
};

export const signIn = async (credentials: SignInWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } , error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

export const onAuthStateChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};
