import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js'; // Removed Subscription as it's implicitly typed by onAuthStateChange
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getCurrentUser, onAuthStateChange } from '../lib/auth';
import { getUserRole, type UserRole, type UserRoleEnum } from '@/lib/supabaseQueries'; // Added imports

interface AuthContextType {
  user: User | null;
  loading: boolean; // For initial user session loading
  error: string | null;
  userRole: UserRoleEnum | null; // New
  isLoadingRole: boolean;      // New
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ error: string | null }>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRoleEnum | null>(null); // New state
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);

  const fetchAndSetUserRole = async (userId: string | undefined) => {
    if (!userId) {
      setUserRole(null);
      setIsLoadingRole(false); // Ensure loading is false if no user ID
      return;
    }
    setIsLoadingRole(true);
    try {
      const roleInfo = await getUserRole(userId);
      setUserRole(roleInfo?.role ?? null);
      console.log(`[AuthContext] Role fetched for user ${userId}:`, roleInfo?.role ?? null);
    } catch (err) {
      console.error("[AuthContext] Error fetching user role:", err);
      setUserRole(null);
    } finally {
      setIsLoadingRole(false);
    }
  };

  useEffect(() => {
    setLoading(true); // For initial session loading
    // setIsLoadingRole(true); // setIsLoadingRole is handled by fetchAndSetUserRole

    const initializeSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        // Fetch role right after getting current user
        await fetchAndSetUserRole(currentUser?.id);
      } catch (err) {
        console.error("[AuthContext] Error initializing session:", err);
        setError("Failed to initialize user session.");
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false); // Session loading finished
      }
    };

    initializeSession();

    const { data: authListener } = onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session);
      const authUser = session?.user ?? null;
      setUser(authUser);
      // Subsequent auth changes (login, logout) will also trigger role fetching.
      // setLoading(true/false) for session is handled by initializeSession for initial load,
      // and by signIn/signUp/signOut for subsequent actions.
      // onAuthStateChange primarily updates user and role here.
      setError(null);
      fetchAndSetUserRole(authUser?.id);
    });

    return () => {
      authListener?.unsubscribe();
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
    setUser(null);
    setUserRole(null); // Clear userRole on sign out
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, userRole, isLoadingRole, signIn, signUp, signOut }}>
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
