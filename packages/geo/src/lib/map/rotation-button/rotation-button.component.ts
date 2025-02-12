import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { AfterContentInit, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { bearingToAzimuth } from '@turf/helpers';
import { BehaviorSubject } from 'rxjs';

import { IgoMap } from '../shared/map';

@Component({
    selector: 'igo-rotation-button',
    templateUrl: './rotation-button.component.html',
    styleUrls: ['./rotation-button.component.scss'],
    imports: [
        NgIf,
        MatTooltipModule,
        MatButtonModule,
        MatIconModule,
        NgStyle,
        AsyncPipe,
        IgoLanguageModule
    ]
})
export class RotationButtonComponent implements AfterContentInit {
  readonly rotated$ = new BehaviorSubject<boolean>(false);
  public azimuthRounded = 0;
  public rotationRounded = 0;
  readonly currentStyle$ = new BehaviorSubject({
    transform: 'rotate(0rad)'
  });

  @Input() map: IgoMap;
  @Input() showIfNoRotation: boolean;
  @Input() color: string;

  ngAfterContentInit() {
    this.map.viewController.rotation$.subscribe((r) => {
      const radians = r || 0;
      const deg = (radians * 180) / Math.PI;
      this.rotationRounded = Math.round(deg);
      this.azimuthRounded = Math.round(bearingToAzimuth(deg * -1));
      this.currentStyle$.next({
        transform: 'rotate(' + radians + 'rad)'
      });
      this.rotated$.next(radians !== 0);
    });
  }
}
