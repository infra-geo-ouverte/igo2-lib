export const StyleEngineKind = ['Geostyler', 'Mapbox'] as const;
export type StyleEngineKind = (typeof StyleEngineKind)[number];
