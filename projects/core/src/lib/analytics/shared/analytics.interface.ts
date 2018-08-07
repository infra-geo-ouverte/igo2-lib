export type AnalyticsProvider = 'matomo';

export interface AnalyticsOptions {
  provider?: AnalyticsProvider;
  url?: string;
  id?: string;
}
