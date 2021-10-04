import { EntityStore } from '@igo2/common';
import { BehaviorSubject } from 'rxjs';
import { FeatureStore } from '../../feature/shared/store';
import { FeatureWithDirection, FeatureWithStop, Stop } from './directions.interface';

/**
 * The class is a specialized version of an EntityStore that stores
 * stops.
 */
export class StopsStore extends EntityStore<Stop> {

    public storeInitialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public clearStops() {
        this.storeInitialized$.next(false);
        this.clear();
    }

}

export class StopsFeatureStore extends FeatureStore<FeatureWithStop> {

}
export class RoutesFeatureStore extends FeatureStore<FeatureWithDirection> {

}
