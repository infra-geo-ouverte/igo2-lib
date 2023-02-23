import { Injectable } from '@angular/core';
import { skip } from 'rxjs/operators';

import { AnalyticsService } from '@igo2/core';
import { AuthService } from '@igo2/auth';

import { ContextState } from '../context/context.state';
import { SearchState } from '../search/search.state';
import { ToolState } from '../tool/tool.state';
import { MapState } from '../map/map.state';

import { Layer } from '@igo2/geo';


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
    private contextState: ContextState,
    private searchState: SearchState,
    private toolState: ToolState,
    private mapState: MapState
  ) {}

  listen() {
    this.listenUser();
    this.listenContext();
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
        this.analyticsService.setUser();
      }
    });
  }

  listenContext() {
    this.contextState.context$.subscribe(context => {
      if (context) {
        this.analyticsService.trackEvent('context', 'activateContext', context.id || context.uri);
      }
    });
  }

  listenTool() {
    this.toolState.toolbox.activeTool$.pipe(skip(1)).subscribe(tool => {
      if (tool) {
        this.analyticsService.trackEvent('tool', 'activateTool', tool.name);
      }
    });
  }

  listenSearch() {
    this.searchState.searchTerm$.pipe(skip(1)).subscribe((searchTerm: string) => {
      if (searchTerm !== undefined && searchTerm !== null) {
        this.analyticsService.trackSearch(searchTerm, this.searchState.store.count);
      }
    });
  }
}
