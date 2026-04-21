'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'continue_with';
  width?: number;
  shape?: 'rectangular' | 'pill';
}

// Google Identity Services refuses to sign in inside these in-app webviews
// (KakaoTalk, Instagram, Facebook, Naver, Line, Band, etc.). There is no
// way around this from our side — we can only give the user a one-tap
// escape into the real system browser.
function isBlockedWebview(ua: string): boolean {
  return /(kakaotalk|kakao|inapp|naver\(inapp|whale\/inapp|instagram|fb_iab|fbav|fban|line\/|band\/|everytime|twitter|daum|zum|;\s*wv\))/i.test(ua);
}
function isKakaoWebview(ua: string): boolean {
  return /kakaotalk|kakao/i.test(ua);
}
function isAndroid(ua: string): boolean {
  return /android/i.test(ua);
}

// Build a deep link that opens the current URL in the device's real browser.
// KakaoTalk exposes an official scheme on both iOS and Android; other Android
// webviews can use a Chrome Intent URL. iOS non-Kakao webviews (Instagram,
// Line, Facebook) don't have a reliable scheme, so we fall back to copy.
function externalBrowserHref(url: string, ua: string): string | null {
  if (isKakaoWebview(ua)) {
    return `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  }
  if (isAndroid(ua)) {
    try {
      const u = new URL(url);
      const tail = `${u.pathname}${u.search}${u.hash}`;
      return `intent://${u.host}${tail}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    } catch {
      return null;
    }
  }
  return null;
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
  const [ua, setUa] = useState('');
  const [webview, setWebview] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const u = navigator.userAgent || '';
    setUa(u);
    setWebview(isBlockedWebview(u));
  }, []);

  // Google's renderButton clamps width to [200, 400]. Keep our wrapper in
  // that range so the rendered iframe fills the container exactly and every
  // click lands on Google's real button underneath.
  const targetWidth = width ?? (size === 'large' ? 240 : 200);

  // Render Google's official button (invisible) as soon as GIS is ready.
  // We delegate the click to Google because window.google.accounts.id.prompt()
  // silently no-ops on Safari/Samsung/Firefox under ITP, inside FedCM
  // cooldowns, or when 3P cookies are blocked — renderButton bypasses all of
  // those via its own popup/redirect flow.
  useEffect(() => {
    if (webview) return;
    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return true;
      if (!googleBtnRef.current || !window.google?.accounts?.id) return false;
      if (googleBtnRef.current.childElementCount > 0) return true;
      try {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme,
          size: size === 'small' ? 'medium' : size,
          text,
          shape: 'rectangular',
          width: targetWidth,
          logo_alignment: 'left',
        });
      } catch {}
      return true;
    };
    if (tryRender()) return;
    const i = setInterval(() => {
      if (tryRender()) clearInterval(i);
    }, 150);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, [webview, size, text, theme, targetWidth]);

  if (webview) {
    const href = typeof window !== 'undefined' ? window.location.href : 'https://www.tripbudget.my';
    const deepLink = externalBrowserHref(href, ua);
    const copyUrl = () => {
      try {
        navigator.clipboard?.writeText(href);
      } catch {
        /* ignore */
      }
    };
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="px-3 py-2 rounded-xl bg-amber-900/30 border border-amber-700/50 text-[11px] text-amber-200 leading-relaxed">
          🚫 카톡·인스타 등 앱 내 브라우저에서는 Google 로그인이 차단돼요.
          <span className="block mt-1 text-amber-100/80">Chrome / Safari 에서 열어주세요.</span>
        </div>
        {deepLink ? (
          <a
            href={deepLink}
            rel="noopener"
            className="text-[12px] text-center px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            ↗ {isKakaoWebview(ua) ? '기본 브라우저로 열기' : 'Chrome 으로 열기'}
          </a>
        ) : (
          <p className="text-[10px] text-slate-400 leading-relaxed px-1">
            우측 상단 <b>···</b> → <b>다른 브라우저에서 열기</b> 를 눌러주세요.
          </p>
        )}
        <button
          onClick={copyUrl}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          주소 복사하기
        </button>
      </div>
    );
  }

  const label = text === 'continue_with' ? 'Google로 계속하기' : 'Google 로그인';
  const paddings = size === 'large' ? 'text-sm' : 'text-xs';
  const iconSize = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  const themeClasses =
    theme === 'outline'
      ? 'bg-white text-slate-700 border-slate-300'
      : theme === 'filled_blue'
        ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
        : 'bg-slate-800 text-slate-100 border-slate-700';

  return (
    <div className="relative inline-block align-middle" style={{ width: targetWidth }}>
      {/* Decorative styled button — visible; clicks pass through via
          pointer-events-none so Google's invisible button underneath
          receives the tap. */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-2 rounded-xl border font-semibold shadow-sm pointer-events-none ${paddings} ${themeClasses}`}
      >
        <span className={`inline-flex ${iconSize} rounded-full bg-white p-[3px] shrink-0`}>
          <GoogleG className="w-full h-full" />
        </span>
        <span>{label}</span>
      </div>
      {/* Google's real sign-in button — kept invisible but the click target.
          The wrapper width matches `targetWidth` so Google's iframe fills
          it exactly, ensuring every click lands on the real button. */}
      <div
        ref={googleBtnRef}
        className="relative opacity-0"
        style={{ colorScheme: 'light' }}
        aria-label="Google로 로그인"
      />
    </div>
  );
}
