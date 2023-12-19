import OlMap from 'ol/Map';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';

/**
 * Base map controller
 */
export class MapController {
  /**
   * OL Map
   */
  protected olMap: OlMap;

  /**
   * Array of observer keys
   */
  protected observerKeys: EventsKey[] = [];

  /**
   * Return the OL map this controller is bound to
   * @returns OL Map
   */
  getOlMap(): OlMap {
    return this.olMap;
  }

  /**
   * Add or remove this controller to/from a map.
   * @param map OL Map
   */
  setOlMap(olMap: OlMap | undefined) {
    if (olMap !== undefined && this.getOlMap() !== undefined) {
      throw new Error('This controller is already bound to a map.');
    }

    if (olMap === undefined) {
      this.teardownObservers();
      this.olMap = olMap;
      return;
    }

    this.olMap = olMap;
  }

  /**
   * Teardown any observers
   */
  teardownObservers() {
    this.observerKeys.forEach((key: EventsKey) => unByKey(key));
    this.observerKeys = [];
  }
}
