'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Lang, T, getT } from '@/lib/i18n';

interface LangContextValue {
  lang: Lang;
  t: T;
}

const VALUE: LangContextValue = { lang: 'ko', t: getT() };

const LangContext = createContext<LangContextValue>(VALUE);

export function LangProvider({ children }: { children: ReactNode }) {
  return <LangContext.Provider value={VALUE}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
