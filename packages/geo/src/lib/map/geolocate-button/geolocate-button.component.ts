import { AsyncPipe } from '@angular/common';
import {
  AfterContentInit,
  Component,
  OnDestroy,
  inject,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-geolocate-button',
  templateUrl: './geolocate-button.component.html',
  styleUrls: ['./geolocate-button.component.scss'],
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class GeolocateButtonComponent implements AfterContentInit, OnDestroy {
  private configService = inject(ConfigService);

  private tracking$$!: Subscription;
  readonly icon$ = new BehaviorSubject<string>('my_location');

  map = input.required<IgoMap>();
  color = input<string>();

  ngAfterContentInit(): void {
    const map = this.map();
    map.ol.once('rendercomplete', () => {
      this.tracking$$ = map.geolocationController.tracking$.subscribe(
        (tracking) => {
          if (tracking) {
            this.icon$.next('my_location');
          } else {
            this.icon$.next(
              this.configService.getConfig('geolocate.basic')
                ? 'my_location'
                : 'location_searching'
            );
          }
        }
      );
    });
  }

  ngOnDestroy(): void {
    if (this.tracking$$) {
      this.tracking$$.unsubscribe();
    }
  }

  onGeolocationClick() {
    const map = this.map();
    const tracking = map.geolocationController.tracking;
    map.geolocationController.tracking = tracking ? false : true;
  }
}
