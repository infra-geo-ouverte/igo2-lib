import { BaseUser } from '@igo2/core/user';

export type AnalyticsProvider = 'matomo';

export interface AnalyticsOptions {
  provider?: AnalyticsProvider;
  url?: string;
  id?: string;
}

export interface AnalyticsBaseUser extends BaseUser {
  sourceId?: string | number;
}
