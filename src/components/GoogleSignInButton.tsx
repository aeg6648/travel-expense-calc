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
  // Google minimum is 200px; clamp incoming width up to that
  const gWidth = Math.max(width ?? (size === 'large' ? 220 : 200), 200);

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
  // Google minimum button width is 200px
  const effectiveWidth = Math.max(width ?? (size === 'large' ? 220 : 200), 200);

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
