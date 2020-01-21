import { Injectable } from '@angular/core';

import { AnalyticsService } from '@igo2/core';
import { AuthService } from '@igo2/auth';
import { ContextService } from '@igo2/context';
import { ToolState } from '@igo2/integration';

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsListenerService {
  /**
   * Toolbox that holds main tools
   */

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private contextService: ContextService,
    private toolState: ToolState
  ) {}

  listen() {
    this.listenUser();
    this.listenContext();
    this.listenLayer();
    this.listenTool();
    this.listenSearch();
  }

  listenUser() {
    this.authService.authenticate$.subscribe(() => {
      const tokenDecoded = this.authService.decodeToken() || {};
      if (tokenDecoded.user) {
        this.authService
          .getProfils()
          .subscribe(profils =>
            this.analyticsService.setUser(tokenDecoded.user, profils.profils)
          );
      } else {
        this.analyticsService.setUser(tokenDecoded.user, []);
      }
    });
  }

  listenContext() {
    this.contextService.context$.subscribe(context => {
      this.analyticsService.trackEvent('context', 'activate', context.id);
    });
  }

  listenLayer() {
    // this.contextService.context$.subscribe(context => {
    //   this.analyticsService.trackEvent('context', 'activate', context.id);
    // });
  }

  listenTool() {
    this.toolState.toolbox.activeTool$.subscribe(tool => {
      if (tool) {
        this.analyticsService.trackEvent('tool', 'activate', tool.name);
      }
    });
  }

  listenSearch() {
    // this.contextService.context$.subscribe(context => {
    //   this.analyticsService.trackSearch(term, types, nbResults);
    // });
  }
}
