import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Feature } from '../../feature';

import { OverlayAction } from './overlay.interface';

@Injectable()
export class OverlayService {

  public features$ =
    new BehaviorSubject<[Feature[], OverlayAction]>([[], undefined]);

  constructor() {}

  setFeatures(features: Feature[], action: OverlayAction = 'none') {
    this.features$.next([features, action]);
  }

  clear() {
    this.features$.next([[], 'none']);
  }

}
