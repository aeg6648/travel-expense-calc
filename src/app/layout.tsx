import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { Playfair_Display, Inter } from 'next/font/google';
import { LangProvider } from '@/context/LangContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['900'],
  style: ['italic'],
  variable: '--font-playfair',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TRIP-B · 당신의 플랜 B, 여행 플래너',
  description:
    '여행 일정 · 유명인 코스 · 여행 커뮤니티 · 실시간 환율 · 실제 블로그 후기 — 계획이 틀어져도 재밌는 플랜 B를 만들어드려요.',
  keywords: [
    'TRIP-B',
    '트립비',
    '여행 플래너',
    '여행 일정 관리',
    '여행 커뮤니티',
    '유명인 여행지',
    '연예인 해외 여행',
    '여행 코스 추천',
    '인기 여행지 2026',
    '유럽 여행 코스',
    '일본 여행 일정',
    '동남아 여행 추천',
    '여행 동선 짜기',
    '여행 체크리스트',
    '여행 팁',
    '해외여행 앱',
    '여행 가심비',
    '여행 브이로그 장소',
    '힙한 여행지',
    '감성 여행지',
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  other: {
    'format-detection': 'telephone=no',
  },
  openGraph: {
    title: 'TRIP-B · 당신의 플랜 B, 여행 플래너',
    description: '일정 · 경험 · 커뮤니티까지 — 플랜 A가 틀어져도 재밌는 플랜 B.',
    type: 'website',
    url: 'https://www.tripbudget.my',
    siteName: 'TRIP-B',
    images: [
      {
        url: 'https://www.tripbudget.my/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TRIP-B · 여행 플래너',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRIP-B · 여행 플래너',
    description: '일정·경험·커뮤니티까지 — 당신의 플랜 B.',
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
    <html lang="ko" className={`h-full ${playfair.variable} ${inter.variable}`}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="TRIP-B RSS 피드"
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
              name: 'TRIP-B · 여행 플래너',
              description: '여행 일정 · 유명인 코스 · 커뮤니티 · 실시간 환율까지 담은 한국 여행자용 플래너',
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
                '드래그로 순서 바꾸는 여행 일정 관리',
                '유명인·인플루언서가 다녀온 여행지 탐색',
                '다른 여행자와 일정 공유·대화 커뮤니티',
                '무드(미식·예술·힐링·야경…)별 여행지 필터',
                '실시간 환율 · 항공권 성수기 반영',
                '블로그 후기 기반 지출 데이터',
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
                    text: 'TRIP-B는 여행 일정을 드래그로 짜고, 유명인·인플루언서가 실제로 다녀온 코스를 참고하고, 다른 여행자와 후기·팁을 주고받을 수 있는 한국 여행자용 플래너입니다. 보조 기능으로 실시간 환율과 블로그 후기 기반 지출 데이터, 항공권 성수기 가중치를 제공합니다.',
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
