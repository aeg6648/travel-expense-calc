import { HolidayInfo } from '@/types/travel';

// Korean public holidays (fixed dates)
const FIXED_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: '신정' },
  { month: 3, day: 1, name: '삼일절' },
  { month: 5, day: 5, name: '어린이날' },
  { month: 6, day: 6, name: '현충일' },
  { month: 8, day: 15, name: '광복절' },
  { month: 10, day: 3, name: '개천절' },
  { month: 10, day: 9, name: '한글날' },
  { month: 12, day: 25, name: '성탄절' },
];

// Lunar calendar holidays (approximate Gregorian dates for 2024-2026)
const LUNAR_HOLIDAYS: Record<number, { name: string; dates: string[] }[]> = {
  2024: [
    { name: '설날 연휴', dates: ['2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12'] },
    { name: '부처님오신날', dates: ['2024-05-15'] },
    { name: '추석 연휴', dates: ['2024-09-16', '2024-09-17', '2024-09-18', '2024-09-19'] },
  ],
  2025: [
    { name: '설날 연휴', dates: ['2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31'] },
    { name: '부처님오신날', dates: ['2025-05-05'] },
    { name: '추석 연휴', dates: ['2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08'] },
  ],
  2026: [
    { name: '설날 연휴', dates: ['2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20'] },
    { name: '부처님오신날', dates: ['2026-05-24'] },
    { name: '추석 연휴', dates: ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'] },
  ],
};

// Summer / peak travel seasons
const PEAK_SEASONS: { start: string; end: string; name: string; multiplier: number }[] = [
  { start: 'MM-07-15', end: 'MM-08-20', name: '여름 성수기', multiplier: 1.5 },
  { start: 'MM-12-23', end: 'MM-01-05', name: '크리스마스·연말 성수기', multiplier: 1.6 },
];

export function getHolidayInfo(dateStr: string): HolidayInfo | null {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Check fixed holidays
  for (const h of FIXED_HOLIDAYS) {
    if (h.month === month && h.day === day) {
      return { date: dateStr, name: h.name, type: 'national', priceMultiplier: 1.6 };
    }
  }

  // Check weekend before/after fixed holidays (연휴 effect)
  for (const h of FIXED_HOLIDAYS) {
    const hDate = new Date(year, h.month - 1, h.day);
    const diff = Math.abs(date.getTime() - hDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 3 && (date.getDay() === 0 || date.getDay() === 6)) {
      return { date: dateStr, name: `${h.name} 연휴`, type: 'national', priceMultiplier: 1.4 };
    }
  }

  // Check lunar holidays
  const yearHolidays = LUNAR_HOLIDAYS[year] || [];
  for (const h of yearHolidays) {
    if (h.dates.includes(dateStr)) {
      return { date: dateStr, name: h.name, type: 'lunar', priceMultiplier: 2.0 };
    }
    // Adjacent days
    for (const hDate of h.dates) {
      const diff = Math.abs(new Date(dateStr).getTime() - new Date(hDate).getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 2) {
        return { date: dateStr, name: `${h.name} 인근`, type: 'lunar', priceMultiplier: 1.7 };
      }
    }
  }

  // Check peak seasons
  if ((month === 7 && day >= 15) || (month === 8 && day <= 20)) {
    return { date: dateStr, name: '여름 성수기', type: 'holiday_season', priceMultiplier: 1.5 };
  }
  if ((month === 12 && day >= 23) || (month === 1 && day <= 5)) {
    return { date: dateStr, name: '크리스마스·연말 성수기', type: 'holiday_season', priceMultiplier: 1.6 };
  }

  return null;
}

export function getFlightMultiplier(dateStr: string, monthlyMultipliers: number[], holidayMultiplier: number): number {
  const date = new Date(dateStr);
  const month = date.getMonth(); // 0-indexed
  const holidayInfo = getHolidayInfo(dateStr);

  const monthMulti = monthlyMultipliers[month] || 1.0;
  if (holidayInfo) {
    return Math.max(monthMulti, holidayInfo.priceMultiplier * holidayMultiplier * 0.6);
  }
  return monthMulti;
}

export function getUpcomingHolidays(year: number): HolidayInfo[] {
  const holidays: HolidayInfo[] = [];

  for (const h of FIXED_HOLIDAYS) {
    const dateStr = `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
    holidays.push({ date: dateStr, name: h.name, type: 'national', priceMultiplier: 1.6 });
  }

  const yearHolidays = LUNAR_HOLIDAYS[year] || [];
  for (const h of yearHolidays) {
    if (h.dates[0]) {
      holidays.push({ date: h.dates[0], name: h.name, type: 'lunar', priceMultiplier: 2.0 });
    }
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}
