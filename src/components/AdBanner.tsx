'use client';

import { useEffect } from 'react';

interface Props {
  // TODO: Replace with your actual AdSense slot IDs from Google AdSense dashboard
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  label?: string;
}

// TODO: Replace with your actual AdSense publisher ID
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXX';

export default function AdBanner({ slot, format = 'auto', className = '', label = '광고' }: Props) {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div className={`relative ${className}`}>
      <p className="text-[9px] text-slate-600 text-center mb-1 tracking-wider uppercase">{label}</p>
      <div className="rounded-xl overflow-hidden border border-slate-700/40 bg-slate-800/30">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
