import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { LangProvider } from '@/context/LangContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: '트립비 | Trip-B - 국가별 여행 경비 계산기',
  description: '호주·일본·태국·싱가포르·베트남 등 국가별 여행 경비를 블로그 후기 기반으로 실시간 계산. 환율·항공권 반영',
  keywords: [
    '트립비',
    'Trip-B',
    '여행 경비 계산기',
    '해외여행 비용',
    '여행 예산 계산',
    '호주 여행 경비',
    '호주 여행 비용 2026',
    '일본 여행 경비',
    '일본 도쿄 여행 비용',
    '태국 방콕 여행 경비',
    '태국 여행 비용 2026',
    '싱가포르 여행 비용',
    '베트남 여행 경비',
    '필리핀 세부 여행 비용',
    '대만 타이베이 여행 경비',
    '홍콩 여행 비용',
    '미국 여행 경비',
    '유럽 여행 비용',
    '여행 경비 얼마',
    '여행 총 비용 계산',
    '항공료 숙박비 계산',
    '환율 여행 경비',
    '배낭여행 비용',
    '신혼여행 경비',
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  other: {
    'format-detection': 'telephone=no',
  },
  openGraph: {
    title: '트립비 | Trip-B - 국가별 여행 경비 실시간 계산',
    description: '블로그 후기 기반 정확한 여행 경비 예측. 환율·항공권·성수기 반영',
    type: 'website',
    url: 'https://www.tripbudget.my',
    siteName: '트립비 | Trip-B',
    images: [
      {
        url: 'https://www.tripbudget.my/og-image.png',
        width: 1200,
        height: 630,
        alt: '트립비 - 여행 경비 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '트립비 | Trip-B',
    description: '국가별 여행 비용을 한눈에 계산하세요',
  },
  alternates: {
    canonical: 'https://www.tripbudget.my',
    languages: {
      'ko': 'https://www.tripbudget.my',
      'x-default': 'https://www.tripbudget.my',
    },
  },
};

// TODO: Replace ca-pub-XXXXXXXXXX with your actual AdSense publisher ID
const ADSENSE_CLIENT = 'ca-pub-8900217994673939';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="트립비 RSS 피드"
          href="https://www.tripbudget.my/rss.xml"
        />
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
              name: '트립비 | Trip-B - 여행 경비 계산기',
              description: '국가별 여행 경비를 실시간으로 예측하는 AI 기반 여행 계획 도구',
              url: 'https://www.tripbudget.my',
              inLanguage: 'ko-KR',
              applicationCategory: 'TravelApplication',
              audience: {
                '@type': 'Audience',
                geographicArea: {
                  '@type': 'Country',
                  name: 'South Korea',
                },
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
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
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              inLanguage: 'ko-KR',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: '해외여행 경비는 어떻게 계산하나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '트립비는 실제 블로그 여행 후기 데이터와 실시간 환율, 항공권 가격, 숙박비, 식비, 교통비, 성수기 가중치를 종합해 국가별 여행 경비를 계산합니다. 알뜰·표준·프리미엄 3가지 스타일별로 예산이 제공됩니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '일본 4박 5일 여행 경비는 얼마인가요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '일본 도쿄·오사카 4박 5일 기준 알뜰 여행은 약 80~110만원, 표준 여행은 약 130~180만원, 프리미엄은 200만원 이상입니다. 항공권·숙박·식비·교통비 모두 포함된 실제 블로그 후기 기반 금액입니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '태국 방콕 여행 경비는 얼마나 드나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '태국 방콕·푸껫 5박 6일 기준 알뜰 여행은 약 70~100만원, 표준 여행은 약 120~170만원 수준입니다. 항공권이 전체 경비의 약 40%를 차지합니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '여행 성수기에는 경비가 얼마나 오르나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '설날·추석·여름휴가·연말 성수기에는 항공권 가격이 평소 대비 40~100% 상승합니다. 트립비는 출발일을 입력하면 해당 시기 성수기 가중치를 자동 반영해 경비를 계산합니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '환율 변동은 어떻게 반영되나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '트립비는 매일 실시간 환율 API를 연동해 JPY, THB, USD, EUR 등 주요 통화의 최신 환율을 반영합니다. 모든 경비는 원화(KRW) 기준으로 환산되어 표시됩니다.',
                  },
                },
              ],
            }),
          }}
          strategy="afterInteractive"
        />
        <meta name="google-site-verification" content="your-verification-code" />
        <meta name="naver-site-verification" content="ab9c7b64d1277578ef377f6c41bcf88c94b0f479" />
        {/* Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full bg-[#0f1117] text-white antialiased">
        <AuthProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
