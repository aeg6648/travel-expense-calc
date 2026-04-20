'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'continue_with';
  width?: number;
  shape?: 'rectangular' | 'pill';
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

  useEffect(() => {
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
        ...(width ? { width } : {}),
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

  const placeholderH = size === 'large' ? 'h-10' : 'h-8';
  const placeholderW = width ? `w-[${width}px]` : size === 'large' ? 'w-48' : 'w-32';

  return (
    <div className="relative">
      {/* 로딩 중 placeholder — Google 버튼과 크기 일치 */}
      {!ready && (
        <div className={`${placeholderH} ${placeholderW} rounded bg-slate-700/60 animate-pulse`} />
      )}
      <div ref={divRef} className={ready ? '' : 'absolute opacity-0 pointer-events-none'} />
    </div>
  );
}
