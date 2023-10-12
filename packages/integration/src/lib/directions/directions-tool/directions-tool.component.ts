import { Component, OnInit } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { ToolComponent } from '@igo2/common';
import {
  LanguageService,
  MessageService,
  StorageScope,
  StorageService
} from '@igo2/core';
import {
  IgoMap,
  RoutesFeatureStore,
  StepFeatureStore,
  StopsFeatureStore,
  StopsStore
} from '@igo2/geo';

import { Subject } from 'rxjs';

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
  templateUrl: './directions-tool.component.html'
})
export class DirectionsToolComponent implements OnInit {
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
  get stepFeatureStore(): StepFeatureStore {
    return this.directionState.stepFeatureStore;
  }

  /**
   * step store
   * @internal
   */
  get zoomToActiveRoute$(): Subject<void> {
    return this.directionState.zoomToActiveRoute$;
  }

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    private directionState: DirectionState,
    private mapState: MapState,
    private languageService: LanguageService,
    private messageService: MessageService,
    private storageService: StorageService,
    public contextState: ContextState,
    private authService: AuthService
  ) {}

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
