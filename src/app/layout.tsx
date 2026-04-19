import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: '여행 경비 계산기',
  description: '블로그 후기 기반 국가별 여행 경비 예측 — 환율·물가·항공권·연휴 반영',
};

// TODO: Replace ca-pub-XXXXXXXXXX with your actual AdSense publisher ID
const ADSENSE_CLIENT = 'ca-pub-8900217994673939';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full bg-[#0f1117] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
