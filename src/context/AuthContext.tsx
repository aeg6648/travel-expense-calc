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
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: () => {},
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
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}

const STORAGE_KEY = 'trip-b-user';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const handleCredential = useCallback((response: { credential: string }) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1])) as GoogleUser;
      const u: GoogleUser = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
    } catch {}
  }, []);

  useEffect(() => {
    if (!CLIENT_ID) return;

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: true,
      });
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          init();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [handleCredential]);

  const signIn = useCallback(() => {
    if (!CLIENT_ID) {
      alert('Google Client ID가 설정되지 않았습니다.\n.env.local에 NEXT_PUBLIC_GOOGLE_CLIENT_ID를 추가하세요.');
      return;
    }
    window.google?.accounts.id.prompt();
  }, []);

  const signOut = useCallback(() => {
    if (user && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user.email, () => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
