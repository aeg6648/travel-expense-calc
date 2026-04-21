'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'continue_with';
  width?: number;
  shape?: 'rectangular' | 'pill';
}

// Detect in-app browsers (KakaoTalk, Instagram, Facebook, Line, etc.).
// Google Identity Services refuses to sign in inside these webviews, so we
// show a helper to open the real system browser instead.
function isBlockedWebview(ua: string): boolean {
  const s = ua.toLowerCase();
  return /(kakao|inapp|naver|instagram|fb_iab|fbav|line|whale\/inapp|everytime|band\/|twitter|kakaotalk)/i.test(s);
}

function GoogleG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function GoogleSignInButton({
  theme = 'filled_black',
  size = 'medium',
  text = 'signin_with',
  width,
  shape: _shape = 'rectangular',
}: Props) {
  const [gisReady, setGisReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [webview, setWebview] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect webview + poll for GIS load.
  useEffect(() => {
    if (typeof navigator !== 'undefined' && isBlockedWebview(navigator.userAgent)) {
      setWebview(true);
      return;
    }
    if (window.google?.accounts?.id) { setGisReady(true); return; }
    pollRef.current = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGisReady(true);
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    }, 120);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleClick = () => {
    if (!window.google?.accounts?.id) {
      setPending(true);
      // GIS still loading; retry briefly
      const until = Date.now() + 5000;
      const retry = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(retry);
          setPending(false);
          window.google.accounts.id.prompt();
        } else if (Date.now() > until) {
          clearInterval(retry);
          setPending(false);
        }
      }, 150);
      return;
    }
    window.google.accounts.id.prompt();
  };

  if (webview) {
    const href = typeof window !== 'undefined' ? window.location.href : 'https://www.tripbudget.my';
    const copy = () => { try { navigator.clipboard?.writeText(href); } catch { /* ignore */ } };
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="px-3 py-2 rounded-xl bg-amber-900/30 border border-amber-700/50 text-[11px] text-amber-200 leading-relaxed">
          🚫 카카오톡·인스타그램 등 앱 내 브라우저에서는 Google 로그인이 막혀 있어요.
          <span className="block mt-1 text-amber-100/80">
            오른쪽 상단의 <b>···</b> → <b>다른 브라우저로 열기</b> (Chrome / Safari) 로 이동해 주세요.
          </span>
        </div>
        <button onClick={copy} className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100">
          주소 복사하기
        </button>
      </div>
    );
  }

  const label = text === 'continue_with' ? 'Google로 계속하기' : 'Google 로그인';
  const paddings = size === 'large' ? 'px-5 py-2.5 text-sm' : size === 'small' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs';
  const iconSize = size === 'large' ? 'w-5 h-5' : size === 'small' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  // Themed to match the rest of the header chrome (dark), but keeps the
  // official Google G mark for brand compliance.
  const themeClasses = theme === 'outline'
    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
    : theme === 'filled_blue'
      ? 'bg-[#1a73e8] text-white border-[#1a73e8] hover:bg-[#1967d2]'
      : 'bg-slate-800 text-slate-100 border-slate-700 hover:border-indigo-500/60 hover:bg-slate-700/80';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      style={width ? { minWidth: `${width}px` } : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-colors shadow-sm ${paddings} ${themeClasses} disabled:opacity-60`}
      aria-busy={pending}
    >
      <span className={`inline-flex ${iconSize} rounded-full bg-white p-[3px] shrink-0`}>
        <GoogleG className="w-full h-full" />
      </span>
      <span>{pending ? '잠시만요…' : gisReady ? label : label}</span>
    </button>
  );
}
