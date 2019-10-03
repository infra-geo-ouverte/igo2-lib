import { Injectable } from '@angular/core';

import { ConfigService } from '../../config/config.service';

import { AnalyticsOptions } from './analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private options: AnalyticsOptions;

  constructor(private config: ConfigService) {
    this.options = this.config.getConfig('analytics') || {};

    if (this.options.provider === 'matomo') {
      this.initMatomo();
    }
  }

  private initMatomo() {
    if (!this.options.url || !this.options.id) {
      return;
    }
    const url =
      this.options.url.substr(-1) === '/'
        ? this.options.url + 'matomo'
        : this.options.url;

    (window as any)._paq = (window as any)._paq || [];
    const paq: any = (window as any)._paq;
    paq.push(['trackPageView']);
    paq.push(['enableLinkTracking']);
    (() => {
      paq.push(['setTrackerUrl', url + '.php']);
      paq.push(['setSiteId', this.options.id]);
      const g = document.createElement('script');
      const s = document.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = url + '.js';
      s.parentNode.insertBefore(g, s);
    })();
  }
}
