'use client';

interface Props {
  rates: Record<string, number>;
  loading?: boolean;
}

// Pair: currency code → flag emoji + rough display precision.
// Order matters — it's the visible sequence in the ticker strip.
const PAIRS: { code: string; flag: string; digits?: number }[] = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'JPY', flag: '🇯🇵', digits: 2 },
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'GBP', flag: '🇬🇧' },
  { code: 'CNY', flag: '🇨🇳', digits: 1 },
  { code: 'AUD', flag: '🇦🇺' },
  { code: 'CAD', flag: '🇨🇦' },
  { code: 'SGD', flag: '🇸🇬' },
  { code: 'HKD', flag: '🇭🇰', digits: 1 },
  { code: 'TWD', flag: '🇹🇼', digits: 1 },
  { code: 'CHF', flag: '🇨🇭' },
  { code: 'THB', flag: '🇹🇭', digits: 1 },
  { code: 'VND', flag: '🇻🇳', digits: 3 },
  { code: 'PHP', flag: '🇵🇭', digits: 1 },
  { code: 'IDR', flag: '🇮🇩', digits: 3 },
  { code: 'INR', flag: '🇮🇳', digits: 1 },
  { code: 'TRY', flag: '🇹🇷', digits: 1 },
  { code: 'AED', flag: '🇦🇪' },
  { code: 'NZD', flag: '🇳🇿' },
  { code: 'MXN', flag: '🇲🇽', digits: 1 },
];

function formatKrwPerUnit(code: string, rates: Record<string, number>, digits?: number): string {
  const krwPerUsd = rates['KRW'] ?? 1450;
  const currencyPerUsd = rates[code] ?? 1;
  const krwPerUnit = krwPerUsd / currencyPerUsd;
  if (krwPerUnit < 1) return krwPerUnit.toFixed(3);
  if (digits !== undefined) return krwPerUnit.toFixed(digits);
  return Math.round(krwPerUnit).toLocaleString();
}

export default function CurrencyTicker({ rates, loading }: Props) {
  const items = PAIRS.map(p => ({
    ...p,
    display: loading ? '…' : formatKrwPerUnit(p.code, rates, p.digits),
  }));

  const strip = (
    <div className="flex items-center gap-7 pr-7 whitespace-nowrap">
      {items.map(it => (
        <span key={it.code} className="inline-flex items-center gap-1.5 text-[11px]">
          <span className="text-sm">{it.flag}</span>
          <span className="text-slate-400 font-medium">{it.code}</span>
          <span className="text-slate-200 font-semibold tabular-nums">₩{it.display}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-slate-900/90 border-b border-slate-800">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900/95 to-transparent z-10 pointer-events-none" />
      <div
        className="flex py-1.5"
        style={{ animation: 'currency-ticker 90s linear infinite', width: 'max-content' }}
      >
        {strip}
        {strip}
      </div>
      <style jsx>{`
        @keyframes currency-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
