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

export default function GoogleSignInButton({
  theme = 'filled_black',
  size = 'large',
  text = 'signin_with',
  width,
  shape = 'rectangular',
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const [ready, setReady] = useState(false);
  const [webview, setWebview] = useState(false);
  const gWidth = Math.max(width ?? (size === 'large' ? 220 : 200), 200);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && isBlockedWebview(navigator.userAgent)) {
      setWebview(true);
      return;
    }
    if (done.current) return;

    const render = () => {
      if (!divRef.current || !window.google?.accounts?.id) return false;
      window.google.accounts.id.renderButton(divRef.current, {
        type: 'standard',
        theme,
        size,
        text,
        shape,
        logo_alignment: 'left',
        width: gWidth,
      });
      done.current = true;
      setReady(true);
      return true;
    };

    if (!render()) {
      const t = setInterval(() => { if (render()) clearInterval(t); }, 150);
      return () => clearInterval(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const placeholderH = size === 'large' ? 40 : 36;
  const effectiveWidth = Math.max(width ?? (size === 'large' ? 220 : 200), 200);

  if (webview) {
    const href = typeof window !== 'undefined' ? window.location.href : 'https://www.tripbudget.my';
    const copy = () => {
      try {
        navigator.clipboard?.writeText(href);
      } catch { /* ignore */ }
    };
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="px-3 py-2 rounded-xl bg-amber-900/30 border border-amber-700/50 text-[11px] text-amber-200 leading-relaxed">
          🚫 카카오톡·인스타그램 등 앱 내 브라우저에서는 Google 로그인이 막혀 있어요.
          <span className="block mt-1 text-amber-100/80">
            오른쪽 상단의 <b>···</b> → <b>다른 브라우저로 열기</b> (Chrome / Safari) 로 이동해 주세요.
          </span>
        </div>
        <button
          onClick={copy}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100"
        >주소 복사하기</button>
      </div>
    );
  }

  return (
    <div className="relative">
      {!ready && (
        <div
          className="rounded bg-slate-700/60 animate-pulse"
          style={{ height: placeholderH, width: effectiveWidth }}
        />
      )}
      <div ref={divRef} className={ready ? '' : 'absolute opacity-0 pointer-events-none'} />
    </div>
  );
}
