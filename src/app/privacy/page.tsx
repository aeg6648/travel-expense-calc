'use client';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - TripBudget 여행 경비 계산기',
  description: 'TripBudget의 개인정보처리방침입니다. 데이터 수집, 사용, 보호에 대한 정보를 확인하세요.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">개인정보처리방침</h1>
          <p className="text-slate-400">마지막 수정: 2026년 4월 20일</p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">1. 수집하는 정보</h2>
            <p className="text-slate-300">
              여행 경비 계산기는 다음과 같은 정보를 수집합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>출발 날짜, 여행 기간, 여행 스타일 등 여행 조건 정보 (로컬 저장)</li>
              <li>선택한 국가 및 도시 정보 (로컬 저장)</li>
              <li>Google Analytics를 통한 익명 방문자 분석 데이터</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">2. 정보 저장 및 사용</h2>
            <p className="text-slate-300">
              입력하신 모든 여행 조건 정보는 <strong>귀하의 브라우저에만 저장</strong>되며, 
              서버로 전송되지 않습니다. 당사는 이러한 정보를 수집, 저장 또는 공유하지 않습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">3. 외부 API 호출</h2>
            <p className="text-slate-300">
              본 사이트는 다음과 같은 외부 서비스를 사용합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li><strong>환율 정보:</strong> Open Exchange Rates API (https://open.er-api.com)</li>
              <li><strong>블로그 검색:</strong> Naver Blog Search API (선택 사항)</li>
              <li><strong>광고:</strong> Google AdSense</li>
              <li><strong>분석:</strong> Vercel Analytics</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">4. 데이터 기반</h2>
            <p className="text-slate-300">
              본 계산기의 여행 경비 데이터는 다음을 기반으로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>블로그 후기 및 여행자 리뷰 분석</li>
              <li>공개 가능한 환율 데이터</li>
              <li>각 국가의 계절별 항공료 변동 데이터</li>
              <li>국가별 주요 휴일 및 성수기 정보</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">5. 쿠키 및 추적</h2>
            <p className="text-slate-300">
              본 사이트는 다음의 추적 도구를 사용합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>Google AdSense: 광고 게재 및 성과 측정</li>
              <li>Vercel Analytics: 방문자 통계 분석</li>
            </ul>
            <p className="text-slate-300 mt-3">
              이러한 도구는 익명으로 작동하며, 개인을 식별할 수 있는 정보를 수집하지 않습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">6. 사용자 권리</h2>
            <p className="text-slate-300">
              귀하는 언제든지:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>브라우저 설정을 통해 로컬 저장 데이터 삭제 가능</li>
              <li>브라우저의 쿠키 및 추적 설정 조정 가능</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-100">7. 문의</h2>
            <p className="text-slate-300">
              개인정보처리방침에 대한 질문이 있으신 경우, 
              이 페이지 하단의 연락처로 문의해 주세요.
            </p>
          </section>

          <section className="space-y-3 pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              이 개인정보처리방침은 예고 없이 변경될 수 있습니다. 
              변경 사항은 본 페이지에 게시됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
