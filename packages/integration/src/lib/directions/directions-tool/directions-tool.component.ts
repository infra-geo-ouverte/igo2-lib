import { Component, OnInit, inject } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { ToolComponent } from '@igo2/common/tool';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { StorageScope, StorageService } from '@igo2/core/storage';
import {
  IgoDirectionsModule,
  IgoMap,
  RoutesFeatureStore,
  StepsFeatureStore,
  StopsFeatureStore,
  StopsStore
} from '@igo2/geo';

import { BehaviorSubject, Subject } from 'rxjs';

import { ContextState } from '../../context/context.state';
import { MapState } from '../../map/map.state';
import { DirectionState } from '../directions.state';

@ToolComponent({
  name: 'directions',
  title: 'igo.integration.tools.directions',
  icon: 'directions'
})
@Component({
  selector: 'igo-directions-tool',
  templateUrl: './directions-tool.component.html',
  imports: [IgoDirectionsModule]
})
export class DirectionsToolComponent implements OnInit {
  private directionState = inject(DirectionState);
  private mapState = inject(MapState);
  private languageService = inject(LanguageService);
  private messageService = inject(MessageService);
  private storageService = inject(StorageService);
  contextState = inject(ContextState);
  private authService = inject(AuthService);

  public currentContextUri: string;
  /**
   * stops
   * @internal
   */
  get stopsStore(): StopsStore {
    return this.directionState.stopsStore;
  }

  get debounceTime(): number {
    return this.directionState.debounceTime;
  }

  /**
   * stops
   * @internal
   */
  get stopsFeatureStore(): StopsFeatureStore {
    return this.directionState.stopsFeatureStore;
  }

  /**
   * routes
   * @internal
   */
  get routesFeatureStore(): RoutesFeatureStore {
    return this.directionState.routesFeatureStore;
  }

  /**
   * step store
   * @internal
   */
  get stepFeatureStore(): StepsFeatureStore {
    return this.directionState.stepFeatureStore;
  }

  /**
   * step store
   * @internal
   */
  get zoomOnActiveRoute$(): Subject<void> {
    return this.directionState.zoomToActiveRoute$;
  }

  get authenticated$(): BehaviorSubject<boolean> {
    return this.authService.authenticate$;
  }

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  ngOnInit(): void {
    const warningShown = this.storageService.get(
      'direction.warning.shown'
    ) as boolean;
    if (!warningShown) {
      this.messageService.info(
        'igo.integration.directions.warning.message',
        'igo.integration.directions.warning.title',
        { timeOut: 20000 }
      );
      this.storageService.set(
        'direction.warning.shown',
        true,
        StorageScope.SESSION
      );
    }
    this.contextState.context$.subscribe((c) => {
      if (!this.authService.authenticated) {
        this.currentContextUri = c.uri;
      }
    });
  }
}
