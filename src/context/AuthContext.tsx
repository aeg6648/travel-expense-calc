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
          prompt: (listener?: (notification: unknown) => void) => void;
          cancel: () => void;
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
  // If name contains garbled chars (old Latin-1 decoded entry), discard it so user re-logs in cleanly
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GoogleUser;
        // Detect Latin-1 garbling: Korean chars in proper UTF-8 are >= U+AC00
        // Garbled text uses characters like ë, ª, © (U+00EB, U+00AA, etc.)
        const hasGarbled = /[\u0080-\u00FF]/.test(parsed.name ?? '');
        if (hasGarbled) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setUser(parsed);
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  const handleCredential = useCallback((response: { credential: string }) => {
    try {
      // JWT payload is base64url-encoded UTF-8 JSON
      // atob() returns Latin-1 bytes, so we need TextDecoder for non-ASCII (e.g. Korean names)
      const base64 = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder('utf-8').decode(bytes)) as GoogleUser;
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
        // iOS Safari / mobile Chrome fixes:
        //   itp_support lets GIS work under Intelligent Tracking Prevention
        //   use_fedcm_for_prompt/button enables the native FedCM sign-in dialog
        //   which bypasses a bunch of third-party-cookie issues on mobile.
        itp_support: true,
        use_fedcm_for_prompt: true,
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
