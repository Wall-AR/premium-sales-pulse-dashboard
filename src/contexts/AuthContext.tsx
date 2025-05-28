import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, Subscription } from '@supabase/supabase-js';
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getCurrentUser, onAuthStateChange } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ error: string | null }>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCurrentUser()
      .then(currentUser => {
        setUser(currentUser);
      })
      .catch(err => {
        console.error("Error getting current user on mount:", err);
        setError("Failed to fetch user session."); // Or handle more gracefully
      })
      .finally(() => {
        setLoading(false);
      });

    const subscription = onAuthStateChange((event, session) => {
      setLoading(true);
      setError(null); // Clear previous errors on auth state change
      console.log('Auth state changed:', event, session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabaseSignIn(credentials);
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return { error: authError.message };
    }
    // User state will be updated by onAuthStateChange
    return { error: null };
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    setLoading(true);
    setError(null);
    const { error: authError, data } = await supabaseSignUp(credentials);
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return { error: authError.message };
    }
    // If sign up requires email confirmation, user object might be immediately available
    // but session might not be active until confirmation.
    // onAuthStateChange should handle the user state.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        const userExistsError = "User already exists. Please try logging in or use a different email.";
        setError(userExistsError);
        return { error: userExistsError };
    }
    // User state will be updated by onAuthStateChange
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabaseSignOut();
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return { error: authError.message };
    }
    // User state will be updated by onAuthStateChange
    setUser(null); // Explicitly set user to null on signout
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
