export type TravelStyle = 'budget' | 'standard' | 'luxury';

export interface CostBreakdown {
  flight: number;
  accommodation: number;
  food: number;
  localTransport: number;
  activities: number;
  shopping: number;
}

export interface StyleCosts {
  min: number;
  avg: number;
  max: number;
  breakdown: CostBreakdown;
}

export interface BlogDataPoint {
  year: number;
  style: TravelStyle;
  totalKRW: number;
  duration: number;
  breakdown: CostBreakdown;
  source: string;
  city?: string;
}

export interface HistoricalRate {
  year: number;
  krwPerUsd: number;
  krwPerLocal: number; // KRW per 1 unit of country's currency
  localInflationPct: number; // % change from previous year
}

export interface FlightData {
  basePriceKRW: number;
  monthlyMultipliers: number[]; // index 0 = Jan
  holidayMultiplier: number;
  airlineOptions: { name: string; priceMultiplier: number }[];
}

export interface Country {
  code: string;
  name: string;
  nameKR: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  region: string;
  defaultDuration: number; // nights
  cities?: string[];
  costs: {
    budget: StyleCosts;
    standard: StyleCosts;
    luxury: StyleCosts;
  };
  flight: FlightData;
  blogData: BlogDataPoint[];
  historicalRates: HistoricalRate[];
  tags: string[];
  description: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface HolidayInfo {
  date: string;
  name: string;
  type: 'national' | 'lunar' | 'holiday_season';
  priceMultiplier: number;
}

export interface TravelEstimate {
  country: Country;
  duration: number;
  style: TravelStyle;
  departureDate: string;
  totalKRW: number;
  breakdown: CostBreakdown;
  holidayWarning?: HolidayInfo;
  flightSeasonMultiplier: number;
  exchangeRateImpact: number; // % change vs when blog data was written
}
