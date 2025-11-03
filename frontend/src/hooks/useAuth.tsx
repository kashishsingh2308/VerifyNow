// src/hooks/useAuth.tsx
import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id?: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean; // <--- ADD THIS
  login: (jwtToken: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialAuthState = (): { token: string | null; user: User | null } => {
  try {
    const storedToken = localStorage.getItem('app_token');
    const storedUser = localStorage.getItem('currentUser');
    return {
      token: storedToken,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  } catch (e) {
    console.error("Failed to parse initial auth state from localStorage", e);
    localStorage.removeItem('app_token');
    localStorage.removeItem('currentUser');
    return { token: null, user: null };
  }
};

const BACKEND_VERIFY_URL = `${import.meta.env.VITE_BACKEND_URL}/api/verify-token`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // <--- ADD THIS

  const isAuthenticated = !!authState.token && !!authState.user?.email;

  const refreshUser = useCallback(async () => {
    setIsAuthLoading(true); // <--- Set loading true when starting verification
    const currentToken = localStorage.getItem('app_token');
    if (!currentToken) {
      setAuthState({ token: null, user: null });
      setIsAuthLoading(false); // <--- Set loading false if no token
      return;
    }

    try {
      const response = await fetch(BACKEND_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: currentToken }),
      });

      const data = await response.json();
      if (response.ok && data.valid && data.user) {
        const verifiedUser: User = {
          id: data.user.id || '',
          name: data.user.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          image: data.user.image || '',
        };
        setAuthState({ token: currentToken, user: verifiedUser });
      } else {
        console.warn("Token verification failed or no user data:", data.message);
        localStorage.removeItem('app_token');
        localStorage.removeItem('currentUser');
        setAuthState({ token: null, user: null });
      }
    } catch (err) {
      console.error('Error during token verification:', err);
      localStorage.removeItem('app_token');
      localStorage.removeItem('currentUser');
      setAuthState({ token: null, user: null });
    } finally {
      setIsAuthLoading(false); // <--- Set loading false after verification attempt
    }
  }, []);

  useEffect(() => {
    // Initial load check
    refreshUser();

    const handleAuthUpdate = () => {
      // Small delay to ensure localStorage updates are processed before refreshing
      setTimeout(() => refreshUser(), 50);
    };
    window.addEventListener('authUpdate', handleAuthUpdate);

    return () => {
      window.removeEventListener('authUpdate', handleAuthUpdate);
    };
  }, [refreshUser]);

  useEffect(() => {
    // This effect runs whenever authState changes to sync with localStorage.
    // Ensure this doesn't overwrite immediately when refreshUser is fetching.
    if (authState.token !== null) { // Only set if there's a token
      localStorage.setItem('app_token', authState.token);
    } else {
      localStorage.removeItem('app_token');
    }
    if (authState.user !== null) { // Only set if there's user data
      localStorage.setItem('currentUser', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [authState]);


  const login = useCallback((jwtToken: string, userData: User) => {
    const normalizedUser: User = {
      id: userData.id || '',
      name: userData.name || userData.email.split('@')[0] || 'User',
      email: userData.email,
      image: userData.image || '',
    };
    setAuthState({ token: jwtToken, user: normalizedUser });
    toast({ title: 'Login Successful', description: `Welcome, ${normalizedUser.name || normalizedUser.email}!` });
    window.dispatchEvent(new Event('authUpdate'));
  }, []);

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null });
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    window.dispatchEvent(new Event('authUpdate'));
  }, []);

  return (
    <AuthContext.Provider value={{
      token: authState.token,
      user: authState.user,
      isAuthenticated,
      isAuthLoading, // <--- EXPOSE THIS
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};