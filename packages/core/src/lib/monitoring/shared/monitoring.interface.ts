export type MonitoringProvider = 'sentry';

export interface MonitoringOptions {
    provider: MonitoringProvider;
    /** Add the user info(id, name, email) to the event request */
    identifyUser?: boolean;
}
