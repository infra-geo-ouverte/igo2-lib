import { EntityStore } from '@igo2/common';

import { BehaviorSubject } from 'rxjs';

import { FeatureStore } from '../../feature/shared/store';
import {
  FeatureWithRoute,
  FeatureWithStep,
  FeatureWithWaypoint,
  Waypoint
} from './directions.interface';

/**
 * The class is a specialized version of an EntityStore that stores
 * waypoints.
 */
export class WaypointStore extends EntityStore<Waypoint> {
  public storeInitialized$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  public clearWaypoints() {
    this.storeInitialized$.next(false);
    this.clear();
  }
}

export class WaypointFeatureStore extends FeatureStore<FeatureWithWaypoint> {}
export class RoutesFeatureStore extends FeatureStore<FeatureWithRoute> {}
export class StepFeatureStore extends FeatureStore<FeatureWithStep> {}
