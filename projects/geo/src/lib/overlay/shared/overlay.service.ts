import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Feature } from '../../feature/shared/feature.interface';

import { OverlayAction } from './overlay.interface';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  public features$ = new BehaviorSubject<[Feature[], OverlayAction]>([
    [],
    undefined
  ]);

  constructor() {}

  setFeatures(features: Feature[], action: OverlayAction = 'none') {
    this.features$.next([features, action]);
  }

  clear() {
    this.features$.next([[], 'none']);
  }
}
