import { EntityStore } from '@igo2/common';
import { uuid } from '@igo2/utils';
import { Stop } from './directions.interface';

/**
 * Function that updat the sort of the list base on the provided field.
 * @param source stop store
 * @param direction asc / desc sort order
 * @param field the field to use to sort the view
 */
export function updateStoreSorting(stopsStore: EntityStore<Stop>, direction: 'asc' | 'desc' = 'asc', field = 'order') {
  stopsStore.view.sort({
    direction,
    valueAccessor: (stop: Stop) => stop[field]
  });
}


/**
 * Function that compute the order property based on the provide list order.
 * @param source stop store
 * @param stop stops list (this list order must be used!)
 * @param emit if the store must emit a update change
 */
export function computeStopOrderBasedOnListOrder(stopsStore: EntityStore<Stop>, stops: Stop[], emit: boolean) {
  let cnt = 0;
  const stopsCnt = stops.length;
  const localStops = [...stops];
  localStops.map(s => {
    const stop = stopsStore.get(s.id);
    if (stop) {
      stop.order = cnt;
      if (cnt === 0) {
        stop.placeholder = 'start';
      } else if (cnt === stopsCnt - 1) {
        stop.placeholder = 'end';
      } else {
        stop.placeholder = 'intermediate';
      }
      cnt += 1;
    }
  });
  if (emit) {
    stopsStore.updateMany(stops);
  }
}

/**
 * Function that add a stop to the stop store. Stop are always added before the last stop.
 * @param source stop store
 */
export function addStopToStore(stopsStore: EntityStore<Stop>): Stop {

  const lastStop = this.allStops[stopsStore.count - 1];
  const lastStopId = lastStop.id;
  const lastStopOrder = lastStop.order;
  stopsStore.get(lastStopId).order = lastStopOrder + 1;
  const id = uuid();
  stopsStore.insert(
    {
      id,
      order: lastStopOrder,
      placeholder: 'intermediate'
    });
  return stopsStore.get(id);
}
