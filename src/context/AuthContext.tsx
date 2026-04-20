'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextValue {
  user: GoogleUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
    // Called by the GIS script's onload callback below
    __tripb_gsi_ready?: () => void;
  }
}

const STORAGE_KEY = 'trip-b-user';
export const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const handleCredential = useCallback((response: { credential: string }) => {
    try {
      // JWT payload is the second segment, base64url-encoded
      const base64 = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as GoogleUser;
      const u: GoogleUser = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
    } catch (e) {
      console.error('[AuthContext] credential parse failed', e);
    }
  }, []);

  // Initialize GIS once the script is ready
  useEffect(() => {
    if (!CLIENT_ID) return;

    const init = () => {
      window.google?.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: false,
      });
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      // Poll until GIS script loads
      const t = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(t);
          init();
        }
      }, 150);
      return () => clearInterval(t);
    }
  }, [handleCredential]);

  const signOut = useCallback(() => {
    window.google?.accounts.id.disableAutoSelect();
    if (user) {
      window.google?.accounts.id.revoke(user.email, () => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
