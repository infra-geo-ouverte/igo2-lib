import { EntityStore } from '@igo2/common/entity';

import { BehaviorSubject } from 'rxjs';

import { FeatureStore } from '../../feature/shared/store';
import {
  FeatureWithDirections,
  FeatureWithStep,
  FeatureWithStop,
  Stop
} from './directions.interface';

/**
 * The class is a specialized version of an EntityStore that stores
 * stops.
 */
export class StopsStore extends EntityStore<Stop> {
  public storeInitialized$ = new BehaviorSubject<boolean>(false);

  public clearStops() {
    this.storeInitialized$.next(false);
    this.clear();
  }
}

export class StopsFeatureStore extends FeatureStore<FeatureWithStop> {}
export class RoutesFeatureStore extends FeatureStore<FeatureWithDirections> {}
export class StepsFeatureStore extends FeatureStore<FeatureWithStep> {}
