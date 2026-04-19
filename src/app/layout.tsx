import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: '여행 경비 계산기 - 국가별 여행 비용 예측',
  description: '호주, 일본, 태국, 싱가포르 등 국가별 여행 경비를 실시간으로 계산하세요. 블로그 후기 기반 정확한 경비 예측, 환율·항공권·성수기 반영',
  keywords: [
    '여행 경비',
    '여행 비용',
    '호주 여행 경비',
    '일본 여행 가격',
    '태국 여행 비용',
    '싱가포르 여행',
    '여행 예산',
    '항공료',
    '환율',
    '숙박료',
  ],
  openGraph: {
    title: '여행 경비 계산기 - 국가별 여행 비용 실시간 계산',
    description: '블로그 후기 기반 정확한 여행 경비 예측. 환율·항공권·성수기 반영',
    type: 'website',
    url: 'https://tripbuget.my',
    siteName: 'TripBudget',
    images: [
      {
        url: 'https://tripbuget.my/og-image.png',
        width: 1200,
        height: 630,
        alt: '여행 경비 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '여행 경비 계산기',
    description: '국가별 여행 비용을 한눈에 계산하세요',
  },
  alternates: {
    canonical: 'https://tripbuget.my',
  },
};

// TODO: Replace ca-pub-XXXXXXXXXX with your actual AdSense publisher ID
const ADSENSE_CLIENT = 'ca-pub-8900217994673939';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BZXEXBE0GC"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BZXEXBE0GC');
            `,
          }}
          strategy="afterInteractive"
        />

        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'TripBudget - 여행 경비 계산기',
              description: '국가별 여행 경비를 실시간으로 예측하는 AI 기반 여행 계획 도구',
              url: 'https://tripbuget.my',
              applicationCategory: 'TravelApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                '실시간 환율 계산',
                '국가별 여행 경비 예측',
                '블로그 후기 기반 데이터',
                '항공료 및 숙박료 추정',
                '여행 스타일별 경비 분석',
              ],
            }),
          }}
          strategy="afterInteractive"
        />
        <meta name="google-site-verification" content="your-verification-code" />
      </head>
      <body className="min-h-full bg-[#0f1117] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
