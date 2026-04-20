'use client';

import { useEffect, useRef } from 'react';

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
      return true;
    };

    if (!render()) {
      const t = setInterval(() => { if (render()) clearInterval(t); }, 150);
      return () => clearInterval(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={divRef} />;
}
