export const StyleEngineKind = {
  Geostyler: 'Geostyler',
  Mapbox: 'Mapbox'
} as const;

export type StyleEngineKind =
  (typeof StyleEngineKind)[keyof typeof StyleEngineKind];
