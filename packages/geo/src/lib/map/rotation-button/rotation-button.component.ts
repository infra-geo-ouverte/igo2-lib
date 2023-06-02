import { AfterContentInit, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { bearingToAzimuth } from '@turf/helpers';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-rotation-button',
  templateUrl: './rotation-button.component.html',
  styleUrls: ['./rotation-button.component.scss']
})
export class RotationButtonComponent implements AfterContentInit {
  readonly rotated$ = new BehaviorSubject<boolean>(false);
  public azimuthRounded: number = 0;
  public rotationRounded: number = 0;
  readonly currentStyle$ = new BehaviorSubject<{}>({
    transform: 'rotate(0rad)'
  });

  @Input() map: IgoMap;
  @Input() showIfNoRotation: boolean;
  @Input() color: string;

  constructor() { }

  ngAfterContentInit() {
    this.map.viewController.rotation$.subscribe(r => {
      const radians = r || 0;
      const deg = radians * 180 / Math.PI;
      this.rotationRounded = Math.round(deg);
      this.azimuthRounded = Math.round(bearingToAzimuth(deg * -1));
      this.currentStyle$.next({
        transform: 'rotate(' + radians + 'rad)'
      });
      this.rotated$.next(radians !== 0);
    }
    );
  }
}
