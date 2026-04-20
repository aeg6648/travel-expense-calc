// Background photos keyed by country code. Each entry has a wide
// landscape Unsplash URL and a gradient fallback for when the image
// fails. Shared by the country grid cards and the itinerary trip cards
// so a saved trip automatically wears its destination's look.

export interface CountryPhoto {
  url: string;
  fallbackFrom: string;
  fallbackTo: string;
}

export const COUNTRY_PHOTOS: Record<string, CountryPhoto> = {
  JP: { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#9f1239', fallbackTo: '#be123c' },
  TH: { url: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#92400e', fallbackTo: '#b45309' },
  VN: { url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#065f46', fallbackTo: '#047857' },
  TW: { url: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#0c4a6e', fallbackTo: '#075985' },
  SG: { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7f1d1d', fallbackTo: '#991b1b' },
  PH: { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#0e4163', fallbackTo: '#0369a1' },
  ID: { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#14532d', fallbackTo: '#166534' },
  MY: { url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#164e63', fallbackTo: '#0e7490' },
  FR: { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#312e81', fallbackTo: '#3730a3' },
  ES: { url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7c2d12', fallbackTo: '#9a3412' },
  TR: { url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7f1d1d', fallbackTo: '#991b1b' },
  US: { url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#1e3a5f', fallbackTo: '#1d4ed8' },
  AU: { url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#78350f', fallbackTo: '#92400e' },
  NZ: { url: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#1e3a5f', fallbackTo: '#0284c7' },
  HK: { url: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#4c1d95', fallbackTo: '#5b21b6' },
  IT: { url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#14532d', fallbackTo: '#15803d' },
  GR: { url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#1e40af', fallbackTo: '#1d4ed8' },
  DE: { url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#4b5563', fallbackTo: '#6b7280' },
  GB: { url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#1e3a8a', fallbackTo: '#1e40af' },
  CH: { url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#075985', fallbackTo: '#0369a1' },
  NL: { url: 'https://images.unsplash.com/photo-1534351590666-13e3e96c5017?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#065f46', fallbackTo: '#047857' },
  HR: { url: 'https://images.unsplash.com/photo-1555990538-17392d0d1fe3?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#78350f', fallbackTo: '#b45309' },
  CZ: { url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7c2d12', fallbackTo: '#9a3412' },
  CN: { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7f1d1d', fallbackTo: '#b91c1c' },
  IN: { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7c2d12', fallbackTo: '#c2410c' },
  AE: { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#78350f', fallbackTo: '#f59e0b' },
  EG: { url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#78350f', fallbackTo: '#a16207' },
  MA: { url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7c2d12', fallbackTo: '#c2410c' },
  CA: { url: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#7f1d1d', fallbackTo: '#be123c' },
  MX: { url: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#78350f', fallbackTo: '#b45309' },
  MN: { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#1e3a5f', fallbackTo: '#1e40af' },
  NP: { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80&auto=format&fit=crop', fallbackFrom: '#1e3a8a', fallbackTo: '#1e40af' },
};

export function getCountryPhoto(code: string): CountryPhoto | undefined {
  return COUNTRY_PHOTOS[code];
}

export function fallbackGradient(code: string): string {
  const p = COUNTRY_PHOTOS[code];
  if (p) return `linear-gradient(135deg, ${p.fallbackFrom}, ${p.fallbackTo})`;
  return 'linear-gradient(135deg, #312e81, #3730a3)';
}
