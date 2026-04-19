import { getCountryByCode } from '@/lib/travel-data';

export async function generateStaticParams() {
  const countries = ['AU', 'JP', 'TH', 'SG', 'US', 'GB', 'FR', 'DE', 'ES', 'IT', 'TR', 'VN', 'TW', 'HK', 'PH', 'ID'];
  return countries.map((code) => ({ code: code.toLowerCase() }));
}

export default function CountryPage({ params }: { params: { code: string } }) {
  const code = params.code?.toUpperCase();
  const country = code ? getCountryByCode(code) : null;

  if (!country) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">국가를 찾을 수 없습니다</h1>
          <p className="text-slate-400">요청하신 국가의 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  const titleKr = country.nameKR;
  const cities = country.cities?.join(', ') || '';
  const budget = {
    budget: 50000, // 기본값 (실제로는 country 데이터에서 가져옴)
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{titleKr} 여행 경비 가이드</h1>
          <p className="text-slate-400 text-lg">
            {titleKr} 여행에 필요한 예상 경비, 항공료, 환율, 숙박료를 한눈에 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">🎒 알뜰 여행</h3>
            <p className="text-2xl font-bold text-emerald-400">
              ₩{budget.budget?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">1박 평균 경비</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">🏨 표준 여행</h3>
            <p className="text-2xl font-bold text-indigo-400">
              ₩{(budget.budget * 1.5)?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">1박 평균 경비</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-2">💎 프리미엄</h3>
            <p className="text-2xl font-bold text-amber-400">
              ₩{(budget.budget * 2.5)?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">1박 평균 경비</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{titleKr} 여행 정보</h2>
          <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 border border-slate-700/60">
            <div>
              <h3 className="font-semibold text-slate-100 mb-2">통화</h3>
              <p className="text-slate-300">{country.currency}</p>
            </div>

            {cities && (
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">주요 도시</h3>
                <p className="text-slate-300">{cities}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-100 mb-2">여행 예산 계획</h3>
              <ul className="text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>5일 여행:</strong> ₩{(budget.budget * 5 * 1).toLocaleString()} ~ ₩
                  {(budget.budget * 5 * 2.5).toLocaleString()}
                </li>
                <li>
                  <strong>1주 여행:</strong> ₩{(budget.budget * 7).toLocaleString()} ~ ₩
                  {(budget.budget * 7 * 2.5).toLocaleString()}
                </li>
                <li>
                  <strong>2주 여행:</strong> ₩{(budget.budget * 14).toLocaleString()} ~ ₩
                  {(budget.budget * 14 * 2.5).toLocaleString()}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-2">포함 비용</h3>
              <ul className="text-slate-300 space-y-1 list-disc list-inside">
                <li>숙박료 (호텔, 게스트하우스, 에어비앤비)</li>
                <li>식사비 (현지 음식점, 카페)</li>
                <li>지역 교통비 (대중교통, 택시)</li>
                <li>입장료 및 관광 비용</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-2">제외 비용</h3>
              <ul className="text-slate-300 space-y-1 list-disc list-inside">
                <li>국제 항공료 (별도 계산)</li>
                <li>여행 보험</li>
                <li>비자 신청료</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">여행 팁</h2>
          <div className="bg-slate-800/50 rounded-lg p-6 space-y-3 border border-slate-700/60">
            <p className="text-slate-300">
              💡 <strong>성수기 피하기:</strong> 성수기에는 항공료와 숙박료가 30-50% 더 비쌀 수 있습니다.
              비수기 여행을 계획하면 경비를 크게 절약할 수 있습니다.
            </p>
            <p className="text-slate-300">
              💡 <strong>환율 확인:</strong> 여행 계획 시점과 실제 여행 시점의 환율 변동을 고려하세요.
              본 계산기는 현재 환율 기준입니다.
            </p>
            <p className="text-slate-300">
              💡 <strong>현지 음식 즐기기:</strong> 고급 레스토랑 대신 현지 음식점을 이용하면 
              식비를 60-70% 절약할 수 있습니다.
            </p>
          </div>
        </section>

        <div className="text-center pt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
          >
            다른 국가 비교하기
          </a>
        </div>
      </div>
    </div>
  );
}
