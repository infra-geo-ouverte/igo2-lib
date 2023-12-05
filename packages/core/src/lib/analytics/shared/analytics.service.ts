import { Injectable } from '@angular/core';

import { User } from '@igo2/auth';

import { ConfigService } from '../../config/config.service';
import { AnalyticsOptions } from './analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private options: AnalyticsOptions;

  get paq() {
    return ((window as any)._paq = (window as any)._paq || []);
  }

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

    // this.paq.push(['trackPageView']);
    // this.paq.push(['enableLinkTracking']);
    (() => {
      this.paq.push(['setTrackerUrl', url + '.php']);
      this.paq.push(['setSiteId', this.options.id]);
      const g = document.createElement('script');
      const s = document.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = url + '.js';
      s.parentNode.insertBefore(g, s);
    })();
  }

  public setUser(user?: User, profils?: string[]) {
    if (this.options.provider === 'matomo') {
      if (!user) {
        this.paq.push(['resetUserId']);
        this.paq.push(['deleteCustomVariable', 1, 'user']);
        this.paq.push(['deleteCustomVariable', 2, 'name']);
        this.paq.push(['deleteCustomVariable', 3, 'profils']);
      } else {
        this.paq.push(['setUserId', user.id]);

        const name = `${user.firstName} ${user.lastName}`;
        this.paq.push(['setCustomVariable', 1, 'user', user.sourceId, 'visit']);
        this.paq.push(['setCustomVariable', 2, 'name', name, 'visit']);
        this.paq.push(['setCustomVariable', 3, 'profils', profils, 'visit']);
      }

      this.paq.push(['trackPageView']);
      this.paq.push(['enableLinkTracking']);
    }
  }

  public trackSearch(term: string, nbResults: number) {
    if (this.options.provider === 'matomo') {
      this.paq.push(['trackSiteSearch', term, false, nbResults]);
    }
  }

  public trackEvent(category: string, action: string, name: string) {
    if (this.options.provider === 'matomo') {
      this.paq.push(['trackEvent', category, action, name]);
    }
  }

  /**
   * Function that tracks layers added to the map
   */
  public trackLayer(category: string, action: string, parameters: any) {
    if (this.options.provider === 'matomo')
      this.paq.push(['trackEvent', category, action, parameters]);
  }
}
